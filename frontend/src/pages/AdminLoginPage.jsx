import React, { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import { Shield, Lock, Mail } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;


export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      
      // Vérifier si l'utilisateur est admin
      if (!response.data.is_admin) {
        setError('Accès refusé : vous n\'êtes pas administrateur');
        setLoading(false);
        return;
      }

      // Sauvegarder les tokens et le flag admin
      localStorage.setItem('af_username', response.data.username);
      localStorage.setItem('af_access_token', response.data.access_token);
      localStorage.setItem('af_refresh_token', response.data.refresh_token);
      localStorage.setItem('af_is_admin', 'true');

      // Rediriger vers le panel admin
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="text-orange-500" size={64} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Console Admin</h1>
          <p className="text-gray-400">ArtisanFlow - Panneau d'administration</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                <Mail className="inline mr-2" size={18} />
                Email Admin
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="admin@artisanflow.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                <Lock className="inline mr-2" size={18} />
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                <Lock className="inline mr-2" size={18} />
                Code PIN (4 chiffres)
              </label>
              <input
                type="password"
                required
                maxLength="4"
                pattern="[0-9]{4}"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest"
                placeholder="••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-gray-400 hover:text-gray-300 text-sm transition"
            >
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
