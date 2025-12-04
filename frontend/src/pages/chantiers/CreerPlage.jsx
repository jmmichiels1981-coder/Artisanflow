import React, { useState, useEffect } from 'react';
import { CalendarPlus, ArrowLeft, Info, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import CreerPlageTutorial from '@/components/tutorials/CreerPlageTutorial';
import EmailPreviewModal from '@/components/EmailPreviewModal';

export default function CreerPlage() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [formData, setFormData] = useState({
    devis: '',
    dateDebut: '',
    dateFin: ''
  });

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('af_creer_plage_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('af_creer_plage_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.devis && formData.dateDebut && formData.dateFin) {
      setShowEmailPreview(true);
    }
  };

  const handleEmailSent = (wasSent) => {
    setShowEmailPreview(false);
    if (wasSent) {
      // Rediriger vers "En attente de validation"
      navigate('/chantiers/en-attente');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Bouton Retour */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📅 Créer une plage de dates
          </h1>
          <p className="text-gray-400">
            Sélectionnez un devis accepté et définissez les dates de chantier
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
            <div className="max-w-2xl">
              <div className="space-y-6">
                {/* Sélection devis */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Devis accepté *
                  </label>
                  <select 
                    name="devis"
                    value={formData.devis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  >
                    <option value="">Sélectionner un devis accepté...</option>
                    <option value="devis-001">DEV-001 - M. Dupont - Rénovation cuisine (2 500€)</option>
                    <option value="devis-002">DEV-002 - Mme Martin - Salle de bain (3 800€)</option>
                    <option value="devis-003">DEV-003 - M. Bernard - Électricité (1 200€)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Seuls les devis acceptés dont le paiement d'acompte a été confirmé apparaissent ici.
                  </p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de fin estimée *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>

                {/* Encart explicatif */}
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-6 mt-8">
                  <h3 className="text-blue-300 font-semibold text-lg mb-4 flex items-center gap-2">
                    <Info size={20} />
                    Comment cela fonctionne ?
                  </h3>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Les dates seront ajoutées dans l'agenda comme <strong className="text-blue-300">provisoires</strong>.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="mb-2">
                          Un <strong className="text-blue-300">email généré par l'IA</strong> sera préparé pour le client contenant :
                        </p>
                        <div className="ml-4 space-y-1">
                          <p className="flex items-center gap-2 text-sm">
                            <span className="text-green-400">✔</span>
                            <span>Accepter les dates</span>
                          </p>
                          <p className="flex items-center gap-2 text-sm">
                            <span className="text-yellow-400">❌</span>
                            <span>Proposer d'autres dates</span>
                          </p>
                        </div>
                        <p className="text-sm text-blue-200 mt-2 italic">
                          💡 Vous pourrez <strong>modifier entièrement l'email</strong> avant l'envoi final.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Vous recevrez une <strong className="text-blue-300">notification</strong> dès que le client répondra.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Le chantier apparaîtra dans <strong className="text-yellow-300">"En attente de validation"</strong> jusqu'à votre confirmation finale.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                    disabled={!formData.devis || !formData.dateDebut || !formData.dateFin}
                  >
                    <Mail size={20} className="mr-2" />
                    👉 Prévisualiser, valider et envoyer les dates au client
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de prévisualisation email */}
      <EmailPreviewModal
        open={showEmailPreview}
        onClose={handleEmailSent}
        clientName={formData.devis === 'devis-001' ? 'M. Dupont' : formData.devis === 'devis-002' ? 'Mme Martin' : 'M. Bernard'}
        startDate={formData.dateDebut}
        endDate={formData.dateFin}
        projectDescription={
          formData.devis === 'devis-001' ? 'la rénovation de votre cuisine' :
          formData.devis === 'devis-002' ? 'les travaux de salle de bain' : 
          'les travaux électriques'
        }
      />

      {/* Tutoriel avec protection contre l'affichage vide */}
      {showTutorial && <CreerPlageTutorial open={showTutorial} onClose={handleCloseTutorial} />}
    </DashboardLayout>
  );
}
