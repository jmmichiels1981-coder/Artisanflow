import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';
import { ArrowLeft, Eye, Download, XCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Données mock pour Phase 1 - Devis refusés
const MOCK_DEVIS_REFUSES = [
  {
    id: 1,
    client: 'Jean Moreau',
    montantTTC: 4200.00,
    acompte: 1260.00, // 30%
    dateDernierEnvoi: '2024-11-15', // J0 = date de la relance
    dateRefus: '2024-11-26', // Refus automatique J+10 après relance
    typeRefus: 'automatique', // ou 'manuel'
    devisNum: 'DEV-2024-005',
    analyseIA: {
      raisonProbable: 'Prix 18% supérieur à la moyenne du marché pour ce type de prestation. Délai de réponse du client inhabituellement long (aucune interaction après 3 relances).',
      suggestions: [
        'Proposer une option de paiement échelonné pour réduire la barrière psychologique',
        'Inclure des témoignages clients et photos de réalisations similaires',
        'Recontacter le client dans 3 mois avec une offre saisonnière'
      ]
    }
  },
  {
    id: 2,
    client: 'Marie Petit',
    montantTTC: 2890.50,
    acompte: 867.15, // 30%
    dateDernierEnvoi: '2024-11-18',
    dateRefus: '2024-11-20', // Refus manuel (marqué par l'artisan)
    typeRefus: 'manuel',
    devisNum: 'DEV-2024-009',
    analyseIA: {
      raisonProbable: 'Client a indiqué avoir trouvé moins cher ailleurs. Prix cohérent avec le marché mais manque de différenciation par rapport à la concurrence.',
      suggestions: [
        'Mettre en avant votre expertise et vos garanties (10 ans décennale)',
        'Proposer un service après-vente premium inclus',
        'Ajouter une clause de révision si les conditions changent'
      ]
    }
  },
  {
    id: 3,
    client: 'Entreprise Dubois SARL',
    montantTTC: 7500.00,
    acompte: 2250.00, // 30%
    dateDernierEnvoi: '2024-11-10',
    dateRefus: '2024-11-21', // Refus automatique
    typeRefus: 'automatique',
    devisNum: 'DEV-2024-010',
    analyseIA: {
      raisonProbable: 'Devis envoyé en période de congés du client (détecté via analyse des dates). Projet probablement reporté ou confié à un concurrent plus réactif.',
      suggestions: [
        'Relancer le client début janvier avec une nouvelle proposition',
        'Proposer une date de démarrage flexible',
        'Inclure une clause de garantie de prix valable 60 jours'
      ]
    }
  }
];

export default function Refuses() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  // Trier par date de refus décroissante (du plus récent au plus ancien)
  const [devisList] = useState(
    [...MOCK_DEVIS_REFUSES].sort((a, b) => 
      new Date(b.dateRefus) - new Date(a.dateRefus)
    )
  );
  const [expandedAnalysis, setExpandedAnalysis] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('tutorial_devis_refuses_seen')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_refuses_seen', 'true');
    setShowTutorial(false);
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Devis refusés</h1>
          <p className="text-gray-400">Opportunités manquées et analyse IA pour améliorer votre taux de conversion</p>
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-2 text-red-400 text-sm">
              <XCircle size={16} />
              <span>{devisList.length} devis refusés</span>
            </div>
          </div>
        </div>

        {/* Tableau des devis refusés */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Montant TTC</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Acompte TTC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date dernier envoi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date du refus</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Type de refus</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {devisList.map((devis) => (
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
                          <span className="text-orange-400 font-semibold text-base">{devis.acompte.toFixed(2)}€</span>
                          <span className="text-gray-500 text-xs">30% acompte</span>
                        </div>
                      </td>

                      {/* Date dernier envoi (J0 = relance) */}
                      <td className="px-6 py-4">
                        <span className="text-white text-sm">
                          {new Date(devis.dateDernierEnvoi).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Date du refus */}
                      <td className="px-6 py-4">
                        <span className="text-red-400 text-sm">
                          {new Date(devis.dateRefus).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Type de refus */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {devis.typeRefus === 'manuel' ? (
                            <span className="inline-flex items-center gap-1 bg-orange-900/20 border border-orange-700/40 rounded-lg px-3 py-1 text-orange-400 text-xs font-semibold">
                              👤 Manuel
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-purple-900/20 border border-purple-700/40 rounded-lg px-3 py-1 text-purple-400 text-xs font-semibold">
                              🤖 Automatique
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

                          {/* Facture acompte */}
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

                    {/* Ligne d'analyse IA expandable */}
                    <tr className="bg-gray-900/30">
                      <td colSpan="7" className="px-6 py-4">
                        <button
                          onClick={() => toggleAnalysis(devis.id)}
                          className="w-full flex items-center justify-between p-4 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700/40 rounded-lg transition"
                        >
                          <div className="flex items-center gap-3">
                            <Lightbulb className="text-purple-400" size={20} />
                            <span className="text-purple-300 font-semibold">
                              🤖 Analyse IA du refus
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
                                <AlertTriangle size={18} />
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
                                ℹ️ Phase 1 : Analyse IA mockée – Phase 2 : Analyse réelle générée automatiquement
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
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
        title="🎓 Comprendre vos devis refusés"
      >
        <p className="text-base mb-4 font-semibold">Bienvenue dans vos devis refusés 👇</p>
        <p className="text-base mb-4 text-gray-300">Cette section regroupe tous les devis qui n'ont pas abouti.</p>
        <p className="text-base mb-3 font-semibold">Deux cas sont possibles :</p>

        {/* 1. Refus manuel */}
        <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-300 mb-2">1️⃣ Refus manuel</p>
          <p className="text-gray-300 text-sm mb-2">
            L'artisan a coché la case "Refusé" dans la page "Devis à relancer".
          </p>
          <p className="text-gray-300 text-sm">
            → Le devis est immédiatement classé ici.
          </p>
        </div>

        {/* 2. Refus automatique */}
        <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-purple-300 mb-2">2️⃣ Refus automatique (Phase 2)</p>
          <p className="text-gray-300 text-sm mb-2">
            Si une relance a été envoyée et qu'aucune réponse n'est reçue :
          </p>
          <p className="text-gray-300 text-sm">
            → Le devis est automatiquement classé ici <span className="text-purple-400 font-semibold">10 jours après la relance</span>.
          </p>
        </div>

        {/* 3. Analyse IA */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">🤖 Analyse IA (Phase 2)</p>
          <p className="text-gray-300 text-sm mb-2">
            Pour chaque devis refusé, une analyse IA sera disponible :
          </p>
          <p className="text-gray-300 text-sm mb-1">→ raison probable du refus</p>
          <p className="text-gray-300 text-sm mb-1">→ conseils d'amélioration</p>
          <p className="text-gray-300 text-sm mb-1">→ comportement du client</p>
          <p className="text-gray-300 text-sm">→ taux de conversion</p>
          <p className="text-blue-400 text-xs mt-3 italic">
            💡 En Phase 1 → texte mocké dans l'UI
          </p>
        </div>

        {/* 4. Documents disponibles */}
        <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
          <p className="font-semibold text-green-300 mb-2">📄 Documents disponibles</p>
          <p className="text-gray-300 text-sm mb-2">
            L'artisan pourra consulter et télécharger :
          </p>
          <p className="text-gray-300 text-sm mb-1">→ le devis envoyé</p>
          <p className="text-gray-300 text-sm">→ la facture d'acompte (si existante)</p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
