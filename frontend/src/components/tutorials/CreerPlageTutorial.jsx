import React from 'react';
import { X, CalendarPlus, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CreerPlageTutorial({ open, onClose }) {
  // Protection contre l'affichage vide ou invalide
  console.log('🔍 CreerPlageTutorial render - open:', open, 'type:', typeof open);
  
  if (!open || typeof open !== 'boolean') {
    console.log('⚠️ CreerPlageTutorial - Conditions non remplies pour affichage, return null');
    return null;
  }

  console.log('✅ CreerPlageTutorial - Rendu du Dialog avec open=true');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-blue-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-400 flex items-center gap-3">
            <CalendarPlus className="text-blue-400" size={32} />
            Créer une plage de dates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            Sélectionnez une <strong className="text-white">date de début</strong> et une <strong className="text-white">date de fin</strong> pour planifier un chantier.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Un <strong className="text-blue-300">email IA</strong> est envoyé à votre client pour <strong className="text-green-300">accepter</strong> ou <strong className="text-yellow-300">proposer d'autres dates</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Les dates sont ajoutées dans votre agenda comme <strong className="text-yellow-300">provisoires</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Vous recevrez une <strong className="text-white">notification</strong> dès que le client répond.
          </p>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
