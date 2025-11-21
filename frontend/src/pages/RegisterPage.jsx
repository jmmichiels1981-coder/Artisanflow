import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PHONE_PLACEHOLDERS = {
  FR: '+33 6 12 34 56 78',
  BE: '+32 470 12 34 56',
  LU: '+352 621 123 456',
  CH: '+41 78 123 45 67',
  CA: '+1 514 123 4567',
  GB: '+44 7700 900000',
  US: '+1 202 555 0123',
  IT: '+39 320 123 4567',
  ES: '+34 612 34 56 78',
  DE: '+49 151 12345678'
};

const POSTAL_PLACEHOLDERS = {
  FR: '75001',
  BE: '1000',
  LU: 'L-1234',
  CH: '1000',
  CA: 'H2X 1Y7',
  GB: 'SW1A 1AA',
  US: '10001',
  IT: '00100',
  ES: '28001',
  DE: '10115'
};

function PrivacyModal({ open, onClose }) {
  const handleAccept = () => {
    localStorage.setItem('af_privacy_accepted', 'true');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-3xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Protection et confidentialité de vos données
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            La confidentialité de vos informations est une priorité absolue pour ArtisanFlow.
            Toutes les données que vous saisissez dans l'application — notamment votre chiffre d'affaires, 
            bénéfices, stocks, données comptables et informations relatives à la TVA — sont entièrement 
            sécurisées et stockées dans un environnement protégé, conforme aux standards professionnels de sécurité.
          </p>
          <p>
            ArtisanFlow n'a jamais accès à vos données, ne peut pas les consulter et ne les utilise à 
            aucune autre fin que leur traitement automatique au sein de l'application.
            Vos informations restent strictement personnelles et ne sont en aucun cas partagées avec 
            des tiers sans votre consentement.
          </p>
          <p>
            Vous conservez à tout moment le contrôle total sur vos données, et pouvez les modifier, 
            exporter ou supprimer conformément aux réglementations en vigueur.
          </p>
          <p className="font-semibold text-white">
            Votre activité mérite une confidentialité irréprochable : nous nous engageons à la garantir.
          </p>
        </div>
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleAccept}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-base"
            data-testid="privacy-accept-button"
          >
            OK j'ai compris, ne plus afficher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MandateSuccessModal({ open, mandateId, paymentMethodType, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="text-green-500" size={32} />
            Mandat confirmé
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-gray-300">
          <p className="text-center">
            Votre mandat de prélèvement a été créé avec succès.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Type de mandat :</p>
            <p className="font-semibold text-white">
              {paymentMethodType === 'sepa_debit' ? 'SEPA (Europe)' : 'PAD (Canada)'}
            </p>
            <p className="text-xs text-gray-400 mt-3 mb-1">Mandate ID :</p>
            <p className="font-mono text-sm text-green-400">{mandateId}</p>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Ce mandat est stocké de manière sécurisée par Stripe.
            Aucun prélèvement ne sera effectué avant le 1er septembre 2026.
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
          >
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentType, setPaymentType] = useState('card');
  const [sepaMandate, setSepaMandate] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showMandateModal, setShowMandateModal] = useState(false);
  const [mandateInfo, setMandateInfo] = useState({ id: '', type: '' });
  const [formData, setFormData] = useState({
    companyName: '',
    directorLastName: '',
    directorFirstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: 'FR',
    street: '',
    number: '',
    box: '',
    postalCode: '',
    city: '',
    mobile: '',
    vatSubject: 'yes',
    companyNumber: '',
    vatNumber: '',
    gstNumber: '', // TPS/GST pour Québec (optionnel)
  });

  useEffect(() => {
    const privacyAccepted = localStorage.getItem('af_privacy_accepted');
    if (!privacyAccepted) {
      setShowPrivacyModal(true);
    }
  }, []);

  // Force card payment for Quebec
  useEffect(() => {
    if (formData.countryCode === 'CA') {
      setPaymentType('card');
    }
  }, [formData.countryCode]);

  // Force vatSubject to 'no' for USA (no VAT in USA)
  useEffect(() => {
    if (formData.countryCode === 'US') {
      setFormData(prev => ({ ...prev, vatSubject: 'no', vatNumber: '' }));
    }
  }, [formData.countryCode]);

  const getCompanyNumberLabel = () => {
    const labels = {
      FR: 'SIREN',
      BE: 'Numéro BCE',
      LU: 'Numéro RCS',
      CH: 'IDE / UID',
      CA: 'NEQ',
      GB: 'Company Number',
      US: 'EIN (Employer Identification Number)',
      IT: 'Codice Fiscale / P.IVA',
      ES: 'NIF / CIF',
      DE: 'Handelsregisternummer (HRB)'
    };
    return labels[formData.countryCode] || "Numéro d'entreprise";
  };

  const getVatNumberLabel = () => {
    const labels = {
      FR: 'TVA intracommunautaire',
      BE: 'Numéro de TVA',
      LU: 'Numéro de TVA',
      CH: 'Numéro de TVA',
      CA: 'TVQ / QST',
      GB: 'VAT Number',
      IT: 'Partita IVA',
      ES: 'Número de IVA',
      DE: 'USt-IdNr'
    };
    return labels[formData.countryCode] || 'Numéro de TVA';
  };

  const shouldShowVatField = () => {
    // USA n'a pas de TVA
    return formData.countryCode !== 'US';
  };

  const getPaymentTypeLabel = () => {
    return 'Prélèvement SEPA';
  };

  const getPaymentMandateText = () => {
    return "En cochant cette case, j'autorise ArtisanFlow à prélever le montant de mon abonnement via prélèvement SEPA. Aucun prélèvement ne sera effectué avant le 1er septembre. Je peux annuler ce mandat ou demander un remboursement selon les conditions de ma banque.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Auto-fill VAT number based on company number
  useEffect(() => {
    if (formData.vatSubject === 'yes' && formData.companyNumber && formData.countryCode !== 'US') {
      let vatNum = '';
      const cleanNumber = formData.companyNumber.replace(/[^0-9]/g, '');
      
      switch(formData.countryCode) {
        case 'BE':
          vatNum = 'BE' + cleanNumber;
          break;
        case 'CH':
          if (cleanNumber.length >= 9) {
            const formatted = cleanNumber.slice(0, 3) + '.' + cleanNumber.slice(3, 6) + '.' + cleanNumber.slice(6, 9);
            vatNum = 'CHE-' + formatted + '.tva';
          } else {
            vatNum = 'CHE-';
          }
          break;
        case 'LU':
          vatNum = 'LU' + cleanNumber;
          break;
        case 'GB':
          vatNum = 'GB' + cleanNumber;
          break;
        case 'IT':
          vatNum = 'IT' + cleanNumber;
          break;
        case 'ES':
          vatNum = 'ES' + cleanNumber;
          break;
        case 'DE':
          vatNum = 'DE' + cleanNumber;
          break;
        case 'FR':
          vatNum = formData.vatNumber.startsWith('FR') ? formData.vatNumber : 'FR';
          break;
        case 'CA':
          // Pour Québec, on ne préfixe pas automatiquement
          vatNum = formData.vatNumber;
          break;
        default:
          vatNum = formData.vatNumber;
      }
      
      if (formData.vatNumber !== vatNum && !['FR', 'CA', 'US'].includes(formData.countryCode)) {
        setFormData(prev => ({ ...prev, vatNumber: vatNum }));
      }
    }
  }, [formData.companyNumber, formData.countryCode, formData.vatSubject]);

  const validateVATNumber = async (vatNumber, countryCode) => {
    try {
      const vatPattern = {
        FR: /^FR[0-9A-Z]{2}[0-9]{9}$/,
        BE: /^BE[0-9]{10}$/,
        LU: /^LU[0-9]{8}$/,
        CH: /^CHE-[0-9]{3}\.[0-9]{3}\.[0-9]{3}\.tva$/,
        CA: /.+/
      };

      const pattern = vatPattern[countryCode];
      if (!pattern || !pattern.test(vatNumber)) {
        return { valid: false, message: `Format de numéro de TVA invalide pour ${countryCode}` };
      }

      return { valid: true };
    } catch (error) {
      console.error('VAT validation error:', error);
      return { valid: false, message: 'Erreur lors de la validation' };
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.directorFirstName || !formData.directorLastName || 
        !formData.email || !formData.password || !formData.confirmPassword ||
        !formData.street || !formData.number || !formData.postalCode || !formData.city || !formData.mobile) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!formData.companyNumber) {
      toast.error('Veuillez renseigner le numéro d\'entreprise');
      return;
    }

    // Validation TVA (pas pour les USA)
    if (formData.countryCode !== 'US' && formData.vatSubject === 'yes') {
      if (!formData.vatNumber) {
        toast.error('Veuillez renseigner le numéro de TVA');
        return;
      }

      const vatValidation = await validateVATNumber(formData.vatNumber, formData.countryCode);
      if (!vatValidation.valid) {
        toast.error(vatValidation.message || 'Numéro de TVA invalide');
        return;
      }
    }
    
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (paymentType === 'sepa' && !sepaMandate) {
      toast.error('Veuillez accepter le mandat de prélèvement');
      return;
    }

    setLoading(true);

    try {
      let paymentMethodId = null;
      let mandateId = null;
      let paymentMethodType = 'card';

      if (paymentType === 'card') {
        // Standard card payment - no mandate needed
        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: `${formData.directorFirstName} ${formData.directorLastName}`,
            email: formData.email,
            phone: formData.mobile,
            address: {
              line1: `${formData.number} ${formData.street}`,
              line2: formData.box || undefined,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.countryCode,
            },
          },
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        paymentMethodId = paymentMethod.id;
        paymentMethodType = 'card';
      } else {
        // Europe SEPA - Use SetupIntent with confirmSepaDebitSetup
        paymentMethodType = 'sepa_debit';
        
        // Create SetupIntent with full customer info
        const setupResponse = await axios.post(`${API}/payment/setup-intent`, {
          email: formData.email,
          firstName: formData.directorFirstName,
          lastName: formData.directorLastName,
          companyName: formData.companyName,
          countryCode: formData.countryCode,
          payment_method_type: 'sepa_debit'
        });

        const { client_secret } = setupResponse.data;

        const ibanElement = elements.getElement(IbanElement);

        // Confirm SEPA Debit Setup
        const { setupIntent, error } = await stripe.confirmSepaDebitSetup(
          client_secret,
          {
            payment_method: {
              sepa_debit: ibanElement,
              billing_details: {
                name: `${formData.directorFirstName} ${formData.directorLastName}`,
                email: formData.email,
              },
            },
          }
        );

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }

        paymentMethodId = setupIntent.payment_method;
        mandateId = setupIntent.mandate;
        
        // Show mandate confirmation
        setMandateInfo({ id: mandateId, type: 'sepa_debit' });
        setShowMandateModal(true);
      }

      // Register user with payment method
      const registerData = {
        companyName: formData.companyName,
        firstName: formData.directorFirstName,
        lastName: formData.directorLastName,
        email: formData.email,
        username: formData.email.split('@')[0],
        password: formData.password,
        countryCode: formData.countryCode,
        paymentMethod: paymentMethodType,
        stripePaymentMethodId: paymentMethodId,
      };

      const response = await axios.post(`${API}/auth/register`, registerData);
      
      // Vérifier que la réponse contient bien les tokens
      if (!response.data || !response.data.access_token) {
        throw new Error('Erreur lors de la création du compte : données manquantes');
      }

      const { username, access_token, refresh_token } = response.data;

      localStorage.setItem('af_username', username);
      localStorage.setItem('af_access_token', access_token);
      localStorage.setItem('af_refresh_token', refresh_token);

      // If mandate was created, wait for user to close modal
      if (mandateId) {
        // Modal will redirect on close
        return;
      }

      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors de la création du compte';
      toast.error(errorMessage);
      
      // Ne PAS naviguer vers le dashboard en cas d'erreur
      // L'utilisateur reste sur la page d'inscription
      setLoading(false);
      return; // Important: sortir ici pour ne pas continuer
    } finally {
      setLoading(false);
    }
  };

  const handleMandateModalClose = () => {
    setShowMandateModal(false);
    toast.success('Compte créé avec succès !');
    navigate('/dashboard');
  };

  if (showPrivacyModal) {
    return <PrivacyModal open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />;
  }

  return (
    <>
      <div className="af-app-shell" data-testid="register-page">
        <div className="af-logo-circle">
          <img src="/logo.png" alt="ArtisanFlow Logo" />
        </div>

        <div className="af-brand-title">ArtisanFlow</div>
        <div className="af-brand-subtitle">Inscription {step === 1 ? '- Informations' : '- Paiement'}</div>

        <div className="af-main-card" style={{ maxWidth: step === 2 ? '560px' : '540px' }}>
          {step === 1 ? (
            <form onSubmit={handleContinue} className="af-fields">
              <div>
                <label className="af-label">Nom de l'entreprise</label>
                <input
                  type="text"
                  name="companyName"
                  className="af-input"
                  placeholder="Artisan Pro"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  data-testid="register-company-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="af-label">NOM du Dirigeant</label>
                  <input
                    type="text"
                    name="directorLastName"
                    className="af-input"
                    placeholder="DUPONT"
                    value={formData.directorLastName}
                    onChange={handleChange}
                    required
                    data-testid="register-director-lastname-input"
                  />
                </div>
                <div>
                  <label className="af-label">Prénom du Dirigeant</label>
                  <input
                    type="text"
                    name="directorFirstName"
                    className="af-input"
                    placeholder="Jean"
                    value={formData.directorFirstName}
                    onChange={handleChange}
                    required
                    data-testid="register-director-firstname-input"
                  />
                </div>
              </div>

              <div>
                <label className="af-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="af-input"
                  placeholder="jean@artisan.fr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="register-email-input"
                />
              </div>

              <div>
                <label className="af-label">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  className="af-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="register-password-input"
                />
              </div>

              <div>
                <label className="af-label">Répéter mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="af-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  data-testid="register-confirm-password-input"
                />
              </div>

              <div>
                <label className="af-label">Pays</label>
                <select
                  name="countryCode"
                  className="af-select"
                  value={formData.countryCode}
                  onChange={handleChange}
                  required
                  data-testid="register-country-select"
                >
                  <option value="FR">France - EUR 19.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="BE">Belgique - EUR 19.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="LU">Luxembourg - EUR 19.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="CH">Suisse - CHF 21.00/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="CA">Québec - CAD 30.00/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="ES">Espagne - EUR 19.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="IT">Italie - EUR 19.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="DE">Allemagne - EUR 19.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="GB">Royaume-Uni - GBP 17.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                  <option value="US">États-Unis - USD 21.99/mois (Gratuit jusqu'au 31/08/2026)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="af-label">Rue</label>
                  <input
                    type="text"
                    name="street"
                    className="af-input"
                    placeholder="Rue de la Paix"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    data-testid="register-street-input"
                  />
                </div>
                <div>
                  <label className="af-label">Numéro</label>
                  <input
                    type="text"
                    name="number"
                    className="af-input"
                    placeholder="123"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    data-testid="register-number-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="af-label">Boîte (facultatif)</label>
                  <input
                    type="text"
                    name="box"
                    className="af-input"
                    placeholder="A"
                    value={formData.box}
                    onChange={handleChange}
                    data-testid="register-box-input"
                  />
                </div>
                <div>
                  <label className="af-label">Code postal</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="af-input"
                    placeholder={POSTAL_PLACEHOLDERS[formData.countryCode]}
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    data-testid="register-postal-input"
                  />
                </div>
              </div>

              <div>
                <label className="af-label">Ville</label>
                <input
                  type="text"
                  name="city"
                  className="af-input"
                  placeholder="Paris"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  data-testid="register-city-input"
                />
              </div>

              <div>
                <label className="af-label">Mobile/GSM/Portable</label>
                <input
                  type="tel"
                  name="mobile"
                  className="af-input"
                  placeholder={PHONE_PLACEHOLDERS[formData.countryCode]}
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  data-testid="register-mobile-input"
                />
              </div>

              {/* Pas de TVA pour les USA */}
              {shouldShowVatField() && (
                <div>
                  <label className="af-label mb-2 block">Statut TVA</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vatSubject"
                        value="yes"
                        checked={formData.vatSubject === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4"
                        data-testid="vat-subject-yes"
                      />
                      <span className="text-sm text-gray-300">Assujetti à la TVA</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vatSubject"
                        value="no"
                        checked={formData.vatSubject === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4"
                        data-testid="vat-subject-no"
                      />
                      <span className="text-sm text-gray-300">Non Assujetti à la TVA</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="af-label">{getCompanyNumberLabel()}</label>
                <input
                  type="text"
                  name="companyNumber"
                  className="af-input"
                  placeholder={
                    formData.countryCode === 'FR' ? '123456789' :
                    formData.countryCode === 'BE' ? '0123.456.789' :
                    formData.countryCode === 'LU' ? 'B123456' :
                    formData.countryCode === 'CH' ? 'CHE-123.456.789' :
                    formData.countryCode === 'CA' ? '1234567890' :
                    formData.countryCode === 'GB' ? '12345678' :
                    formData.countryCode === 'US' ? '12-3456789' :
                    formData.countryCode === 'IT' ? '12345678901' :
                    formData.countryCode === 'ES' ? 'A12345678' :
                    formData.countryCode === 'DE' ? 'HRB 123456' :
                    'Numéro'
                  }
                  value={formData.companyNumber}
                  onChange={handleChange}
                  required
                  data-testid="register-company-number-input"
                />
              </div>

              {formData.vatSubject === 'yes' && shouldShowVatField() && (
                <div>
                  <label className="af-label">{getVatNumberLabel()}</label>
                  <input
                    type="text"
                    name="vatNumber"
                    className="af-input"
                    placeholder={
                      formData.countryCode === 'FR' ? 'FRXX123456789' :
                      formData.countryCode === 'BE' ? 'BE0123456789' :
                      formData.countryCode === 'LU' ? 'LU12345678' :
                      formData.countryCode === 'CH' ? 'CHE-123.456.789.tva' :
                      formData.countryCode === 'CA' ? '1234567890TQ0001' :
                      formData.countryCode === 'GB' ? 'GB123456789' :
                      formData.countryCode === 'IT' ? 'IT12345678901' :
                      formData.countryCode === 'ES' ? 'ESA12345678' :
                      formData.countryCode === 'DE' ? 'DE123456789' :
                      'TVA'
                    }
                    value={formData.vatNumber}
                    onChange={handleChange}
                    required
                    data-testid="register-vat-number-input"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.countryCode === 'BE' && 'Le numéro de TVA sera automatiquement généré avec le préfixe BE'}
                    {formData.countryCode === 'CH' && 'Format: CHE-XXX.XXX.XXX.tva'}
                    {formData.countryCode === 'LU' && 'Le numéro de TVA sera automatiquement généré avec le préfixe LU'}
                    {formData.countryCode === 'FR' && 'Ajoutez le préfixe FR suivie de votre numéro'}
                    {formData.countryCode === 'CA' && 'Numéro TVQ du Québec (obligatoire)'}
                    {formData.countryCode === 'GB' && 'Format: GB suivi de 9 chiffres'}
                    {formData.countryCode === 'IT' && 'Partita IVA italiana'}
                    {formData.countryCode === 'ES' && 'Número de identificación fiscal'}
                    {formData.countryCode === 'DE' && 'Umsatzsteuer-Identifikationsnummer (Format: DE suivi de 9 chiffres)'}
                  </p>
                </div>
              )}

              {/* TPS/GST pour Québec uniquement (optionnel) */}
              {formData.countryCode === 'CA' && (
                <div>
                  <label className="af-label">TPS / GST (optionnel)</label>
                  <input
                    type="text"
                    name="gstNumber"
                    className="af-input"
                    placeholder="123456789RT0001"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    data-testid="register-gst-number-input"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Numéro TPS fédéral (obligatoire uniquement si votre CA dépasse 30 000 $)
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="af-btn-primary"
                data-testid="continue-button"
              >
                Continuer
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="af-fields">
              <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <p className="text-sm" style={{ color: '#22c55e', lineHeight: '1.6' }}>
                  L'utilisation de l'application est entièrement gratuite jusqu'au 31 août, aucun prélèvement ne sera effectué avant le 1er septembre.
                  Votre inscription vous permet simplement d'activer votre accès dès maintenant, sans aucun frais immédiat. 
                  Vous serez bien entendu averti avant tout renouvellement ou prélèvement.
                </p>
              </div>

              {/* Europe: carte + SEPA | Autres pays: voir ci-dessous */}
              {['FR', 'BE', 'LU', 'CH', 'DE', 'ES', 'IT'].includes(formData.countryCode) && (
                <div className="mb-4">
                  <label className="af-label mb-3 block">Mode de paiement</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType('card')}
                      className={`flex-1 py-3 px-4 rounded-lg border transition ${
                        paymentType === 'card'
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300'
                      }`}
                      data-testid="payment-type-card"
                    >
                      Carte bancaire (Visa/Mastercard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('sepa')}
                      className={`flex-1 py-3 px-4 rounded-lg border transition ${
                        paymentType === 'sepa'
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300'
                      }`}
                      data-testid="payment-type-sepa"
                    >
                      {getPaymentTypeLabel()}
                    </button>
                  </div>
                </div>
              )}

              {formData.countryCode === 'CA' && (
                <div className="mb-4">
                  <label className="af-label mb-3 block">Mode de paiement</label>
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300">
                    <p className="text-sm">
                      <strong>Carte bancaire uniquement</strong> - Visa / Mastercard / Apple Pay / Google Pay
                    </p>
                  </div>
                </div>
              )}

              {paymentType === 'card' ? (
                <div className="space-y-3">
                  <div>
                    <label className="af-label">Informations de carte bancaire</label>
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'var(--input-bg)',
                      }}
                      data-testid="payment-element"
                    >
                      <CardElement
                        options={{
                          hidePostalCode: true,  // Code postal demandé séparément ci-dessous
                          style: {
                            base: {
                              fontSize: '14px',
                              color: '#ffffff',
                              '::placeholder': { color: '#5b5b73' },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Code postal pour AVS (Address Verification System) */}
                  <div>
                    <label className="af-label">Code postal de facturation</label>
                    <input
                      type="text"
                      name="billingPostalCode"
                      className="af-input"
                      placeholder={POSTAL_PLACEHOLDERS[formData.countryCode] || '12345'}
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      required
                      data-testid="billing-postal-code-input"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Requis pour la vérification AVS (améliore la sécurité et les taux d'acceptation)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="af-label">IBAN ({formData.countryCode})</label>
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--input-bg)',
                    }}
                    data-testid="payment-element"
                  >
                    <IbanElement
                      options={{
                        supportedCountries: ['SEPA'],
                        placeholderCountry: formData.countryCode,
                        style: {
                          base: {
                            fontSize: '14px',
                            color: '#ffffff',
                            '::placeholder': { color: '#5b5b73' },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {paymentType === 'sepa' && (
                <div className="mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sepaMandate}
                      onChange={(e) => setSepaMandate(e.target.checked)}
                      className="w-5 h-5 mt-1"
                      required
                      data-testid="sepa-mandate-checkbox"
                    />
                    <span className="text-xs text-gray-300 leading-relaxed">
                      {getPaymentMandateText()}
                    </span>
                  </label>
                </div>
              )}

              <div className="p-4 rounded-lg mt-4" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <p className="text-sm" style={{ color: '#22c55e', lineHeight: '1.6' }}>
                  Vos informations de paiement sont entièrement sécurisées et cryptées.
                  Elles ne sont jamais stockées chez nous et sont traitées par un prestataire certifié.
                  Aucun prélèvement ne sera effectué avant le 1er septembre.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="af-btn-ghost" 
                  style={{ flex: 1 }}
                  data-testid="back-button"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="af-btn-primary"
                  disabled={loading || !stripe || (paymentType === 'sepa' && !sepaMandate)}
                  style={{ flex: 1 }}
                  data-testid="register-submit-button"
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </button>
              </div>
            </form>
          )}

          <div className="af-footer-link">
            Déjà un compte ?{' '}
            <Link to="/login" data-testid="login-link">Se connecter</Link>
          </div>
          <div className="af-footer-link">
            <Link to="/" data-testid="back-home-link">← Retour à l'accueil</Link>
          </div>
        </div>

        <div className="af-admin-link" style={{ marginTop: '24px' }}>
          <a href="/admin" style={{ fontSize: '11px', opacity: 0.6 }}>accès admin</a>
        </div>
      </div>

      {/* Mandate Success Modal */}
      <MandateSuccessModal 
        open={showMandateModal}
        mandateId={mandateInfo.id}
        paymentMethodType={mandateInfo.type}
        onClose={handleMandateModalClose}
      />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Elements stripe={stripePromise}>
      <RegisterForm />
    </Elements>
  );
}