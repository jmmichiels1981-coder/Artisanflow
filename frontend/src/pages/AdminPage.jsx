import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Receipt, FileText, Package, Shield } from 'lucide-react';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvoices: 0,
    totalQuotes: 0,
    totalInventory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const isAdmin = localStorage.getItem('af_is_admin') === 'true';
    const token = localStorage.getItem('af_access_token');
    
    if (!isAdmin || !token) {
      // Rediriger vers la page de login admin
      navigate('/admin/login');
      return;
    }
    
    // For now, we'll show a simple admin interface
    // In the future, you can add real admin statistics here
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="text-orange-500" size={40} />
            <div>
              <h1 className="text-3xl font-bold text-white">Console Admin</h1>
              <p className="text-gray-400">ArtisanFlow - Panneau d'administration</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              ← Retour à l'accueil
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('af_is_admin');
                localStorage.removeItem('af_access_token');
                localStorage.removeItem('af_refresh_token');
                localStorage.removeItem('af_username');
                navigate('/admin/login');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 p-6 rounded-2xl border border-orange-700/30 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-orange-500" size={24} />
            <h2 className="text-xl font-semibold text-white">Accès Administrateur</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Bienvenue dans la console d'administration d'ArtisanFlow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Email support :</p>
              <p className="text-white font-semibold">sav.artisanflow@gmail.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Domaine :</p>
              <p className="text-white font-semibold">artisanflow-appli.com</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-2xl border border-blue-700/30">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-400" size={28} />
              <span className="text-xs text-gray-400">UTILISATEURS</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-gray-400">Comptes artisans</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-6 rounded-2xl border border-green-700/30">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="text-green-400" size={28} />
              <span className="text-xs text-gray-400">FACTURES</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalInvoices}
            </div>
            <div className="text-sm text-gray-400">Total générées</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-6 rounded-2xl border border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-purple-400" size={28} />
              <span className="text-xs text-gray-400">DEVIS</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalQuotes}
            </div>
            <div className="text-sm text-gray-400">Total créés</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 p-6 rounded-2xl border border-orange-700/30">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-orange-400" size={28} />
              <span className="text-xs text-gray-400">STOCK</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalInventory}
            </div>
            <div className="text-sm text-gray-400">Articles en stock</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Gestion des utilisateurs</h3>
            <p className="text-gray-400 text-sm mb-4">
              Consulter et gérer tous les comptes artisans inscrits sur la plateforme.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition">
              Accéder à la gestion
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Rapports financiers</h3>
            <p className="text-gray-400 text-sm mb-4">
              Visualiser les statistiques financières et les abonnements actifs.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition">
              Voir les rapports
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Support client</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gérer les demandes de support et les tickets ouverts.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition">
              Support & Tickets
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration système</h3>
            <p className="text-gray-400 text-sm mb-4">
              Paramètres généraux de l'application et intégrations.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition">
              Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
