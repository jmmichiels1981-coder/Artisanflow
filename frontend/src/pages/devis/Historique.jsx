import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';

export default function Historique() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_historique_devis_hidden')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_historique_devis_hidden', 'true');
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
        <h1 className="text-3xl font-bold text-white mb-2">Historique des devis</h1>
        <p className="text-gray-400 mb-8">Archive complète de tous vos devis</p>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-gray-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Page en construction</h2>
          <p className="text-gray-400 mb-6">
            Cette section affichera l'historique complet de tous vos devis (acceptés, refusés, expirés) avec filtres et recherche avancée.
          </p>
          <div className="inline-block bg-gray-700/40 border border-gray-600/40 rounded-lg px-4 py-2 text-gray-400 text-sm">
            🚧 Fonctionnalité disponible prochainement (Phase 2)
          </div>
        </div>
      </div>

      {/* Tutoriel */}
      <DevisTutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        title="Bienvenue dans votre Historique des devis"
      >
        <p className="text-lg mb-4">Ici, vous pouvez consulter tous vos devis passés — acceptés ou refusés — ainsi que filtrer vos recherches par période.</p>
        
        <p className="text-lg mb-4">Vous pouvez :</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Voir et télécharger chaque devis</li>
          <li>Voir les factures d'acompte (si le devis était sans réponse ou refusé)</li>
          <li>Utiliser les filtres (acceptés, refusés, par dates)</li>
          <li>Lire l'analyse IA pour les devis refusés (raison probable + suggestion)</li>
        </ul>

        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/40 rounded-lg p-4">
          <p className="font-semibold text-blue-300 mb-2">💡 Astuce :</p>
          <p>Cet espace vous permet d'analyser votre activité et d'améliorer vos devis futurs.</p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
