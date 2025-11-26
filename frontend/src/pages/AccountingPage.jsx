import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AccountingPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Comptabilité</h1>
          <p className="text-gray-400">CA, dépenses et TVA automatisés</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Comptabilité automatisée</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Le module de comptabilité sera bientôt disponible avec suivi CA, dépenses, TVA et graphiques.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}