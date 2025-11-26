import React from 'react';
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

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Liste des alertes/notifications à traiter
  const alerts = [
    { 
      emoji: '✔', 
      label: 'Devis accepté',
      count: 0, // sera alimenté dynamiquement
      color: 'text-green-500'
    },
    { 
      emoji: '💳', 
      label: 'Paiement reçu',
      sublabel: 'uniquement si via QR Code',
      count: 0,
      color: 'text-blue-500'
    },
    { 
      emoji: '📅', 
      label: 'Dates acceptées',
      count: 0,
      color: 'text-cyan-500'
    },
    { 
      emoji: '🔄', 
      label: 'Dates proposées',
      count: 0,
      color: 'text-purple-500'
    },
    { 
      emoji: '🔻', 
      label: 'Stock faible',
      count: 0,
      color: 'text-orange-500'
    },
    { 
      emoji: '🎉', 
      label: 'Fin des travaux',
      count: 0,
      color: 'text-yellow-500'
    },
    { 
      emoji: '🧾', 
      label: 'Facture impayée',
      sublabel: 'IA relance',
      count: 0,
      color: 'text-red-500'
    },
    { 
      emoji: '🔁', 
      label: 'Devis sans réponse',
      sublabel: 'IA relance',
      count: 0,
      color: 'text-pink-500'
    },
    { 
      emoji: '❌', 
      label: 'Devis refusé/sans réponse',
      sublabel: 'analyse IA du pourquoi',
      count: 0,
      color: 'text-gray-500'
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
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

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const disabled = item.badge === 'Bientôt';

            return (
              <li key={item.path}>
                <Link
                  to={disabled ? '#' : item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition group relative ${
                    active 
                      ? 'bg-orange-600 text-white' 
                      : disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  onClick={(e) => disabled && e.preventDefault()}
                >
                  <Icon size={20} className={active ? 'text-white' : item.color} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.badge === 'IA' 
                            ? 'bg-pink-500/20 text-pink-400' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute left-12 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 p-2">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition mb-2 ${
            isActive('/settings')
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Paramètres</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition ${
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
