import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft, Clock, Wrench, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import AgendaTutorial from '@/components/tutorials/AgendaTutorial';

export default function Agenda() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('mois');
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const hasCheckedTutorial = useRef(false);

  useEffect(() => {
    // Ne vérifier qu'une seule fois par session pour éviter les réaffichages
    if (hasCheckedTutorial.current) return;
    
    const tutorialSeen = localStorage.getItem('af_agenda_tutorial_seen');
    
    // Afficher uniquement si jamais vu ET que c'est la première vérification
    if (!tutorialSeen) {
      // Délai pour s'assurer que le composant est complètement monté
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 300);
      
      hasCheckedTutorial.current = true;
      return () => clearTimeout(timer);
    }
    
    hasCheckedTutorial.current = true;
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_agenda_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  // Mock chantiers avec dates réalistes
  const mockChantiers = [
    {
      id: 1,
      client: 'M. Dupont',
      type: 'provisoire',
      dateDebut: new Date(2024, 11, 5),
      dateFin: new Date(2024, 11, 8),
      description: 'Rénovation cuisine'
    },
    {
      id: 2,
      client: 'Mme Martin',
      type: 'planifie',
      dateDebut: new Date(2024, 11, 10),
      dateFin: new Date(2024, 11, 15),
      description: 'Installation salle de bain'
    },
    {
      id: 3,
      client: 'M. Bernard',
      type: 'en-cours',
      dateDebut: new Date(2024, 11, 2),
      dateFin: new Date(2024, 11, 6),
      description: 'Travaux électriques'
    },
    {
      id: 4,
      client: 'Mme Dubois',
      type: 'propose-client',
      dateDebut: new Date(2024, 11, 18),
      dateFin: new Date(2024, 11, 22),
      description: 'Peinture intérieure'
    },
    {
      id: 5,
      client: 'M. Petit',
      type: 'termine',
      dateDebut: new Date(2024, 10, 25),
      dateFin: new Date(2024, 10, 30),
      description: 'Pose de carrelage'
    }
  ];

  const getStatusInfo = (type) => {
    const statusMap = {
      'provisoire': {
        label: 'Dates provisoires',
        bgColor: 'bg-yellow-600',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-900',
        pattern: 'bg-stripes-yellow',
        route: '/chantiers/en-attente'
      },
      'propose-client': {
        label: 'Proposé par client',
        bgColor: 'bg-blue-600',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-900',
        pattern: 'bg-stripes-blue',
        route: '/chantiers/en-attente'
      },
      'planifie': {
        label: 'Planifié',
        bgColor: 'bg-green-600',
        borderColor: 'border-green-500',
        textColor: 'text-white',
        pattern: '',
        route: '/chantiers/planifies'
      },
      'en-cours': {
        label: 'En cours',
        bgColor: 'bg-orange-600',
        borderColor: 'border-orange-500',
        textColor: 'text-white',
        pattern: '',
        route: '/chantiers/en-cours'
      },
      'termine': {
        label: 'Terminé',
        bgColor: 'bg-gray-500',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-200',
        pattern: '',
        route: '/chantiers/historique'
      }
    };
    return statusMap[type] || statusMap['planifie'];
  };

  const handleChantierClick = (chantier) => {
    const statusInfo = getStatusInfo(chantier.type);
    navigate(statusInfo.route);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (activeView === 'jour') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (activeView === 'semaine') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (activeView === 'jour') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (activeView === 'semaine') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    if (activeView === 'jour') {
      return currentDate.toLocaleDateString('fr-FR', options);
    } else if (activeView === 'semaine') {
      const start = getWeekStart(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `Semaine du ${start.getDate()} au ${end.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateInRange = (date, start, end) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  };

  const getChantiersForDate = (date) => {
    return mockChantiers.filter(c => isDateInRange(date, c.dateDebut, c.dateFin));
  };

  // Vue Jour
  const renderJourView = () => {
    const chantiers = getChantiersForDate(currentDate);
    
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        
        {chantiers.length > 0 ? (
          <div className="space-y-3">
            {chantiers.map(chantier => {
              const info = getStatusInfo(chantier.type);
              return (
                <button
                  key={chantier.id}
                  onClick={() => handleChantierClick(chantier)}
                  className={`w-full ${info.bgColor} hover:opacity-90 rounded-lg p-4 text-left transition cursor-pointer border-l-4 ${info.borderColor}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`font-semibold ${info.textColor} mb-1`}>
                        {chantier.client}
                      </p>
                      <p className={`text-sm ${info.textColor} opacity-90`}>
                        {chantier.description}
                      </p>
                      <p className={`text-xs ${info.textColor} opacity-80 mt-2`}>
                        {info.label} • {chantier.dateDebut.toLocaleDateString('fr-FR')} → {chantier.dateFin.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-gray-500" size={48} />
            <p className="text-gray-400">Aucun chantier n'est planifié pour cette période.</p>
          </div>
        )}
      </div>
    );
  };

  // Vue Semaine
  const renderSemaineView = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-700">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour, idx) => (
            <div key={idx} className="p-3 text-center border-r border-gray-700 last:border-r-0 bg-gray-800">
              <p className="text-sm font-semibold text-gray-300">{jour}</p>
              <p className="text-lg text-white mt-1">{days[idx].getDate()}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 min-h-[400px]">
          {days.map((day, idx) => {
            const chantiers = getChantiersForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={idx} 
                className={`p-2 border-r border-gray-700 last:border-r-0 ${isToday ? 'bg-purple-900/20' : ''}`}
              >
                <div className="space-y-1">
                  {chantiers.map(chantier => {
                    const info = getStatusInfo(chantier.type);
                    const isStart = isSameDay(day, chantier.dateDebut);
                    const isEnd = isSameDay(day, chantier.dateFin);
                    
                    return (
                      <button
                        key={chantier.id}
                        onClick={() => handleChantierClick(chantier)}
                        className={`w-full ${info.bgColor} hover:opacity-90 rounded px-2 py-1 text-left transition cursor-pointer text-xs ${info.textColor} truncate ${
                          info.type === 'provisoire' || info.type === 'propose-client' ? 'border-2 border-dashed border-white/50' : ''
                        }`}
                        title={`${chantier.client} - ${chantier.description}`}
                      >
                        {isStart && chantier.client}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Vue Mois
  const renderMoisView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = getWeekStart(firstDay);
    
    const days = [];
    let current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-700">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour, idx) => (
            <div key={idx} className="p-2 text-center border-r border-gray-700 last:border-r-0 bg-gray-800">
              <p className="text-sm font-semibold text-gray-300">{jour}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = isSameDay(day, new Date());
            const chantiers = getChantiersForDate(day);
            
            return (
              <div 
                key={idx} 
                className={`min-h-[100px] p-2 border-r border-b border-gray-700 ${
                  !isCurrentMonth ? 'bg-gray-900/50 opacity-50' : ''
                } ${isToday ? 'bg-purple-900/20 border-purple-500' : ''}`}
              >
                <div className="text-sm text-gray-300 mb-1 font-semibold">
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {chantiers.slice(0, 3).map(chantier => {
                    const info = getStatusInfo(chantier.type);
                    const isStart = isSameDay(day, chantier.dateDebut);
                    
                    return (
                      <button
                        key={chantier.id}
                        onClick={() => handleChantierClick(chantier)}
                        className={`w-full ${info.bgColor} hover:opacity-90 rounded px-1 py-0.5 text-left transition cursor-pointer text-[10px] ${info.textColor} truncate ${
                          info.type === 'provisoire' || info.type === 'propose-client' ? 'border border-dashed border-white/50' : ''
                        }`}
                        title={`${chantier.client} - ${chantier.description}`}
                      >
                        {isStart && chantier.client}
                      </button>
                    );
                  })}
                  {chantiers.length > 3 && (
                    <p className="text-[10px] text-gray-500">+{chantiers.length - 3} autre(s)</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📅 Agenda
            </h1>
            <p className="text-gray-400">
              Visualisez vos chantiers (provisoires, planifiés, en cours ou terminés) par jour, semaine ou mois.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={goToToday}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Aujourd'hui
            </Button>
          </div>
        </div>

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

        <div className="flex items-center justify-between mb-6 bg-gray-800/50 p-4 rounded-lg">
          <button 
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeft className="text-gray-300" size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            <span className="text-xl font-semibold text-white">
              {formatDateHeader()}
            </span>
          </div>
          
          <button 
            onClick={goToNext}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRight className="text-gray-300" size={24} />
          </button>
        </div>

        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Légende :</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {['provisoire', 'propose-client', 'planifie', 'en-cours', 'termine'].map((type) => {
              const info = getStatusInfo(type);
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${info.bgColor} ${
                    type === 'provisoire' || type === 'propose-client' ? 'border border-dashed border-white/70' : ''
                  }`}></div>
                  <span className="text-xs text-gray-300">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {activeView === 'jour' && renderJourView()}
        {activeView === 'semaine' && renderSemaineView()}
        {activeView === 'mois' && renderMoisView()}
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <AgendaTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
