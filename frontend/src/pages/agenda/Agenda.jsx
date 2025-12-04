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

        {/* Contenu Agenda (placeholder) */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Vue {activeView} de l'agenda
            </p>
            <p className="text-gray-500 text-sm">
              L'interface calendrier sera implémentée dans la Phase 2
            </p>
          </div>
        </div>
      </div>

      <AgendaTutorial open={showTutorial} onClose={handleCloseTutorial} />
    </DashboardLayout>
  );
}
