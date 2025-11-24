import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, KeyRound } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    pin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien invalide ou expiré');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('Le code PIN doit contenir exactement 4 chiffres');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: formData.newPassword,
        pin: formData.pin
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      console.error('Response:', err.response);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError('Erreur lors de la réinitialisation. Vérifiez vos informations.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="af-container">
        <div className="af-box" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h1 className="af-title">✅ Mot de passe réinitialisé</h1>
          <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="af-container">
      <div className="af-box" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 className="af-title">
          <Lock className="inline mr-2" size={28} />
          Nouveau mot de passe
        </h1>
        <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
          Entrez votre nouveau mot de passe et votre <strong>code PIN actuel</strong> pour confirmer.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="af-form-group">
            <label className="af-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="af-input"
              placeholder="Minimum 6 caractères"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              minLength="6"
            />
          </div>

          <div className="af-form-group">
            <label className="af-label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="af-input"
              placeholder="Retapez le mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className="af-form-group">
            <label className="af-label">
              <KeyRound className="inline mr-1" size={18} />
              Votre code PIN actuel (pour valider)
            </label>
            <input
              type="password"
              className="af-input"
              placeholder="••••"
              maxLength="4"
              pattern="\d{4}"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              required
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
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
            disabled={loading || !token}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <div className="af-footer-link" style={{ marginTop: '24px' }}>
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
