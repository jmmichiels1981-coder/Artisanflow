import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft, Clock, Wrench, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import AgendaTutorial from '@/components/tutorials/AgendaTutorial';

export default function Agenda() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('semaine'); // jour, semaine, mois
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_agenda_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_agenda_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  // Mock data - À remplacer par les vraies données en Phase 2
  const mockChantiers = [
    {
      id: 1,
      client: 'M. Dupont',
      type: 'provisoire', // provisoire, propose-client, planifie, en-cours, termine
      dateDebut: '2024-12-05',
      dateFin: '2024-12-08',
      description: 'Rénovation cuisine'
    },
    {
      id: 2,
      client: 'Mme Martin',
      type: 'planifie',
      dateDebut: '2024-12-10',
      dateFin: '2024-12-15',
      description: 'Installation salle de bain'
    },
    {
      id: 3,
      client: 'M. Bernard',
      type: 'en-cours',
      dateDebut: '2024-12-02',
      dateFin: '2024-12-06',
      description: 'Travaux électriques'
    }
  ];

  const getStatusInfo = (type) => {
    const statusMap = {
      'provisoire': {
        label: 'Dates provisoires',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-600',
        textColor: 'text-yellow-300',
        icon: Clock,
        route: '/chantiers/en-attente'
      },
      'propose-client': {
        label: 'Proposé par client',
        bgColor: 'bg-blue-900/30',
        borderColor: 'border-blue-600',
        textColor: 'text-blue-300',
        icon: Clock,
        route: '/chantiers/en-attente'
      },
      'planifie': {
        label: 'Planifié',
        bgColor: 'bg-green-900/30',
        borderColor: 'border-green-600',
        textColor: 'text-green-300',
        icon: Calendar,
        route: '/chantiers/planifies'
      },
      'en-cours': {
        label: 'En cours',
        bgColor: 'bg-orange-900/30',
        borderColor: 'border-orange-600',
        textColor: 'text-orange-300',
        icon: Wrench,
        route: '/chantiers/en-cours'
      },
      'termine': {
        label: 'Terminé',
        bgColor: 'bg-gray-800/50',
        borderColor: 'border-gray-600',
        textColor: 'text-gray-500',
        icon: CheckCircle,
        route: '/chantiers/historique'
      }
    };
    return statusMap[type] || statusMap['planifie'];
  };

  const handleChantierClick = (chantier) => {
    const statusInfo = getStatusInfo(chantier.type);
    navigate(statusInfo.route);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Bouton Retour */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📅 Agenda
            </h1>
            <p className="text-gray-400">
              Visualisez vos chantiers planifiés par jour, semaine ou mois
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Aujourd'hui
            </Button>
          </div>
        </div>

        {/* Onglets Vue */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('jour')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeView === 'jour'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setActiveView('semaine')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeView === 'semaine'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setActiveView('mois')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeView === 'mois'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Mois
          </button>
        </div>

        {/* Navigation Date */}
        <div className="flex items-center justify-between mb-6 bg-gray-800/50 p-4 rounded-lg">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition">
            <ChevronLeft className="text-gray-300" size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            <span className="text-xl font-semibold text-white">
              {activeView === 'jour' && 'Lundi 3 décembre 2024'}
              {activeView === 'semaine' && 'Semaine du 2 au 8 décembre 2024'}
              {activeView === 'mois' && 'Décembre 2024'}
            </span>
          </div>
          
          <button className="p-2 hover:bg-gray-700 rounded-lg transition">
            <ChevronRight className="text-gray-300" size={24} />
          </button>
        </div>

        {/* Légende */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Légende :</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {['provisoire', 'propose-client', 'planifie', 'en-cours', 'termine'].map((type) => {
              const info = getStatusInfo(type);
              const Icon = info.icon;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 ${info.borderColor} ${info.bgColor}`}></div>
                  <span className="text-xs text-gray-300">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu Agenda */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          {mockChantiers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Chantiers - Vue {activeView}
              </h3>
              
              {/* Liste des chantiers (placeholder calendrier) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockChantiers.map((chantier) => {
                  const statusInfo = getStatusInfo(chantier.type);
                  const Icon = statusInfo.icon;
                  return (
                    <button
                      key={chantier.id}
                      onClick={() => handleChantierClick(chantier)}
                      className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-lg p-4 text-left hover:scale-105 transition-transform cursor-pointer`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={18} className={statusInfo.textColor} />
                          <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-white font-semibold mb-1">
                        {chantier.client}
                      </h4>
                      <p className="text-gray-400 text-sm mb-2">
                        {chantier.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        📅 {chantier.dateDebut} → {chantier.dateFin}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info Phase 2 */}
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-3 mt-6">
                <p className="text-blue-300 text-xs">
                  ℹ️ <strong>Phase 2 :</strong> L'interface calendrier complète avec vue jour/semaine/mois sera implémentée. Pour l'instant, les chantiers sont affichés en liste.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-gray-500" size={64} />
              <p className="text-gray-400 text-lg">
                Aucun chantier n'est planifié pour cette période.
              </p>
            </div>
          )}
        </div>
      </div>

      <AgendaTutorial open={showTutorial} onClose={handleCloseTutorial} />
    </DashboardLayout>
  );
}
