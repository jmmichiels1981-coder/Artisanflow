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

  // Générer les années de 2022 à 2050
  const currentYear = new Date().getFullYear();
  const anneeOptions = [
    { value: '', label: 'Toutes les années' },
    ...Array.from({ length: 2050 - 2022 + 1 }, (_, i) => {
      const year = 2022 + i;
      return { value: year.toString(), label: year.toString() };
    })
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

        {/* Barre de filtres */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-gray-400" size={18} />
            <span className="text-sm font-medium text-gray-300">Filtrer par :</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre Mois */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline mr-1" size={16} />
                Mois
              </label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                {moisOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Année */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline mr-1" size={16} />
                Année
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                {anneeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Client */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="inline mr-1" size={16} />
                Client
              </label>
              <select
                value={filters.client}
                onChange={(e) => handleFilterChange('client', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                {clientsUniques.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des chantiers ou message vide */}
        {chantiersTries.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 text-gray-500" size={64} />
              <p className="text-gray-400 text-lg mb-2">
                Aucun chantier terminé pour le moment.
              </p>
              <p className="text-gray-500 text-sm">
                Les chantiers terminés apparaîtront ici après génération de la facture finale.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chantiersTries.map((chantier) => (
              <div key={chantier.id} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/40 transition">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-600/20 border border-green-700/40 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
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
                      <CheckCircle size={12} />
                      Terminé
                    </span>
                  </div>
                </div>

                {/* Informations du chantier terminé */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">📅 Date de génération de la facture finale :</p>
                      <p className="text-white font-semibold">
                        {formatDate(chantier.dateFactureFinale)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDateShort(chantier.dateFactureFinale)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions - Visualisation uniquement */}
                <div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVoirFacture(chantier)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download size={18} className="mr-2" />
                      Voir la facture finale (PDF)
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    Pour consulter le statut de la facture, rendez-vous dans le menu <strong className="text-gray-300">Factures</strong> de votre tableau de bord.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <HistoriqueTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
