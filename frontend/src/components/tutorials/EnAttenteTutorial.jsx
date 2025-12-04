import React from 'react';
import { X, Clock, CheckCircle, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EnAttenteTutorial({ open, onClose }) {
  // Protection contre l'affichage vide ou invalide
  if (!open || typeof open !== 'boolean') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-yellow-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
            <Clock className="text-yellow-400" size={32} />
            En attente de validation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            Ici se trouvent tous les <strong className="text-white">chantiers dont les dates doivent être confirmées par vous</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Le client peut avoir <strong className="text-green-300">accepté vos dates</strong> ou <strong className="text-yellow-300">proposé d'autres dates</strong>.
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <p className="text-gray-300 font-semibold">Vous pouvez :</p>
            <div className="space-y-2 ml-4">
              <p className="flex items-center gap-2 text-gray-300">
                <CheckCircle size={18} className="text-green-400" />
                <span>Confirmer les dates</span>
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <CheckCircle size={18} className="text-green-400" />
                <span>Accepter les dates proposées</span>
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Edit2 size={18} className="text-blue-400" />
                <span>Proposer d'autres dates</span>
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 leading-relaxed">
            Le chantier deviendra <strong className="text-green-300">« Planifié »</strong> uniquement après votre confirmation.
          </p>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
