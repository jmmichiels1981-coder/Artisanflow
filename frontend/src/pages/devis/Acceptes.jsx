import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';
import { ArrowLeft, Eye, Download, Calendar, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';

// Données mock pour Phase 1 - Devis acceptés
const MOCK_DEVIS_ACCEPTES = [
  {
    id: 1,
    client: 'Pierre Dubois',
    montantTTC: 3250.00,
    acompte: 975.00, // 30%
    dateAcceptation: '2024-11-28',
    devisNum: 'DEV-2024-004',
    acomptePayé: true
  },
  {
    id: 2,
    client: 'Sophie Bernard',
    montantTTC: 4560.75,
    acompte: 1368.23, // 30%
    dateAcceptation: '2024-11-25',
    devisNum: 'DEV-2024-007',
    acomptePayé: true
  },
  {
    id: 3,
    client: 'Entreprise Martin SARL',
    montantTTC: 6890.00,
    acompte: 2067.00, // 30%
    dateAcceptation: '2024-11-22',
    devisNum: 'DEV-2024-008',
    acomptePayé: false // Acompte pas encore payé
  }
];

export default function Acceptes() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  // Trier par date d'acceptation décroissante (du plus récent au plus ancien)
  const [devisList] = useState(
    [...MOCK_DEVIS_ACCEPTES].sort((a, b) => 
      new Date(b.dateAcceptation) - new Date(a.dateAcceptation)
    )
  );

  useEffect(() => {
    if (!localStorage.getItem('tutorial_devis_acceptes_seen')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_acceptes_seen', 'true');
    setShowTutorial(false);
  };

  const handleViewPDF = (devis) => {
    toast.info(`📄 Devis ${devis.devisNum}`, {
      description: `Visualisation du devis pour ${devis.client} (${devis.montantTTC.toFixed(2)}€ TTC)`,
      duration: 3000
    });
  };

  const handleDownloadPDF = (devis) => {
    toast.success(`⬇️ Téléchargement Devis`, {
      description: `Devis ${devis.devisNum} - ${devis.client}`,
      duration: 2000
    });
  };

  const handleOuvrirChantier = (devis) => {
    // Phase 1: Toast uniquement
    toast.info('📅 Ouverture chantier disponible en Phase 2', {
      description: `En Phase 2, l'agenda s'ouvrira pour planifier les dates du chantier pour ${devis.client}. Un chantier sera automatiquement créé dans "Chantiers planifiés".`,
      duration: 4000
    });
  };

  const handleGenererFactureFinale = (devis) => {
    // Phase 1: Toast uniquement
    if (!devis.acomptePayé) {
      toast.warning('⚠️ Acompte non payé', {
        description: 'La facture finale ne peut être générée que si l\'acompte a été marqué comme payé.',
        duration: 3000
      });
      return;
    }

    toast.info('🧾 Génération facture finale disponible en Phase 2', {
      description: `En Phase 2, une fenêtre s'ouvrira avec la facture finale préremplie (montant total: ${devis.montantTTC.toFixed(2)}€ - acompte: ${devis.acompte.toFixed(2)}€ = restant dû: ${(devis.montantTTC - devis.acompte).toFixed(2)}€). L'IA générera un email professionnel.`,
      duration: 5000
    });
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
          <h1 className="text-3xl font-bold text-white mb-2">Devis acceptés</h1>
          <p className="text-gray-400">Vos conversions réussies - Prêts pour le chantier</p>
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-2 text-green-400 text-sm">
              <CheckCircle size={16} />
              <span>{devisList.length} devis acceptés</span>
            </div>
          </div>
        </div>

        {/* Tableau des devis acceptés */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Montant TTC</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Acompte TTC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date d'acceptation</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Devis PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {devisList.map((devis) => (
                  <tr key={devis.id} className="hover:bg-gray-800/30 transition">
                    {/* Client */}
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{devis.client}</span>
                    </td>

                    {/* Actions - Ouvrir chantier + Générer facture */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Ouvrir chantier */}
                        <button
                          onClick={() => handleOuvrirChantier(devis)}
                          className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-700/40 rounded-lg text-purple-400 text-sm flex items-center justify-center gap-2 transition"
                          title="Ouvrir le chantier - Planifier les dates"
                        >
                          <Calendar size={16} />
                          Ouvrir chantier
                        </button>

                        {/* Générer facture finale */}
                        <button
                          onClick={() => handleGenererFactureFinale(devis)}
                          className={`px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition ${
                            devis.acomptePayé
                              ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-700/40 text-green-400'
                              : 'bg-gray-600/20 border border-gray-700/40 text-gray-500 cursor-not-allowed'
                          }`}
                          title={
                            devis.acomptePayé
                              ? 'Générer la facture finale'
                              : 'Désactivé - Acompte non payé'
                          }
                        >
                          <FileText size={16} />
                          Générer facture finale
                        </button>
                      </div>
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
                        <span className="text-green-400 font-semibold text-base">{devis.acompte.toFixed(2)}€</span>
                        <span className={`text-xs ${devis.acomptePayé ? 'text-green-500' : 'text-orange-400'}`}>
                          {devis.acomptePayé ? '✓ Payé' : '⏳ En attente'}
                        </span>
                      </div>
                    </td>

                    {/* Date d'acceptation */}
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">
                        {new Date(devis.dateAcceptation).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Devis PDF */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewPDF(devis)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded-lg text-blue-400 transition"
                          title="Voir le devis PDF"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(devis)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 rounded-lg text-blue-400 transition"
                          title="Télécharger le devis PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mentions informatives */}
          <div className="border-t border-gray-700/40 bg-gray-800/30 px-6 py-4 space-y-3">
            {/* Mention facture d'acompte */}
            <div className="flex items-start gap-3">
              <FileText size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 text-sm">
                <span className="text-blue-400 font-semibold">Facture d'acompte:</span> Pour consulter la facture d'acompte → <span className="text-gray-300 italic">Historique des factures → Factures d'acompte</span>
              </p>
            </div>

            {/* Mention Phase 2 */}
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 text-sm">
                <span className="text-purple-400 font-semibold">Ouverture chantier:</span> Disponible en Phase 2 (agenda + création automatique dans "Chantiers planifiés")
              </p>
            </div>
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
        title="📘 Bienvenue dans la section « Devis acceptés »"
      >
        <p className="text-base mb-4">👋 Cette page regroupe tous les devis validés par vos clients.</p>
        <p className="text-base mb-3 font-semibold">Voici ce que vous pouvez faire :</p>

        {/* 1. Consulter devis accepté */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">📄 1. Consulter votre devis accepté</p>
          <p className="mb-1">→ Ouvrir le devis PDF</p>
          <p className="mb-1">→ Télécharger le devis</p>
          <p className="text-sm text-gray-400 mt-2 italic">
            💡 Pour retrouver la facture d'acompte :<br />
            <span className="ml-4">Historique des factures → Factures d'acompte</span>
          </p>
        </div>

        {/* 2. Ouvrir chantier */}
        <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-purple-300 mb-2">🛠 2. Ouvrir un chantier</p>
          <p className="mb-2">Le bouton "Ouvrir chantier" permet de :</p>
          <p className="mb-1">→ accéder à l'agenda</p>
          <p className="mb-1">→ planifier les dates de chantier</p>
          <p>→ créer automatiquement un chantier lié au devis accepté</p>
        </div>

        {/* 3. Générer facture finale */}
        <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-green-300 mb-2">🧾 3. Générer la facture finale</p>
          <p className="mb-2">Une fois le chantier terminé, le bouton "Générer facture finale" permet de :</p>
          <p className="mb-1">→ préremplir automatiquement la facture finale</p>
          <p className="mb-1">→ déduire l'acompte déjà payé</p>
          <p className="mb-1">→ générer un email professionnel via IA, modifiable avant envoi</p>
          <p className="text-orange-400 text-sm mt-2 font-semibold">
            ⚠ Ce bouton doit rester désactivé tant que l'acompte n'a pas été marqué comme payé.
          </p>
        </div>

        {/* 4. Archivage automatique */}
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-lg p-4">
          <p className="font-semibold text-gray-300 mb-2">📚 4. Archivage automatique</p>
          <p className="mb-1">Après envoi de la facture finale :</p>
          <p className="mb-1">→ Le devis passe dans <span className="text-blue-300">Historique des devis → Devis acceptés</span></p>
          <p>→ La facture finale est classée dans <span className="text-green-300">Factures envoyées</span></p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
