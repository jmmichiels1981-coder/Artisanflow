import React from 'react';
import { X, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EnCoursTutorial({ open, onClose }) {
  // Protection contre l'affichage vide ou invalide
  if (!open || typeof open !== 'boolean') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-orange-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-400 flex items-center gap-3">
            <Wrench className="text-orange-400" size={32} />
            Chantiers en cours
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            Ces chantiers sont actuellement <strong className="text-orange-300">en réalisation</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Le dernier jour prévu, à <strong className="text-white">20h00</strong>, vous recevrez une notification :
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <p className="text-gray-300 italic">
              « Le chantier de <strong>[Nom du client]</strong> est-il terminé ? <strong className="text-green-400">Oui</strong> / <strong className="text-red-400">Non</strong> »
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3">
              <p className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-1" />
                <span><strong className="text-green-300">Si oui</strong> → vous pourrez générer la facture finale depuis le devis accepté</span>
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
              <p className="flex items-start gap-2 text-sm text-gray-300">
                <XCircle size={18} className="text-red-400 flex-shrink-0 mt-1" />
                <span><strong className="text-red-300">Si non</strong> → vous choisirez une nouvelle date de fin et un email IA sera envoyé au client</span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
