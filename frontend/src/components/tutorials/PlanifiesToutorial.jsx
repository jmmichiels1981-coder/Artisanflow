import React from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PlanifiesToutorial({ open, onClose }) {
  // Protection contre l'affichage vide ou invalide
  if (!open || typeof open !== 'boolean') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-green-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 flex items-center gap-3">
            <Calendar className="text-green-400" size={32} />
            Chantiers planifiés
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            Vous trouvez ici tous les chantiers dont les <strong className="text-green-300">dates sont confirmées</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Vous pouvez consulter les <strong className="text-white">dates de début et de fin</strong>, et suivre vos travaux à venir.
          </p>
          
          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3">
            <p className="text-green-300 text-sm">
              💡 Le jour de début, le chantier passera automatiquement en <strong>Chantiers en cours</strong>.
            </p>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
