import React, { useState, useEffect } from 'react';
import { X, Send, Edit, Mail, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ProposeNewDatesModal({ open, onClose, clientName, currentDates, chantierData }) {
  const [emailContent, setEmailContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newDates, setNewDates] = useState({
    startDate: '',
    endDate: ''
  });

  // Générer l'email IA au montage du composant
  useEffect(() => {
    if (open && clientName) {
      const generatedEmail = `Bonjour ${clientName},

J'espère que vous allez bien.

Concernant ${chantierData?.description || 'vos travaux'}, suite à votre réponse sur les dates que j'avais proposées, je vous propose de nouvelles dates :

📅 Nouvelles dates proposées :
• Début des travaux : ${newDates.startDate ? new Date(newDates.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '[Date de début]'}
• Fin estimée : ${newDates.endDate ? new Date(newDates.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '[Date de fin]'}

Ces nouvelles dates prennent en compte vos contraintes et s'adaptent mieux à mon planning.

Merci de me confirmer si ces dates vous conviennent :

✅ Accepter ces nouvelles dates
❌ Proposer d'autres dates

Je reste à votre disposition pour toute question ou ajustement.

Cordialement,
[Votre nom]
Artisan certifié`;
      
      setEmailContent(generatedEmail);
    }
  }, [open, clientName, chantierData, newDates]);

  const handleSendProposal = () => {
    console.log('Nouvelles dates proposées:', newDates);
    console.log('Email envoyé:', emailContent);
    onClose(true, newDates);
  };

  const handleDateChange = (field, value) => {
    setNewDates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-orange-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-400 flex items-center gap-3">
            <Mail className="text-orange-400" size={28} />
            Proposer de nouvelles dates
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-2">
            Définissez de nouvelles dates et personnalisez l'email avant envoi
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Sélection des nouvelles dates */}
          <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-6">
            <h3 className="text-orange-300 font-semibold text-lg mb-4">📅 Nouvelles dates à proposer</h3>
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
                <span className="text-white">{clientName} &lt;{clientName?.toLowerCase().replace(' ', '.')}@email.com&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Objet :</span>
                <span className="text-white">📅 Nouvelles dates proposées pour vos travaux</span>
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
                  onClick={handleSendProposal}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
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
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3">
            <p className="text-yellow-300 text-xs">
              💡 <strong>Note :</strong> Après l'envoi, le chantier restera dans "En attente de validation" jusqu'à la réponse du client et votre confirmation finale.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}