import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
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
    </DashboardLayout>
  );
}
