import React, { useState, useEffect } from 'react';
import { X, Send, Edit, Mail, CheckCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ModifyChantierDatesModal({ open, onClose, chantier }) {
  const [emailContent, setEmailContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newDates, setNewDates] = useState({
    startDate: '',
    endDate: ''
  });

  // Pré-remplir avec les dates actuelles du chantier
  useEffect(() => {
    if (open && chantier) {
      setNewDates({
        startDate: chantier.startDate || '',
        endDate: chantier.endDate || ''
      });
    }
  }, [open, chantier]);

  // Générer l'email IA au montage du composant
  useEffect(() => {
    if (open && chantier && newDates.startDate && newDates.endDate) {
      const generatedEmail = `Bonjour ${chantier.clientName},

J'espère que vous allez bien.

En raison d'un imprévu dans mon planning, je dois reprogrammer les dates de ${chantier.description}.

📅 Nouvelles dates proposées :
• Début des travaux : ${new Date(newDates.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
• Fin estimée : ${new Date(newDates.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

Dates initialement prévues :
• Début : ${new Date(chantier.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
• Fin : ${new Date(chantier.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month, year: 'numeric' })}

Je m'excuse pour ce changement et j'espère que ces nouvelles dates vous conviennent :

✅ Accepter les nouvelles dates
❌ Proposer d'autres dates

Je reste à votre disposition pour toute question.

Cordialement,
[Votre nom]
Artisan certifié`;
      
      setEmailContent(generatedEmail);
    }
  }, [open, chantier, newDates]);

  const handleSendModification = () => {
    console.log('Dates modifiées pour chantier:', chantier.id);
    console.log('Nouvelles dates:', newDates);
    console.log('Email envoyé:', emailContent);
    onClose(true, newDates);
  };

  const handleDateChange = (field, value) => {
    setNewDates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!open || !chantier) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
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

          {/* Sélection des nouvelles dates */}
          <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-6">
            <h3 className="text-purple-300 font-semibold text-lg mb-4">🔄 Nouvelles dates à proposer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nouvelle date de début *
                </label>
                <input
                  type="date"
                  value={newDates.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
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
                  value={newDates.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* En-tête de l'email */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">À :</span>
                <span className="text-white">{chantier.clientName} &lt;{chantier.clientName?.toLowerCase().replace(' ', '.')}@email.com&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Objet :</span>
                <span className="text-white">📅 Modification des dates de votre chantier</span>
              </div>
            </div>
          </div>

          {/* Contenu de l'email */}
          <div className="bg-white text-black rounded-lg p-6 border">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                🤖 <strong>Email généré par l'IA</strong> - Modifiez le contenu selon vos besoins
              </span>
            </div>
            
            {isEditing ? (
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none font-sans text-sm leading-relaxed"
                placeholder="Contenu de l'email..."
              />
            ) : (
              <div className="whitespace-pre-line font-sans text-sm leading-relaxed">
                {emailContent}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Sauvegarder les modifications
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="bg-gray-800 text-white border-gray-700"
                >
                  Annuler
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSendModification}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  disabled={!newDates.startDate || !newDates.endDate}
                >
                  <Send size={20} className="mr-2" />
                  ✅ Envoyer les nouvelles dates
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="bg-blue-800 text-white border-blue-700 hover:bg-blue-700"
                >
                  <Edit size={20} className="mr-2" />
                  ✏️ Modifier l'email
                </Button>
                <Button
                  onClick={() => onClose(false)}
                  variant="outline"
                  className="bg-gray-800 text-white border-gray-700"
                >
                  Annuler
                </Button>
              </>
            )}
          </div>

          {/* Note explicative */}
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
            <h4 className="text-yellow-300 font-semibold text-sm mb-2">🔄 Après l'envoi :</h4>
            <ul className="text-yellow-200 text-xs space-y-1">
              <li>• Le chantier passera dans <strong>"En attente de validation"</strong></li>
              <li>• Les anciennes dates seront libérées dans l'agenda</li>
              <li>• Les nouvelles dates seront bloquées provisoirement (bordure pointillée)</li>
              <li>• Vous recevrez une notification dès que le client répondra</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}