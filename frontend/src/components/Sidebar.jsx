import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText, 
  Calendar,
  Receipt, 
  TrendingUp, 
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, activeAlerts, markAsHandled } = useNotifications();

  // Auto-ouvrir la sidebar quand un nouvel événement arrive
  useEffect(() => {
    if (activeAlerts.length > 0 && collapsed) {
      setCollapsed(false);
    }
  }, [activeAlerts, collapsed, setCollapsed]);

  // Liste des alertes/notifications à traiter
  const alerts = [
    { 
      id: 'quotesAccepted',
      emoji: '✔', 
      label: 'Devis accepté',
      count: notifications.quotesAccepted,
      color: 'text-green-500'
    },
    { 
      id: 'paymentsReceived',
      emoji: '💳', 
      label: 'Paiement reçu',
      sublabel: 'uniquement si via QR Code',
      count: notifications.paymentsReceived,
      color: 'text-blue-500'
    },
    { 
      id: 'datesAccepted',
      emoji: '📅', 
      label: 'Dates acceptées',
      count: notifications.datesAccepted,
      color: 'text-cyan-500'
    },
    { 
      id: 'datesProposed',
      emoji: '🔄', 
      label: 'Dates proposées',
      count: notifications.datesProposed,
      color: 'text-purple-500'
    },
    { 
      id: 'lowStock',
      emoji: '🔻', 
      label: 'Stock faible',
      count: notifications.lowStock,
      color: 'text-orange-500'
    },
    { 
      id: 'jobsCompleted',
      emoji: '🎉', 
      label: 'Fin des travaux',
      count: notifications.jobsCompleted,
      color: 'text-yellow-500'
    },
    { 
      id: 'unpaidInvoices',
      emoji: '🧾', 
      label: 'Facture impayée',
      sublabel: 'IA relance',
      count: notifications.unpaidInvoices,
      color: 'text-red-500'
    },
    { 
      id: 'quotesNoResponse',
      emoji: '🔁', 
      label: 'Devis sans réponse',
      sublabel: 'IA relance',
      count: notifications.quotesNoResponse,
      color: 'text-pink-500'
    },
    { 
      id: 'quotesRejected',
      emoji: '❌', 
      label: 'Devis refusé/sans réponse',
      sublabel: 'analyse IA du pourquoi',
      count: notifications.quotesRejected,
      color: 'text-gray-500'
    },
  ];

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

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">📋</span>
            </div>
            <span className="font-bold text-white text-lg">A TRAITER</span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto">
            <span className="text-white text-xl">📋</span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-gray-800 border border-gray-700 rounded-full p-1 hover:bg-gray-700 transition"
      >
        {collapsed ? (
          <ChevronRight size={16} className="text-gray-400" />
        ) : (
          <ChevronLeft size={16} className="text-gray-400" />
        )}
      </button>

      {/* Alerts/Notifications Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <style>{`
          @keyframes pulse-alert {
            0%, 100% { 
              background-color: rgba(249, 115, 22, 0.2);
              border-color: rgba(249, 115, 22, 0.6);
              box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
            }
            50% { 
              background-color: rgba(249, 115, 22, 0.4);
              border-color: rgba(249, 115, 22, 0.9);
              box-shadow: 0 0 30px rgba(249, 115, 22, 0.8);
            }
          }
          .alert-pulse {
            animation: pulse-alert 1s ease-in-out infinite !important;
          }
        `}</style>
        <ul className="space-y-2 px-2">
          {alerts.map((alert, index) => {
            const isActiveAlert = activeAlerts.includes(alert.id);
            return (
              <li key={index}>
                <div
                  onClick={() => {
                    if (alert.count > 0) {
                      // Marquer comme traité et arrêter l'animation
                      markAsHandled(alert.id);
                      toast.success(`"${alert.label}" marqué comme traité`);
                    }
                  }}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                    alert.count > 0 
                      ? 'bg-orange-600/10 border-2 border-orange-600/30 cursor-pointer hover:bg-orange-600/20' 
                      : 'bg-gray-800/30 border border-gray-800 opacity-60'
                  } ${collapsed ? 'justify-center' : ''} ${isActiveAlert ? 'alert-pulse' : ''}`}
                  style={isActiveAlert ? {
                    transform: 'scale(1.02)'
                  } : {}}
                >
                  <span className={`text-xl flex-shrink-0 ${isActiveAlert ? 'animate-bounce' : ''}`}>
                    {alert.emoji}
                  </span>
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${alert.color} ${isActiveAlert ? 'font-bold text-orange-400' : ''}`}>
                          {alert.label}
                        </span>
                        {alert.count > 0 && (
                          <span className={`bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                            isActiveAlert ? 'animate-pulse' : ''
                          }`}>
                            {alert.count}
                          </span>
                        )}
                      </div>
                      {alert.sublabel && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          → {alert.sublabel}
                        </span>
                      )}
                      {isActiveAlert && !collapsed && (
                        <div className="text-[9px] text-orange-400 font-semibold mt-1 animate-pulse">
                          🔔 NOUVEAU ! Cliquez pour traiter
                        </div>
                      )}
                    </div>
                  )}
                  {collapsed && (
                    <span className="absolute left-12 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                      {alert.label} {alert.count > 0 && `(${alert.count})`}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 p-2 space-y-1">
        {/* Tutoriel */}
        <Link
          to="/tutorials"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
            location.pathname === '/tutorials'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg">📚</span>
          {!collapsed && <span className="text-sm font-medium">Tutoriel</span>}
        </Link>

        {/* Recommandation */}
        <Link
          to="/recommendations"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
            location.pathname === '/recommendations'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg">💡</span>
          {!collapsed && <span className="text-sm font-medium">Recommandation</span>}
        </Link>

        {/* Divider */}
        <div className="h-px bg-gray-800 my-2"></div>

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
            location.pathname === '/dashboard'
              ? 'bg-orange-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <LayoutDashboard size={20} />
          {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
        </Link>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}
