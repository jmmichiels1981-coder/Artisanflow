import React, { useState, useEffect } from 'react';
import { CalendarPlus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import CreerPlageTutorial from '@/components/tutorials/CreerPlageTutorial';

export default function CreerPlage() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_creer_plage_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_creer_plage_tutorial_seen', 'true');
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
            📅 Créer une plage de dates
          </h1>
          <p className="text-gray-400">
            Sélectionnez un devis accepté et définissez les dates de chantier
          </p>
        </div>

        {/* Placeholder Formulaire */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
          <div className="max-w-2xl">
            <div className="space-y-6">
              {/* Sélection devis */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Devis accepté *
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>Sélectionner un devis accepté...</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seuls les devis acceptés apparaissent dans cette liste
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de fin estimée *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Placeholder pour futur développement */}
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mt-8">
                <p className="text-blue-300 text-sm">
                  ℹ️ <strong>Phase 2 :</strong> La logique de création et validation des plages de dates sera implémentée ultérieurement.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  disabled
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CalendarPlus size={20} className="mr-2" />
                  Proposer les dates
                </Button>
                <Link to="/chantiers/planifies">
                  <Button variant="outline" className="bg-gray-800 text-white border-gray-700">
                    Annuler
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <CreerPlageTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
