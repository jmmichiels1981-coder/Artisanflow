import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft, CheckCircle, Edit, FileText, AlertCircle, User, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import EnAttenteTutorial from '@/components/tutorials/EnAttenteTutorial';
import ProposeNewDatesModal from '@/components/ProposeNewDatesModal';

export default function ChantiersEnAttente() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedChantier, setSelectedChantier] = useState(null);
  
  // Données mockées pour démonstration
  const [chantiers, setChantiers] = useState([
    {
      id: 1,
      clientName: 'M. Dupont',
      description: 'Rénovation complète de la cuisine',
      devisRef: 'DEV-001',
      montant: '2 500€',
      proposedStartDate: '2025-01-15',
      proposedEndDate: '2025-01-19',
      status: 'waiting_client', // waiting_client | client_accepted | client_proposed_other
      clientProposedDates: null,
      dateSent: '2025-01-08'
    },
    {
      id: 2,
      clientName: 'Mme Martin',
      description: 'Installation salle de bain',
      devisRef: 'DEV-002',
      montant: '3 800€',
      proposedStartDate: '2025-01-20',
      proposedEndDate: '2025-01-25',
      status: 'client_accepted',
      clientProposedDates: null,
      dateSent: '2025-01-07',
      clientResponse: 'Dates parfaites, je confirme ma disponibilité.'
    },
    {
      id: 3,
      clientName: 'M. Bernard',
      description: 'Travaux électriques',
      devisRef: 'DEV-003',
      montant: '1 200€',
      proposedStartDate: '2025-01-22',
      proposedEndDate: '2025-01-24',
      status: 'client_proposed_other',
      clientProposedDates: {
        startDate: '2025-01-25',
        endDate: '2025-01-27'
      },
      dateSent: '2025-01-06',
      clientResponse: 'Je préférerais commencer le 25 janvier si possible.'
    }
  ]);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_en_attente_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_en_attente_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const handleConfirmDates = (chantierId) => {
    // Déplacer le chantier vers "Chantiers planifiés"
    setChantiers(prev => prev.filter(c => c.id !== chantierId));
    console.log(`Chantier ${chantierId} confirmé et déplacé vers Chantiers planifiés`);
    // Ici on pourrait naviguer vers la page Planifiés ou afficher une notification
  };

  const handleAcceptClientDates = (chantierId) => {
    // Accepter les dates proposées par le client
    setChantiers(prev => prev.map(c => 
      c.id === chantierId 
        ? { ...c, status: 'client_accepted', proposedStartDate: c.clientProposedDates.startDate, proposedEndDate: c.clientProposedDates.endDate }
        : c
    ));
    console.log(`Dates client acceptées pour chantier ${chantierId}`);
  };

  const handleProposeNewDates = (chantier) => {
    setSelectedChantier(chantier);
    setShowProposeModal(true);
  };

  const handleModalClose = (wasSent, newDates) => {
    setShowProposeModal(false);
    setSelectedChantier(null);
    
    if (wasSent && newDates && selectedChantier) {
      // Mettre à jour le chantier avec les nouvelles dates proposées
      setChantiers(prev => prev.map(c => 
        c.id === selectedChantier.id 
          ? { 
              ...c, 
              proposedStartDate: newDates.startDate, 
              proposedEndDate: newDates.endDate,
              status: 'waiting_client',
              dateSent: new Date().toISOString().split('T')[0]
            }
          : c
      ));
      console.log('Nouvelles dates envoyées au client');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting_client':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded-full border border-yellow-700/40">
            <Clock size={12} />
            En attente réponse client
          </span>
        );
      case 'client_accepted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-300 text-xs rounded-full border border-green-700/40">
            <CheckCircle size={12} />
            Client a accepté
          </span>
        );
      case 'client_proposed_other':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700/40">
            <Edit size={12} />
            Client propose d'autres dates
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
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
            ⏳ Chantiers en attente de validation
          </h1>
          <p className="text-gray-400">
            Chantiers dont les dates ont été proposées et attendent confirmation du client
          </p>
        </div>

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera les chantiers en attente de validation client après proposition de dates.
          </p>
        </div>

        {/* Liste vide */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <Clock className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Aucun chantier en attente
            </p>
            <p className="text-gray-500 text-sm">
              Les chantiers avec dates proposées apparaîtront ici
            </p>
          </div>
        </div>
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <EnAttenteTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
