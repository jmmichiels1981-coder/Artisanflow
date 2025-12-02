import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function TutorialsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📚 Tutoriels</h1>
          <p className="text-gray-400">Guides et vidéos pour maîtriser ArtisanFlow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tutoriel 1 - À venir */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Démarrage rapide</h3>
            <p className="text-sm text-gray-400 mb-4">Découvrez les bases d'ArtisanFlow en 5 minutes</p>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-400">Bientôt disponible</span>
          </div>

          {/* Tutoriel 2 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Créer votre premier devis</h3>
            <p className="text-sm text-gray-400 mb-4">Guide étape par étape pour créer un devis professionnel</p>
            <span className="text-xs px-3 py-1 rounded-full bg-green-600/20 text-green-400">Bientôt disponible</span>
          </div>

          {/* Tutoriel 3 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Utiliser l'IA efficacement</h3>
            <p className="text-sm text-gray-400 mb-4">Maximisez votre productivité avec l'assistant IA</p>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-600/20 text-blue-400">Bientôt disponible</span>
          </div>

          {/* Tutoriel 4 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Gérer votre comptabilité</h3>
            <p className="text-sm text-gray-400 mb-4">CA, dépenses et TVA automatisés</p>
            <span className="text-xs px-3 py-1 rounded-full bg-orange-600/20 text-orange-400">Bientôt disponible</span>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-700/30 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Des tutoriels régulièrement ajoutés</h3>
              <p className="text-sm text-gray-400">
                Nous enrichissons continuellement cette section avec de nouveaux guides vidéo et texte
                pour vous accompagner dans la maîtrise complète d'ArtisanFlow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}