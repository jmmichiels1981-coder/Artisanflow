import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  Clock,
  CheckCircle,
  Wrench,
  ArrowLeft
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ChantiersAgendaTutorialModal from '@/components/ChantiersAgendaTutorialModal';

export default function JobsPage() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check tutorial status
    const tutorialSeen = localStorage.getItem('af_chantiers_tutorial_seen');
    if (!tutorialSeen || tutorialSeen === 'false') {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('af_chantiers_tutorial_seen', 'true');
  };

  const menuItems = [
    {
      title: 'Agenda',
      description: 'Vue calendrier (Jour / Semaine / Mois)',
      icon: Calendar,
      link: '/agenda',
      color: 'from-purple-900/30 to-purple-800/20',
      borderColor: 'border-purple-700/40 hover:border-purple-500',
      iconBg: 'bg-purple-600/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Créer une plage de dates',
      description: 'Depuis un devis accepté',
      icon: CalendarPlus,
      link: '/chantiers/creer-plage',
      color: 'from-blue-900/30 to-blue-800/20',
      borderColor: 'border-blue-700/40 hover:border-blue-500',
      iconBg: 'bg-blue-600/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'En attente de validation',
      description: 'Chantiers avec dates proposées',
      icon: Clock,
      link: '/chantiers/en-attente',
      color: 'from-yellow-900/30 to-yellow-800/20',
      borderColor: 'border-yellow-700/40 hover:border-yellow-500',
      iconBg: 'bg-yellow-600/20',
      iconColor: 'text-yellow-400'
    },
    {
      title: 'Chantiers planifiés',
      description: 'Dates validées, prêts à démarrer',
      icon: Calendar,
      link: '/chantiers/planifies',
      color: 'from-green-900/30 to-green-800/20',
      borderColor: 'border-green-700/40 hover:border-green-500',
      iconBg: 'bg-green-600/20',
      iconColor: 'text-green-400'
    },
    {
      title: 'Chantiers en cours',
      description: 'Travaux en cours de réalisation',
      icon: Wrench,
      link: '/chantiers/en-cours',
      color: 'from-orange-900/30 to-orange-800/20',
      borderColor: 'border-orange-700/40 hover:border-orange-500',
      iconBg: 'bg-orange-600/20',
      iconColor: 'text-orange-400'
    },
    {
      title: 'Historique terminés',
      description: 'Tous les chantiers terminés',
      icon: CheckCircle,
      link: '/chantiers/historique',
      color: 'from-gray-900/30 to-gray-800/20',
      borderColor: 'border-gray-700/40 hover:border-gray-500',
      iconBg: 'bg-gray-600/20',
      iconColor: 'text-gray-400'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Retour au Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            📅 Chantiers & Agenda
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez vos chantiers, planifiez vos interventions et consultez votre agenda
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-8">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 1 :</strong> L'architecture et la navigation sont en place. La logique métier sera implémentée en Phase 2.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.link}
                className={`bg-gradient-to-br ${item.color} p-6 rounded-xl border ${item.borderColor} transition group cursor-pointer`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${item.iconBg} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <Icon className={item.iconColor} size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <ChantiersAgendaTutorialModal
        open={showTutorial}
        onClose={handleTutorialClose}
      />
    </DashboardLayout>
  );
}
