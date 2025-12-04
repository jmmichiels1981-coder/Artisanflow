import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft, CheckCircle, Edit, FileText, AlertCircle, User, CalendarDays, Filter, Trash2, Send } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState('TOUT');
  
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
      dateSent: '2024-12-20' // Plus de 7 jours pour test de relance
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
      dateSent: '2025-01-02',
      clientResponse: 'Dates parfaites pour moi.'
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
      dateSent: '2025-01-01',
      clientResponse: 'Je préfère commencer le 25 janvier.'
    }
  ]);

  // Filtres disponibles
  const filtres = [
    { id: 'TOUT', label: 'TOUT', count: chantiers.length },
    { id: 'waiting_client', label: 'En attente de réponse du client', count: chantiers.filter(c => c.status === 'waiting_client').length },
    { id: 'client_accepted', label: 'Dates acceptées par le client', count: chantiers.filter(c => c.status === 'client_accepted').length },
    { id: 'client_proposed_other', label: 'Dates proposées par le client', count: chantiers.filter(c => c.status === 'client_proposed_other').length }
  ];

  // Filtrer les chantiers selon le filtre actif
  const chantiersFiltered = activeFilter === 'TOUT' 
    ? chantiers 
    : chantiers.filter(c => c.status === activeFilter);

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

  const handleDeleteChantier = (chantierId) => {
    // Supprimer le chantier et libérer les dates provisoires
    setChantiers(prev => prev.filter(c => c.id !== chantierId));
    console.log(`Chantier ${chantierId} supprimé et dates provisoires libérées`);
  };

  const handleSendRelance = (chantierId) => {
    // Future fonction de relance IA
    console.log(`Relance IA envoyée pour chantier ${chantierId}`);
  };
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

  // Calculer l'ancienneté en jours
  const calculateDaysWaiting = (dateSent) => {
    const today = new Date();
    const sentDate = new Date(dateSent);
    const diffTime = Math.abs(today - sentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Vérifier si le chantier peut être supprimé (aucune date confirmée)
  const canDeleteChantier = (chantier) => {
    return chantier.status === 'waiting_client' || chantier.status === 'client_proposed_other';
  };

  // Vérifier si une relance est nécessaire (plus de 7 jours)
  const needsRelance = (dateSent) => {
    return calculateDaysWaiting(dateSent) > 7;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting_client':
        return (
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded-full border border-yellow-700/40 border-dashed">
              <Clock size={12} />
              Dates envoyées — en attente de réponse du client
            </span>
          </div>
        );
      case 'client_accepted':
        return (
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-300 text-xs rounded-full border border-green-700/40">
              <CheckCircle size={12} />
              Client a accepté les dates
            </span>
            <p className="text-xs text-gray-500 mt-2">
              Les dates seront planifiées définitivement après votre confirmation.
            </p>
          </div>
        );
      case 'client_proposed_other':
        return (
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700/40 border-dashed">
              <Edit size={12} />
              Nouvelles dates proposées par le client
            </span>
            <p className="text-xs text-gray-500 mt-2">
              Les dates seront planifiées définitivement après votre confirmation.
            </p>
          </div>
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

        {/* Liste des chantiers ou message vide */}
        {chantiers.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
            <div className="text-center">
              <Clock className="mx-auto mb-4 text-gray-500" size={64} />
              <p className="text-gray-400 text-lg mb-2">
                Aucun chantier en attente
              </p>
              <p className="text-gray-500 text-sm">
                Les chantiers avec dates proposées ou acceptées par vos clients apparaîtront ici.
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
                    <div className="w-12 h-12 bg-purple-600/20 border border-purple-700/40 rounded-lg flex items-center justify-center">
                      <User className="text-purple-400" size={24} />
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
                    {getStatusBadge(chantier.status)}
                    <p className="text-xs text-gray-500 mt-2">
                      Envoyé le {formatDate(chantier.dateSent)}
                    </p>
                  </div>
                </div>

                {/* Dates proposées */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <CalendarDays size={16} />
                      Dates concernées
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded-md border border-yellow-700/40 border-dashed">
                      Dates provisoires — en attente de validation
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dates actuellement proposées */}
                    <div>
                      <p className="text-xs text-gray-400 mb-2">📅 Dates proposées par vous :</p>
                      <div className="space-y-1">
                        <p className="text-sm text-white">
                          <span className="text-green-400">Début:</span> {formatDate(chantier.proposedStartDate)}
                        </p>
                        <p className="text-sm text-white">
                          <span className="text-orange-400">Fin:</span> {formatDate(chantier.proposedEndDate)}
                        </p>
                      </div>
                    </div>

                    {/* Dates proposées par le client si applicable */}
                    {chantier.status === 'client_proposed_other' && chantier.clientProposedDates && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">🗣️ Dates proposées par le client :</p>
                        <div className="space-y-1">
                          <p className="text-sm text-blue-300">
                            <span className="text-green-400">Début:</span> {formatDate(chantier.clientProposedDates.startDate)}
                          </p>
                          <p className="text-sm text-blue-300">
                            <span className="text-orange-400">Fin:</span> {formatDate(chantier.clientProposedDates.endDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Réponse du client si applicable */}
                  {chantier.clientResponse && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
                      <p className="text-xs text-blue-300 mb-1">💬 Réponse du client :</p>
                      <p className="text-sm text-gray-300 italic">&ldquo;{chantier.clientResponse}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Actions selon le statut */}
                <div className="flex gap-3">
                  {chantier.status === 'waiting_client' && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <AlertCircle size={16} />
                      <span>En attente de la réponse du client...</span>
                    </div>
                  )}

                  {chantier.status === 'client_accepted' && (
                    <Button
                      onClick={() => handleConfirmDates(chantier.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Confirmer les dates
                    </Button>
                  )}

                  {chantier.status === 'client_proposed_other' && (
                    <>
                      <Button
                        onClick={() => handleAcceptClientDates(chantier.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        🟩 Accepter les dates proposées
                      </Button>
                      <Button
                        onClick={() => handleProposeNewDates(chantier)}
                        variant="outline"
                        className="bg-transparent text-white border-gray-600 hover:bg-gray-800"
                      >
                        <Edit size={18} className="mr-2" />
                        ⬜ Proposer d'autres dates
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour proposer de nouvelles dates */}
      <ProposeNewDatesModal
        open={showProposeModal}
        onClose={handleModalClose}
        clientName={selectedChantier?.clientName}
        currentDates={{
          start: selectedChantier?.proposedStartDate,
          end: selectedChantier?.proposedEndDate
        }}
        chantierData={selectedChantier}
      />

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <EnAttenteTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
