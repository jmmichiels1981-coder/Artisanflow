import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';

export default function LandingPage() {
  const [showContact, setShowContact] = React.useState(false);

  return (
    <div className="af-app-shell" data-testid="landing-page">
      {/* Sélecteur de langue en haut à droite */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      <div className="af-logo-circle">
        <img src="/logo.png" alt="ArtisanFlow Logo" />
      </div>

      <div className="af-brand-title">ArtisanFlow</div>
      <div className="af-brand-subtitle" style={{ fontSize: '13px', maxWidth: '500px', margin: '0 auto 24px', lineHeight: '1.6' }}>
        <div>Concentrez-vous sur votre activité,</div>
        <div>ArtisanFlow automatise tout le reste.</div>
      </div>

      <main className="af-landing-main">
        <div 
          className="af-offer-card" 
          style={{ 
            padding: '14px 24px', 
            fontSize: '13px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }} 
          data-testid="offer-trial"
        >
          <div style={{ color: '#22c55e' }}>
            <strong>Accès Gratuit à toutes les fonctions jusqu'au 31 août 2026</strong>
          </div>
        </div>

        <div 
          className="af-offer-card" 
          style={{ 
            padding: '14px 24px', 
            fontSize: '13px', 
            marginBottom: 24,
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}
        >
          <div style={{ color: '#22c55e' }}>
            <strong>Aucun prélèvement avant le 1er septembre</strong>
          </div>
        </div>

        <h1 className="af-landing-title" style={{ lineHeight: '1.3' }}>
          <div>ArtisanFlow :</div>
          <div>L'IA gère l'intégralité, vous créez l'essentiel.</div>
        </h1>
        <p className="af-landing-sub">
          Devis dictés, factures automatiques, gestion de stock et comptabilité IA.
        </p>

        <div className="af-landing-actions" style={{ marginTop: '32px' }}>
          <Link
            to="/login"
            className="af-btn-primary"
            style={{ maxWidth: 260 }}
            data-testid="login-button"
          >
            Connexion artisan
          </Link>

          <Link
            to="/register"
            className="af-btn-primary"
            style={{ maxWidth: 260 }}
            data-testid="register-button"
          >
            Inscription
          </Link>
        </div>

        <div className="af-admin-link" style={{ marginTop: '24px' }}>
          <a href="/admin/login" style={{ fontSize: '11px', opacity: 0.6 }}>accès admin</a>
          {" | "}
          <button 
            onClick={() => setShowContact(!showContact)}
            style={{ 
              fontSize: '11px', 
              opacity: 0.6, 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            contact
          </button>
          {" | "}
          <Link to="/legal" style={{ fontSize: '11px', opacity: 0.6, textDecoration: 'underline' }}>
            mentions légales
          </Link>
        </div>
      </main>

      {/* Section Contact - Affichée uniquement si showContact est true */}
      {showContact && (
        <div id="contact" style={{
          marginTop: '60px',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0
              }}>
                Nous contacter
              </h2>
              <button
                onClick={() => setShowContact(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  lineHeight: '1'
                }}
                title="Fermer"
              >
                ×
              </button>
            </div>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Une question ? Notre équipe vous répond dans les plus brefs délais.
            </p>

            <ContactForm />
          </div>
        </div>
      )}
    </div>
  );
}

// Composant formulaire de contact
function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API}/api/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.detail || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Impossible d\'envoyer le message. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {success && (
        <div style={{
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#22c55e',
          fontSize: '14px'
        }}>
          ✓ Votre message a été envoyé avec succès ! Nous vous répondrons rapidement.
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <input
        type="text"
        name="name"
        placeholder="Votre nom"
        value={formData.name}
        onChange={handleChange}
        required
        className="af-input"
        style={{ width: '100%' }}
      />

      <input
        type="email"
        name="email"
        placeholder="Votre email"
        value={formData.email}
        onChange={handleChange}
        required
        className="af-input"
        style={{ width: '100%' }}
      />

      <input
        type="text"
        name="subject"
        placeholder="Sujet"
        value={formData.subject}
        onChange={handleChange}
        required
        className="af-input"
        style={{ width: '100%' }}
      />

      <textarea
        name="message"
        placeholder="Votre message"
        value={formData.message}
        onChange={handleChange}
        required
        rows="5"
        className="af-input"
        style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
      />

      <button
        type="submit"
        disabled={loading}
        className="af-btn-primary"
        style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
}