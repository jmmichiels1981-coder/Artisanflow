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

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera les chantiers en cours avec suivi de l'avancement.
          </p>
        </div>

        {/* Liste vide */}
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
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <EnCoursTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
