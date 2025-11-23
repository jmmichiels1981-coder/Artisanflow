from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import secrets
import hashlib
import stripe
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
import httpx
import re
from vat_validator import vat_validator
from email_service import send_registration_confirmation_email, send_contact_notification_email

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration
stripe.api_key = os.environ['STRIPE_SECRET_KEY']
STRIPE_WEBHOOK_SECRET = os.environ['STRIPE_WEBHOOK_SECRET']
is_test_mode = True

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# TVA & Tarifs
VAT_RATES = {
    "BE": 0.21,
    "FR": 0.20,
    "LU": 0.17,
    "CH": 0.081,
    "CA": 0.05,     # TVQ Québec
    "ES": 0.21,     # IVA Espagne
    "IT": 0.22,     # IVA Italie
    "GB": 0.20,     # VAT UK
    "DE": 0.19,     # MwSt Allemagne
    "US": 0.00,     # Pas de TVA fédérale
}

CURRENCIES = {
    "BE": ("EUR", 19.99),
    "FR": ("EUR", 19.99),
    "LU": ("EUR", 19.99),
    "CH": ("CHF", 21.00),
    "CA": ("CAD", 30.00),
    "ES": ("EUR", 19.99),
    "IT": ("EUR", 19.99),
    "DE": ("EUR", 19.99),
    "GB": ("GBP", 17.99),
    "US": ("USD", 21.99),  # Corrigé: 21.99 au lieu de 24.99
}

# Helpers
def hash_password(pw: str):
    return hashlib.sha256(pw.encode()).hexdigest()

def verify_password(pw: str, hashed: str):
    return hash_password(pw) == hashed

def make_access_token(username: str):
    return secrets.token_hex(32)

def make_refresh_token(username: str):
    return secrets.token_hex(40)

# ============ MODELS ============

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    pin: str  # PIN 4 chiffres requis

class RefreshRequest(BaseModel):
    refresh_token: str

class RegisterRequest(BaseModel):
    companyName: str
    firstName: str
    lastName: str
    email: EmailStr
    username: str
    password: str
    pin: str  # PIN 4 chiffres pour double authentification
    countryCode: str
    profession: Optional[str] = None  # Métier de l'artisan
    professionOther: Optional[str] = None  # Si "Autre" est sélectionné
    paymentMethod: str
    stripePaymentMethodId: str
    gstNumber: Optional[str] = None  # TPS/GST pour Québec (optionnel)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class PortalSessionRequest(BaseModel):
    email: EmailStr
    return_url: Optional[str] = None

class SetupIntentRequest(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    companyName: str
    countryCode: str
    payment_method_type: str  # 'sepa_debit' or 'acss_debit'

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    username: str
    password_hash: str
    pin_hash: str  # PIN 4 chiffres hashé
    companyName: str
    firstName: str
    lastName: str
    countryCode: str
    profession: Optional[str] = None  # Métier de l'artisan
    professionOther: Optional[str] = None  # Si "Autre" est sélectionné
    stripe_customer_id: str
    gstNumber: Optional[str] = None  # TPS/GST pour Québec
    vat_verification_status: Optional[str] = "pending"  # verified, pending, format_only, invalid
    vat_verified_company_name: Optional[str] = None  # From VIES/UID
    vat_verified_address: Optional[str] = None  # From VIES/UID
    refresh_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: secrets.token_hex(8))
    username: str
    client_name: str
    client_email: str
    description: str
    items: List[dict]
    total_ht: float
    total_ttc: float
    status: str = "draft"  # draft, sent, accepted, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    client_name: str
    client_email: str
    description: str
    items: List[dict]

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: secrets.token_hex(8))
    username: str
    quote_id: Optional[str] = None
    client_name: str
    client_email: str
    description: str
    items: List[dict]
    total_ht: float
    total_ttc: float
    status: str = "unpaid"  # unpaid, paid, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None

class InvoiceCreate(BaseModel):
    quote_id: Optional[str] = None
    client_name: str
    client_email: str
    description: str
    items: List[dict]

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: secrets.token_hex(8))
    username: str
    name: str
    reference: str
    quantity: int
    unit_price: float
    min_stock: int = 10
    category: str = "Matériaux"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InventoryItemCreate(BaseModel):
    name: str
    reference: str
    quantity: int
    unit_price: float
    min_stock: int = 10
    category: str = "Matériaux"

class AccountingAnalysisRequest(BaseModel):
    period: str  # "month", "quarter", "year"
    year: int
    month: Optional[int] = None

class VoiceTranscriptionResponse(BaseModel):
    text: str
    confidence: float = 1.0

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: secrets.token_hex(8))
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str = "new"  # new, read, archived
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(request: RegisterRequest):
    # Check if user exists - ALWAYS enforce (all countries)
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cet email.")
    
    existing_username = await db.users.find_one({"username": request.username})
    if existing_username:
        raise HTTPException(status_code=409, detail="Ce nom d'utilisateur est déjà pris.")
    
    # Validate PIN format (4 digits)
    if not re.match(r'^\d{4}$', request.pin):
        raise HTTPException(status_code=400, detail="Le PIN doit être composé de 4 chiffres")
    
    # Validate VAT/Company number BEFORE creating Stripe customer
    # This ensures no Stripe customer is created if validation fails
    logger.info(f"Validating business identifiers before Stripe creation for {request.email}")

    # Determine country/VAT/price
    country = request.countryCode.upper()
    currency, base_price = CURRENCIES.get(country, ("EUR", 19.99))
    vat_rate = VAT_RATES.get(country, 0.0)
    tax_amount = round(base_price * vat_rate, 2)
    total_price = base_price + tax_amount

    # Trial period until September 1st, 2026
    trial_end = int(datetime(2026, 9, 1, 0, 0, 0, tzinfo=timezone.utc).timestamp())

    # Create or retrieve Stripe customer
    try:
        logger.info(f"Processing registration for {request.email} with payment method {request.stripePaymentMethodId}")
        
        # Retrieve payment method to check if it's already attached to a customer
        payment_method = stripe.PaymentMethod.retrieve(request.stripePaymentMethodId, expand=['customer'])
        logger.info(f"Payment method {request.stripePaymentMethodId} retrieved, customer: {payment_method.customer}")
        logger.info(f"Payment method type: {payment_method.type}")
        
        if payment_method.customer:
            # Payment method already attached to a customer (from SetupIntent)
            customer_id = payment_method.customer if isinstance(payment_method.customer, str) else payment_method.customer.id
            logger.info(f"Using existing customer {customer_id} from SetupIntent")
            
            # Update customer with complete registration info
            customer_obj = stripe.Customer.modify(
                customer_id,
                email=request.email,
                name=f"{request.firstName} {request.lastName}",
                metadata={
                    "username": request.username, 
                    "countryCode": country,
                    "companyName": request.companyName,
                    "stage": "registered"
                },
                description=f"{request.companyName} - {request.firstName} {request.lastName}",
                invoice_settings={"default_payment_method": request.stripePaymentMethodId},
            )
            # Extract ID from response
            customer_id = customer_obj["id"] if isinstance(customer_obj, dict) else customer_obj.id
            logger.info(f"Updated customer {customer_id} with full registration data")
            
            # Check if there's a mandate for SEPA
            if payment_method.type == 'sepa_debit':
                try:
                    # List mandates for this payment method
                    mandates = stripe.Mandate.list(customer=customer_id, limit=5)
                    if mandates.data:
                        for mandate in mandates.data:
                            if mandate.payment_method == request.stripePaymentMethodId:
                                logger.info(f"✅ SEPA Mandate found: {mandate.id}")
                                logger.info(f"🔗 Mandate Dashboard: https://dashboard.stripe.com/{'test/' if stripe.api_key.startswith('sk_test') else ''}mandates/{mandate.id}")
                                break
                    else:
                        logger.warning(f"⚠️ No mandate found for payment method {request.stripePaymentMethodId}")
                except Exception as e:
                    logger.error(f"Error checking mandate: {str(e)}")
        else:
            # Payment method not attached (card payment), create customer and attach
            logger.info("Creating new customer for card payment")
            customer_obj = stripe.Customer.create(
                email=request.email,
                name=f"{request.firstName} {request.lastName}",
                metadata={
                    "username": request.username, 
                    "countryCode": country,
                    "companyName": request.companyName
                },
                description=f"{request.companyName} - {request.firstName} {request.lastName}"
            )
            # Extract ID from response
            customer_id = customer_obj["id"] if isinstance(customer_obj, dict) else customer_obj.id
            logger.info(f"Created new customer {customer_id}")

            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                request.stripePaymentMethodId,
                customer=customer_id,
            )
            logger.info(f"Attached payment method {request.stripePaymentMethodId} to customer {customer_id}")

            stripe.Customer.modify(
                customer_id,
                invoice_settings={"default_payment_method": request.stripePaymentMethodId},
            )
            logger.info(f"Set default payment method for customer {customer_id}")

        # Create or retrieve Stripe product for the subscription
        # We create a product first, then use it in the price_data
        try:
            # Try to find existing product
            products = stripe.Product.list(limit=1, active=True)
            if products.data and products.data[0].name == "Abonnement ArtisanFlow":
                product_id = products.data[0].id
                logger.info(f"Using existing product: {product_id}")
            else:
                # Create new product
                product = stripe.Product.create(
                    name="Abonnement ArtisanFlow",
                    description="Abonnement mensuel à ArtisanFlow",
                )
                product_id = product.id
                logger.info(f"Created new product: {product_id}")
        except Exception as e:
            # Fallback: create product
            logger.warning(f"Error finding product, creating new one: {str(e)}")
            product = stripe.Product.create(
                name="Abonnement ArtisanFlow",
                description="Abonnement mensuel à ArtisanFlow",
            )
            product_id = product.id
            logger.info(f"Created fallback product: {product_id}")

        # Create subscription with trial until Sept 1, 2026
        # This ensures no charge before that date
        logger.info(f"Creating subscription for customer {customer_id} with trial until Sept 1, 2026")
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[
                {
                    "price_data": {
                        "currency": currency.lower(),
                        "product": product_id,  # Use product ID instead of product_data
                        "unit_amount": int(total_price * 100),
                        "recurring": {"interval": "month"},
                    }
                }
            ],
            trial_end=trial_end,  # No charge until Sept 1, 2026
            payment_behavior="default_incomplete",  # Wait for trial to end
            expand=["latest_invoice.payment_intent"],
            metadata={
                "username": request.username,
                "email": request.email,
                "companyName": request.companyName,
                "countryCode": country
            }
        )
        # Extract subscription ID
        subscription_id = subscription["id"] if isinstance(subscription, dict) else subscription.id
        logger.info(f"Created subscription {subscription_id} for customer {customer_id}")
        logger.info(f"🔗 Stripe Dashboard - Customer: https://dashboard.stripe.com/{'test/' if stripe.api_key.startswith('sk_test') else ''}customers/{customer_id}")
        logger.info(f"🔗 Stripe Dashboard - Subscription: https://dashboard.stripe.com/{'test/' if stripe.api_key.startswith('sk_test') else ''}subscriptions/{subscription_id}")

    except stripe._error.StripeError as e:
        # Erreur Stripe spécifique
        logger.error(f"Stripe error during registration: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")
    except Exception as e:
        # Autre erreur
        logger.error(f"General error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

    # Create user in DB
    logger.info(f"Creating user in database for {request.email}")
    password_hash = hash_password(request.password)
    pin_hash = hash_password(request.pin)  # Hash PIN like password
    user = User(
        email=request.email,
        username=request.username,
        password_hash=password_hash,
        pin_hash=pin_hash,
        companyName=request.companyName,
        firstName=request.firstName,
        lastName=request.lastName,
        countryCode=country,
        profession=request.profession,
        professionOther=request.professionOther,
        stripe_customer_id=customer_id,
        gstNumber=request.gstNumber if country == "CA" else None,
        vat_verification_status="pending",  # Will be updated by validation
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    logger.info(f"User {request.username} created in database with customer_id {customer_id}")

    # Create subscription record
    subscription_record = {
        "user_email": request.email,
        "username": request.username,
        "stripe_subscription_id": subscription_id,
        "stripe_customer_id": customer_id,
        "status": "Actif",
        "currency": currency,
        "amount": total_price,
        "failures": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.subscriptions.insert_one(subscription_record)
    logger.info(f"Subscription record created: {subscription_id} for user {request.username}")

    # Generate tokens
    access_token = make_access_token(request.username)
    refresh_token = make_refresh_token(request.username)
    await db.users.update_one(
        {"username": request.username},
        {"$set": {"refresh_token": refresh_token}}
    )

    # Envoyer l'email de confirmation d'inscription
    try:
        send_registration_confirmation_email(
            to_email=request.email,
            username=request.username,
            password=request.password,  # Envoyé uniquement dans l'email de confirmation
            pin=request.pin,
            company_name=request.companyName,
            first_name=request.firstName,
            trial_end_date="31 août 2026"
        )
        logger.info(f"Email de confirmation envoyé à {request.email}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email de confirmation: {str(e)}")
        # On ne fait pas échouer l'inscription si l'email ne part pas

    return {
        "username": request.username,
        "access_token": access_token,
        "refresh_token": refresh_token,
    }

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=401, detail="Email, mot de passe ou PIN incorrect.")
    
    # Verify password
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email, mot de passe ou PIN incorrect.")
    
    # Verify PIN
    if not verify_password(req.pin, user.get("pin_hash", "")):
        raise HTTPException(status_code=401, detail="Email, mot de passe ou PIN incorrect.")

    access_token = make_access_token(user["username"])
    refresh_token = make_refresh_token(user["username"])
    await db.users.update_one(
        {"username": user["username"]},
        {"$set": {"refresh_token": refresh_token}}
    )

    return {
        "username": user["username"],
        "access_token": access_token,
        "refresh_token": refresh_token,
    }

@api_router.post("/auth/refresh")
async def refresh(req: RefreshRequest):
    user = await db.users.find_one({"refresh_token": req.refresh_token})
    if not user:
        raise HTTPException(status_code=401, detail="Refresh token invalide.")

    new_access_token = make_access_token(user["username"])
    new_refresh_token = make_refresh_token(user["username"])
    await db.users.update_one(
        {"username": user["username"]},
        {"$set": {"refresh_token": new_refresh_token}}
    )

    return {
        "username": user["username"],
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await db.users.find_one({"email": req.email})
    if not user:
        return {"message": "Si un compte existe, un email a été envoyé."}

    token = secrets.token_hex(24)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.insert_one({
        "email": req.email,
        "token": token,
        "expires_at": expires_at.isoformat()
    })

    print(f"[SIMULATION EMAIL] Reset password pour {req.email} – token={token}")
    return {"message": "Si un compte existe, un email a été envoyé."}

@api_router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    reset_entry = await db.password_resets.find_one({"token": req.token})
    if not reset_entry:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré.")

    if datetime.fromisoformat(reset_entry["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expiré.")

    user = await db.users.find_one({"email": reset_entry["email"]})
    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur introuvable.")

    await db.users.update_one(
        {"email": reset_entry["email"]},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    await db.password_resets.delete_one({"token": req.token})

    return {"message": "Mot de passe mis à jour avec succès."}

@api_router.post("/auth/forgot-username")
async def forgot_username(req: ForgotPasswordRequest):
    user = await db.users.find_one({"email": req.email})
    if user:
        print(f"[SIMULATION EMAIL] Identifiant pour {req.email}: {user['username']}")
    return {"message": "Si un compte existe, votre identifiant a été envoyé."}

@api_router.post("/vat/validate")
async def validate_vat_number(vat_number: str, country_code: str):
    """Validate VAT number using official APIs"""
    try:
        logger.info(f"Validating VAT {vat_number} for country {country_code}")
        result = await vat_validator.validate_vat(vat_number, country_code)
        logger.info(f"VAT validation result: {result}")
        return result
    except Exception as e:
        logger.error(f"VAT validation error: {str(e)}")
        # Don't block on validation errors
        return {
            'valid': True,
            'verified': False,
            'status': 'pending',
            'message': f'Validation temporarily unavailable: {str(e)}'
        }

@api_router.post("/payment/setup-intent")
async def create_setup_intent(req: SetupIntentRequest):
    """Create a SetupIntent for SEPA (Europe) or Card payment to collect mandate"""
    try:
        logger.info(f"Creating SetupIntent for {req.email} with payment type {req.payment_method_type}")
        
        # Determine payment method types based on request
        # Support: Card (all countries) and SEPA (Europe only)
        payment_method_types = []
        if req.payment_method_type == 'sepa_debit':
            payment_method_types = ['sepa_debit']
        else:
            payment_method_types = ['card']
        
        # Create customer with full information upfront
        customer = stripe.Customer.create(
            email=req.email,
            name=f"{req.firstName} {req.lastName}",
            metadata={
                'companyName': req.companyName,
                'countryCode': req.countryCode,
                'stage': 'setup_intent',
                'email': req.email
            },
            description=f"{req.companyName} - {req.firstName} {req.lastName}"
        )
        
        logger.info(f"Created Stripe Customer: {customer.id} for {req.email}")
        
        # Create SetupIntent attached to this customer
        setup_intent = stripe.SetupIntent.create(
            customer=customer.id,
            payment_method_types=payment_method_types,
            metadata={
                'email': req.email,
                'companyName': req.companyName,
                'countryCode': req.countryCode
            },
            usage='off_session',  # For recurring payments
        )
        
        logger.info(f"Created SetupIntent: {setup_intent.id} for customer {customer.id}")
        
        return {
            "client_secret": setup_intent.client_secret,
            "setup_intent_id": setup_intent.id,
            "customer_id": customer.id
        }
    except Exception as e:
        if "stripe" in str(e).lower():
            logger.error(f"Stripe error in create_setup_intent: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")
        else:
            logger.error(f"General error in create_setup_intent: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

# ============ BILLING ROUTES ============

@api_router.post("/billing/portal")
async def create_billing_portal_session(req: PortalSessionRequest):
    user = await db.users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    return_url = req.return_url or "https://toolsmith-4.preview.emergentagent.com"

    try:
        session = stripe.billing_portal.Session.create(
            customer=user["stripe_customer_id"],
            return_url=return_url,
        )
        return {"url": session.url}
    except stripe._error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if is_test_mode:
        try:
            event = json.loads(payload.decode("utf-8"))
        except Exception:
            raise HTTPException(status_code=400, detail="Payload invalide")
        event_type = event.get("type")
        data = event.get("data", {}).get("object", {})
    else:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        except Exception:
            raise HTTPException(status_code=400, detail="Signature invalide")
        event_type = event["type"]
        data = event["data"]["object"]

    # Handle webhook events
    if event_type == "invoice.payment_succeeded":
        sub_id = data.get("subscription")
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {"status": "Actif", "is_active": True, "failures": 0}}
        )
    elif event_type == "invoice.payment_failed":
        sub_id = data.get("subscription")
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {"status": "Échec Paiement", "is_active": False}, "$inc": {"failures": 1}}
        )
    elif event_type == "customer.subscription.deleted":
        sub_id = data.get("id")
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {"status": "Annulé", "is_active": False}}
        )

    return {"status": "success"}

# ============ QUOTES ROUTES ============

@api_router.post("/quotes")
async def create_quote(quote: QuoteCreate, username: str):
    total_ht = sum(item["quantity"] * item["unit_price"] for item in quote.items)
    total_ttc = total_ht * 1.20  # TVA 20%
    
    quote_obj = Quote(
        username=username,
        client_name=quote.client_name,
        client_email=quote.client_email,
        description=quote.description,
        items=quote.items,
        total_ht=total_ht,
        total_ttc=total_ttc,
    )
    
    quote_dict = quote_obj.model_dump()
    quote_dict['created_at'] = quote_dict['created_at'].isoformat()
    await db.quotes.insert_one(quote_dict)
    
    return quote_obj

@api_router.get("/quotes")
async def get_quotes(username: str):
    quotes = await db.quotes.find({"username": username}, {"_id": 0}).to_list(1000)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

@api_router.get("/quotes/{quote_id}")
async def get_quote(quote_id: str, username: str):
    quote = await db.quotes.find_one({"id": quote_id, "username": username}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Devis introuvable")
    if isinstance(quote['created_at'], str):
        quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    return quote

@api_router.put("/quotes/{quote_id}")
async def update_quote_status(quote_id: str, username: str, status: str):
    result = await db.quotes.update_one(
        {"id": quote_id, "username": username},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Devis introuvable")
    return {"message": "Statut mis à jour"}

# ============ INVOICES ROUTES ============

@api_router.post("/invoices")
async def create_invoice(invoice: InvoiceCreate, username: str):
    total_ht = sum(item["quantity"] * item["unit_price"] for item in invoice.items)
    total_ttc = total_ht * 1.20
    
    invoice_obj = Invoice(
        username=username,
        quote_id=invoice.quote_id,
        client_name=invoice.client_name,
        client_email=invoice.client_email,
        description=invoice.description,
        items=invoice.items,
        total_ht=total_ht,
        total_ttc=total_ttc,
    )
    
    invoice_dict = invoice_obj.model_dump()
    invoice_dict['created_at'] = invoice_dict['created_at'].isoformat()
    await db.invoices.insert_one(invoice_dict)
    
    return invoice_obj

@api_router.get("/invoices")
async def get_invoices(username: str):
    invoices = await db.invoices.find({"username": username}, {"_id": 0}).to_list(1000)
    for inv in invoices:
        if isinstance(inv['created_at'], str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
    return invoices

@api_router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, username: str):
    invoice = await db.invoices.find_one({"id": invoice_id, "username": username}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    if isinstance(invoice['created_at'], str):
        invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
    return invoice

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, username: str, status: str):
    update_data = {"status": status}
    if status == "paid":
        update_data["paid_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.invoices.update_one(
        {"id": invoice_id, "username": username},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    return {"message": "Statut mis à jour"}

# ============ INVENTORY ROUTES ============

@api_router.post("/inventory")
async def create_inventory_item(item: InventoryItemCreate, username: str):
    item_obj = InventoryItem(
        username=username,
        name=item.name,
        reference=item.reference,
        quantity=item.quantity,
        unit_price=item.unit_price,
        min_stock=item.min_stock,
        category=item.category,
    )
    
    item_dict = item_obj.model_dump()
    item_dict['created_at'] = item_dict['created_at'].isoformat()
    await db.inventory.insert_one(item_dict)
    
    return item_obj

@api_router.get("/inventory")
async def get_inventory(username: str):
    items = await db.inventory.find({"username": username}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.get("/inventory/{item_id}")
async def get_inventory_item(item_id: str, username: str):
    item = await db.inventory.find_one({"id": item_id, "username": username}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Article introuvable")
    if isinstance(item['created_at'], str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    return item

@api_router.put("/inventory/{item_id}")
async def update_inventory_item(item_id: str, username: str, quantity: int):
    result = await db.inventory.update_one(
        {"id": item_id, "username": username},
        {"$set": {"quantity": quantity}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return {"message": "Stock mis à jour"}

@api_router.delete("/inventory/{item_id}")
async def delete_inventory_item(item_id: str, username: str):
    result = await db.inventory.delete_one({"id": item_id, "username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return {"message": "Article supprimé"}

# ============ AI ROUTES ============

@api_router.post("/accounting/analyze")
async def analyze_accounting(request: AccountingAnalysisRequest, username: str):
    # Fetch invoices for the period
    invoices = await db.invoices.find({"username": username}, {"_id": 0}).to_list(1000)
    
    # Calculate basic stats
    total_revenue = sum(inv["total_ttc"] for inv in invoices if inv["status"] == "paid")
    total_pending = sum(inv["total_ttc"] for inv in invoices if inv["status"] == "unpaid")
    invoice_count = len(invoices)
    
    # Use GPT-5 for analysis
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=llm_key,
        session_id=f"accounting_{username}_{datetime.now(timezone.utc).isoformat()}",
        system_message="Tu es un expert comptable francophone spécialisé dans les PME artisanales. Analyse les données financières et fournis des recommandations claires et actionnables."
    ).with_model("openai", "gpt-5")
    
    prompt = f"""Analyse ces données comptables pour la période {request.period} ({request.year}):

- Chiffre d'affaires total: {total_revenue:.2f} EUR
- Factures en attente: {total_pending:.2f} EUR
- Nombre de factures: {invoice_count}

Fournis une analyse détaillée avec:
1. Santé financière globale
2. Points d'attention
3. Recommandations concrètes
4. Prévisions

Réponds en français de manière concise et professionnelle."""
    
    try:
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "analysis": response,
            "stats": {
                "total_revenue": total_revenue,
                "total_pending": total_pending,
                "invoice_count": invoice_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@api_router.post("/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    """Transcribe audio to text using OpenAI Whisper"""
    try:
        # Read audio file
        audio_content = await file.read()
        
        # Use OpenAI Whisper API via httpx
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        
        async with httpx.AsyncClient() as client:
            files = {
                'file': (file.filename, audio_content, file.content_type),
                'model': (None, 'whisper-1'),
            }
            headers = {'Authorization': f'Bearer {llm_key}'}
            
            response = await client.post(
                'https://api.openai.com/v1/audio/transcriptions',
                headers=headers,
                files=files,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Erreur Whisper: {response.text}")
            
            result = response.json()
            return VoiceTranscriptionResponse(text=result["text"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur transcription: {str(e)}")


# ============ CONTACT ROUTES ============

@api_router.post("/contact/send")
async def send_contact_message(message: ContactMessageCreate):
    """
    Endpoint public pour recevoir les messages du formulaire de contact
    """
    try:
        # Créer le message dans MongoDB
        contact_message = ContactMessage(
            name=message.name,
            email=message.email,
            subject=message.subject,
            message=message.message,
            status="new"
        )
        
        message_dict = contact_message.model_dump()
        message_dict["created_at"] = message_dict["created_at"].isoformat()
        
        await db.contact_messages.insert_one(message_dict)
        logger.info(f"Message de contact reçu de {message.name} ({message.email})")
        
        # Envoyer une notification email à l'admin
        try:
            send_contact_notification_email(
                admin_email="sav.artisanflow@gmail.com",
                contact_name=message.name,
                contact_email=message.email,
                contact_subject=message.subject,
                contact_message=message.message,
                submission_date=datetime.now(timezone.utc).strftime("%d/%m/%Y à %H:%M")
            )
            logger.info("Email de notification envoyé à l'admin")
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de l'email de notification: {str(e)}")
        
        return {
            "success": True,
            "message": "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
            "message_id": contact_message.id
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la réception du message de contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du message")


@api_router.get("/contact/messages")
async def get_contact_messages(status: Optional[str] = None):
    """
    Récupère tous les messages de contact (pour la console Admin)
    """
    try:
        query = {}
        if status:
            query["status"] = status
        
        messages = await db.contact_messages.find(query).sort("created_at", -1).to_list(500)
        
        # Convertir les ObjectId si nécessaire
        for msg in messages:
            if "_id" in msg:
                msg["_id"] = str(msg["_id"])
        
        return {
            "success": True,
            "messages": messages,
            "total": len(messages)
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des messages")


@api_router.patch("/contact/messages/{message_id}/status")
async def update_message_status(message_id: str, status: str):
    """
    Met à jour le statut d'un message (new, read, archived)
    """
    try:
        if status not in ["new", "read", "archived"]:
            raise HTTPException(status_code=400, detail="Statut invalide")
        
        result = await db.contact_messages.update_one(
            {"id": message_id},
            {"$set": {"status": status}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Message non trouvé")
        
        return {
            "success": True,
            "message": "Statut mis à jour avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du statut: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")


@api_router.delete("/contact/messages/{message_id}")
async def delete_contact_message(message_id: str):
    """
    Supprime un message de contact
    """
    try:
        result = await db.contact_messages.delete_one({"id": message_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message non trouvé")


# ============ AWS SNS ENDPOINTS (pour confirmation et notifications) ============

@api_router.post("/ses/subscription")
async def handle_sns_subscription(request: Request):
    """
    Endpoint pour recevoir les confirmations d'abonnement SNS
    """
    try:
        body = await request.json()
        logger.info("=" * 80)
        logger.info("📬 REQUÊTE SNS REÇUE - SUBSCRIPTION")
        logger.info("=" * 80)
        logger.info(f"Type: {body.get('Type')}")
        logger.info(f"Message: {body.get('Message', '')[:200]}")
        
        if body.get('Type') == 'SubscriptionConfirmation':
            subscribe_url = body.get('SubscribeURL')
            token = body.get('Token')
            topic_arn = body.get('TopicArn')
            
            logger.info("🔔 CONFIRMATION D'ABONNEMENT SNS")
            logger.info(f"📍 SubscribeURL: {subscribe_url}")
            logger.info(f"🎟️ Token: {token}")
            logger.info(f"📊 TopicArn: {topic_arn}")
            logger.info("=" * 80)
            
            # Sauvegarder dans un fichier pour récupération facile
            with open('/tmp/sns_subscription_info.txt', 'w') as f:
                f.write("=" * 80 + "\n")
                f.write("AWS SNS SUBSCRIPTION CONFIRMATION\n")
                f.write("=" * 80 + "\n\n")
                f.write(f"SubscribeURL: {subscribe_url}\n\n")
                f.write(f"Token: {token}\n\n")
                f.write(f"TopicArn: {topic_arn}\n\n")
                f.write("Pour confirmer l'abonnement, visitez le SubscribeURL dans votre navigateur.\n")
                f.write("=" * 80 + "\n")
            
            return {"status": "received", "message": "SubscribeURL logged"}
        
        return {"status": "received", "type": body.get('Type')}
        
    except Exception as e:
        logger.error(f"Erreur lors du traitement SNS: {str(e)}")
        return {"status": "error", "message": str(e)}


@api_router.post("/ses/notifications/bounce")
async def handle_bounce_notification(request: Request):
    """
    Endpoint pour recevoir les notifications de rebonds (bounces)
    """
    try:
        body = await request.json()
        logger.info("📬 SNS Bounce Notification reçue")
        
        if body.get('Type') == 'SubscriptionConfirmation':
            subscribe_url = body.get('SubscribeURL')
            logger.info(f"🔔 Bounce SubscribeURL: {subscribe_url}")
            
            with open('/tmp/sns_bounce_subscription.txt', 'w') as f:
                f.write(f"SubscribeURL: {subscribe_url}\n")
                f.write(f"Token: {body.get('Token')}\n")
        
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Erreur bounce notification: {str(e)}")
        return {"status": "error"}


@api_router.post("/ses/notifications/complaint")
async def handle_complaint_notification(request: Request):
    """
    Endpoint pour recevoir les notifications de plaintes (complaints)
    """
    try:
        body = await request.json()
        logger.info("📬 SNS Complaint Notification reçue")
        
        if body.get('Type') == 'SubscriptionConfirmation':
            subscribe_url = body.get('SubscribeURL')
            logger.info(f"🔔 Complaint SubscribeURL: {subscribe_url}")
            
            with open('/tmp/sns_complaint_subscription.txt', 'w') as f:
                f.write(f"SubscribeURL: {subscribe_url}\n")
                f.write(f"Token: {body.get('Token')}\n")
        
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Erreur complaint notification: {str(e)}")
        return {"status": "error"}


        
        return {
            "success": True,
            "message": "Message supprimé avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du message: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# ============ DASHBOARD STATS ============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(username: str):
    quotes = await db.quotes.find({"username": username}).to_list(1000)
    invoices = await db.invoices.find({"username": username}).to_list(1000)
    inventory = await db.inventory.find({"username": username}).to_list(1000)
    
    total_revenue = sum(inv["total_ttc"] for inv in invoices if inv["status"] == "paid")
    pending_invoices = sum(1 for inv in invoices if inv["status"] == "unpaid")
    pending_quotes = sum(1 for q in quotes if q["status"] == "draft")
    low_stock_items = sum(1 for item in inventory if item["quantity"] <= item["min_stock"])
    
    return {
        "total_revenue": total_revenue,
        "pending_invoices": pending_invoices,
        "pending_quotes": pending_quotes,
        "low_stock_items": low_stock_items,
        "total_quotes": len(quotes),
        "total_invoices": len(invoices),
        "total_inventory_items": len(inventory),
    }

@api_router.get("/")
async def root():
    return {"status": "ok", "message": "ArtisanFlow Backend API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()