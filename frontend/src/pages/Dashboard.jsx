import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Receipt, Package, TrendingUp, LogOut } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 p-6 rounded-2xl border border-orange-700/30" data-testid="stat-revenue">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-orange-500" size={24} />
              <span className="text-xs text-gray-400">TOTAL</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.total_revenue?.toFixed(2) || '0.00'} €
            </div>
            <div className="text-sm text-gray-400">Chiffre d'affaires</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-2xl border border-blue-700/30" data-testid="stat-invoices">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="text-blue-400" size={24} />
              <span className="text-xs text-gray-400">EN ATTENTE</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.pending_invoices || 0}
            </div>
            <div className="text-sm text-gray-400">Factures impayées</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-6 rounded-2xl border border-purple-700/30" data-testid="stat-quotes">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-purple-400" size={24} />
              <span className="text-xs text-gray-400">BROUILLON</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.pending_quotes || 0}
            </div>
            <div className="text-sm text-gray-400">Devis en attente</div>
          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 p-6 rounded-2xl border border-red-700/30" data-testid="stat-stock">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-red-400" size={24} />
              <span className="text-xs text-gray-400">ALERTE</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.low_stock_items || 0}
            </div>
            <div className="text-sm text-gray-400">Articles en rupture</div>
          </div>
        </div>

        {/* Feature Cards - Moved from Landing Page */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Fonctionnalités</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <FileText className="text-orange-500 mb-3" size={32} />
              <h3 className="font-semibold text-base mb-2 text-white">Devis dictés</h3>
              <p className="text-sm text-gray-400">Créez vos devis à la voix avec l'IA</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <Receipt className="text-orange-500 mb-3" size={32} />
              <h3 className="font-semibold text-base mb-2 text-white">Factures auto</h3>
              <p className="text-sm text-gray-400">Génération automatique depuis les devis</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <Package className="text-orange-500 mb-3" size={32} />
              <h3 className="font-semibold text-base mb-2 text-white">Gestion stock</h3>
              <p className="text-sm text-gray-400">Suivez vos matériaux en temps réel</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <TrendingUp className="text-orange-500 mb-3" size={32} />
              <h3 className="font-semibold text-base mb-2 text-white">Comptabilité IA</h3>
              <p className="text-sm text-gray-400">Analyses et recommandations GPT-5</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <h2 className="text-xl font-semibold text-white mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/quotes"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-orange-600 transition group"
            data-testid="nav-quotes"
          >
            <FileText className="text-orange-500 mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Devis</h3>
            <p className="text-sm text-gray-400 mb-3">Créer et gérer vos devis avec dictée vocale</p>
            <div className="text-orange-500 text-sm font-semibold">Accéder →</div>
          </Link>

          <Link
            to="/invoices"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-orange-600 transition group"
            data-testid="nav-invoices"
          >
            <Receipt className="text-orange-500 mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Factures</h3>
            <p className="text-sm text-gray-400 mb-3">Génération automatique et suivi des paiements</p>
            <div className="text-orange-500 text-sm font-semibold">Accéder →</div>
          </Link>

          <Link
            to="/inventory"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-orange-600 transition group"
            data-testid="nav-inventory"
          >
            <Package className="text-orange-500 mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Stock</h3>
            <p className="text-sm text-gray-400 mb-3">Gestion optimisée de vos matériaux et outils</p>
            <div className="text-orange-500 text-sm font-semibold">Accéder →</div>
          </Link>

          <Link
            to="/accounting"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-orange-600 transition group"
            data-testid="nav-accounting"
          >
            <TrendingUp className="text-orange-500 mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Comptabilité IA</h3>
            <p className="text-sm text-gray-400 mb-3">Analyses et recommandations par GPT-5</p>
            <div className="text-orange-500 text-sm font-semibold">Accéder →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}