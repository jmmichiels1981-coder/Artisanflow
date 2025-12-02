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
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            👋 {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4 text-gray-300">
          {children}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-base"
          >
            OK, j'ai compris — ne plus afficher ce message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
