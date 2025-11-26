import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import LanguageSelector from '@/components/LanguageSelector';
import { API } from '@/config';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);

  // Pré-remplir l'email depuis localStorage
  useEffect(() => {
    const lastEmail = localStorage.getItem('af_last_email');
    if (lastEmail) {
      setFormData(prev => ({ ...prev, email: lastEmail }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      const { username, access_token, refresh_token } = response.data;

      localStorage.setItem('af_username', username);
      localStorage.setItem('af_access_token', access_token);
      localStorage.setItem('af_refresh_token', refresh_token);
      // Stocker l'email pour le pré-remplissage futur
      localStorage.setItem('af_last_email', formData.email);

      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-app-shell" data-testid="login-page">
      {/* Sélecteur de langue en haut à droite */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      <div className="af-logo-circle">
        <img src="/logo.png" alt="ArtisanFlow Logo" />
      </div>

      <div className="af-brand-title">ArtisanFlow</div>
      <div className="af-brand-subtitle">Connexion</div>

      <div className="af-main-card">
        <form onSubmit={handleSubmit} className="af-fields">
          <div>
            <label className="af-label">Email</label>
            <input
              type="email"
              name="email"
              className="af-input"
              placeholder="votre@email.fr"
              value={formData.email}
              onChange={handleChange}
              required
              data-testid="login-email-input"
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
              data-testid="login-password-input"
            />
          </div>

          <div>
            <label className="af-label">Code PIN (4 chiffres)</label>
            <input
              type="password"
              name="pin"
              className="af-input"
              placeholder="••••"
              maxLength="4"
              pattern="\d{4}"
              value={formData.pin}
              onChange={handleChange}
              required
              data-testid="login-pin-input"
            />
          </div>

          <button
            type="submit"
            className="af-btn-primary"
            disabled={loading}
            data-testid="login-submit-button"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Forgot Password / PIN Links */}
        <div className="af-footer-link" style={{ marginTop: '16px', fontSize: '13px' }}>
          <Link to="/forgot-password" style={{ color: '#f97316' }}>Mot de passe oublié ?</Link>
          {" | "}
          <Link to="/forgot-pin" style={{ color: '#f97316' }}>Code PIN oublié ?</Link>
        </div>

        <div className="af-footer-link">
          Pas encore de compte ?{' '}
          <Link to="/register" data-testid="register-link">Créer un compte</Link>
        </div>
        <div className="af-footer-link">
          <Link to="/" data-testid="back-home-link">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}