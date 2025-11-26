import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Receipt, Package, TrendingUp, LogOut } from 'lucide-react';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        params: { username },
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-600">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
              <p className="text-gray-400">Bienvenue, {username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
            data-testid="logout-button"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>

        {/* Main Navigation Cards - 4 + 3 Layout */}
        <div className="space-y-6">
          {/* First Row - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. DEVIS */}
            <Link
              to="/quotes"
              className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/40 hover:border-purple-500 transition group cursor-pointer"
              data-testid="nav-quotes"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FileText className="text-purple-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">DEVIS</h3>
                <p className="text-xs text-gray-400">Créer et gérer vos devis</p>
              </div>
            </Link>

            {/* 2. CHANTIERS & AGENDA */}
            <Link
              to="/jobs"
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-700/40 hover:border-blue-500 transition group cursor-pointer"
              data-testid="nav-jobs"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Package className="text-blue-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">CHANTIERS & AGENDA</h3>
                <p className="text-xs text-gray-400">Planning et gestion</p>
                <span className="mt-2 text-[10px] px-2 py-1 rounded-full bg-gray-700 text-gray-400">Bientôt</span>
              </div>
            </Link>

            {/* 3. FACTURES */}
            <Link
              to="/invoices"
              className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-xl border border-green-700/40 hover:border-green-500 transition group cursor-pointer"
              data-testid="nav-invoices"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Receipt className="text-green-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">FACTURES</h3>
                <p className="text-xs text-gray-400">Gestion et suivi</p>
              </div>
            </Link>

            {/* 4. COMPTABILITÉ */}
            <Link
              to="/accounting"
              className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 p-6 rounded-xl border border-yellow-700/40 hover:border-yellow-500 transition group cursor-pointer"
              data-testid="nav-accounting"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <TrendingUp className="text-yellow-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">COMPTABILITÉ</h3>
                <p className="text-xs text-gray-400">CA, dépenses, TVA</p>
                <span className="mt-2 text-[10px] px-2 py-1 rounded-full bg-gray-700 text-gray-400">Bientôt</span>
              </div>
            </Link>
          </div>

          {/* Second Row - 3 Cards Centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 5. CLIENTS */}
            <Link
              to="/clients"
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-6 rounded-xl border border-cyan-700/40 hover:border-cyan-500 transition group cursor-pointer"
              data-testid="nav-clients"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FileText className="text-cyan-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">CLIENTS</h3>
                <p className="text-xs text-gray-400">Fiches et historique</p>
              </div>
            </Link>

            {/* 6. CHAT IA MÉTIER */}
            <Link
              to="/ai-chat"
              className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 p-6 rounded-xl border border-pink-700/40 hover:border-pink-500 transition group cursor-pointer"
              data-testid="nav-ai-chat"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-pink-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FileText className="text-pink-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">CHAT IA MÉTIER</h3>
                <p className="text-xs text-gray-400">Assistance technique</p>
                <span className="mt-2 text-[10px] px-2 py-1 rounded-full bg-pink-700/40 text-pink-300">IA</span>
              </div>
            </Link>

            {/* 7. PARAMÈTRES & PROFIL */}
            <Link
              to="/settings"
              className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 p-6 rounded-xl border border-gray-700/40 hover:border-gray-500 transition group cursor-pointer"
              data-testid="nav-settings"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">PARAMÈTRES & PROFIL</h3>
                <p className="text-xs text-gray-400">Réglages du compte</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}