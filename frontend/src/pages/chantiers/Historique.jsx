import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, User, FileText, Download, Filter, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import HistoriqueTutorial from '@/components/tutorials/HistoriqueTutorial';

export default function HistoriqueChantiers() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // États pour les filtres (UI uniquement)
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    client: ''
  });
  
  // Données mockées pour démonstration (chantiers terminés)
  const [chantiersTermines, setChantiersTermines] = useState([
    {
      id: 1,
      clientName: 'M. Dupont',
      description: 'Rénovation complète de la cuisine',
      devisRef: 'DEV-001',
      montant: '2 500€',
      dateFactureFinale: '2024-12-15',
      status: 'termine',
      facturePdfUrl: '/factures/DEV-001-finale.pdf'
    },
    {
      id: 2,
      clientName: 'Mme Martin',
      description: 'Installation salle de bain',
      devisRef: 'DEV-002',
      montant: '3 800€',
      dateFactureFinale: '2024-12-10',
      status: 'termine',
      facturePdfUrl: '/factures/DEV-002-finale.pdf'
    },
    {
      id: 3,
      clientName: 'M. Bernard',
      description: 'Travaux électriques',
      devisRef: 'DEV-003',
      montant: '1 200€',
      dateFactureFinale: '2024-11-28',
      status: 'termine',
      facturePdfUrl: '/factures/DEV-003-finale.pdf'
    },
    {
      id: 4,
      clientName: 'Mme Dubois',
      description: 'Peinture salon et couloir',
      devisRef: 'DEV-004',
      montant: '800€',
      dateFactureFinale: '2024-11-15',
      status: 'termine',
      facturePdfUrl: '/factures/DEV-004-finale.pdf'
    }
  ]);

  // Options pour les filtres
  const moisOptions = [
    { value: '', label: 'Tous les mois' },
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const anneeOptions = [
    { value: '', label: 'Toutes les années' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' }
  ];

  const clientsUniques = [
    { value: '', label: 'Tous les clients' },
    ...Array.from(new Set(chantiersTermines.map(c => c.clientName)))
      .map(client => ({ value: client, label: client }))
  ];

  // Tri des chantiers par date de facture finale (plus récent en premier)
  const chantiersTries = [...chantiersTermines].sort((a, b) => {
    return new Date(b.dateFactureFinale).getTime() - new Date(a.dateFactureFinale).getTime();
  });

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_historique_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_historique_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleVoirFacture = (chantier) => {
    // Ouvrir la facture PDF (UI uniquement pour l'instant)
    console.log(`Ouverture de la facture PDF pour ${chantier.clientName} - ${chantier.devisRef}`);
    // Ici on pourrait ouvrir le PDF dans un nouvel onglet ou une modal
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
            ✅ Historique des chantiers terminés
          </h1>
          <p className="text-gray-400">
            Tous les chantiers terminés et leurs détails
          </p>
        </div>

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera l'historique complet des chantiers terminés.
          </p>
        </div>

        {/* Liste vide */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Aucun chantier terminé
            </p>
            <p className="text-gray-500 text-sm">
              L'historique de vos chantiers terminés s'affichera ici
            </p>
          </div>
        </div>
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <HistoriqueTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
