import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function WelcomeModal({ isOpen, onClose }) {
  const [canClose, setCanClose] = useState(false);
  const contentRef = useRef(null);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Vérifier si l'utilisateur est arrivé en bas (avec une marge de 10px)
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setCanClose(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (canClose) {
      localStorage.setItem('af_welcome_seen', 'true');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="bg-gray-900 text-white border-orange-600/50 max-w-4xl max-h-[90vh] flex flex-col p-0"
        hideClose
      >
        {/* Header fixe */}
        <div className="flex-shrink-0 p-6 border-b border-gray-800 bg-gradient-to-r from-orange-600/20 to-orange-500/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-600/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-500">Présentation de la colonne "À TRAITER"</h2>
              <p className="text-sm text-gray-400 mt-1">Votre assistant personnel intégré</p>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Introduction */}
          <div className="space-y-3">
            <p className="text-gray-300 leading-relaxed">
              La colonne <strong className="text-orange-500">« À TRAITER »</strong> est votre assistant personnel intégré à ArtisanFlow.
              Elle regroupe toutes les tâches importantes qui nécessitent votre attention, et vous
              permet de rester parfaitement organisé au quotidien, sans rien oublier.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Cette colonne est <strong>cachée par défaut</strong> pour ne pas encombrer votre espace de travail.
              Mais dès qu'une action doit être réalisée, elle <strong>s'affiche automatiquement</strong> lorsque
              vous ouvrez l'un des 7 menus de votre console artisan.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Elle devient ainsi votre <strong className="text-orange-500">centre d'alertes intelligent</strong>, toujours visible au bon moment
              et jamais lorsque ce n'est pas nécessaire.
            </p>
          </div>

          {/* Ce que vous trouverez */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📌</span> Ce que vous trouverez dans "À TRAITER"
            </h3>
            <p className="text-gray-300 mb-4">La colonne affiche toutes les tâches prioritaires générées par vos activités :</p>
            
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">✔</span>
                <div>
                  <strong className="text-green-400">Devis acceptés</strong>
                  <p className="text-sm text-gray-400">Planifiez les dates dans votre agenda.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">💳</span>
                <div>
                  <strong className="text-blue-400">Paiement reçu</strong>
                  <p className="text-sm text-gray-400">Le client a payé son acompte via QR Code.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">📅</span>
                <div>
                  <strong className="text-cyan-400">Dates acceptées</strong>
                  <p className="text-sm text-gray-400">Le client a validé les dates planifiées.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🔄</span>
                <div>
                  <strong className="text-purple-400">Dates proposées</strong>
                  <p className="text-sm text-gray-400">Le client demande un changement de dates.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🔻</span>
                <div>
                  <strong className="text-orange-400">Stock faible</strong>
                  <p className="text-sm text-gray-400">Votre stock atteint un niveau critique (moins de 10%).</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🎉</span>
                <div>
                  <strong className="text-yellow-400">Fin des travaux</strong>
                  <p className="text-sm text-gray-400">Confirmez la fin du chantier → générez automatiquement la facture.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🧾</span>
                <div>
                  <strong className="text-red-400">Facture impayée</strong>
                  <p className="text-sm text-gray-400">L'IA prépare une relance professionnelle. Vous validez → elle est envoyée au client.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🔁</span>
                <div>
                  <strong className="text-pink-400">Devis sans réponse</strong>
                  <p className="text-sm text-gray-400">L'IA génère une relance efficace. Vous validez → elle est envoyée.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">❌</span>
                <div>
                  <strong className="text-gray-400">Devis refusé / sans réponse prolongée</strong>
                  <p className="text-sm text-gray-400">L'IA vous fournit une analyse complète : « Pourquoi ce devis n'a pas été accepté ? »</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fonctionnement */}
          <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-xl p-5 border border-orange-700/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚙️</span> Un fonctionnement intelligent et automatique
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Lorsqu'une nouvelle tâche apparaît, la colonne s'ouvre seule.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Vous êtes immédiatement averti de ce qui doit être fait.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Chaque ligne est cliquable pour accéder directement à l'action correspondante.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>L'IA vous assiste sur les relances et les analyses.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>La colonne se referme ensuite automatiquement dès que vous changez de section.</span>
              </li>
            </ul>
          </div>

          {/* Objectif */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span> Objectif de la colonne "À TRAITER"
            </h3>
            <p className="text-gray-300">Vous permettre de :</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2"><span className="text-orange-500">✓</span> ne rien oublier,</li>
              <li className="flex gap-2"><span className="text-orange-500">✓</span> gagner du temps,</li>
              <li className="flex gap-2"><span className="text-orange-500">✓</span> gérer vos priorités sans stress,</li>
              <li className="flex gap-2"><span className="text-orange-500">✓</span> suivre vos devis, factures et chantiers en un coup d'œil,</li>
              <li className="flex gap-2"><span className="text-orange-500">✓</span> être assisté par l'IA exactement au bon moment.</li>
            </ul>
            <p className="text-orange-400 font-semibold mt-4">
              ArtisanFlow devient ainsi votre coach administratif intelligent, pour vous permettre de
              vous concentrer sur votre métier.
            </p>
          </div>

          {/* Tutoriels */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span>📚</span> Découverte des tutoriels
            </h3>
            <p className="text-gray-300 mb-3">
              <strong>Bienvenue dans votre console ArtisanFlow !</strong><br/>
              Pour vous accompagner dans votre prise en main, vous disposez à tout moment de
              tutoriels complets au format texte et vidéo.
              Ces guides vous expliquent pas à pas chaque fonctionnalité de l'application.
            </p>
            <p className="text-gray-300">
              <strong>Pour y accéder, rien de plus simple :</strong><br/>
              Ouvrez la colonne de gauche → Cliquez sur <span className="text-orange-500 font-semibold">« Tutoriels »</span>
            </p>
          </div>

          {/* Recommandations */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span>💡</span> Recommandations
            </h3>
            <p className="text-gray-300 mb-3">
              Votre satisfaction est au cœur de notre mission.
              Chez ArtisanFlow, nous améliorons continuellement l'application pour qu'elle s'adapte
              parfaitement à vos besoins et à la réalité de votre métier.
            </p>
            <p className="text-gray-300 mb-3">
              <strong>Votre avis compte énormément :</strong> chaque recommandation, chaque suggestion nous permet
              de faire évoluer l'outil et de vous offrir une expérience encore plus complète, fluide et
              performante.
            </p>
            <p className="text-orange-400 font-semibold text-center py-3 border-t border-gray-700 mt-4">
              Notre objectif : Construire, avec vous, l'outil le plus intelligent et le plus efficace
            </p>
          </div>

          {/* Indicateur de scroll si pas encore en bas */}
          {!canClose && (
            <div className="text-center py-4 animate-bounce">
              <p className="text-orange-400 text-sm font-semibold">
                ⬇️ Faites défiler jusqu'en bas pour continuer
              </p>
            </div>
          )}
        </div>

        {/* Footer fixe avec bouton */}
        <div className="flex-shrink-0 p-6 border-t border-gray-800 bg-gray-900">
          <Button
            onClick={handleClose}
            disabled={!canClose}
            className={`w-full py-3 text-base font-semibold transition-all ${
              canClose 
                ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {canClose ? '✓ OK j\'ai compris, ne plus afficher' : '🔒 Lisez jusqu\'en bas pour continuer'}
          </Button>
          {!canClose && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Le bouton sera activé une fois que vous aurez lu l'intégralité du message
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
