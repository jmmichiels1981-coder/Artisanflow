import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';

export default function EnvoyesEtEnAttente() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Vérifier si le tutoriel a déjà été vu
    if (!localStorage.getItem('tutorial_devis_envoyes_hidden')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_envoyes_hidden', 'true');
    setShowTutorial(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          Retour
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Devis envoyés & en attente</h1>
        <p className="text-gray-400 mb-8">Suivez les devis en attente de réponse client</p>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-blue-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"></path>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Page en construction</h2>
          <p className="text-gray-400 mb-6">
            Cette section affichera tous les devis que vous avez envoyés et qui sont en attente d'une réponse du client.
          </p>
          <div className="inline-block bg-blue-900/20 border border-blue-700/40 rounded-lg px-4 py-2 text-blue-400 text-sm">
            🚧 Fonctionnalité disponible prochainement (Phase 2)
          </div>
        </div>
      </div>

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
