import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, User, FileText, CalendarDays, Clock, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import PlanifiesToutorial from '@/components/tutorials/PlanifiesToutorial';
import ModifyChantierDatesModal from '@/components/ModifyChantierDatesModal';

export default function ChantiersPlanifies() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedChantier, setSelectedChantier] = useState(null);
  
  // Données mockées pour démonstration
  const [chantiers, setChantiers] = useState([
    {
      id: 1,
      clientName: 'M. Dupont',
      description: 'Rénovation complète de la cuisine',
      devisRef: 'DEV-001',
      montant: '2 500€',
      startDate: '2025-01-15',
      endDate: '2025-01-19',
      status: 'planifie',
      dureeJours: 5
    },
    {
      id: 2,
      clientName: 'Mme Martin', 
      description: 'Installation salle de bain',
      devisRef: 'DEV-002',
      montant: '3 800€',
      startDate: '2025-01-22',
      endDate: '2025-01-26',
      status: 'planifie',
      dureeJours: 5
    },
    {
      id: 3,
      clientName: 'M. Bernard',
      description: 'Travaux électriques',
      devisRef: 'DEV-003', 
      montant: '1 200€',
      startDate: '2025-02-03',
      endDate: '2025-02-05',
      status: 'planifie',
      dureeJours: 3
    }
  ]);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_planifies_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_planifies_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const handleModifyDates = (chantier) => {
    setSelectedChantier(chantier);
    setShowModifyModal(true);
  };

  const handleModalClose = (wasSent, newDates) => {
    setShowModifyModal(false);
    
    if (wasSent && newDates && selectedChantier) {
      // Déplacer le chantier vers "En attente de validation" avec nouvelles dates
      setChantiers(prev => prev.filter(c => c.id !== selectedChantier.id));
      console.log(`Chantier ${selectedChantier.id} déplacé vers "En attente de validation" avec nouvelles dates:`, newDates);
      // Ici on pourrait naviguer vers la page En attente ou afficher une notification
    }
    
    setSelectedChantier(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'short' })} → ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'short' })}`;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📅 Chantiers planifiés
          </h1>
          <p className="text-gray-400">
            Chantiers dont les dates ont été validées et qui sont prêts à démarrer
          </p>
        </div>

        {/* Liste des chantiers ou message vide */}
        {chantiers.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
            <div className="text-center">
              <Calendar className="mx-auto mb-4 text-gray-500" size={64} />
              <p className="text-gray-400 text-lg mb-2">
                Aucun chantier planifié
              </p>
              <p className="text-gray-500 text-sm">
                Les chantiers avec dates confirmées apparaîtront ici
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chantiers.map((chantier) => (
              <div key={chantier.id} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-600/20 border border-green-700/40 rounded-lg flex items-center justify-center">
                      <User className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {chantier.clientName}
                      </h3>
                      <p className="text-gray-300 mb-2">{chantier.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          Devis {chantier.devisRef} ({chantier.montant})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-300 text-xs rounded-full border border-green-700/40">
                      <Calendar size={12} />
                      Planifié
                    </span>
                  </div>
                </div>

                {/* Dates confirmées */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <CalendarDays size={16} />
                    Dates confirmées
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Plage de dates */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">📅 Période de travaux :</p>
                      <p className="text-sm text-white font-semibold">
                        {formatDateRange(chantier.startDate, chantier.endDate)}
                      </p>
                    </div>

                    {/* Dates détaillées */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">🕒 Détail :</p>
                      <div className="space-y-1">
                        <p className="text-xs text-white">
                          <span className="text-green-400">Début:</span> {formatDate(chantier.startDate)}
                        </p>
                        <p className="text-xs text-white">
                          <span className="text-orange-400">Fin:</span> {formatDate(chantier.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* Durée */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">⏱️ Durée totale :</p>
                      <p className="text-sm text-white">
                        <span className="font-semibold">{chantier.dureeJours}</span> jour{chantier.dureeJours > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleModifyDates(chantier)}
                    variant="outline"
                    className="bg-purple-800 text-white border-purple-700 hover:bg-purple-700"
                  >
                    <Edit size={18} className="mr-2" />
                    🟣 Modifier les dates du chantier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour modifier les dates */}
      <ModifyChantierDatesModal
        open={showModifyModal}
        onClose={handleModalClose}
        chantier={selectedChantier}
      />

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <PlanifiesToutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
