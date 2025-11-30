import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Volume2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import ManualQuoteTutorial from '@/components/tutorials/ManualQuoteTutorial';
import VoiceQuoteTutorial from '@/components/tutorials/VoiceQuoteTutorial';
import AIQuoteTutorial from '@/components/tutorials/AIQuoteTutorial';

export default function CreerDevisChoix() {
  const navigate = useNavigate();
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showManualTutorial, setShowManualTutorial] = useState(false);
  const [showVoiceTutorial, setShowVoiceTutorial] = useState(false);
  const [showAITutorial, setShowAITutorial] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  useEffect(() => {
    // Vérifier si le tutoriel a déjà été vu
    const tutorialSeen = localStorage.getItem('af_devis_creation_tutorial_seen');
    if (tutorialSeen !== 'true') {
      setShowTutorialModal(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_devis_creation_tutorial_seen', 'true');
    setShowTutorialModal(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto" data-testid="creer-devis-choix-page">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            Retour
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Créer un devis</h1>
          <p className="text-gray-400">Choisissez votre méthode de création préférée</p>
        </div>

        {/* 3 méthodes de création */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Méthode 1: Manuel */}
          <button
            onClick={() => navigate('/devis/creer/manuel')}
            className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-8 rounded-xl border border-blue-700/40 hover:border-blue-500 transition group cursor-pointer"
            data-testid="method-manuel"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Edit className="text-blue-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Manuel</h3>
              <p className="text-sm text-gray-400">Saisie classique et complète</p>
            </div>
          </button>

          {/* Méthode 2: Dictée vocale */}
          <button
            onClick={() => navigate('/devis/creer/dictee-vocale-structuree-par-ia')}
            className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-8 rounded-xl border border-purple-700/40 hover:border-purple-500 transition group cursor-pointer"
            data-testid="method-dictee"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Volume2 className="text-purple-400" size={40} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-white">Dictée vocale</h3>
                <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-[10px] font-bold rounded">IA</span>
              </div>
              <p className="text-sm text-gray-400">Structuré par IA</p>
            </div>
          </button>

          {/* Méthode 3: Assisté par IA */}
          <button
            onClick={() => navigate('/devis/creer/assiste-par-ia')}
            className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 p-8 rounded-xl border border-pink-700/40 hover:border-pink-500 transition group cursor-pointer"
            data-testid="method-ia"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Sparkles className="text-pink-400" size={40} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-white">Assisté par IA</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-pink-300 text-[10px] font-bold rounded">IA</span>
              </div>
              <p className="text-sm text-gray-400">Génération intelligente</p>
            </div>
          </button>
        </div>

      </div>

      {/* Modale Tutoriel */}
      <Dialog open={showTutorialModal} onOpenChange={setShowTutorialModal}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              Créer un devis — Choisissez votre mode
            </DialogTitle>
          </DialogHeader>
          
          {/* Zone scrollable */}
          <div className="overflow-y-auto flex-1 pr-2" style={{ maxHeight: 'calc(85vh - 200px)' }}>
            <div className="space-y-6 py-4">
              <p className="text-gray-300 text-center mb-6">
                Voici les trois façons rapides de créer un devis avec ArtisanFlow :
              </p>

            {/* Option 1: Manuel */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-700/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Edit className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">🔹 Manuel</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Vous complétez vous-même toutes les informations du devis.
                    <br />
                    Mode classique, simple et précis.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Dictée vocale */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-700/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Volume2 className="text-purple-400" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">🔹 Dictée vocale</h3>
                    <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-[10px] font-bold rounded">IA</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Vous parlez, l'application transcrit votre voix,
                    <br />
                    et l'IA organise automatiquement le devis
                    <br />
                    (main-d'œuvre, matériaux, quantités…).
                    <br />
                    <span className="text-purple-400 font-medium">Idéal sur chantier.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Option 3: Assisté par IA */}
            <div className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 p-6 rounded-xl border border-pink-700/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-pink-400" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">🔹 Assisté par IA</h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-pink-300 text-[10px] font-bold rounded">IA</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Vous décrivez simplement la mission.
                    <br />
                    L'IA génère un devis complet : structure, quantités, matériaux, prix, mise en page professionnelle.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Bouton de confirmation - Fixe en bas */}
          <div className="flex justify-center pt-6 pb-2 border-t border-gray-700 mt-4">
            <Button
              onClick={handleCloseTutorial}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              OK, j'ai compris — Ne plus afficher
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
