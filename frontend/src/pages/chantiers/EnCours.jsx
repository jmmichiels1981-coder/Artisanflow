import React, { useState, useEffect } from 'react';
import { Wrench, ArrowLeft, User, FileText, CalendarDays, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import EnCoursTutorial from '@/components/tutorials/EnCoursTutorial';

export default function ChantiersEnCours() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Données mockées pour démonstration (chantiers en cours)
  const [chantiers, setChantiers] = useState([
    {
      id: 1,
      clientName: 'M. Dupont',
      description: 'Rénovation complète de la cuisine',
      devisRef: 'DEV-001',
      montant: '2 500€',
      startDate: '2025-01-08', // Date de début confirmée
      endDate: '2025-01-12',   // Date de fin confirmée
      status: 'en_cours'
    },
    {
      id: 2,
      clientName: 'Mme Martin',
      description: 'Installation salle de bain',
      devisRef: 'DEV-002', 
      montant: '3 800€',
      startDate: '2025-01-06',
      endDate: '2025-01-12',   // Même date de fin que Dupont
      status: 'en_cours'
    },
    {
      id: 3,
      clientName: 'M. Bernard',
      description: 'Travaux électriques',
      devisRef: 'DEV-003',
      montant: '1 200€',
      startDate: '2025-01-09',
      endDate: '2025-01-15',   // Finit plus tard
      status: 'en_cours'
    },
    {
      id: 4,
      clientName: 'Mme Dubois',
      description: 'Peinture salon',
      devisRef: 'DEV-004',
      montant: '800€',
      startDate: '2025-01-10',
      endDate: '2025-01-12',   // Même fin que Dupont et Martin
      status: 'en_cours'
    }
  ]);

  // Tri automatique selon la logique métier
  const chantiersTries = [...chantiers].sort((a, b) => {
    // 1. Tri par date de fin (plus urgent en premier)
    const dateFinA = new Date(a.endDate);
    const dateFinB = new Date(b.endDate);
    
    if (dateFinA.getTime() !== dateFinB.getTime()) {
      return dateFinA.getTime() - dateFinB.getTime();
    }
    
    // 2. Si même date de fin, tri par date de début
    const dateDebutA = new Date(a.startDate);
    const dateDebutB = new Date(b.startDate);
    
    if (dateDebutA.getTime() !== dateDebutB.getTime()) {
      return dateDebutA.getTime() - dateDebutB.getTime();
    }
    
    // 3. Si même dates, tri alphabétique par nom client
    return a.clientName.localeCompare(b.clientName);
  });

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_en_cours_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_en_cours_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const handleVoirChantier = (chantierId) => {
    // Navigation vers la fiche détaillée du chantier
    console.log(`Ouverture de la fiche du chantier ${chantierId}`);
    // Ici on pourrait naviguer vers une page de détail du chantier
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
            🔧 Chantiers en cours
          </h1>
          <p className="text-gray-400">
            Chantiers actuellement en cours de réalisation
          </p>
        </div>

        {/* Liste des chantiers ou message vide */}
        {chantiersTries.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
            <div className="text-center">
              <Wrench className="mx-auto mb-4 text-gray-500" size={64} />
              <p className="text-gray-400 text-lg mb-2">
                Aucun chantier en cours
              </p>
              <p className="text-gray-500 text-sm">
                Les chantiers démarrés apparaîtront ici
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chantiersTries.map((chantier) => (
              <div key={chantier.id} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-600/20 border border-orange-700/40 rounded-lg flex items-center justify-center">
                      <User className="text-orange-400" size={24} />
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-900/30 text-orange-300 text-xs rounded-full border border-orange-700/40">
                      <Wrench size={12} />
                      En cours
                    </span>
                  </div>
                </div>

                {/* Dates confirmées */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
                    🟠 Dates confirmées :
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Période principale */}
                    <div>
                      <p className="text-white text-lg font-semibold">
                        du {new Date(chantier.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} au {new Date(chantier.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Période : <span className="font-semibold text-white">{formatDateRange(chantier.startDate, chantier.endDate)}</span>
                      </p>
                    </div>

                    {/* Détail des dates */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">🚀 Début confirmé :</p>
                        <p className="text-sm text-white">
                          {new Date(chantier.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">🏁 Fin confirmée :</p>
                        <p className="text-sm text-white">
                          {new Date(chantier.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVoirChantier(chantier.id)}
                    variant="outline"
                    className="bg-orange-800 text-white border-orange-700 hover:bg-orange-700"
                  >
                    <Eye size={18} className="mr-2" />
                    Voir le chantier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <EnCoursTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
