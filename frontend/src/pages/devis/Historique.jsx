import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

export default function Historique() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/quotes')}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          ← Retour aux devis
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
    </DashboardLayout>
  );
}
