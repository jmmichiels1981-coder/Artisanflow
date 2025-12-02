import React, { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function RecommendationsPage() {
  const [formData, setFormData] = useState({
    category: 'amelioration',
    title: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: Envoyer au backend
    toast.success('Merci pour votre recommandation ! Nous l\'étudierons avec attention.');
    
    // Reset form
    setFormData({
      category: 'amelioration',
      title: '',
      description: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💡 Recommandations</h1>
          <p className="text-gray-400">Partagez vos idées pour améliorer ArtisanFlow</p>
        </div>

        {/* Message d'intro */}
        <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-700/30 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Votre avis compte énormément</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Chez ArtisanFlow, nous améliorons continuellement l'application pour qu'elle s'adapte
                parfaitement à vos besoins et à la réalité de votre métier. Chaque recommandation nous aide
                à construire, avec vous, l'outil le plus intelligent et le plus efficace.
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de recommandation
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600"
              >
                <option value="amelioration">💡 Amélioration d'une fonctionnalité existante</option>
                <option value="nouvelle">✨ Nouvelle fonctionnalité</option>
                <option value="bug">🐛 Signaler un problème</option>
                <option value="ux">🎨 Suggestion d'interface</option>
                <option value="autre">📝 Autre</option>
              </select>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre de votre recommandation *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Ajouter un filtre par date dans les factures"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Décrivez votre idée en détail *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Expliquez votre suggestion, pourquoi elle serait utile, et comment vous l'imaginez..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-600 resize-none"
                required
              />
            </div>

            {/* Bouton submit */}
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-base font-semibold"
            >
              ✉️ Envoyer ma recommandation
            </Button>
          </form>
        </div>

        {/* Remerciements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Merci pour votre contribution — elle nous aide à faire d'ArtisanFlow un outil qui vous ressemble.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}