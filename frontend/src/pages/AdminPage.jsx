import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Receipt, FileText, Package, Shield, DollarSign, UserCheck, BarChart3, Mail } from 'lucide-react';

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
    // Mode démo : pas de vérification d'authentification (bypass UI)
    // L'accès admin est libre pour le développement UI
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* 1. FINANCES */}
          <Link
            to="/admin/finances"
            className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 p-6 rounded-2xl border border-emerald-700/30 hover:border-emerald-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <DollarSign className="text-emerald-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Finances</h3>
                <p className="text-gray-400 text-sm">
                  Suivi global des revenus, dépenses et projections.
                </p>
              </div>
            </div>
          </Link>

          {/* 2. ABONNÉS INSCRITS */}
          <Link
            to="/admin/subscribers"
            className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-2xl border border-blue-700/30 hover:border-blue-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <UserCheck className="text-blue-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Abonnés inscrits</h3>
                <p className="text-gray-400 text-sm">
                  Suivi et gestion des comptes artisans inscrits.
                </p>
              </div>
            </div>
          </Link>

          {/* 3. PERFORMANCE */}
          <Link
            to="/admin/performance"
            className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-6 rounded-2xl border border-purple-700/30 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <BarChart3 className="text-purple-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Performance</h3>
                <p className="text-gray-400 text-sm">
                  Statistiques d'utilisation de la plateforme.
                </p>
              </div>
            </div>
          </Link>

          {/* 4. MESSAGERIE */}
          <Link
            to="/admin/messaging"
            className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 p-6 rounded-2xl border border-cyan-700/30 hover:border-cyan-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-cyan-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Mail className="text-cyan-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Messagerie</h3>
                <p className="text-gray-400 text-sm">
                  Gestion des emails SAV et recommandations.
                </p>
              </div>
            </div>
          </Link>

          {/* 5. GESTION DES UTILISATEURS (Existant) */}
          <Link
            to="/admin/users"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Users className="text-gray-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Gestion des utilisateurs</h3>
                <p className="text-gray-400 text-sm">
                  Consulter et gérer tous les comptes artisans.
                </p>
              </div>
            </div>
          </Link>

          {/* 6. RAPPORTS FINANCIERS (Existant) */}
          <Link
            to="/admin/reports"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Receipt className="text-gray-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Rapports financiers</h3>
                <p className="text-gray-400 text-sm">
                  Statistiques financières et abonnements actifs.
                </p>
              </div>
            </div>
          </Link>

          {/* 7. SUPPORT CLIENT (Existant) */}
          <Link
            to="/admin/support"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Shield className="text-gray-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Support client</h3>
                <p className="text-gray-400 text-sm">
                  Demandes de support et tickets ouverts.
                </p>
              </div>
            </div>
          </Link>

          {/* 8. CONFIGURATION SYSTÈME (Existant) */}
          <Link
            to="/admin/settings"
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Package className="text-gray-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Configuration système</h3>
                <p className="text-gray-400 text-sm">
                  Paramètres généraux et intégrations.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
