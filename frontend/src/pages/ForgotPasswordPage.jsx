import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="af-container">
        <div className="af-box" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h1 className="af-title">✅ Email envoyé</h1>
          <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
            Un email a été envoyé à <strong>{email}</strong> avec un lien pour réinitialiser votre mot de passe.
          </p>
          <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
            Vous devrez entrer votre <strong>code PIN</strong> pour confirmer le nouveau mot de passe.
          </p>
          <Link to="/login" className="af-btn-primary" style={{ display: 'inline-block' }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="af-container">
      <div className="af-box" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 className="af-title">
          <Mail className="inline mr-2" size={28} />
          Mot de passe oublié
        </h1>
        <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
          Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="af-form-group">
            <label className="af-label">Email</label>
            <input
              type="email"
              className="af-input"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fef2f2', 
              border: '1px solid #fca5a5', 
              borderRadius: '8px', 
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="af-btn-primary"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>

        <div className="af-footer-link" style={{ marginTop: '24px' }}>
          <Link to="/login">
            <ArrowLeft className="inline mr-1" size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
