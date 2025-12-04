import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import PlanifiesToutorial from '@/components/tutorials/PlanifiesToutorial';

export default function ChantiersPlanifies() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_planifies_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_planifies_tutorial_seen', 'true');
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📅 Chantiers planifiés
            </h1>
            <p className="text-gray-400">
              Chantiers dont les dates ont été validées et qui sont prêts à démarrer
            </p>
          </div>
          
          <Link to="/chantiers/creer-plage">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={20} className="mr-2" />
              Créer une plage de dates
            </Button>
          </Link>
        </div>

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera les chantiers validés avec leurs dates confirmées.
          </p>
        </div>

        {/* Liste vide */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Aucun chantier planifié
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Créez une plage de dates pour un devis accepté
            </p>
            <Link to="/chantiers/creer-plage">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus size={20} className="mr-2" />
                Créer une plage de dates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
