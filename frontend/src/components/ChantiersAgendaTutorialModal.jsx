import React from 'react';
import { X, Calendar, Clock, CheckCircle, XCircle, RefreshCw, Wrench, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ChantiersAgendaTutorialModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gray-900 text-white border-purple-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-400 flex items-center gap-3">
            <Calendar className="text-purple-400" size={32} />
            Chantiers & Agenda – Comment ça fonctionne ?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Introduction */}
          <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4">
            <p className="text-gray-300 leading-relaxed">
              Bienvenue dans l'espace <strong className="text-white">Chantiers & Agenda</strong>.
              <br />
              C'est ici que vous planifiez vos travaux, organisez vos chantiers et gérez vos dates de réalisation.
            </p>
          </div>

          {/* Section 1 - Agenda */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🗓️ 1. Utiliser votre agenda
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    Votre agenda propose une vue <strong className="text-purple-300">Jour, Semaine ou Mois</strong>.
                  </p>
                  <p className="ml-4">Il affiche :</p>
                  <ul className="list-disc ml-8 space-y-1">
                    <li>vos chantiers planifiés et confirmés,</li>
                    <li>vos chantiers en attente de confirmation (dates proposées mais non encore validées).</li>
                  </ul>
                  <p className="text-sm bg-blue-900/20 border border-blue-700/40 rounded p-2 mt-2">
                    💡 Les dates "en attente" apparaissent différemment pour éviter toute proposition de dates conflictuelles à un autre client.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Choisir les dates */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Clock size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🏗️ 2. Choisir les dates après acceptation d'un devis
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    Lorsque vous marquez un devis comme accepté, vous pouvez définir une <strong className="text-blue-300">plage de dates</strong> pour les travaux.
                  </p>
                  <p>L'IA envoie alors un email à votre client avec :</p>
                  <div className="ml-4 space-y-1">
                    <p className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-300">Accepter les dates</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-400" />
                      <span className="text-red-300">Proposer d'autres dates</span>
                    </p>
                  </div>
                  <p className="text-sm bg-yellow-900/20 border border-yellow-700/40 rounded p-2 mt-2">
                    ⚠️ Dès cet envoi, le chantier apparaît dans <strong>Chantiers → En attente de validation</strong>,
                    et la plage de dates apparaît dans l'agenda en tant que <strong>proposition non confirmée</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 - Réponse du client */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0 mt-1">
                <RefreshCw size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🔁 3. Réponse du client
                </h3>
                <div className="space-y-3 text-gray-300">
                  {/* Client accepte */}
                  <div className="bg-green-900/20 border border-green-700/40 rounded p-3">
                    <p className="font-semibold text-green-300 mb-1">
                      ✅ Si le client accepte vos dates :
                    </p>
                    <p className="text-sm">
                      Vous recevez une notification et vous n'avez plus qu'à cliquer <strong>Confirmer les dates</strong> pour finaliser la planification.
                    </p>
                  </div>

                  {/* Client propose autres dates */}
                  <div className="bg-orange-900/20 border border-orange-700/40 rounded p-3">
                    <p className="font-semibold text-orange-300 mb-1">
                      🔄 Si le client propose d'autres dates :
                    </p>
                    <p className="text-sm mb-2">
                      Vous recevez une notification avec les dates proposées. Vous pouvez :
                    </p>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li>
                        <strong>Accepter ces dates</strong> → le chantier devient immédiatement planifié (email IA envoyé automatiquement),
                      </li>
                      <li>
                        ou <strong>proposer d'autres dates</strong> → l'IA vérifie votre disponibilité et génère un nouvel email.
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm italic">
                    💡 Les dates restent visibles dans l'agenda tant qu'elles ne sont pas confirmées.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 - Début du chantier */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Wrench size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🚧 4. Début du chantier
                </h3>
                <div className="text-gray-300">
                  <p>
                    Le jour du début prévu, le chantier passe automatiquement en <strong className="text-orange-300">Chantiers en cours</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 - Fin des travaux */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  📣 5. Fin des travaux
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    Le dernier jour prévu, à <strong className="text-green-300">20h00</strong>, vous recevez une notification :
                  </p>
                  <p className="bg-gray-800 border border-gray-700 rounded p-2 text-center italic">
                    « Le chantier de M./Mme X est-il terminé ? <strong className="text-green-400">Oui</strong> / <strong className="text-red-400">Non</strong> »
                  </p>

                  <div className="space-y-2 mt-3">
                    <div className="bg-green-900/20 border border-green-700/40 rounded p-2">
                      <p className="font-semibold text-green-300 text-sm mb-1">✅ Si oui :</p>
                      <ul className="list-disc ml-6 text-sm space-y-1">
                        <li>Vous pouvez générer la facture finale (l'acompte est automatiquement déduit).</li>
                        <li>La facture est classée dans <strong>Factures → En attente de paiement</strong> et dans <strong>Historique des chantiers terminés</strong>.</li>
                      </ul>
                    </div>

                    <div className="bg-red-900/20 border border-red-700/40 rounded p-2">
                      <p className="font-semibold text-red-300 text-sm mb-1">❌ Si non :</p>
                      <ul className="list-disc ml-6 text-sm space-y-1">
                        <li>Vous définissez une nouvelle date de fin.</li>
                        <li>L'IA informe votre client et vous recevrez une notification à cette nouvelle date.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6 - Historique */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                <FileText size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  📚 6. Historique
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>Vous pouvez consulter :</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>le nom du client,</li>
                    <li>la date de génération de la facture finale,</li>
                    <li>la facture (vue / téléchargement).</li>
                  </ul>
                  <p className="text-sm bg-gray-800/50 border border-gray-700 rounded p-2 mt-2">
                    🔍 <strong>Filtrage possible :</strong> mois, année, client.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              J'ai compris, commencer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
