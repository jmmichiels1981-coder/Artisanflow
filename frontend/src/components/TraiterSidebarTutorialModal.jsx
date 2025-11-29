import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, FileText, Bell, CheckCircle } from 'lucide-react';

export default function TraiterSidebarTutorialModal({ open, onComplete }) {
  
  const handleContinue = () => {
    localStorage.setItem('af_traiter_tutorial_seen', 'true');
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="bg-gray-900 text-white border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            📋 Colonne « À TRAITER » — Votre tableau de bord prioritaire
          </DialogTitle>
          <p className="text-gray-400 text-center text-sm">
            Cette colonne vous suit partout dans l'application pour ne rien oublier
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Illustration visuelle */}
          <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-2 border-orange-700/40 rounded-xl p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center">
                <AlertCircle className="text-orange-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-orange-300">
                Toujours visible à gauche de chaque page
              </h3>
            </div>
            <p className="text-gray-300 text-center">
              La colonne « À TRAITER » est <strong>votre assistant personnel</strong>.
              <br />
              Elle vous rappelle en temps réel les actions importantes à effectuer.
            </p>
          </div>

          {/* Exemples concrets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white text-center">
              📌 Que contient cette colonne ?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exemple 1 */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Devis à relancer</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Un client n'a pas répondu depuis 7 jours ? Vous êtes alerté automatiquement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exemple 2 */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Factures impayées</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Une facture arrive à échéance ? Relancez votre client en un clic.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exemple 3 */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Chantiers imminents</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Un chantier commence demain ? Préparez-vous en avance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exemple 4 */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="text-yellow-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Événements importants</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Paiement reçu, devis accepté... Restez informé en direct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bénéfice principal */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/40 rounded-lg p-5">
            <p className="text-green-300 font-semibold text-center text-lg">
              🎯 Résultat : zéro oubli, zéro retard, une gestion sereine !
            </p>
          </div>

          {/* Message de fin */}
          <div className="bg-gray-800/30 border border-gray-600/40 rounded-lg p-4">
            <p className="text-gray-300 text-sm text-center">
              Vous verrez cette colonne dès maintenant sur <strong>toutes les pages</strong> de l'application.
              <br />
              <span className="text-orange-400 font-medium">
                Elle s'adapte en fonction de votre activité et vous guide au quotidien.
              </span>
            </p>
          </div>
        </div>

        {/* Bouton de confirmation */}
        <div className="flex justify-center pt-6 pb-2">
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-12 py-4 text-lg font-semibold"
          >
            Parfait, j'ai compris ! Allons-y 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
