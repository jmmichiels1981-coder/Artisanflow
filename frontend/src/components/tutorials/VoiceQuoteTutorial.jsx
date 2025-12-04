import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

export default function VoiceQuoteTutorial({ open, onClose }) {
  // Vérifier si les tutoriels sont désactivés globalement
  if (window.__disableTutorials) {
    return null;
  }

  const handleClose = () => {
    localStorage.setItem('af_tutorial_voice_quote_seen', 'true');
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={true} modal={true}>
      <DialogContent 
        className="bg-gray-900 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideClose
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Mic className="text-blue-400" size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Créer un devis — Dictée vocale (structuré par IA)
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-gray-300">
          <p className="text-base leading-relaxed">
            Ce mode vous permet de créer un devis en parlant :
          </p>

          <ul className="space-y-3 pl-5">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cliquez sur <strong>Démarrer la dictée vocale</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Dictez les travaux à réaliser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cliquez sur <strong>Structurer le devis</strong><br />
              <span className="text-sm text-gray-400">→ L'IA organise automatiquement les lignes du devis</span></span>
            </li>
          </ul>

          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              Pour les matériaux, vous n'avez qu'à renseigner le <strong className="text-blue-400">prix d'achat</strong>.
              La marge matériaux configurée sera appliquée automatiquement pour obtenir le prix final affiché dans le devis.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Vos informations d'entreprise, le logo et les informations bancaires seront inclus dans le devis.
          </p>

          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              L'acompte est généré automatiquement selon le pourcentage défini dans vos paramètres, calculé sur le montant total du devis.
              Lors de l'envoi, l'email envoyé au client contiendra en pièces jointes :
            </p>
            <ul className="mt-2 space-y-1 pl-5">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-400">•</span>
                <span>le devis</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-400">•</span>
                <span>la facture d'acompte associée.</span>
              </li>
            </ul>
          </div>

          <p className="text-base">
            Utilisez le bouton <strong className="text-blue-400">Modifier</strong> pour ajuster les éléments.
          </p>

          <p className="text-base">
            Ensuite :
          </p>

          <ul className="space-y-2 pl-5">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Valider et envoyer (email direct + passage automatique dans Devis envoyés & en attente)</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-700">
          <Button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            ✔ Compris — masquer le tutoriel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
