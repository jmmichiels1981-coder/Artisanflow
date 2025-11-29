import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

export default function EnvoyesEtEnAttente() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Devis envoyés & en attente</h1>
        <p className="text-gray-400 mb-8">Suivez les devis en attente de réponse client</p>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/40 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-blue-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"></path>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Page en construction</h2>
          <p className="text-gray-400 mb-6">
            Cette section affichera tous les devis que vous avez envoyés et qui sont en attente d'une réponse du client.
          </p>
          <div className="inline-block bg-blue-900/20 border border-blue-700/40 rounded-lg px-4 py-2 text-blue-400 text-sm">
            🚧 Fonctionnalité disponible prochainement (Phase 2)
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
