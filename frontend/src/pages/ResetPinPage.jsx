import React, { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import { KeyRound, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;


export default function ResetPinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPin: '',
    confirmPin: '',
    password: ''
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

    if (formData.newPin !== formData.confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }

    if (formData.newPin.length !== 4 || !/^\d{4}$/.test(formData.newPin)) {
      setError('Le code PIN doit contenir exactement 4 chiffres');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/reset-pin`, {
        token,
        new_pin: formData.newPin,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset PIN error:', err);
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
          <h1 className="af-title">✅ Code PIN réinitialisé</h1>
          <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
            Votre code PIN a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="af-container">
      <div className="af-box" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 className="af-title">
          <KeyRound className="inline mr-2" size={28} />
          Nouveau code PIN
        </h1>
        <p style={{ marginBottom: '24px', color: '#9ca3af' }}>
          Entrez votre nouveau code PIN et votre <strong>mot de passe actuel</strong> pour confirmer.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="af-form-group">
            <label className="af-label">Nouveau code PIN (4 chiffres)</label>
            <input
              type="password"
              className="af-input"
              placeholder="••••"
              maxLength="4"
              pattern="\d{4}"
              value={formData.newPin}
              onChange={(e) => setFormData({ ...formData, newPin: e.target.value })}
              required
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
            />
          </div>

          <div className="af-form-group">
            <label className="af-label">Confirmer le code PIN</label>
            <input
              type="password"
              className="af-input"
              placeholder="••••"
              maxLength="4"
              pattern="\d{4}"
              value={formData.confirmPin}
              onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value })}
              required
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
            />
          </div>

          <div className="af-form-group">
            <label className="af-label">
              <Lock className="inline mr-1" size={18} />
              Votre mot de passe actuel (pour valider)
            </label>
            <input
              type="password"
              className="af-input"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            disabled={loading || !token}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le code PIN'}
          </button>
        </form>

        <div className="af-footer-link" style={{ marginTop: '24px' }}>
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
