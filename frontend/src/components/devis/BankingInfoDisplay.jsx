import React from 'react';
import { Building2 } from 'lucide-react';

export default function BankingInfoDisplay() {
  // Récupération des infos bancaires depuis localStorage (Phase 1 - UI uniquement)
  const config = JSON.parse(localStorage.getItem('af_config_artisan') || '{}');
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="text-green-400" size={20} />
        <h3 className="text-sm font-semibold text-white">🏦 Informations bancaires</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">Titulaire :</span>
          <span className="text-white ml-2 font-mono">{config.accountHolder || 'Non renseigné'}</span>
        </div>
        <div>
          <span className="text-gray-400">IBAN :</span>
          <span className="text-white ml-2 font-mono">{config.iban || 'Non renseigné'}</span>
        </div>
        {config.bic && (
          <div>
            <span className="text-gray-400">BIC :</span>
            <span className="text-white ml-2 font-mono">{config.bic}</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        Ces informations seront affichées sur le devis et la facture d'acompte
      </p>
    </div>
  );
}
