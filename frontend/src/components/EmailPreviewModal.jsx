import React, { useState } from 'react';
import { X, Send, Edit, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function EmailPreviewModal({ open, onClose, clientName, startDate, endDate, projectDescription }) {
  const [isEditing, setIsEditing] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  // Générer l'email IA au montage du composant
  React.useEffect(() => {
    if (open && clientName) {
      const generatedEmail = `Bonjour ${clientName},

J'espère que vous allez bien. 

Suite à l'acceptation de votre devis pour ${projectDescription || 'vos travaux'}, je vous propose les dates suivantes pour la réalisation :

📅 Dates proposées :
• Début des travaux : ${startDate ? new Date(startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '[Date de début]'}
• Fin estimée : ${endDate ? new Date(endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '[Date de fin]'}

Merci de me confirmer si ces dates vous conviennent :

✅ Accepter ces dates
❌ Proposer d'autres dates

En cas d'acceptation, je procéderai à la planification définitive. Si vous souhaitez d'autres dates, n'hésitez pas à me faire part de vos préférences.

Je reste à votre disposition pour toute question.

Cordialement,
[Votre nom]
Artisan certifié`;
      
      setEmailContent(generatedEmail);
    }
  }, [open, clientName, startDate, endDate, projectDescription]);

  const handleSendToClient = () => {
    // Ici, la logique d'envoi réel serait implémentée
    console.log('Email envoyé au client:', emailContent);
    onClose(true); // Indiquer que l'email a été envoyé
  };

  const handleModifyMessage = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-blue-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-400 flex items-center gap-3">
            <Mail className="text-blue-400" size={28} />
            Prévisualisation et validation de l'email client
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-2">
            Vérifiez et modifiez l'email avant l'envoi final au client
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* En-tête de l'email */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">À :</span>
                <span className="text-white">{clientName || '[Client]'} &lt;{clientName?.toLowerCase().replace(' ', '.')}@email.com&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Objet :</span>
                <span className="text-white">📅 Proposition de dates pour vos travaux</span>
              </div>
            </div>
          </div>

          {/* Contenu de l'email */}
          <div className="bg-white text-black rounded-lg p-6 border">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                🤖 <strong>Email généré par l'IA</strong> - Vous pouvez le modifier avant l'envoi
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

          {/* Actions de l'email */}
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <h4 className="text-blue-300 font-semibold mb-3">Actions disponibles pour le client :</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="text-green-400" size={18} />
                <span className="text-gray-300">Bouton "Accepter ces dates" → chantier passe en "Planifié"</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <XCircle className="text-yellow-400" size={18} />
                <span className="text-gray-300">Bouton "Proposer d'autres dates" → chantier reste en "En attente"</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveChanges}
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
                  onClick={handleSendToClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  <Send size={20} className="mr-2" />
                  ✅ Envoyer au client
                </Button>
                <Button
                  onClick={handleModifyMessage}
                  variant="outline"
                  className="bg-gray-800 text-white border-gray-700"
                >
                  <Edit size={20} className="mr-2" />
                  ✏️ Modifier le message
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
              💡 <strong>Note :</strong> Après l'envoi, le chantier apparaîtra dans "En attente de validation" et les dates seront bloquées comme provisoires dans votre agenda jusqu'à la réponse du client.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}