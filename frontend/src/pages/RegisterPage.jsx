import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'sonner';

const stripePromise = loadStripe('pk_test_51STHP55M1BCqBD6xmzIEw7eOj3H7kqXGrY6kZBgF5YGO0uUvZ3J4vJVOuBj3sC5u6dOmOkAQ9pELZxK00YBBYLOq00PqBYw0Nv');
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function RegisterForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: Payment
  const [paymentType, setPaymentType] = useState('card'); // 'card' or 'sepa'
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    countryCode: 'FR',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      let paymentMethod;

      if (paymentType === 'card') {
        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        paymentMethod = pm;
      } else {
        const ibanElement = elements.getElement(IbanElement);
        const { error, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'sepa_debit',
          sepa_debit: ibanElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          },
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        paymentMethod = pm;
      }

      const registerData = {
        ...formData,
        paymentMethod: paymentType === 'card' ? 'card' : 'sepa_debit',
        stripePaymentMethodId: paymentMethod.id,
      };

      const response = await axios.post(`${API}/auth/register`, registerData);
      const { username, access_token, refresh_token } = response.data;

      localStorage.setItem('af_username', username);
      localStorage.setItem('af_access_token', access_token);
      localStorage.setItem('af_refresh_token', refresh_token);

      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-app-shell" data-testid="register-page">
      <div className="af-logo-circle">
        <img src="/logo.png" alt="ArtisanFlow Logo" />
      </div>

      <div className="af-brand-title">ArtisanFlow</div>
      <div className="af-brand-subtitle">Inscription {step === 1 ? '- Informations' : '- Paiement'}</div>

      <div className="af-main-card" style={{ maxWidth: step === 2 ? '520px' : '480px' }}>
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
                <label className="af-label">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  className="af-input"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  data-testid="register-firstname-input"
                />
              </div>
              <div>
                <label className="af-label">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  className="af-input"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  data-testid="register-lastname-input"
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
              <label className="af-label">Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                className="af-input"
                placeholder="jdupont"
                value={formData.username}
                onChange={handleChange}
                required
                data-testid="register-username-input"
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
              <label className="af-label">Pays</label>
              <select
                name="countryCode"
                className="af-select"
                value={formData.countryCode}
                onChange={handleChange}
                required
                data-testid="register-country-select"
              >
                <option value="FR">France (EUR 19.99/mois)</option>
                <option value="BE">Belgique (EUR 19.99/mois)</option>
                <option value="LU">Luxembourg (EUR 19.99/mois)</option>
                <option value="CH">Suisse (CHF 21.00/mois)</option>
                <option value="CA">Canada (CAD 30.00/mois)</option>
              </select>
            </div>

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
                  Prélèvement SEPA
                </button>
              </div>
            </div>

            <div>
              <label className="af-label">
                {paymentType === 'card' ? 'Informations de carte bancaire' : 'IBAN'}
              </label>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--input-bg)',
                }}
                data-testid="payment-element"
              >
                {paymentType === 'card' ? (
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '14px',
                          color: '#ffffff',
                          '::placeholder': { color: '#5b5b73' },
                        },
                      },
                    }}
                  />
                ) : (
                  <IbanElement
                    options={{
                      supportedCountries: ['SEPA'],
                      style: {
                        base: {
                          fontSize: '14px',
                          color: '#ffffff',
                          '::placeholder': { color: '#5b5b73' },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-3" style={{ fontSize: '11px', lineHeight: '1.5' }}>
              {paymentType === 'sepa' && (
                <p className="mb-2">
                  En fournissant votre IBAN et en confirmant ce paiement, vous autorisez ArtisanFlow à envoyer des
                  instructions à votre banque pour débiter votre compte.
                </p>
              )}
              <p>
                Rappel : Accès gratuit jusqu'au 31 août 2026. Aucun prélèvement avant le 1er septembre.
              </p>
            </div>

            <div className="flex gap-3">
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
                disabled={loading || !stripe}
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
  );
}

export default function RegisterPage() {
  return (
    <Elements stripe={stripePromise}>
      <RegisterForm />
    </Elements>
  );
}