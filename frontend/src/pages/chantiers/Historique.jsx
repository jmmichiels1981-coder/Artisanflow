import React from 'react';
import { CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function HistoriqueChantiers() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ✅ Historique des chantiers terminés
          </h1>
          <p className="text-gray-400">
            Tous les chantiers terminés et leurs détails
          </p>
        </div>

        {/* Info Phase 2 */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ <strong>Phase 2 :</strong> Cette page affichera l'historique complet des chantiers terminés.
          </p>
        </div>

        {/* Liste vide */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12">
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 text-gray-500" size={64} />
            <p className="text-gray-400 text-lg mb-2">
              Aucun chantier terminé
            </p>
            <p className="text-gray-500 text-sm">
              L'historique de vos chantiers terminés s'affichera ici
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
