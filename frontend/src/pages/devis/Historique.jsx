import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';
import { ArrowLeft, Eye, Download, Lightbulb, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';

// Données mock pour Phase 1 - Historique complet
const MOCK_HISTORIQUE_DEVIS = [
  // Devis acceptés
  {
    id: 1,
    client: 'Sophie Martin',
    montantTTC: 5200.00,
    acompte: 1560.00,
    categorie: 'accepte',
    dateAcceptation: '2024-10-15',
    dateRelance: null,
    dateRefus: null,
    devisNum: 'DEV-2024-015',
    analyseIA: null
  },
  {
    id: 2,
    client: 'Lucas Bernard',
    montantTTC: 3890.50,
    acompte: 1167.15,
    categorie: 'accepte',
    dateAcceptation: '2024-09-28',
    dateRelance: null,
    dateRefus: null,
    devisNum: 'DEV-2024-012',
    analyseIA: null
  },
  // Devis refusés manuellement
  {
    id: 3,
    client: 'Pierre Durand',
    montantTTC: 4200.00,
    acompte: 1260.00,
    categorie: 'refuse_manuel',
    dateAcceptation: null,
    dateRelance: '2024-10-05',
    dateRefus: '2024-10-08',
    devisNum: 'DEV-2024-008',
    typeRefus: 'manuel',
    analyseIA: {
      raisonProbable: 'Client a indiqué avoir trouvé moins cher chez un concurrent. Prix 15% au-dessus du marché local.',
      suggestions: [
        'Proposer une réduction pour fidéliser le client',
        'Mettre en avant la qualité des matériaux utilisés',
        'Offrir une garantie étendue'
      ]
    }
  },
  // Devis refusés automatiquement J+10
  {
    id: 4,
    client: 'Marie Dubois',
    montantTTC: 6890.00,
    acompte: 2067.00,
    categorie: 'refuse_auto',
    dateAcceptation: null,
    dateRelance: '2024-09-20',
    dateRefus: '2024-10-01',
    devisNum: 'DEV-2024-005',
    typeRefus: 'automatique',
    analyseIA: {
      raisonProbable: 'Aucune réponse du client après 3 relances. Période de congés détectée. Projet probablement abandonné ou confié à un autre prestataire.',
      suggestions: [
        'Recontacter le client dans 3 mois avec une nouvelle offre',
        'Proposer un devis réactualisé avec prix promotionnel',
        'Simplifier le devis avec des options modulaires'
      ]
    }
  },
  // Devis archivés automatiquement (10 jours après refus)
  {
    id: 5,
    client: 'Thomas Petit',
    montantTTC: 3250.00,
    acompte: 975.00,
    categorie: 'archive_refuse',
    dateAcceptation: null,
    dateRelance: '2024-08-15',
    dateRefus: '2024-08-26',
    devisNum: 'DEV-2024-002',
    typeRefus: 'automatique',
    analyseIA: {
      raisonProbable: 'Budget client insuffisant. Montant du devis 40% supérieur au budget initialement mentionné lors du premier contact.',
      suggestions: [
        'Proposer un échelonnement du paiement',
        'Créer une version simplifiée du devis',
        'Suggérer une réalisation en plusieurs phases'
      ]
    }
  },
  {
    id: 6,
    client: 'Entreprise Rousseau SARL',
    montantTTC: 8900.00,
    acompte: 2670.00,
    categorie: 'archive_refuse',
    dateAcceptation: null,
    dateRelance: '2024-08-10',
    dateRefus: '2024-08-12',
    devisNum: 'DEV-2024-001',
    typeRefus: 'manuel',
    analyseIA: {
      raisonProbable: 'Client a choisi un concurrent avec délai de livraison plus court. Votre délai annoncé : 6 semaines vs concurrent : 3 semaines.',
      suggestions: [
        'Optimiser la planification pour réduire les délais',
        'Proposer une prime pour démarrage rapide',
        'Mettre en avant la qualité vs rapidité'
      ]
    }
  }
];

export default function Historique() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const { formatAmount } = useCurrency();
  
  // Trier par date la plus récente (acceptation, relance ou refus selon la catégorie)
  const [historique] = useState(
    [...MOCK_HISTORIQUE_DEVIS].sort((a, b) => {
      const dateA = a.dateAcceptation || a.dateRefus || a.dateRelance;
      const dateB = b.dateAcceptation || b.dateRefus || b.dateRelance;
      return new Date(dateB) - new Date(dateA);
    })
  );
  
  // Filtres
  const [filterCategorie, setFilterCategorie] = useState('tous');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');
  const [expandedAnalysis, setExpandedAnalysis] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('tutorial_historique_devis_seen')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_historique_devis_seen', 'true');
    setShowTutorial(false);
  };

  // Filtrage des devis (Phase 1 mock)
  const filteredHistorique = historique.filter(devis => {
    // Filtre par catégorie
    if (filterCategorie !== 'tous') {
      if (filterCategorie === 'acceptes' && devis.categorie !== 'accepte') return false;
      if (filterCategorie === 'refuses' && !devis.categorie.includes('refuse')) return false;
    }
    
    // Filtre par date (Phase 1 mock - à implémenter proprement en Phase 2)
    // Pour l'instant, on accepte tous les devis si les dates ne sont pas renseignées
    
    return true;
  });

  const handleViewPDF = (devis, type) => {
    const docType = type === 'devis' ? 'Devis' : 'Facture d\'acompte';
    toast.info(`📄 ${docType} ${devis.devisNum}`, {
      description: `Visualisation du ${docType.toLowerCase()} pour ${devis.client}`,
      duration: 3000
    });
  };

  const handleDownloadPDF = (devis, type) => {
    const docType = type === 'devis' ? 'Devis' : 'Facture d\'acompte';
    toast.success(`⬇️ Téléchargement ${docType}`, {
      description: `${docType} ${devis.devisNum} - ${devis.client}`,
      duration: 2000
    });
  };

  const toggleAnalysis = (devisId) => {
    setExpandedAnalysis(prev => ({
      ...prev,
      [devisId]: !prev[devisId]
    }));
  };

  const getCategorieDisplay = (devis) => {
    switch(devis.categorie) {
      case 'accepte':
        return {
          label: 'Accepté',
          date: devis.dateAcceptation,
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-700/40',
          icon: <CheckCircle size={16} />
        };
      case 'refuse_manuel':
      case 'refuse_auto':
      case 'archive_refuse':
        return {
          label: 'Refusé/sans réponse',
          date: devis.dateRefus,
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-700/40',
          icon: <XCircle size={16} />
        };
      default:
        return {
          label: 'Inconnu',
          date: null,
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-700/40',
          icon: null
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header avec bouton retour */}
        <button
          onClick={() => navigate('/quotes')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition"
        >
          <ArrowLeft size={20} />
          <span>Retour au menu Devis</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Historique des devis</h1>
          <p className="text-gray-400">Archive complète de tous vos devis finalisés</p>
        </div>

        {/* Barre de filtres */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filtres</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtre par catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Catégorie</label>
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous</option>
                <option value="acceptes">Acceptés</option>
                <option value="refuses">Refusés</option>
              </select>
            </div>

            {/* Filtre date début */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date début</label>
              <input
                type="date"
                value={filterDateDebut}
                onChange={(e) => setFilterDateDebut(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date fin</label>
              <input
                type="date"
                value={filterDateFin}
                onChange={(e) => setFilterDateFin(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Badge résultat */}
            <div className="flex items-end">
              <div className="w-full px-4 py-2 bg-blue-900/20 border border-blue-700/40 rounded-lg text-blue-400 text-sm font-semibold text-center">
                {filteredHistorique.length} devis trouvé{filteredHistorique.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Tableau de l'historique */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Montant TTC</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Acompte TTC</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Catégorie</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {filteredHistorique.map((devis) => {
                  const categorieInfo = getCategorieDisplay(devis);
                  const hasAnalyseIA = devis.analyseIA !== null;

                  return (
                    <React.Fragment key={devis.id}>
                      <tr className="hover:bg-gray-800/30 transition">
                        {/* Client */}
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{devis.client}</span>
                        </td>

                        {/* Montant TTC */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-white font-bold text-lg">{devis.montantTTC.toFixed(2)}€</span>
                            <span className="text-gray-500 text-sm">Total TTC</span>
                          </div>
                        </td>

                        {/* Acompte TTC */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-blue-400 font-semibold text-base">{devis.acompte.toFixed(2)}€</span>
                            <span className="text-gray-500 text-xs">Acompte</span>
                          </div>
                        </td>

                        {/* Catégorie */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className={`inline-flex items-center gap-2 ${categorieInfo.bgColor} border ${categorieInfo.borderColor} rounded-lg px-3 py-1`}>
                              {categorieInfo.icon}
                              <span className={`${categorieInfo.color} font-semibold text-sm`}>
                                {categorieInfo.label}
                              </span>
                            </div>
                            {categorieInfo.date && (
                              <span className="text-gray-400 text-xs">
                                {new Date(categorieInfo.date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {/* Devis PDF */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-gray-400 text-xs">Devis</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleViewPDF(devis, 'devis')}
                                  className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded-lg text-blue-400 transition"
                                  title="Voir le devis PDF"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(devis, 'devis')}
                                  className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded-lg text-blue-400 transition"
                                  title="Télécharger le devis PDF"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Facture acompte (visible pour TOUS les devis) */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-gray-400 text-xs">Facture</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleViewPDF(devis, 'acompte')}
                                  className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 rounded-lg text-green-400 transition"
                                  title="Voir la facture d'acompte"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(devis, 'acompte')}
                                  className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 rounded-lg text-green-400 transition"
                                  title="Télécharger la facture d'acompte"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Ligne d'analyse IA pour les devis refusés */}
                      {hasAnalyseIA && (
                        <tr className="bg-gray-900/30">
                          <td colSpan="5" className="px-6 py-4">
                            <button
                              onClick={() => toggleAnalysis(devis.id)}
                              className="w-full flex items-center justify-between p-4 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700/40 rounded-lg transition"
                            >
                              <div className="flex items-center gap-3">
                                <Lightbulb className="text-purple-400" size={20} />
                                <span className="text-purple-300 font-semibold">
                                  💡 Analyse IA — Raison probable du refus
                                </span>
                              </div>
                              <span className="text-gray-400 text-sm">
                                {expandedAnalysis[devis.id] ? '▼ Masquer' : '▶ Afficher'}
                              </span>
                            </button>

                            {expandedAnalysis[devis.id] && (
                              <div className="mt-4 p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-700/40 rounded-lg space-y-4">
                                {/* Raison probable */}
                                <div>
                                  <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                                    <XCircle size={18} />
                                    Raison probable du refus :
                                  </h4>
                                  <p className="text-gray-300 text-sm leading-relaxed">
                                    {devis.analyseIA.raisonProbable}
                                  </p>
                                </div>

                                {/* Suggestions */}
                                <div>
                                  <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                                    <Lightbulb size={18} />
                                    Suggestions pour améliorer votre taux de conversion :
                                  </h4>
                                  <ul className="space-y-2">
                                    {devis.analyseIA.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <span className="text-green-400 font-bold mt-0.5">•</span>
                                        <span>{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Badge Phase 1 */}
                                <div className="pt-3 border-t border-purple-700/40">
                                  <span className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 rounded-lg px-3 py-1 text-blue-300 text-xs">
                                    ℹ️ Phase 1 : Analyse IA mockée – Phase 2 : Analyse conservée depuis le refus
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouton Retour en bas */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/quotes')}
            className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/40 rounded-lg text-gray-300 hover:text-white flex items-center gap-2 transition"
          >
            <ArrowLeft size={20} />
            <span>Retour au menu Devis</span>
          </button>
        </div>
      </div>

      {/* Tutoriel */}
      <DevisTutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        title="📘 Tutoriel — Historique des devis"
      >
        <div className="space-y-4">
          <p className="text-base text-gray-300 leading-relaxed">
            Cette page regroupe tous vos <span className="text-white font-semibold">devis passés</span>, qu'ils aient été :
          </p>
          
          <ul className="space-y-2 ml-4 text-base text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold mt-1">✓</span>
              <span><span className="text-green-400 font-semibold">Acceptés</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold mt-1">✗</span>
              <span><span className="text-orange-400 font-semibold">Refusés manuellement</span> par l'artisan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold mt-1">✗</span>
              <span><span className="text-red-400 font-semibold">Refusés automatiquement</span> 10 jours après la date d'envoi de la relance lorsque le client n'a donné aucune réponse et qu'aucun paiement n'a été enregistré</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold mt-1">📦</span>
              <span><span className="text-purple-400 font-semibold">Archivés automatiquement</span> 10 jours après être restés dans la section "Devis refusés"</span>
            </li>
          </ul>

          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <p className="text-base text-gray-300 leading-relaxed mb-3">
              <span className="text-blue-300 font-semibold">📋 Vous pouvez ici :</span>
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>→ Consulter le détail de vos devis</li>
              <li>→ Lire l'analyse IA pour les devis refusés</li>
              <li>→ Télécharger les PDF</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/40 rounded-lg p-4">
            <p className="text-base text-gray-300 leading-relaxed">
              <span className="text-gray-300 font-semibold">ℹ️ Important :</span><br />
              L'historique est une <span className="text-blue-400 font-semibold">zone de consultation uniquement</span> : aucune action n'est requise.
            </p>
          </div>

          <p className="text-sm text-gray-400 italic text-center mt-4">
            Cliquez sur "Retour" pour revenir au menu principal.
          </p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
