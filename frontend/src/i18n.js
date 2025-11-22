import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traductions
const resources = {
  fr: {
    translation: {
      // Landing Page
      "welcome": "Bienvenue sur ArtisanFlow",
      "tagline": "La gestion simplifiée pour artisans",
      "login": "Se connecter",
      "register": "Créer un compte",
      
      // Login Page
      "connection": "Connexion",
      "email": "Email",
      "password": "Mot de passe",
      "pin": "Code PIN (4 chiffres)",
      "connect": "Se connecter",
      "no_account": "Pas encore de compte ?",
      "create_account": "Créer un compte",
      "back_home": "← Retour à l'accueil",
      
      // Register Page
      "registration": "Inscription",
      "company_name": "Nom de l'entreprise",
      "last_name": "Nom du dirigeant",
      "first_name": "Prénom du dirigeant",
      "repeat_password": "Répéter mot de passe",
      "pin_code": "Code PIN (4 chiffres)",
      "repeat_pin": "Répéter le code PIN",
      "country": "Pays",
      "street": "Rue",
      "number": "Numéro",
      "box": "Boîte (optionnel)",
      "postal_code": "Code postal",
      "city": "Ville",
      "mobile": "Mobile",
      "profession": "Métier",
      "specify_profession": "Précisez votre métier",
      "continue": "Continuer",
      "payment": "Paiement",
      "payment_method": "Mode de paiement",
      "card_payment": "Carte bancaire (Visa/Mastercard)",
      "card_only": "Carte bancaire uniquement",
      "sepa_payment": "Prélèvement SEPA",
      "billing_postal_code": "Code postal de facturation",
      "create_my_account": "Créer mon compte",
      
      // Dashboard
      "dashboard": "Tableau de bord",
      "quotes": "Devis",
      "invoices": "Factures",
      "inventory": "Stock",
      "accounting": "Comptabilité IA",
      "logout": "Déconnexion",
      
      // Errors & Messages
      "error": "Erreur",
      "success": "Succès",
      "loading": "Chargement...",
      "account_exists": "Un compte existe déjà avec cet email.",
      "invalid_credentials": "Email, mot de passe ou PIN incorrect.",
      "vat_verifying": "Vérification du numéro de TVA en cours...",
      "vat_verified": "TVA vérifiée",
      "vat_pending": "TVA en attente de vérification",
      "vat_format_valid": "Format TVA valide",
      "vat_invalid": "Numéro de TVA non trouvé dans les registres officiels"
    }
  },
  en: {
    translation: {
      "welcome": "Welcome to ArtisanFlow",
      "tagline": "Simplified management for artisans",
      "login": "Log in",
      "register": "Sign up",
      "connection": "Login",
      "email": "Email",
      "password": "Password",
      "pin": "PIN Code (4 digits)",
      "connect": "Log in",
      "no_account": "Don't have an account?",
      "create_account": "Create an account",
      "back_home": "← Back to home",
      "registration": "Registration",
      "company_name": "Company name",
      "last_name": "Last name",
      "first_name": "First name",
      "repeat_password": "Repeat password",
      "pin_code": "PIN Code (4 digits)",
      "repeat_pin": "Repeat PIN code",
      "country": "Country",
      "street": "Street",
      "number": "Number",
      "box": "Box (optional)",
      "postal_code": "Postal code",
      "city": "City",
      "mobile": "Mobile",
      "profession": "Profession",
      "specify_profession": "Specify your profession",
      "continue": "Continue",
      "payment": "Payment",
      "payment_method": "Payment method",
      "card_payment": "Credit card (Visa/Mastercard)",
      "card_only": "Credit card only",
      "sepa_payment": "SEPA Direct Debit",
      "billing_postal_code": "Billing postal code",
      "create_my_account": "Create my account",
      "dashboard": "Dashboard",
      "quotes": "Quotes",
      "invoices": "Invoices",
      "inventory": "Inventory",
      "accounting": "AI Accounting",
      "logout": "Logout"
    }
  },
  de: {
    translation: {
      "welcome": "Willkommen bei ArtisanFlow",
      "tagline": "Vereinfachte Verwaltung für Handwerker",
      "login": "Anmelden",
      "register": "Registrieren",
      "connection": "Anmeldung",
      "email": "E-Mail",
      "password": "Passwort",
      "pin": "PIN-Code (4 Ziffern)",
      "connect": "Anmelden",
      "no_account": "Noch kein Konto?",
      "create_account": "Konto erstellen",
      "back_home": "← Zurück zur Startseite"
    }
  },
  it: {
    translation: {
      "welcome": "Benvenuto su ArtisanFlow",
      "tagline": "Gestione semplificata per artigiani",
      "login": "Accedi",
      "register": "Registrati",
      "connection": "Connessione",
      "email": "Email",
      "password": "Password",
      "pin": "Codice PIN (4 cifre)",
      "connect": "Accedi",
      "no_account": "Non hai ancora un account?",
      "create_account": "Crea un account",
      "back_home": "← Torna alla home"
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido a ArtisanFlow",
      "tagline": "Gestión simplificada para artesanos",
      "login": "Iniciar sesión",
      "register": "Registrarse",
      "connection": "Conexión",
      "email": "Correo electrónico",
      "password": "Contraseña",
      "pin": "Código PIN (4 dígitos)",
      "connect": "Iniciar sesión",
      "no_account": "¿No tienes cuenta?",
      "create_account": "Crear una cuenta",
      "back_home": "← Volver al inicio"
    }
  },
  nl: {
    translation: {
      "welcome": "Welkom bij ArtisanFlow",
      "tagline": "Vereenvoudigd beheer voor ambachtslieden",
      "login": "Inloggen",
      "register": "Registreren",
      "connection": "Verbinding",
      "email": "E-mail",
      "password": "Wachtwoord",
      "pin": "PIN-code (4 cijfers)",
      "connect": "Inloggen",
      "no_account": "Nog geen account?",
      "create_account": "Account aanmaken",
      "back_home": "← Terug naar home"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('af_language') || 'fr', // Default French
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
