import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';
import { ArrowLeft, FileText, Download, Eye, Clock, Mail, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Données mock pour Phase 1 - Devis à relancer (J+7 après envoi initial)
const MOCK_DEVIS_A_RELANCER = [
  {
    id: 1,
    dateEnvoi: '2024-11-15',
    dateRelance: null, // Se remplit après l'envoi de la relance
    client: 'Pierre Dubois',
    montantTTC: 3250.00,
    acompte: 975.00, // 30% de 3250
    devisNum: 'DEV-2024-004'
  },
  {
    id: 2,
    dateEnvoi: '2024-11-12',
    dateRelance: '2024-11-25', // Exemple: relance déjà envoyée
    client: 'Marie Lambert',
    montantTTC: 4560.75,
    acompte: 1368.23, // 30% de 4560.75
    devisNum: 'DEV-2024-005'
  },
  {
    id: 3,
    dateEnvoi: '2024-11-10',
    dateRelance: null,
    client: 'Entreprise Rousseau SAS',
    montantTTC: 6890.00,
    acompte: 2067.00, // 30% de 6890
    devisNum: 'DEV-2024-006'
  }
];

export default function ARelancer() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [devisList, setDevisList] = useState(MOCK_DEVIS_A_RELANCER);
  const [checkedPayments, setCheckedPayments] = useState({});
  const [checkedRefuses, setCheckedRefuses] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('tutorial_devis_relancer_hidden')) {
      setShowTutorial(true);
    }
    
    // Vérifier si le modal d'information a déjà été vu
    if (!localStorage.getItem('info_modal_devis_relancer_hidden')) {
      setShowInfoModal(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_relancer_hidden', 'true');
    setShowTutorial(false);
  };

  const handleCloseInfoModal = () => {
    localStorage.setItem('info_modal_devis_relancer_hidden', 'true');
    setShowInfoModal(false);
  };

  const handleViewPDF = (devis, type) => {
    const docType = type === 'devis' ? 'Devis' : 'Facture d\'acompte';
    toast.info(`📄 ${docType} ${devis.devisNum}`, {
      description: `Visualisation du ${docType.toLowerCase()} pour ${devis.client} (${devis.montantTTC.toFixed(2)}€ TTC)`,
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

  const handlePreparerEmailRelance = (devisId) => {
    // 🔒 PHASE 2 - Voir /app/frontend/PHASE_2_WORKFLOW_RELANCES.md (Cas 2)
    // Actions à implémenter :
    // 1. Appeler API /api/devis/:id/generate-email pour générer email IA
    // 2. Ouvrir modal avec email pré-rempli (modifiable)
    // 3. Sur "Valider & envoyer" :
    //    - Appeler API /api/devis/:id/send-relance
    //    - Remplir date_relance avec date du jour
    //    - Désactiver le bouton (afficher badge "Déjà relancé")
    //    - Démarrer compteur J+10
    // 4. Toast de confirmation
    
    // Phase 1: UNIQUEMENT toast informatif - aucune action backend
    toast.info('🤖 Génération d\'email par IA disponible en Phase 2', {
      description: `En Phase 2, un email de relance personnalisé sera généré avec le devis et la facture d'acompte en pièces jointes. La date de relance sera alors enregistrée automatiquement après l'envoi.`,
      duration: 4000
    });
  };

  const handlePaymentReceived = (devisId) => {
    setCheckedPayments(prev => ({ ...prev, [devisId]: !prev[devisId] }));
    
    if (!checkedPayments[devisId]) {
      const devis = devisList.find(d => d.id === devisId);
      toast.success('✅ Paiement marqué comme reçu!', {
        description: `Le devis ${devis.devisNum} sera déplacé vers "Devis acceptés" et l'agenda s'ouvrira pour planifier le chantier (Phase 2)`,
        duration: 4000
      });
    }
  };

  const handleMarquerRefuse = (devisId) => {
    setCheckedRefuses(prev => ({ ...prev, [devisId]: !prev[devisId] }));
    
    if (!checkedRefuses[devisId]) {
      const devis = devisList.find(d => d.id === devisId);
      toast.error('❌ Devis marqué comme refusé', {
        description: `Le devis ${devis.devisNum} sera déplacé vers "Devis refusés". Une analyse IA et des suggestions seront disponibles dans l'historique (Phase 2)`,
        duration: 5000
      });
    }
  };

  // Note: Logique automatique Phase 2
  // Un devis sera automatiquement classé en "Refusé" si:
  // - 10 jours se sont écoulés APRÈS la date de relance (dateRelance)
  // - ET aucune action n'a été effectuée ("Paiement reçu" ou "Refusé" manuel)
  // Le système génèrera alors une analyse IA + suggestions et enverra une notification

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
          <h1 className="text-3xl font-bold text-white mb-2">Devis à relancer</h1>
          <p className="text-gray-400">Clients à recontacter pour augmenter vos conversions</p>
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-orange-900/20 border border-orange-700/40 rounded-lg px-4 py-2 text-orange-400 text-sm">
              <Clock size={16} />
              <span>{devisList.length} devis à relancer (J+7 après envoi initial)</span>
            </div>
          </div>
        </div>

        {/* Tableau des devis */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date d'envoi initial</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date de relance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Email relance</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Paiement reçu</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Refusé</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Montant TTC</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Acompte TTC</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {devisList.map((devis) => {
                  const isPaymentChecked = checkedPayments[devis.id];
                  const isRefuseChecked = checkedRefuses[devis.id];

                  return (
                    <tr key={devis.id} className="hover:bg-gray-800/30 transition">
                      {/* 1. Date d'envoi initial */}
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-medium">
                          {new Date(devis.dateEnvoi).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* 2. Date de relance */}
                      <td className="px-6 py-4">
                        {devis.dateRelance ? (
                          <div className="flex flex-col">
                            <span className="text-blue-400 text-sm font-medium">
                              {new Date(devis.dateRelance).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-gray-500 text-xs">Relance envoyée</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span className="text-gray-500 text-sm italic">Pas encore relancé</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Client */}
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{devis.client}</span>
                      </td>

                      {/* 4. Email de relance (IA) */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {devis.dateRelance ? (
                            // Si une relance a déjà été envoyée : afficher un badge "Déjà relancé"
                            <div className="px-3 py-2 bg-gray-700/30 border border-gray-600/40 rounded-lg text-gray-400 text-sm flex flex-col items-center gap-1">
                              <CheckCircle size={18} className="text-gray-500" />
                              <span className="text-xs whitespace-nowrap font-semibold">Déjà relancé</span>
                              <span className="text-xs text-gray-500">
                                {new Date(devis.dateRelance).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          ) : (
                            // Si aucune relance envoyée : bouton actif
                            <button
                              onClick={() => handlePreparerEmailRelance(devis.id)}
                              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-700/40 rounded-lg text-purple-400 text-sm flex flex-col items-center gap-1 transition"
                              title="Préparer l'email de relance avec IA"
                            >
                              <Mail size={18} />
                              <span className="text-xs whitespace-nowrap">Préparer email</span>
                              <span className="text-xs text-purple-300">(IA)</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 5. Paiement reçu - Checkbox */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isPaymentChecked}
                              onChange={() => handlePaymentReceived(devis.id)}
                              className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-gray-900 cursor-pointer"
                            />
                            <span className={`text-sm transition ${isPaymentChecked ? 'text-green-400 font-semibold' : 'text-gray-400 group-hover:text-gray-300'}`}>
                              {isPaymentChecked ? 'Reçu ✓' : 'Paiement reçu ?'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* 6. Refusé - Checkbox */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isRefuseChecked}
                              onChange={() => handleMarquerRefuse(devis.id)}
                              className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900 cursor-pointer"
                            />
                            <span className={`text-sm transition ${isRefuseChecked ? 'text-red-400 font-semibold' : 'text-gray-400 group-hover:text-gray-300'}`}>
                              {isRefuseChecked ? 'Refusé ✗' : 'Refusé ?'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* 7. Montant TTC */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-bold text-lg">{devis.montantTTC.toFixed(2)}€</span>
                          <span className="text-gray-500 text-sm">TTC</span>
                        </div>
                      </td>

                      {/* 8. Acompte TTC */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-green-400 font-semibold text-base">{devis.acompte.toFixed(2)}€</span>
                          <span className="text-gray-500 text-xs">Acompte 30%</span>
                        </div>
                      </td>

                      {/* 9. Actions PDF - 4 boutons */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {/* Ligne 1: Devis PDF */}
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewPDF(devis, 'devis')}
                              className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded text-blue-400 transition"
                              title="Voir le devis PDF"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(devis, 'devis')}
                              className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded text-blue-400 transition"
                              title="Télécharger le devis PDF"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                          {/* Ligne 2: Facture acompte */}
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewPDF(devis, 'acompte')}
                              className="p-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 rounded text-green-400 transition"
                              title="Voir la facture d'acompte"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(devis, 'acompte')}
                              className="p-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 rounded text-green-400 transition"
                              title="Télécharger la facture d'acompte"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
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

      {/* Modal d'information automatique - S'affiche à la première visite */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/50 sticky top-0 bg-gray-800/95 backdrop-blur">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">🔔 Informations importantes</h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-5">
              {/* Section 1: Apparition des devis */}
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                <p className="text-gray-200 text-base leading-relaxed">
                  Les devis apparaissent ici lorsqu'ils sont restés <span className="text-blue-400 font-semibold">sans réponse pendant 7 jours</span> après leur envoi initial.
                </p>
                <p className="text-gray-200 text-base leading-relaxed mt-2">
                  L'artisan reçoit automatiquement une <span className="text-green-400 font-semibold">notification</span> lorsqu'un devis arrive dans cette section.
                </p>
              </div>

              {/* Section 2: Relancer un client */}
              <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                <p className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                  <Mail size={18} />
                  ✉️ Relancer un client
                </p>
                <p className="text-gray-200 text-base leading-relaxed mb-2">
                  L'artisan peut relancer un client à tout moment en cliquant sur <span className="text-purple-400 font-semibold">"Préparer l'email de relance (IA)"</span>.
                </p>
                <p className="text-gray-200 text-base leading-relaxed mb-2">
                  Cette action ouvre un email de relance généré par l'IA, incluant automatiquement :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                  <li>le devis en pièce jointe,</li>
                  <li>la facture d'acompte en pièce jointe,</li>
                  <li>un message pré-rempli (modifiable avant envoi).</li>
                </ul>
                <p className="text-gray-200 text-base leading-relaxed mt-3">
                  Une fois validé, la <span className="text-blue-400 font-semibold">date de relance est enregistrée automatiquement</span>.
                </p>
              </div>

              {/* Section 3: Classement automatique après relance */}
              <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4">
                <p className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  ⏱ Classement automatique après la relance
                </p>
                <p className="text-gray-200 text-base leading-relaxed mb-2">
                  Après une relance effectuée, si aucune action n'est faite par l'artisan dans les <span className="text-orange-400 font-semibold">10 jours suivant la date de relance</span> :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                  <li>le devis est automatiquement classé comme <span className="text-red-400 font-semibold">refusé</span>,</li>
                  <li>il apparaît dans <span className="text-gray-300 italic">Historique des devis → Devis refusés</span>,</li>
                  <li>une <span className="text-purple-400 font-semibold">analyse IA</span> et des suggestions d'amélioration sont générées automatiquement,</li>
                  <li>une notification informe l'artisan de ce classement.</li>
                </ul>
              </div>

              {/* Section 4: Classer comme refusé manuellement */}
              <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4">
                <p className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                  <X size={18} />
                  ❌ Classer un devis comme refusé manuellement
                </p>
                <p className="text-gray-200 text-base leading-relaxed mb-2">
                  Si le client informe l'artisan qu'il refuse le devis (par téléphone, email, SMS…), l'artisan peut cocher la case <span className="text-red-400 font-semibold">"Refusé"</span>.
                </p>
                <p className="text-gray-200 text-base leading-relaxed">
                  Le devis est alors immédiatement déplacé dans <span className="text-red-400 font-semibold">"Devis refusés"</span>, avec une <span className="text-purple-400 font-semibold">analyse IA et des suggestions</span> disponibles dans l'historique.
                </p>
              </div>

              {/* Section 5: Confirmer réception acompte */}
              <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4">
                <p className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  💶 Confirmer la réception d'un acompte
                </p>
                <p className="text-gray-200 text-base leading-relaxed mb-2">
                  Si le client paie l'acompte, il peut cocher <span className="text-green-400 font-semibold">"Paiement reçu ?"</span>.
                </p>
                <p className="text-gray-200 text-base leading-relaxed">
                  Le devis sera automatiquement déplacé dans <span className="text-green-400 font-semibold">"Devis acceptés"</span>, et l'agenda s'ouvrira pour permettre de planifier les dates de chantier.
                </p>
              </div>
            </div>

            {/* Footer avec bouton */}
            <div className="px-6 py-5 border-t border-gray-700/50 bg-gray-800/50">
              <button
                onClick={handleCloseInfoModal}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <CheckCircle size={20} />
                ✔ OK, j'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutoriel */}
      <DevisTutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        title="Bienvenue dans votre espace 'Devis à relancer'"
      >
        <p className="text-lg mb-4">Vous retrouvez ici les devis sans réponse au 7ᵉ jour après le premier envoi.</p>
        
        <p className="text-lg mb-4">Vous pouvez :</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Voir et télécharger le devis PDF</li>
          <li>Voir et télécharger la facture d'acompte</li>
          <li>Voir les jours écoulés depuis l'envoi</li>
          <li>Préparer un email de relance avec l'IA</li>
          <li>Cocher "Paiement reçu"</li>
          <li>Marquer un devis comme "Refusé"</li>
        </ul>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">Email de relance IA (Phase 2) :</p>
          <p className="mb-2">L'IA générera un email personnalisé avec le devis + la facture d'acompte en pièces jointes.</p>
          <p>Vous pourrez modifier le contenu avant d'envoyer.</p>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-4">
          <p className="font-semibold text-orange-300 mb-2">Si vous marquez un paiement comme reçu :</p>
          <p className="mb-1">→ le devis passe dans "Devis acceptés"</p>
          <p>→ la facture d'acompte est archivée dans<br />
          <span className="ml-4 text-sm">Factures → Historique des factures → Factures d'acompte</span></p>
          <p className="mt-2">→ l'agenda s'ouvre pour planifier les dates de chantier</p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
