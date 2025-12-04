import React from 'react';
import { X, CheckCircle, FileText, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function HistoriqueTutorial({ open, onClose }) {
  // Protection contre l'affichage vide ou invalide
  if (!open || typeof open !== 'boolean') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-400 flex items-center gap-3">
            <CheckCircle className="text-gray-400" size={32} />
            Historique des chantiers terminés
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            Vous retrouvez ici tous vos <strong className="text-white">chantiers finalisés</strong>.
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <p className="text-gray-300 font-semibold">Vous pouvez :</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>consulter les informations du chantier</li>
              <li>
                voir la <strong className="text-white">date de génération de la facture finale</strong>
              </li>
              <li className="flex items-center gap-2">
                <Eye size={16} className="text-blue-400" />
                <Download size={16} className="text-green-400" />
                <span>visualiser ou télécharger la <strong className="text-white">facture PDF</strong> associée</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              J'ai compris
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
