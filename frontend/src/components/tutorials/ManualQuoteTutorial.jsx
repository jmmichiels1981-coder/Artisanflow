import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function ManualQuoteTutorial({ open, onClose }) {
  // Vérifier si les tutoriels sont désactivés globalement
  if (window.__disableTutorials) {
    return null;
  }

  const handleClose = () => {
    localStorage.setItem('af_tutorial_manuel_quote_seen', 'true');
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
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              <FileText className="text-purple-400" size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Créer un devis — Mode manuel
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-gray-300">
          <p className="text-base leading-relaxed">
            Ce mode vous permet de créer votre devis manuellement :
          </p>

          <ul className="space-y-3 pl-5">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Choisir un client ou en ajouter un nouveau</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Ajouter des lignes de travaux</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Ajouter des matériaux</span>
            </li>
          </ul>

          <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              Lorsque vous ajoutez des matériaux, indiquez simplement le <strong className="text-purple-400">prix d'achat (prix fournisseur)</strong>.
              L'application appliquera automatiquement la marge sur les matériaux que vous avez configurée lors de votre première connexion, 
              et calculera le prix final affiché dans le devis.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Vos informations d'entreprise (et logo), ainsi que vos informations bancaires, seront intégrées au devis.
          </p>

          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              L'acompte est calculé automatiquement selon le pourcentage paramétré au début (basé sur le montant total du devis).
              Lors de l'envoi, l'email contiendra deux pièces jointes :
            </p>
            <ul className="mt-2 space-y-1 pl-5">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-blue-400">•</span>
                <span>le devis</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-blue-400">•</span>
                <span>la facture d'acompte correspondante.</span>
              </li>
            </ul>
          </div>

          <p className="text-base">
            Vous pourrez ensuite :
          </p>

          <ul className="space-y-2 pl-5">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Prévisualiser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Envoyer au client (email direct + déplacement automatique dans Devis envoyés & en attente)</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-700">
          <Button
            onClick={handleClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          >
            ✔ Compris — masquer le tutoriel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
