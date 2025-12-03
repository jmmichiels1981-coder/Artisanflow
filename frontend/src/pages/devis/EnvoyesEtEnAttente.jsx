import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';
import { ArrowLeft, FileText, Download, Eye, Clock, CheckCircle, Send, Mail } from 'lucide-react';
import { toast } from 'sonner';

// Données mock pour Phase 1
const MOCK_DEVIS_ENVOYES = [
  {
    id: 1,
    dateEnvoi: '2024-11-28',
    client: 'Martin Dupont',
    montantTTC: 2450.00,
    acompte: 735.00, // 30% de 2450
    devisNum: 'DEV-2024-001'
  },
  {
    id: 2,
    dateEnvoi: '2024-11-25',
    client: 'Sophie Bernard',
    montantTTC: 3890.50,
    acompte: 1167.15, // 30% de 3890.50
    devisNum: 'DEV-2024-002'
  },
  {
    id: 3,
    dateEnvoi: '2024-11-22',
    client: 'Entreprise Legrand SARL',
    montantTTC: 5200.00,
    acompte: 1560.00, // 30% de 5200
    devisNum: 'DEV-2024-003'
  }
];

export default function EnvoyesEtEnAttente() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [devisList, setDevisList] = useState(MOCK_DEVIS_ENVOYES);
  const [checkedPayments, setCheckedPayments] = useState({});
  const [checkedRefuses, setCheckedRefuses] = useState({});

  useEffect(() => {
    // Vérifier si le tutoriel a déjà été vu
    if (!localStorage.getItem('tutorial_devis_envoyes_hidden')) {
      setShowTutorial(true);
    }
    
    // Vérifier si le modal d'information a déjà été vu
    if (!localStorage.getItem('info_modal_devis_envoyes_hidden')) {
      setShowInfoModal(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_envoyes_hidden', 'true');
    setShowTutorial(false);
  };

  const handleCloseInfoModal = () => {
    localStorage.setItem('info_modal_devis_envoyes_hidden', 'true');
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

  const handlePaymentReceived = (devisId) => {
    setCheckedPayments(prev => ({ ...prev, [devisId]: !prev[devisId] }));
    
    if (!checkedPayments[devisId]) {
      const devis = devisList.find(d => d.id === devisId);
      toast.success('✅ Paiement marqué comme reçu!', {
        description: `Le devis ${devis.devisNum} sera déplacé vers "Devis acceptés" (Phase 2)`,
        duration: 4000
      });
    }
  };

  const handleRelancer = (devis) => {
    toast.info('🤖 Génération d\'email par IA disponible en Phase 2', {
      description: `La fonctionnalité de relance automatique sera disponible prochainement`,
      duration: 3000
    });
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

  const calculateDaysWaiting = (dateEnvoi) => {
    const today = new Date();
    const sentDate = new Date(dateEnvoi);
    const diffTime = Math.abs(today - sentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <h1 className="text-3xl font-bold text-white mb-2">Devis envoyés & en attente</h1>
          <p className="text-gray-400">Suivez les devis en attente de réponse client</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-900/20 border border-blue-700/40 rounded-lg px-4 py-2 text-blue-400 text-sm">
            <Clock size={16} />
            <span>{devisList.length} devis en attente</span>
          </div>
        </div>

        {/* Tableau des devis */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date d'envoi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Montant TTC</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Devis PDF</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Facture acompte</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Paiement reçu</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Refusé</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {devisList.map((devis) => {
                  const daysWaiting = calculateDaysWaiting(devis.dateEnvoi);
                  const isPaymentChecked = checkedPayments[devis.id];
                  const isRefuseChecked = checkedRefuses[devis.id];

                  return (
                    <tr key={devis.id} className="hover:bg-gray-800/30 transition">
                      {/* Date d'envoi */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white text-sm">
                            {new Date(devis.dateEnvoi).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-gray-500 text-xs">Il y a {daysWaiting} jour{daysWaiting > 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{devis.client}</span>
                          <span className="text-gray-500 text-sm">{devis.devisNum}</span>
                        </div>
                      </td>

                      {/* Montant TTC */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-bold text-lg">{devis.montantTTC.toFixed(2)}€</span>
                          <span className="text-gray-500 text-sm">TTC</span>
                        </div>
                      </td>

                      {/* Devis PDF */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewPDF(devis, 'devis')}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded-lg text-blue-400 transition"
                            title="Voir le devis PDF"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(devis, 'devis')}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded-lg text-blue-400 transition"
                            title="Télécharger le devis PDF"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>

                      {/* Facture acompte */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-green-400 font-semibold text-sm">{devis.acompte.toFixed(2)}€ TTC</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewPDF(devis, 'acompte')}
                              className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 rounded-lg text-green-400 transition"
                              title="Voir la facture d'acompte"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(devis, 'acompte')}
                              className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 rounded-lg text-green-400 transition"
                              title="Télécharger la facture d'acompte"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Paiement reçu - Checkbox */}
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

                      {/* Refusé - Checkbox */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checkedRefuses[devis.id]}
                              onChange={() => handleMarquerRefuse(devis.id)}
                              className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900 cursor-pointer"
                            />
                            <span className={`text-sm transition ${checkedRefuses[devis.id] ? 'text-red-400 font-semibold' : 'text-gray-400 group-hover:text-gray-300'}`}>
                              {checkedRefuses[devis.id] ? 'Refusé ✗' : 'Refusé ?'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleRelancer(devis)}
                            className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-700/40 rounded-lg text-orange-400 text-sm flex items-center gap-2 transition"
                            title="Relancer le client maintenant"
                          >
                            <Send size={16} />
                            Relancer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'information automatique - S'affiche à la première visite */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/50">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">🔔 Informations importantes</h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 mb-6">
                {/* Section 1: Déplacement automatique à J+7 */}
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                  <p className="text-gray-200 text-base leading-relaxed">
                    Les devis envoyés et toujours sans réponse seront automatiquement déplacés dans <span className="text-orange-400 font-semibold">"Devis à relancer"</span> après <span className="text-blue-400 font-semibold">7 jours</span>.
                  </p>
                  <p className="text-gray-200 text-base leading-relaxed mt-2">
                    L'artisan recevra une <span className="text-green-400 font-semibold">notification</span> lorsque ce déplacement sera effectué.
                  </p>
                </div>

                {/* Section 2: Classement automatique en refusés */}
                <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4">
                  <p className="text-gray-200 text-base leading-relaxed">
                    Si après la relance automatique le client ne répond toujours pas, le devis sera automatiquement classé dans <span className="text-red-400 font-semibold">"Devis refusés"</span>.
                  </p>
                  <p className="text-gray-200 text-base leading-relaxed mt-2">
                    Une <span className="text-purple-400 font-semibold">analyse IA</span> et des <span className="text-purple-400 font-semibold">suggestions d'amélioration</span> seront consultables dans <span className="text-gray-300 italic">Historique des devis → Devis refusés</span>.
                  </p>
                </div>

                {/* Section 3: Relance manuelle */}
                <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4">
                  <p className="text-gray-200 text-base leading-relaxed">
                    Vous pouvez également relancer un client manuellement à tout moment en cliquant sur <span className="text-orange-400 font-semibold">"Relancer"</span>.
                  </p>
                  <p className="text-gray-200 text-base leading-relaxed mt-2">
                    Un <span className="text-blue-400 font-semibold">email de relance généré par l'IA</span> s'ouvrira alors (avec devis + facture d'acompte en pièce jointe et un texte pré-rempli modifiable).
                  </p>
                </div>

                {/* Section 4: Marquage manuel comme refusé */}
                <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                  <p className="text-gray-200 text-base leading-relaxed">
                    Vous pouvez aussi marquer un devis comme <span className="text-red-400 font-semibold">refusé manuellement</span> si le client vous en informe (téléphone, email…).
                  </p>
                  <p className="text-gray-200 text-base leading-relaxed mt-2">
                    Dans ce cas, le devis est immédiatement déplacé dans <span className="text-red-400 font-semibold">"Devis refusés"</span> avec une <span className="text-purple-400 font-semibold">analyse IA associée</span>.
                  </p>
                </div>
              </div>

              {/* Bouton */}
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
        title="Bienvenue dans votre espace 'Devis envoyés & en attente'"
      >
        <p className="text-lg mb-4">Vous pouvez :</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Voir le devis PDF</li>
          <li>Télécharger le devis PDF</li>
          <li>Voir et télécharger la facture d'acompte</li>
          <li>Cocher un paiement reçu</li>
          <li>Relancer un client (optionnel)</li>
        </ul>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">Important :</p>
          <p className="mb-2">Vous n'êtes pas obligé de relancer le client manuellement.</p>
          <p className="mb-2">Si aucune réponse n'est reçue au 7ᵉ jour après le premier envoi, le devis est automatiquement déplacé dans "Devis à relancer".</p>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-4">
          <p className="font-semibold text-orange-300 mb-2">Si vous marquez un paiement comme reçu :</p>
          <p className="mb-1">→ le devis passe dans "Devis acceptés"</p>
          <p>→ la facture d'acompte est archivée dans<br />
          <span className="ml-4 text-sm">Factures → Historique des factures → Factures d'acompte</span></p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
