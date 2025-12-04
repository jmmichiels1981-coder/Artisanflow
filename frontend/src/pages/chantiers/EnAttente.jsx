import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import EnAttenteTutorial from '@/components/tutorials/EnAttenteTutorial';

export default function ChantiersEnAttente() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_en_attente_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_en_attente_tutorial_seen', 'true');
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
            ⏳ Chantiers en attente de validation
          </h1>
          <p className="text-gray-400">
            Chantiers dont les dates ont été proposées et attendent confirmation du client
          </p>
        </div>

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera les chantiers en attente de validation client après proposition de dates.
          </p>
        </div>

        {/* Liste vide */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <Clock className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Aucun chantier en attente
            </p>
            <p className="text-gray-500 text-sm">
              Les chantiers avec dates proposées apparaîtront ici
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
