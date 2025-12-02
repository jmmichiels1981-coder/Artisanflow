import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';

export default function Refuses() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_devis_refuses_hidden')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_refuses_hidden', 'true');
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
        <h1 className="text-3xl font-bold text-white mb-2">Devis refusés</h1>
        <p className="text-gray-400 mb-8">Opportunités manquées et analyse</p>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-red-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Page en construction</h2>
          <p className="text-gray-400 mb-6">
            Cette section affichera les devis refusés avec des statistiques pour vous aider à améliorer votre taux de conversion.
          </p>
          <div className="inline-block bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-2 text-red-400 text-sm">
            🚧 Fonctionnalité disponible prochainement (Phase 2)
          </div>
        </div>
      </div>

      {/* Tutoriel */}
      <DevisTutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        title="Bienvenue dans votre espace 'Devis refusés'"
      >
        <p className="text-lg mb-4">Vous pouvez :</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Voir et télécharger le devis PDF</li>
          <li>Voir et télécharger la facture d'acompte</li>
          <li>Lire une analyse IA indiquant la raison probable du refus et les suggestions d'amélioration</li>
          <li>Comprendre pourquoi certains devis n'ont pas été acceptés</li>
        </ul>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">Important :</p>
          <p className="mb-2">Les devis arrivent ici automatiquement si le client n'a pas répondu 7 jours après la relance.</p>
        </div>

        <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4">
          <p className="font-semibold text-purple-300 mb-2">Une analyse IA vous permet de comprendre :</p>
          <p className="mb-1">→ si le prix était trop élevé</p>
          <p className="mb-1">→ si le devis manquait de clarté</p>
          <p className="mb-1">→ si le délai de réponse a posé problème</p>
          <p>→ ou si le client a un comportement récurrent</p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
