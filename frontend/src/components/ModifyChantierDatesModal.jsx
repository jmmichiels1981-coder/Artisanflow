import React, { useState, useEffect } from 'react';
import { X, Send, Edit, Mail, CheckCircle, Calendar, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EmailPreviewModal from '@/components/EmailPreviewModal';

export default function ModifyChantierDatesModal({ open, onClose, chantier }) {
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [formData, setFormData] = useState({
    devis: '',
    dateDebut: '',
    dateFin: ''
  });

  // Pré-remplir avec les données du chantier
  useEffect(() => {
    if (open && chantier) {
      setFormData({
        devis: `${chantier.devisRef} - ${chantier.clientName} - ${chantier.description} (${chantier.montant})`,
        dateDebut: chantier.startDate,
        dateFin: chantier.endDate
      });
    }
  }, [open, chantier]);

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
      // Retourner les nouvelles dates pour que le parent puisse gérer la logique
      onClose(true, {
        startDate: formData.dateDebut,
        endDate: formData.dateFin
      });
    }
  };

  if (!open || !chantier) return null;

  return (
    <>
      <Dialog open={open && !showEmailPreview} onOpenChange={() => onClose(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-purple-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-400 flex items-center gap-3">
              <Calendar className="text-purple-400" size={28} />
              Modifier les dates du chantier
            </DialogTitle>
            <p className="text-gray-400 text-sm mt-2">
              {chantier.clientName} - {chantier.description}
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Dates actuelles */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">📅 Dates actuellement planifiées :</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-400">Début :</span> {new Date(chantier.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div>
                  <span className="text-orange-400">Fin :</span> {new Date(chantier.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
                <div className="max-w-2xl">
                  <div className="space-y-6">
                    {/* Devis (pré-rempli, en lecture seule) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Devis concerné
                      </label>
                      <input
                        type="text"
                        value={formData.devis}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Devis associé à ce chantier planifié.
                      </p>
                    </div>

                    {/* Nouvelles dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nouvelle date de début *
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
                          Nouvelle date de fin estimée *
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
                            Les nouvelles dates seront ajoutées dans l'agenda comme <strong className="text-blue-300">provisoires</strong>.
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
                                <span>Accepter les nouvelles dates</span>
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
                            Le chantier apparaîtra dans <strong className="text-yellow-300">"En attente de validation"</strong> avec le statut <strong className="text-purple-300">"Nouvelles dates proposées"</strong>.
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p>
                            Les <strong className="text-orange-300">anciennes dates seront libérées</strong> dans l'agenda.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bouton */}
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                        disabled={!formData.devis || !formData.dateDebut || !formData.dateFin}
                      >
                        <Mail size={20} className="mr-2" />
                        👉 Prévisualiser, valider et envoyer les nouvelles dates au client
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation email */}
      <EmailPreviewModal
        open={showEmailPreview}
        onClose={handleEmailSent}
        clientName={chantier?.clientName}
        startDate={formData.dateDebut}
        endDate={formData.dateFin}
        projectDescription={chantier?.description}
      />
    </>
  );
}