import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DevisTutorialModal from '@/components/DevisTutorialModal';

export default function Acceptes() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_devis_acceptes_hidden')) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorial_devis_acceptes_hidden', 'true');
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
        <h1 className="text-3xl font-bold text-white mb-2">Devis acceptés</h1>
        <p className="text-gray-400 mb-8">Vos conversions réussies</p>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-green-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Page en construction</h2>
          <p className="text-gray-400 mb-6">
            Cette section affichera tous les devis acceptés par vos clients, prêts à être transformés en factures ou chantiers.
          </p>
          <div className="inline-block bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-2 text-green-400 text-sm">
            🚧 Fonctionnalité disponible prochainement (Phase 2)
          </div>
        </div>
      </div>

      {/* Tutoriel */}
      <DevisTutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        title="Bienvenue dans votre espace 'Devis acceptés'"
      >
        <p className="text-lg mb-4">Vous pouvez :</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Voir et télécharger le devis PDF</li>
          <li>Voir l'acompte payé</li>
          <li>Voir la date d'acceptation</li>
          <li>Ouvrir le chantier</li>
          <li>Générer la facture finale</li>
        </ul>

        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-300 mb-2">Important :</p>
          <p className="mb-2">L'ouverture du chantier vous permet de :</p>
          <p className="mb-1 ml-4">→ sélectionner les dates dans l'agenda</p>
          <p className="mb-1 ml-4">→ envoyer automatiquement une confirmation au client</p>
          <p className="ml-4">→ créer une entrée dans "Chantiers"</p>
        </div>

        <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
          <p className="font-semibold text-green-300 mb-2">Lorsque vous générez la facture finale :</p>
          <p className="mb-1">→ l'acompte est déduit automatiquement</p>
          <p className="mb-1">→ le montant restant dû est calculé</p>
          <p className="mb-1">→ vous pouvez envoyer la facture finalisée au client</p>
          <p>→ le devis est ensuite archivé dans l'historique</p>
        </div>
      </DevisTutorialModal>
    </DashboardLayout>
  );
}
