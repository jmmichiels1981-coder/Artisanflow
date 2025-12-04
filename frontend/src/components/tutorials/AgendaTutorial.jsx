import React from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AgendaTutorial({ open, onClose }) {
  // Vérifier si les tutoriels sont désactivés globalement
  if (window.__disableTutorials) {
    return null;
  }

  // Protection contre l'affichage vide ou invalide
  if (!open || typeof open !== 'boolean') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-purple-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-400 flex items-center gap-3">
            <Calendar className="text-purple-400" size={32} />
            Agenda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            C'est votre <strong className="text-white">calendrier de travail</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Vous pouvez afficher vos chantiers en vue <strong className="text-purple-300">Jour, Semaine ou Mois</strong>.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Les <strong className="text-green-300">chantiers confirmés</strong> et les <strong className="text-yellow-300">dates provisoires en attente de validation</strong> apparaissent directement dans l'agenda.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Il vous permet d'éviter les conflits et d'avoir une <strong className="text-white">vision claire de votre planning</strong>.
          </p>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
