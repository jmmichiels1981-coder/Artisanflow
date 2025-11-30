import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function AIQuoteTutorial({ open, onClose }) {
  const handleClose = () => {
    localStorage.setItem('af_tutorial_ai_quote_seen', 'true');
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
            <div className="w-12 h-12 bg-pink-600/20 rounded-full flex items-center justify-center">
              <Sparkles className="text-pink-400" size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Créer un devis — Assisté par IA
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-gray-300">
          <p className="text-base leading-relaxed">
            Ce mode génère un devis complet à partir de votre description vocale :
          </p>

          <ul className="space-y-3 pl-5">
            <li className="flex items-start gap-2">
              <span className="text-pink-400 mt-1">•</span>
              <span>Cliquez sur <strong>Démarrer la dictée vocale</strong> et décrivez le projet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 mt-1">•</span>
              <div>
                <span>Cliquez sur <strong>Générer le devis complet</strong></span>
                <div className="text-sm text-gray-400 mt-1 space-y-1">
                  <div>→ L'IA génère automatiquement :</div>
                  <div className="pl-4 space-y-1">
                    <div>• la structure du devis</div>
                    <div>• les matériaux</div>
                    <div>• les quantités</div>
                    <div>• les prix</div>
                    <div>• un texte professionnel</div>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div className="bg-pink-900/20 border border-pink-700/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              Pour les matériaux, l'application utilise le <strong className="text-pink-400">prix d'achat</strong> que vous indiquez.
              La marge que vous avez configurée est automatiquement ajoutée pour calculer le prix final dans le devis.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Vos informations d'entreprise, votre logo et vos informations bancaires seront inclus dans le devis.
          </p>

          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              L'acompte est calculé automatiquement selon le pourcentage paramétré, et basé sur le montant total du devis.
              Le client recevra un email comprenant :
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
            Vous pouvez ensuite <strong className="text-pink-400">modifier toutes les lignes du devis</strong> si nécessaire.
          </p>

          <p className="text-base">
            Ensuite :
          </p>

          <ul className="space-y-2 pl-5">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Valider et envoyer (email direct + ajout automatique dans Devis envoyés & en attente)</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-700">
          <Button
            onClick={handleClose}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2"
          >
            ✔ Compris — masquer le tutoriel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
