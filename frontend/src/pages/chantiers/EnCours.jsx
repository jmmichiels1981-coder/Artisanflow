import React, { useState, useEffect, useRef } from 'react';
import { Wrench, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import EnCoursTutorial from '@/components/tutorials/EnCoursTutorial';

export default function ChantiersEnCours() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const hasCheckedTutorial = useRef(false);

  useEffect(() => {
    // Ne vérifier qu'une seule fois par session pour éviter les réaffichages
    if (hasCheckedTutorial.current) return;
    
    const tutorialSeen = localStorage.getItem('af_en_cours_tutorial_seen');
    
    // Afficher uniquement si jamais vu ET que c'est la première vérification
    if (!tutorialSeen) {
      // Délai pour s'assurer que le composant est complètement monté
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 300);
      
      hasCheckedTutorial.current = true;
      return () => clearTimeout(timer);
    }
    
    hasCheckedTutorial.current = true;
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_en_cours_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Bouton Retour */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔧 Chantiers en cours
          </h1>
          <p className="text-gray-400">
            Chantiers actuellement en cours de réalisation
          </p>
        </div>

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera les chantiers en cours avec suivi de l'avancement.
          </p>
        </div>

        {/* Liste vide */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <Wrench className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Aucun chantier en cours
            </p>
            <p className="text-gray-500 text-sm">
              Les chantiers démarrés apparaîtront ici
            </p>
          </div>
        </div>
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <EnCoursTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
