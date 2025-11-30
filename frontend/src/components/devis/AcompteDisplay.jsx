import React from 'react';
import { Receipt } from 'lucide-react';

export default function AcompteDisplay({ totalHT = 0 }) {
  // Récupération du pourcentage d'acompte depuis localStorage (Phase 1 - Mock)
  const config = JSON.parse(localStorage.getItem('af_config_artisan') || '{}');
  const acomptePercentage = 30; // Mock - à terme, sera configurable dans les paramètres
  const acompteMontant = (totalHT * acomptePercentage) / 100;
  
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/40 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="text-blue-400" size={20} />
          <span className="text-sm font-medium text-gray-300">Acompte automatique</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-400">{acomptePercentage}%</div>
          <div className="text-sm text-gray-400">
            {acompteMontant.toFixed(2)} € HT
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        L'acompte sera calculé automatiquement et inclus dans la facture d'acompte envoyée au client
      </p>
    </div>
  );
}
