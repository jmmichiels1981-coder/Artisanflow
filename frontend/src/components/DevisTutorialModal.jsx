import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

/**
 * Composant réutilisable pour les tutoriels du module Devis
 * 
 * @param {boolean} isOpen - État d'ouverture de la modale
 * @param {function} onClose - Fonction appelée lors de la fermeture
 * @param {string} title - Titre de la modale
 * @param {React.ReactNode} children - Contenu du tutoriel (HTML/JSX)
 */
export default function DevisTutorialModal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
              <Lightbulb className="text-orange-500" size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold text-orange-500">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 text-gray-300 leading-relaxed">
          {children}
        </div>

        <div className="flex justify-center mt-6 flex-shrink-0 pt-4 border-t border-gray-800">
          <Button
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-base font-semibold"
          >
            ✓ OK j'ai compris, ne plus afficher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
