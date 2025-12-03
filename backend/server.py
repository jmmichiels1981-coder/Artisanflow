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
from email_service import send_registration_confirmation_email, send_contact_notification_email

# IMPORTANT: Load .env BEFORE importing vat_validator
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Now import vat_validator after .env is loaded
from vat_validator import vat_validator

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
# Stripe Tax - Price IDs par devise
# Stripe Tax gère automatiquement le calcul de la TVA selon le pays et le statut fiscal
STRIPE_PRICE_IDS = {
    "EUR": "price_1SX0S77NHZXHRYC2ZdEkUuCr",  # Europe (BE, FR, LU, ES, IT, DE, autres UE)
    "CHF": "price_1SX1AH7NHZXHRYC28taLJotZ",  # Suisse
    "CAD": "price_1SX1AH7NHZXHRYC2wB2UQxfI",  # Canada/Québec
    "GBP": "price_1SX1AH7NHZXHRYC2EnEbPQ8J",  # Royaume-Uni
    "USD": "price_1SX1AH7NHZXHRYC25mExGUlA",  # États-Unis
}

# Mapping pays -> devise (pour sélectionner le bon Price ID)
COUNTRY_TO_CURRENCY = {
    "BE": "EUR", "FR": "EUR", "LU": "EUR", "ES": "EUR", "IT": "EUR", "DE": "EUR",
    "NL": "EUR", "AT": "EUR", "PT": "EUR", "IE": "EUR", "FI": "EUR", "GR": "EUR",
    "CH": "CHF",
    "CA": "CAD",
    "GB": "GBP",
    "US": "USD",
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
    # Champs pour Stripe Tax
    addressLine1: Optional[str] = None  # Adresse complète
    city: Optional[str] = None
    postalCode: Optional[str] = None
    vatNumber: Optional[str] = None  # Numéro de TVA intracommunautaire (optionnel pour B2B UE)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ResetPasswordWithPinRequest(BaseModel):
    token: str
    new_password: str
    pin: str  # PIN requis pour valider

class ForgotPinRequest(BaseModel):
    email: EmailStr

class ResetPinWithPasswordRequest(BaseModel):
    token: str
    new_pin: str
    password: str  # Mot de passe requis pour valider

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
    vatNumber: Optional[str] = None  # VAT/TVA number (unique per company)
    gstNumber: Optional[str] = None  # TPS/GST pour Québec
    vat_verification_status: Optional[str] = "pending"  # verified, pending, format_only, invalid
    vat_verified_company_name: Optional[str] = None  # From VIES/UID
    vat_verified_address: Optional[str] = None  # From VIES/UID
    refresh_token: Optional[str] = None
    is_admin: bool = False  # Flag pour identifier les administrateurs
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
    
    # ========== VALIDATION VAT/COMPANY NUMBER BEFORE STRIPE CUSTOMER ==========
    # This ensures no Stripe customer is created if validation fails
    logger.info(f"🔍 Validating business identifiers before Stripe creation for {request.email}")

    # 1️⃣ CHECK VAT UNIQUENESS - One company can only register once
    if request.vatNumber:
        vat_clean = request.vatNumber.replace(" ", "").replace("-", "").replace(".", "").upper()
        existing_vat = await db.users.find_one({"vatNumber": vat_clean}, {"_id": 0})
        if existing_vat:
            logger.warning(f"⚠️ VAT number {vat_clean} already registered by user {existing_vat.get('username')}")
            raise HTTPException(
                status_code=409, 
                detail=f"Ce numéro de TVA ({vat_clean}) est déjà enregistré dans notre système. Une entreprise ne peut créer qu'un seul compte."
            )
        logger.info(f"✅ VAT number {vat_clean} is unique")
    
    # 2️⃣ VALIDATE VAT WITH OFFICIAL APIS (VIES for EU, HMRC for UK)
    if request.vatNumber and request.countryCode.upper() in ['FR', 'BE', 'LU', 'DE', 'IT', 'ES', 'GB', 'CH', 'CA']:
        logger.info(f"🔍 Validating VAT {request.vatNumber} for country {request.countryCode}")
        validation_result = await vat_validator.validate_vat(request.vatNumber, request.countryCode.upper())
        
        logger.info(f"📋 VAT Validation Result: {validation_result}")
        
        # If validation explicitly says INVALID, block registration
        if validation_result.get('status') == 'invalid' or validation_result.get('valid') == False:
            logger.error(f"❌ VAT validation failed: {validation_result.get('message')}")
            raise HTTPException(
                status_code=400, 
                detail=f"Numéro de TVA invalide : {validation_result.get('message')}"
            )
        
        # If validated successfully via API, store company info
        if validation_result.get('verified') and validation_result.get('company_name'):
            logger.info(f"✅ VAT verified! Company: {validation_result.get('company_name')}")
            # We'll store this in the user record later
            request.vat_verified_company_name = validation_result.get('company_name')
            request.vat_verified_address = validation_result.get('address')
        else:
            logger.info(f"⏳ VAT format valid but not verified via API: {validation_result.get('message')}")
    
    logger.info(f"✅ All business identifier validations passed for {request.email}")

    # Determine country and Price ID for Stripe Tax
    country = request.countryCode.upper()
    currency = COUNTRY_TO_CURRENCY.get(country, "EUR")
    price_id = STRIPE_PRICE_IDS.get(currency)
    
    if not price_id:
        logger.error(f"No Price ID found for currency {currency} (country: {country})")
        raise HTTPException(status_code=400, detail=f"Devise {currency} non supportée")
    
    logger.info(f"Using Price ID {price_id} for {country} ({currency})")

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
            
            # Prepare address for Stripe Tax
            address_data = None
            if request.addressLine1 and request.city and request.postalCode:
                address_data = {
                    "line1": request.addressLine1,
                    "city": request.city,
                    "postal_code": request.postalCode,
                    "country": country
                }
                logger.info(f"Address provided for Stripe Tax: {request.city}, {country}")
            
            # Update customer with complete registration info + address for Stripe Tax
            customer_update_data = {
                "email": request.email,
                "name": f"{request.firstName} {request.lastName}",
                "metadata": {
                    "username": request.username, 
                    "countryCode": country,
                    "companyName": request.companyName,
                    "stage": "registered"
                },
                "description": f"{request.companyName} - {request.firstName} {request.lastName}",
                "invoice_settings": {"default_payment_method": request.stripePaymentMethodId},
            }
            
            if address_data:
                customer_update_data["address"] = address_data
            
            customer_obj = stripe.Customer.modify(customer_id, **customer_update_data)
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
            
            # Prepare address for Stripe Tax
            address_data = None
            if request.addressLine1 and request.city and request.postalCode:
                address_data = {
                    "line1": request.addressLine1,
                    "city": request.city,
                    "postal_code": request.postalCode,
                    "country": country
                }
                logger.info(f"Address provided for Stripe Tax: {request.city}, {country}")
            
            customer_create_data = {
                "email": request.email,
                "name": f"{request.firstName} {request.lastName}",
                "metadata": {
                    "username": request.username, 
                    "countryCode": country,
                    "companyName": request.companyName
                },
                "description": f"{request.companyName} - {request.firstName} {request.lastName}"
            }
            
            if address_data:
                customer_create_data["address"] = address_data
            
            customer_obj = stripe.Customer.create(**customer_create_data)
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

        # Add tax_id to Customer if VAT number provided (for B2B reverse charge)
        if request.vatNumber and country in ["BE", "FR", "LU", "ES", "IT", "DE", "NL", "AT", "PT", "IE", "FI", "GR", "GB"]:
            try:
                vat_number_clean = request.vatNumber.replace(" ", "").upper()
                # Determine tax_id type based on country
                if country == "GB":
                    tax_id_type = "gb_vat"
                elif country == "CH":
                    tax_id_type = "ch_vat"
                else:
                    tax_id_type = "eu_vat"
                
                # Create tax_id for the customer
                tax_id_obj = stripe.Customer.create_tax_id(
                    customer_id,
                    type=tax_id_type,
                    value=vat_number_clean
                )
                logger.info(f"✅ Tax ID added to customer {customer_id}: {vat_number_clean} (type: {tax_id_type})")
                logger.info(f"Tax ID verification status: {tax_id_obj.verification.status}")
            except stripe._error.StripeError as e:
                logger.warning(f"⚠️ Could not add tax_id to customer: {str(e)}")
                # Continue anyway - Stripe Tax will still work, just won't apply reverse charge

        # Create subscription with Stripe Tax enabled and Price ID
        # Stripe Tax will automatically calculate VAT based on customer address and tax_id
        logger.info(f"Creating subscription for customer {customer_id} with Stripe Tax enabled")
        logger.info(f"Using Price ID: {price_id} ({currency})")
        
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            trial_end=trial_end,  # No charge until Sept 1, 2026
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
            automatic_tax={"enabled": True},  # ✨ Stripe Tax activated
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
    
    # Prepare VAT status based on validation
    vat_status = "pending"
    vat_company_name = None
    vat_address = None
    
    if hasattr(request, 'vat_verified_company_name') and request.vat_verified_company_name:
        vat_status = "verified"
        vat_company_name = request.vat_verified_company_name
        vat_address = getattr(request, 'vat_verified_address', None)
    elif request.vatNumber:
        vat_status = "format_only"
    
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
        vatNumber=request.vatNumber.replace(" ", "").replace("-", "").replace(".", "").upper() if request.vatNumber else None,
        gstNumber=request.gstNumber if country == "CA" else None,
        vat_verification_status=vat_status,
        vat_verified_company_name=vat_company_name,
        vat_verified_address=vat_address,
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    logger.info(f"User {request.username} created in database with customer_id {customer_id}")

    # Create subscription record
    # Note: amount will be calculated by Stripe Tax (we don't store it here)
    subscription_record = {
        "user_email": request.email,
        "username": request.username,
        "stripe_subscription_id": subscription_id,
        "stripe_customer_id": customer_id,
        "status": "Actif",
        "currency": currency,
        "price_id": price_id,  # Store the Price ID used
        "failures": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.subscriptions.insert_one(subscription_record)
    logger.info(f"Subscription record created: {subscription_id} for user {request.username} with Price ID {price_id}")

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
    logger.info(f"🔍 LOGIN ATTEMPT: email={req.email}")
    user = await db.users.find_one({"email": req.email})
    if not user:
        logger.warning(f"❌ User not found: {req.email}")
        raise HTTPException(status_code=401, detail="Email, mot de passe ou PIN incorrect.")
    
    logger.info(f"✅ User found: {user.get('username')}")
    logger.info(f"🔑 Stored password_hash: {user.get('password_hash')[:20]}...")
    logger.info(f"🔑 Stored pin_hash: {user.get('pin_hash')[:20]}...")
    
    # Verify password
    calculated_password_hash = hash_password(req.password)
    logger.info(f"🔑 Calculated password_hash: {calculated_password_hash[:20]}...")
    password_match = verify_password(req.password, user["password_hash"])
    logger.info(f"🔐 Password match: {password_match}")
    
    if not password_match:
        logger.warning(f"❌ Password mismatch for {req.email}")
        raise HTTPException(status_code=401, detail="Email, mot de passe ou PIN incorrect.")
    
    # Verify PIN
    calculated_pin_hash = hash_password(req.pin)
    logger.info(f"🔑 Calculated pin_hash: {calculated_pin_hash[:20]}...")
    pin_match = verify_password(req.pin, user.get("pin_hash", ""))
    logger.info(f"🔐 PIN match: {pin_match}")
    
    if not pin_match:
        logger.warning(f"❌ PIN mismatch for {req.email}")
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
        "is_admin": user.get("is_admin", False),  # Retourner le flag admin
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
    """Envoie un email avec un lien pour réinitialiser le mot de passe"""
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Informer l'utilisateur que l'email n'existe pas
        raise HTTPException(status_code=404, detail="Aucun compte n'est associé à cet email")

    # Créer un token unique
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    # Sauvegarder dans MongoDB
    await db.password_resets.insert_one({
        "email": req.email,
        "token": token,
        "type": "password",
        "expires_at": expires_at.isoformat()
    })

    # Envoyer l'email avec le lien
    reset_link = f"https://artisanflow-appli.com/reset-password?token={token}"
    
    from email_service import send_email
    
    email_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #f97316;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe ArtisanFlow.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        <p style="margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Réinitialiser mon mot de passe
            </a>
        </p>
        <p style="color: #dc2626;"><strong>⚠️ Important :</strong> Vous devrez entrer votre code PIN actuel pour valider le changement.</p>
        <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 1 heure.</p>
        <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe ArtisanFlow</p>
    </body>
    </html>
    """
    
    email_text = f"""
Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe ArtisanFlow.

Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
{reset_link}

⚠️ Vous devrez entrer votre code PIN actuel pour valider le changement.

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe ArtisanFlow
    """
    
    send_email(
        to_email=req.email,
        subject="Réinitialisation de votre mot de passe - ArtisanFlow",
        html_content=email_html,
        text_content=email_text
    )
    
    logger.info(f"Email de réinitialisation de mot de passe envoyé à {req.email}")
    return {"message": "Si un compte existe, un email a été envoyé."}


@api_router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordWithPinRequest):
    """Réinitialise le mot de passe avec validation du PIN"""
    # Vérifier le token
    reset_entry = await db.password_resets.find_one({"token": req.token, "type": "password"})
    if not reset_entry:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")

    if datetime.fromisoformat(reset_entry["expires_at"]) < datetime.now(timezone.utc):
        await db.password_resets.delete_one({"token": req.token})
        raise HTTPException(status_code=400, detail="Ce lien a expiré")

    # Récupérer l'utilisateur
    user = await db.users.find_one({"email": reset_entry["email"]})
    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur introuvable")

    # VALIDER LE PIN
    if not verify_password(req.pin, user["pin_hash"]):
        raise HTTPException(status_code=400, detail="Code PIN incorrect")

    # Mettre à jour le mot de passe
    await db.users.update_one(
        {"email": reset_entry["email"]},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    
    # Supprimer le token utilisé
    await db.password_resets.delete_one({"token": req.token})
    
    logger.info(f"Mot de passe réinitialisé avec succès pour {reset_entry['email']}")
    return {"message": "Mot de passe réinitialisé avec succès"}


@api_router.post("/auth/forgot-pin")
async def forgot_pin(req: ForgotPinRequest):
    """Envoie un email avec un lien pour réinitialiser le code PIN"""
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Informer l'utilisateur que l'email n'existe pas
        raise HTTPException(status_code=404, detail="Aucun compte n'est associé à cet email")

    # Créer un token unique
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    # Sauvegarder dans MongoDB
    await db.password_resets.insert_one({
        "email": req.email,
        "token": token,
        "type": "pin",
        "expires_at": expires_at.isoformat()
    })

    # Envoyer l'email avec le lien
    reset_link = f"https://artisanflow-appli.com/reset-pin?token={token}"
    
    from email_service import send_email
    
    email_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #f97316;">Réinitialisation de votre code PIN</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre code PIN ArtisanFlow.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau code PIN :</p>
        <p style="margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Réinitialiser mon code PIN
            </a>
        </p>
        <p style="color: #dc2626;"><strong>⚠️ Important :</strong> Vous devrez entrer votre mot de passe actuel pour valider le changement.</p>
        <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 1 heure.</p>
        <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe ArtisanFlow</p>
    </body>
    </html>
    """
    
    email_text = f"""
Bonjour,

Vous avez demandé la réinitialisation de votre code PIN ArtisanFlow.

Cliquez sur le lien ci-dessous pour créer un nouveau code PIN :
{reset_link}

⚠️ Vous devrez entrer votre mot de passe actuel pour valider le changement.

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe ArtisanFlow
    """
    
    send_email(
        to_email=req.email,
        subject="Réinitialisation de votre code PIN - ArtisanFlow",
        html_content=email_html,
        text_content=email_text
    )
    
    logger.info(f"Email de réinitialisation de PIN envoyé à {req.email}")
    return {"message": "Si un compte existe, un email a été envoyé."}


@api_router.post("/auth/reset-pin")
async def reset_pin(req: ResetPinWithPasswordRequest):
    """Réinitialise le code PIN avec validation du mot de passe"""
    # Vérifier le token
    reset_entry = await db.password_resets.find_one({"token": req.token, "type": "pin"})
    if not reset_entry:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")

    if datetime.fromisoformat(reset_entry["expires_at"]) < datetime.now(timezone.utc):
        await db.password_resets.delete_one({"token": req.token})
        raise HTTPException(status_code=400, detail="Ce lien a expiré")

    # Récupérer l'utilisateur
    user = await db.users.find_one({"email": reset_entry["email"]})
    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur introuvable")

    # VALIDER LE MOT DE PASSE
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect")

    # Mettre à jour le PIN
    await db.users.update_one(
        {"email": reset_entry["email"]},
        {"$set": {"pin_hash": hash_password(req.new_pin)}}
    )
    
    # Supprimer le token utilisé
    await db.password_resets.delete_one({"token": req.token})
    
    logger.info(f"Code PIN réinitialisé avec succès pour {reset_entry['email']}")
    return {"message": "Code PIN réinitialisé avec succès"}

@api_router.post("/auth/forgot-username")
async def forgot_username(req: ForgotPasswordRequest):
    user = await db.users.find_one({"email": req.email})
    if user:
        print(f"[SIMULATION EMAIL] Identifiant pour {req.email}: {user['username']}")
    return {"message": "Si un compte existe, votre identifiant a été envoyé."}

@api_router.post("/auth/reset-account")
async def reset_account(data: dict):
    """
    Endpoint pour réinitialiser complètement un compte à l'état "nouvel utilisateur"
    Supprime toute configuration, tutoriels vus, etc.
    """
    email = data.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email requis")
    
    # Trouver l'utilisateur
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Supprimer TOUS les champs de configuration
    result = await db.users.update_one(
        {"email": email},
        {"$unset": {
            "config": "",
            "first_login": "",
            "first_login_completed": "",
            "onboarding_completed": "",
            "onboarding": "",
            "tutorials_seen": "",
            "tutorial_seen": "",
            "configuration_completed": "",
            "setup_completed": "",
            "has_config": "",
            "has_configured": "",
            "parametres": "",
            "settings": "",
            "currency": "",
            "country_code": ""
        }}
    )
    
    return {
        "success": True,
        "message": "Compte réinitialisé avec succès",
        "email": email,
        "reset": True
    }

@api_router.post("/users/{username}/configuration")
async def save_user_configuration(username: str, config: dict):
    """
    Sauvegarder la configuration utilisateur (taux, marge, devise, acompte, etc.)
    Ce flag empêche le modal de configuration de réapparaître
    """
    try:
        logger.info(f"💾 Sauvegarde configuration pour {username}")
        
        # Mettre à jour la config utilisateur
        result = await db.users.update_one(
            {"username": username},
            {"$set": {
                "configuration": config,
                "has_configured": True,
                "profile_completed": True,
                "country": config.get("country"),
                "currency": config.get("currency"),
                "deposit_percentage": config.get("depositPercentage", 30)
            }}
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Configuration sauvegardée pour {username}")
            return {"success": True, "message": "Configuration enregistrée"}
        else:
            logger.warning(f"⚠️ Aucune modification pour {username}")
            return {"success": False, "message": "Utilisateur non trouvé"}
            
    except Exception as e:
        logger.error(f"❌ Erreur sauvegarde config: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde")

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

    return_url = req.return_url or "https://artisanflow-appli.com"

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
    logger.info(f"📬 Webhook Stripe reçu: {event_type}")
    
    if event_type == "invoice.paid":
        # Facture payée avec succès
        sub_id = data.get("subscription")
        customer_id = data.get("customer")
        invoice_id = data.get("id")
        amount_paid = data.get("amount_paid", 0) / 100  # Convertir centimes en euros
        
        logger.info(f"✅ Facture payée: {invoice_id} - {amount_paid}€")
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {
                "status": "active",
                "is_active": True,
                "failures": 0,
                "last_payment_date": datetime.now(timezone.utc).isoformat(),
                "last_invoice_id": invoice_id
            }}
        )
        
        # Envoyer la facture PDF par email (si configuré dans Stripe Dashboard)
        # La facture est automatiquement envoyée par Stripe si activé
        logger.info(f"Facture PDF disponible: https://dashboard.stripe.com/invoices/{invoice_id}")
        
    elif event_type == "invoice.payment_succeeded":
        # Alias pour invoice.paid (gardé pour compatibilité)
        sub_id = data.get("subscription")
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {"status": "active", "is_active": True, "failures": 0}}
        )
        
    elif event_type == "invoice.payment_failed":
        # Échec de paiement
        sub_id = data.get("subscription")
        invoice_id = data.get("id")
        
        logger.warning(f"❌ Échec paiement facture: {invoice_id}")
        
        # Récupérer le nombre de tentatives
        subscription_db = await db.subscriptions.find_one({"stripe_subscription_id": sub_id})
        failures = subscription_db.get("failures", 0) + 1 if subscription_db else 1
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {
                "status": "past_due",
                "is_active": False,
                "failures": failures,
                "last_failed_invoice": invoice_id
            }}
        )
        
    elif event_type == "customer.subscription.created":
        # Nouvel abonnement créé
        sub_id = data.get("id")
        status = data.get("status")
        current_period_end = data.get("current_period_end")
        
        logger.info(f"🆕 Abonnement créé: {sub_id} - Statut: {status}")
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {
                "status": status,
                "is_active": status in ["active", "trialing"],
                "current_period_end": datetime.fromtimestamp(current_period_end, tz=timezone.utc).isoformat() if current_period_end else None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
    elif event_type == "customer.subscription.updated":
        # Abonnement mis à jour (changement de statut, de plan, etc.)
        sub_id = data.get("id")
        status = data.get("status")
        cancel_at_period_end = data.get("cancel_at_period_end", False)
        current_period_end = data.get("current_period_end")
        
        logger.info(f"🔄 Abonnement mis à jour: {sub_id} - Statut: {status}")
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {
                "status": status,
                "is_active": status in ["active", "trialing"],
                "cancel_at_period_end": cancel_at_period_end,
                "current_period_end": datetime.fromtimestamp(current_period_end, tz=timezone.utc).isoformat() if current_period_end else None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
    elif event_type == "customer.subscription.deleted":
        # Abonnement annulé/supprimé
        sub_id = data.get("id")
        
        logger.info(f"🗑️ Abonnement supprimé: {sub_id}")
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {
                "status": "canceled",
                "is_active": False,
                "canceled_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
    elif event_type == "customer.subscription.trial_will_end":
        # La période d'essai se termine bientôt (3 jours avant)
        sub_id = data.get("id")
        trial_end = data.get("trial_end")
        
        logger.info(f"⏰ Période d'essai se termine bientôt: {sub_id}")
        
        # TODO: Envoyer un email de rappel à l'utilisateur
        
    elif event_type == "invoice.finalized":
        # Facture finalisée et prête à être envoyée
        invoice_id = data.get("id")
        invoice_pdf = data.get("invoice_pdf")
        
        logger.info(f"📄 Facture finalisée: {invoice_id}")
        logger.info(f"   PDF disponible: {invoice_pdf}")
        
        # Stripe envoie automatiquement la facture par email si configuré
        # dans Settings > Billing > Emails dans le Dashboard Stripe
    
    elif event_type == "customer.tax_id.updated":
        # Tax ID mis à jour (validation réussie ou échouée)
        tax_id = data.get("id")
        customer_id = data.get("customer")
        tax_id_value = data.get("value")
        verification_status = data.get("verification", {}).get("status")
        
        logger.info(f"🆔 Tax ID mis à jour: {tax_id} pour customer {customer_id}")
        logger.info(f"   Valeur: {tax_id_value} | Statut de vérification: {verification_status}")
        
        # Mettre à jour le statut de vérification dans MongoDB
        if verification_status in ["verified", "unverified", "pending"]:
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {
                    "vat_verification_status": verification_status,
                    "vat_verified_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"✅ Statut de vérification VAT mis à jour dans DB: {verification_status}")

    return {"status": "success"}


# ============ SUBSCRIPTION ROUTES ============

@api_router.get("/subscription/status")
async def get_subscription_status(username: str):
    """
    Récupère l'état de l'abonnement de l'utilisateur
    """
    try:
        user = await db.users.find_one({"username": username})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        subscription = await db.subscriptions.find_one(
            {"username": username},
            {"_id": 0}
        )
        
        if not subscription:
            return {
                "has_subscription": False,
                "message": "Aucun abonnement trouvé"
            }
        
        # Récupérer les détails depuis Stripe
        stripe_sub_id = subscription.get("stripe_subscription_id")
        if stripe_sub_id:
            try:
                stripe_subscription = stripe.Subscription.retrieve(stripe_sub_id)
                
                # Synchroniser le statut si différent
                if stripe_subscription.status != subscription.get("status"):
                    await db.subscriptions.update_one(
                        {"stripe_subscription_id": stripe_sub_id},
                        {"$set": {
                            "status": stripe_subscription.status,
                            "is_active": stripe_subscription.status in ["active", "trialing"],
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    subscription["status"] = stripe_subscription.status
                    subscription["is_active"] = stripe_subscription.status in ["active", "trialing"]
                
                return {
                    "has_subscription": True,
                    "subscription": subscription,
                    "stripe_status": stripe_subscription.status,
                    "current_period_end": stripe_subscription.current_period_end,
                    "cancel_at_period_end": stripe_subscription.cancel_at_period_end,
                    "trial_end": stripe_subscription.trial_end
                }
            except stripe._error.StripeError as e:
                logger.error(f"Erreur Stripe lors de la récupération de l'abonnement: {str(e)}")
        
        return {
            "has_subscription": True,
            "subscription": subscription
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'abonnement: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération de l'abonnement")


@api_router.post("/subscription/cancel")
async def cancel_subscription(username: str):
    """
    Annule l'abonnement de l'utilisateur (à la fin de la période en cours)
    """
    try:
        subscription = await db.subscriptions.find_one({"username": username})
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Aucun abonnement trouvé")
        
        stripe_sub_id = subscription.get("stripe_subscription_id")
        
        if not stripe_sub_id:
            raise HTTPException(status_code=400, detail="ID d'abonnement Stripe manquant")
        
        # Annuler l'abonnement dans Stripe (à la fin de la période)
        updated_subscription = stripe.Subscription.modify(
            stripe_sub_id,
            cancel_at_period_end=True
        )
        
        # Mettre à jour dans MongoDB
        await db.subscriptions.update_one(
            {"stripe_subscription_id": stripe_sub_id},
            {"$set": {
                "cancel_at_period_end": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Abonnement {stripe_sub_id} annulé à la fin de la période pour {username}")
        
        return {
            "success": True,
            "message": "Abonnement annulé à la fin de la période en cours",
            "cancel_at": updated_subscription.current_period_end
        }
        
    except stripe._error.StripeError as e:
        logger.error(f"Erreur Stripe lors de l'annulation: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")
    except Exception as e:
        logger.error(f"Erreur lors de l'annulation de l'abonnement: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'annulation")


@api_router.post("/subscription/reactivate")
async def reactivate_subscription(username: str):
    """
    Réactive un abonnement qui était prévu d'être annulé
    """
    try:
        subscription = await db.subscriptions.find_one({"username": username})
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Aucun abonnement trouvé")
        
        stripe_sub_id = subscription.get("stripe_subscription_id")
        
        if not stripe_sub_id:
            raise HTTPException(status_code=400, detail="ID d'abonnement Stripe manquant")
        
        # Réactiver l'abonnement dans Stripe
        updated_subscription = stripe.Subscription.modify(
            stripe_sub_id,
            cancel_at_period_end=False
        )
        
        # Mettre à jour dans MongoDB
        await db.subscriptions.update_one(
            {"stripe_subscription_id": stripe_sub_id},
            {"$set": {
                "cancel_at_period_end": False,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Abonnement {stripe_sub_id} réactivé pour {username}")
        
        return {
            "success": True,
            "message": "Abonnement réactivé avec succès"
        }
        
    except stripe._error.StripeError as e:
        logger.error(f"Erreur Stripe lors de la réactivation: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")
    except Exception as e:
        logger.error(f"Erreur lors de la réactivation de l'abonnement: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la réactivation")


@api_router.post("/subscription/update-payment-method")
async def update_payment_method(username: str, payment_method_id: str):
    """
    Met à jour le moyen de paiement de l'abonnement de l'utilisateur
    """
    try:
        user = await db.users.find_one({"username": username})
        
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable")
        
        customer_id = user.get("stripe_customer_id")
        
        if not customer_id:
            raise HTTPException(status_code=400, detail="Customer Stripe non trouvé")
        
        # Attacher le nouveau moyen de paiement au customer
        stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )
        logger.info(f"Attached payment method {payment_method_id} to customer {customer_id}")
        
        # Définir comme moyen de paiement par défaut
        stripe.Customer.modify(
            customer_id,
            invoice_settings={"default_payment_method": payment_method_id}
        )
        logger.info(f"Set {payment_method_id} as default payment method for customer {customer_id}")
        
        return {
            "success": True,
            "message": "Moyen de paiement mis à jour avec succès"
        }
        
    except stripe._error.StripeError as e:
        logger.error(f"Erreur Stripe lors de la mise à jour du moyen de paiement: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du moyen de paiement: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

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


# ============ CLIENTS ROUTES ============

@api_router.post("/clients")
async def create_client(client_data: dict, username: str):
    """Create a new client"""
    client = {
        "id": str(uuid4()),
        "username": username,
        "name": client_data.get("name"),
        "email": client_data.get("email"),
        "phone": client_data.get("phone"),
        "address": client_data.get("address"),
        "city": client_data.get("city"),
        "postal_code": client_data.get("postal_code"),
        "notes": client_data.get("notes", ""),
        "created_at": datetime.now(timezone.utc)
    }
    await db.clients.insert_one(client)
    return {"message": "Client créé", "client_id": client["id"]}

@api_router.get("/clients")
async def get_clients(username: str):
    """Get all clients for a user"""
    clients = await db.clients.find(
        {"username": username},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return clients

@api_router.get("/clients/{client_id}")
async def get_client(client_id: str, username: str):
    """Get a specific client"""
    client = await db.clients.find_one(
        {"id": client_id, "username": username},
        {"_id": 0}
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return client

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, client_data: dict, username: str):
    """Update a client"""
    result = await db.clients.update_one(
        {"id": client_id, "username": username},
        {"$set": {
            "name": client_data.get("name"),
            "email": client_data.get("email"),
            "phone": client_data.get("phone"),
            "address": client_data.get("address"),
            "city": client_data.get("city"),
            "postal_code": client_data.get("postal_code"),
            "notes": client_data.get("notes", "")
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return {"message": "Client mis à jour"}

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, username: str):
    """Delete a client"""
    result = await db.clients.delete_one({"id": client_id, "username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return {"message": "Client supprimé"}


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
        
        return {
            "success": True,
            "message": "Message supprimé avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du message: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


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
        message_type = body.get('Type')
        
        logger.info(f"📬 SNS Bounce - Type: {message_type}")
        
        if message_type == 'SubscriptionConfirmation':
            subscribe_url = body.get('SubscribeURL')
            token = body.get('Token')
            topic_arn = body.get('TopicArn')
            
            logger.info(f"🔔 Bounce SubscriptionConfirmation reçue")
            logger.info(f"   SubscribeURL: {subscribe_url}")
            logger.info(f"   Token: {token}")
            logger.info(f"   TopicArn: {topic_arn}")
            
            # CONFIRMATION AUTOMATIQUE - Faire un GET sur le SubscribeURL
            try:
                import requests
                confirm_response = requests.get(subscribe_url, timeout=10)
                
                if confirm_response.status_code == 200:
                    logger.info("✅ Abonnement SNS Bounce confirmé automatiquement !")
                    
                    # Sauvegarder pour référence
                    with open('/tmp/sns_bounce_confirmed.txt', 'w') as f:
                        f.write(f"Abonnement confirmé automatiquement\n")
                        f.write(f"SubscribeURL: {subscribe_url}\n")
                        f.write(f"Token: {token}\n")
                        f.write(f"TopicArn: {topic_arn}\n")
                        f.write(f"Confirmation response: {confirm_response.status_code}\n")
                    
                    return {"status": "confirmed", "message": "Subscription confirmed automatically"}
                else:
                    logger.error(f"❌ Échec confirmation: HTTP {confirm_response.status_code}")
                    return {"status": "error", "message": f"Confirmation failed: {confirm_response.status_code}"}
                    
            except Exception as e:
                logger.error(f"❌ Erreur lors de la confirmation automatique: {str(e)}")
                return {"status": "error", "message": str(e)}
        
        elif message_type == 'Notification':
            # Traiter les notifications de bounce réelles
            message = body.get('Message')
            logger.info(f"📧 Bounce notification: {message[:200] if message else 'N/A'}")
            
            # TODO: Traiter les bounces (marquer les emails comme invalides, etc.)
            
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"❌ Erreur bounce notification: {str(e)}")
        return {"status": "error", "message": str(e)}


@api_router.post("/ses/notifications/complaint")
async def handle_complaint_notification(request: Request):
    """
    Endpoint pour recevoir les notifications de plaintes (complaints)
    """
    try:
        body = await request.json()
        message_type = body.get('Type')
        
        logger.info(f"📬 SNS Complaint - Type: {message_type}")
        
        if message_type == 'SubscriptionConfirmation':
            subscribe_url = body.get('SubscribeURL')
            token = body.get('Token')
            topic_arn = body.get('TopicArn')
            
            logger.info(f"🔔 Complaint SubscriptionConfirmation reçue")
            logger.info(f"   SubscribeURL: {subscribe_url}")
            logger.info(f"   Token: {token}")
            logger.info(f"   TopicArn: {topic_arn}")
            
            # CONFIRMATION AUTOMATIQUE - Faire un GET sur le SubscribeURL
            try:
                import requests
                confirm_response = requests.get(subscribe_url, timeout=10)
                
                if confirm_response.status_code == 200:
                    logger.info("✅ Abonnement SNS Complaint confirmé automatiquement !")
                    
                    # Sauvegarder pour référence
                    with open('/tmp/sns_complaint_confirmed.txt', 'w') as f:
                        f.write(f"Abonnement confirmé automatiquement\n")
                        f.write(f"SubscribeURL: {subscribe_url}\n")
                        f.write(f"Token: {token}\n")
                        f.write(f"TopicArn: {topic_arn}\n")
                        f.write(f"Confirmation response: {confirm_response.status_code}\n")
                    
                    return {"status": "confirmed", "message": "Subscription confirmed automatically"}
                else:
                    logger.error(f"❌ Échec confirmation: HTTP {confirm_response.status_code}")
                    return {"status": "error", "message": f"Confirmation failed: {confirm_response.status_code}"}
                    
            except Exception as e:
                logger.error(f"❌ Erreur lors de la confirmation automatique: {str(e)}")
                return {"status": "error", "message": str(e)}
        
        elif message_type == 'Notification':
            # Traiter les notifications de complaint réelles
            message = body.get('Message')
            logger.info(f"⚠️ Complaint notification: {message[:200] if message else 'N/A'}")
            
            # TODO: Traiter les plaintes (désabonner l'email, marquer comme spam, etc.)
            
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"❌ Erreur complaint notification: {str(e)}")
        return {"status": "error", "message": str(e)}


        
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