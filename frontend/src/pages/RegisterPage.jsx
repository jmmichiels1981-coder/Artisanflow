import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const registerData = {
        ...formData,
        paymentMethod: 'card',
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
      <div className="af-brand-subtitle">Inscription</div>

      <div className="af-main-card">
        <form onSubmit={handleSubmit} className="af-fields">
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

          <div>
            <label className="af-label">Carte bancaire</label>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
              }}
              data-testid="register-card-element"
            >
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
            </div>
          </div>

          <button
            type="submit"
            className="af-btn-primary"
            disabled={loading || !stripe}
            data-testid="register-submit-button"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="af-footer-link">
          Déjà un compte ?{' '}
          <Link to="/login" data-testid="login-link">Se connecter</Link>
        </div>
        <div className="af-footer-link">
          <Link to="/" data-testid="back-home-link">← Retour à l'accueil</Link>
        </div>
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