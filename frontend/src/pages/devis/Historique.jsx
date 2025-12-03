import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';

export default function Historique() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_historique_devis_seen')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_historique_devis_seen', 'true');
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
