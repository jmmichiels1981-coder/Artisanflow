import React from 'react';
import { Wrench } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function ChantiersEnCours() {
  return (
    <DashboardLayout>
      <div className="p-8">
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
    </DashboardLayout>
  );
}
