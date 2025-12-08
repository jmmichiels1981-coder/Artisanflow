import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Receipt, Package, TrendingUp, LogOut, Calendar, Users, MessageSquare, Settings, Shield } from 'lucide-react';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';
import TutorialModal from '@/components/TutorialModal';
import ConfigurationArtisanModal from '@/components/ConfigurationArtisanModal';
import TraiterSidebarTutorialModal from '@/components/TraiterSidebarTutorialModal';
import DashboardLayout from '@/components/DashboardLayout';
import { TUTORIALS } from '@/constants/tutorials';
import { useNotifications } from '@/contexts/NotificationContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  const [stats, setStats] = useState(null);
  const { simulateEvent } = useNotifications();
  const [tutorialModal, setTutorialModal] = useState({
    isOpen: false,
    section: null,
    pendingNavigation: null
  });
  const [showConfigArtisan, setShowConfigArtisan] = useState(false);
  const [showTraiterTutorial, setShowTraiterTutorial] = useState(false);

  // Vérifier si c'est la première connexion
  useEffect(() => {
    const checkConfiguration = async () => {
      const username = localStorage.getItem('af_username');
      const token = localStorage.getItem('af_token');

      console.log('🔍 Vérification configuration pour:', username);

      if (!username) {
        console.log('⚠️ Pas de username - skip vérification');
        return;
      }

      // Vérifier d'abord localStorage (plus rapide)
      const localConfig = localStorage.getItem('af_config_artisan');
      console.log('📦 Config localStorage:', localConfig ? 'existe' : 'absente');

      // Si config existe en local, on considère l'utilisateur configuré
      if (localConfig) {
        console.log('✅ Config locale trouvée - utilisateur déjà configuré');
        // Vérifier le tutoriel "À TRAITER"
        const traiterTutorialSeen = localStorage.getItem('af_traiter_tutorial_seen');
        if (!traiterTutorialSeen) {
          setShowTraiterTutorial(true);
        }
        return;
      }

      // Sinon, vérifier côté serveur
      try {
        console.log('🌐 Appel API pour vérification serveur...');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/users/${username}/configuration`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const hasConfigured = data.has_configured || false;

        console.log('🔍 has_configured (serveur):', hasConfigured);

        if (!hasConfigured) {
          console.log('🎯 Ouverture du modal de configuration');
          setShowConfigArtisan(true);
        }
      } catch (error) {
        console.error('❌ Erreur API vérification config:', error);
        // En cas d'erreur API, ouvrir le modal si pas de config locale
        console.log('🎯 Fallback: Ouverture du modal de configuration');
        setShowConfigArtisan(true);
      }
    };

    checkConfiguration();
  }, []);
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
    const email = localStorage.getItem('af_email');
    localStorage.clear();
    // Sauvegarder l'email pour pré-remplir le formulaire de login
    if (email) {
      localStorage.setItem('af_last_email', email);
    }
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const handleSectionClick = (e, section, path) => {
    // Vérifier si le tutoriel a déjà été vu
    const tutorialSeen = localStorage.getItem(`af_tutorial_${section}_seen`);

    if (!tutorialSeen) {
      // Vérifier que le tutoriel existe AVANT d'ouvrir
      if (!TUTORIALS[section] || !TUTORIALS[section].content) {
        console.warn(`Tentative d'ouverture d'un tutoriel inexistant pour la section: ${section}`);
        // Si pas de tutoriel, on laisse passer la navigation normale
        return;
      }

      // Empêcher la navigation
      e.preventDefault();

      // Afficher le modal de tutoriel
      setTutorialModal({
        isOpen: true,
        section: section,
        pendingNavigation: path
      });
    }
    // Si tutorialSeen est true, la navigation Link se fera normalement
  };

  const closeTutorialAndNavigate = () => {
    const { pendingNavigation } = tutorialModal;

    // Fermer le modal
    setTutorialModal({
      isOpen: false,
      section: null,
      pendingNavigation: null
    });

    // Naviguer vers la section
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleConfigComplete = () => {
    // Utiliser flushSync pour s'assurer que l'état est bien vidé avant de fermer
    flushSync(() => {
      setShowConfigArtisan(false);
    });
    // Petit délai pour laisser le DOM se nettoyer
    setTimeout(() => {
      setShowTraiterTutorial(true);
    }, 100);
  };

  const handleTraiterTutorialComplete = () => {
    // Utiliser flushSync pour s'assurer que l'état est bien vidé avant de fermer
    flushSync(() => {
      setShowTraiterTutorial(false);
    });
    // 🔒 PAS de simulateEvent - La sidebar reste fermée jusqu'à ce qu'un VRAI événement se produise
    toast.success('Bienvenue dans ArtisanFlow ! 🎉');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto" data-testid="dashboard">
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
          <div className="flex items-center gap-3">
            {/* Bouton de simulation (pour démo) */}
            <button
              onClick={() => simulateEvent('paymentsReceived')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition text-sm"
              title="Simuler: Paiement reçu"
            >
              💳 Simuler événement
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
              data-testid="logout-button"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Navigation Cards - 4 + 3 Layout */}
        <div className="space-y-6">
          {/* First Row - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. DEVIS */}
            <Link
              to="/quotes"
              onClick={(e) => handleSectionClick(e, 'devis', '/quotes')}
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
              to="/chantiers-agenda"
              onClick={(e) => handleSectionClick(e, 'chantiers-agenda', '/chantiers-agenda')}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-700/40 hover:border-blue-500 transition group cursor-pointer"
              data-testid="nav-chantiers-agenda"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Calendar className="text-blue-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">CHANTIERS & AGENDA</h3>
                <p className="text-xs text-gray-400">Planning et gestion</p>
              </div>
            </Link>

            {/* 3. FACTURES */}
            <Link
              to="/invoices"
              onClick={(e) => handleSectionClick(e, 'invoices', '/invoices')}
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
              onClick={(e) => handleSectionClick(e, 'accounting', '/accounting')}
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

          {/* Second Row - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 5. STOCK */}
            <Link
              to="/inventory"
              onClick={(e) => handleSectionClick(e, 'stock', '/inventory')}
              className="bg-gradient-to-br from-slate-900/30 to-slate-800/20 p-6 rounded-xl border border-slate-700/40 hover:border-slate-500 transition group cursor-pointer"
              data-testid="nav-stock"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Package className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">STOCK</h3>
                <p className="text-xs text-gray-400">Gestion du matériel et des consommables</p>
              </div>
            </Link>

            {/* 6. CLIENTS */}
            <Link
              to="/clients"
              onClick={(e) => handleSectionClick(e, 'clients', '/clients')}
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-6 rounded-xl border border-cyan-700/40 hover:border-cyan-500 transition group cursor-pointer"
              data-testid="nav-clients"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Users className="text-cyan-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">CLIENTS</h3>
                <p className="text-xs text-gray-400">Fiches et historique</p>
              </div>
            </Link>

            {/* 7. CHAT IA MÉTIER */}
            <Link
              to="/ai-chat"
              onClick={(e) => handleSectionClick(e, 'aiChat', '/ai-chat')}
              className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 p-6 rounded-xl border border-pink-700/40 hover:border-pink-500 transition group cursor-pointer"
              data-testid="nav-ai-chat"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-pink-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <MessageSquare className="text-pink-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">CHAT IA MÉTIER</h3>
                <p className="text-xs text-gray-400">Assistance technique</p>
                <span className="mt-2 text-[10px] px-2 py-1 rounded-full bg-pink-700/40 text-pink-300">IA</span>
              </div>
            </Link>

            {/* 8. PARAMÈTRES & PROFIL */}
            <Link
              to="/settings"
              onClick={(e) => handleSectionClick(e, 'settings', '/settings')}
              className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 p-6 rounded-xl border border-gray-700/40 hover:border-gray-500 transition group cursor-pointer"
              data-testid="nav-settings"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Settings className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">PARAMÈTRES & PROFIL</h3>
                <p className="text-xs text-gray-400">Réglages du compte</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Configuration Artisan Modal (PREMIÈRE ÉTAPE après login) */}
      <ConfigurationArtisanModal
        open={showConfigArtisan}
        onComplete={handleConfigComplete}
      />

      {/* Tutoriel Sidebar "À TRAITER" (DEUXIÈME ÉTAPE après config artisan) */}
      <TraiterSidebarTutorialModal
        open={showTraiterTutorial}
        onComplete={handleTraiterTutorialComplete}
      />

      {/* Tutorial Modal */}
      {tutorialModal.isOpen && tutorialModal.section && (
        <TutorialModal
          isOpen={tutorialModal.isOpen}
          onClose={closeTutorialAndNavigate}
          section={tutorialModal.section}
          title={TUTORIALS[tutorialModal.section]?.title || ''}
          content={TUTORIALS[tutorialModal.section]?.content || ''}
        />
      )}
    </DashboardLayout>
  );
}