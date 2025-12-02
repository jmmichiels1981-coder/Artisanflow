import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';

export default function ARelancer() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_devis_relancer_hidden')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_relancer_hidden', 'true');
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
        <h1 className="text-3xl font-bold text-white mb-2">Devis à relancer</h1>
        <p className="text-gray-400 mb-8">Clients à recontacter pour augmenter vos conversions</p>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-orange-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Page en construction</h2>
          <p className="text-gray-400 mb-6">
            Cette section affichera les devis envoyés depuis plus de X jours sans réponse, avec des suggestions de relance automatique.
          </p>
          <div className="inline-block bg-orange-900/20 border border-orange-700/40 rounded-lg px-4 py-2 text-orange-400 text-sm">
            🚧 Fonctionnalité disponible prochainement (Phase 2)
          </div>
        </div>
      </div>

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
          <li>Préparer un email de relance</li>
          <li>Cocher "Paiement reçu"</li>
        </ul>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">Important :</p>
          <p className="mb-2">Une notification vous avertira lorsqu'un email de relance IA est prêt à être envoyé.</p>
          <p className="mb-2">L'email contiendra le devis + la facture d'acompte.</p>
          <p>Vous pouvez modifier le contenu ou simplement valider et envoyer.</p>
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
