import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
      <DialogContent className="bg-gray-900 text-white border-orange-600/50 max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 border-b border-gray-800 bg-gradient-to-r from-orange-600/20 to-orange-500/10">
          <DialogTitle className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            👋 {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300">
          {children}
        </div>

        <div className="flex-shrink-0 p-6 border-t border-gray-800 bg-gray-900">
          <Button
            onClick={onClose}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-base font-semibold"
          >
            OK, j'ai compris — ne plus afficher ce message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
