import React from 'react';
import { X, Calendar, CheckCircle, Eye, Edit, RefreshCw, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PlanifiesToutorial({ open, onClose }) {
  // Protection contre l'affichage vide ou invalide
  if (!open || typeof open !== 'boolean') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-green-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 flex items-center gap-3">
            <Calendar className="text-green-400" size={32} />
            Tutoriel — Chantiers planifiés
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-2">
            Version mise à jour avec gestion des retards et déplacements automatiques
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Introduction */}
          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
            <p className="text-gray-300 leading-relaxed">
              C'est ici que vous retrouvez tous vos <strong className="text-green-300">chantiers dont les dates ont été confirmées</strong> avec votre client.
            </p>
            <p className="text-gray-300 leading-relaxed mt-2">
              Un chantier planifié possède une <strong className="text-white">date de début et une date de fin validées</strong>, 
              et il passera automatiquement en <strong className="text-orange-300">"Chantier en cours"</strong> le jour du début des travaux.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
            Ce que vous pouvez faire ici :
          </h3>

          {/* Section 1 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 text-black rounded-full flex items-center justify-center text-sm font-bold">1</div>
              🟢 Consulter vos chantiers à venir
            </h4>
            <div className="ml-8 space-y-3">
              <p className="text-gray-300">Vous voyez pour chaque chantier :</p>
              <ul className="list-disc ml-6 space-y-1 text-gray-300">
                <li>le nom du client</li>
                <li>la description du chantier</li>
                <li>les dates confirmées</li>
                <li>la durée prévue</li>
                <li>le statut : <span className="text-green-300 font-semibold">Planifié</span></li>
              </ul>
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-3 mt-3">
                <p className="text-blue-300 text-sm">
                  💡 Les chantiers sont automatiquement classés par date de fin prévue, du plus urgent au plus lointain.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              🟣 Ouvrir le chantier pour voir ses détails
            </h4>
            <div className="ml-8">
              <p className="text-gray-300">
                Vous pouvez consulter toutes les informations liées au chantier, dont le <strong className="text-white">devis associé</strong>.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-orange-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              🟠 Modifier les dates en cas d'imprévu
            </h4>
            <div className="ml-8 space-y-3">
              <p className="text-gray-300">
                Si vous devez décaler un chantier <em>(retard sur un autre chantier, maladie, imprévu)</em>, 
                vous pouvez <strong className="text-white">modifier la plage de dates</strong> depuis la fiche du chantier.
              </p>
              
              <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-4">
                <p className="text-orange-300 font-semibold mb-3">Lorsque vous modifiez les dates :</p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight size={16} className="text-orange-400 mt-0.5" />
                    <span>Les nouvelles dates sont enregistrées comme <strong className="text-yellow-300">provisoires</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight size={16} className="text-orange-400 mt-0.5" />
                    <span>Votre chantier quitte <strong>"Chantiers planifiés"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight size={16} className="text-orange-400 mt-0.5" />
                    <span>Il retourne automatiquement dans <strong className="text-yellow-300">"Chantiers — En attente de validation"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight size={16} className="text-orange-400 mt-0.5" />
                    <span>Une proposition de nouvelles dates sera envoyée à votre client par email <em>(rédigé par l'IA)</em></span>
                  </li>
                </ul>
                
                <div className="mt-4 pl-4 border-l-2 border-orange-500">
                  <p className="text-gray-300 text-sm mb-2">Votre client pourra :</p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-400" />
                      <span>Accepter les nouvelles dates, ou</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Edit size={14} className="text-blue-400" />
                      <span>Proposer encore d'autres dates</span>
                    </li>
                  </ul>
                  <p className="text-gray-300 text-sm mt-3">
                    Vous devrez ensuite <strong className="text-white">confirmer la date finale</strong> pour que le chantier revienne dans <strong>Chantiers planifiés</strong>.
                  </p>
                </div>
                
                <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3 mt-4">
                  <p className="text-red-300 text-sm font-semibold">
                    ⚠️ Ainsi, aucune date ne peut être confirmée sans votre validation manuelle, même si le client a accepté.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              🔄 Passage automatique en "Chantiers en cours"
            </h4>
            <div className="ml-8 space-y-3">
              <p className="text-gray-300">
                Le jour du début des travaux, votre chantier passe automatiquement dans :
              </p>
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-3">
                <p className="text-blue-300 flex items-center gap-2">
                  <ArrowRight size={16} />
                  <strong>Chantiers en cours</strong>
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Vous serez averti par une notification.
                </p>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🧠 En résumé :
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-400 mt-0.5" />
                <span>Un chantier planifié = <strong className="text-green-300">dates confirmées</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Edit size={18} className="text-orange-400 mt-0.5" />
                <span>Vous pouvez <strong className="text-orange-300">modifier les dates</strong> si nécessaire</span>
              </li>
              <li className="flex items-start gap-3">
                <RefreshCw size={18} className="text-blue-400 mt-0.5" />
                <div>
                  <span>Après modification :</span>
                  <div className="text-sm text-gray-400 mt-1 ml-4">
                    <span className="text-green-300">Planifié</span> → <span className="text-yellow-300">En attente de validation</span> → <span className="text-green-300">Planifié</span> <em>(après validation)</em>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={18} className="text-purple-400 mt-0.5" />
                <span>Le chantier <strong className="text-purple-300">commence automatiquement</strong> à la date prévue</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">🔔</span>
                <span>Vous serez <strong className="text-blue-300">notifié à chaque étape</strong> importante</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
