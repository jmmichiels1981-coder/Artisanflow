import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/utils/tvaCalculator';

export default function ConfigurationArtisanModal({ open, onComplete }) {
  const [formData, setFormData] = useState({
    tauxHoraire: '',
    margeMateriaux: '',
    tvaStatus: 'assujetti',
    country: 'FR',
    logo: null,
    // Informations bancaires
    accountHolder: '',
    iban: '',
    bic: ''
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Le logo ne doit pas dépasser 5 MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image');
        return;
      }

      setFormData({ ...formData, logo: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation taux horaire (obligatoire)
    if (!formData.tauxHoraire || formData.tauxHoraire <= 0) {
      toast.error('Veuillez saisir un taux horaire valide');
      return;
    }
    
    // Validation marge matériaux (obligatoire)
    if (!formData.margeMateriaux || formData.margeMateriaux < 0) {
      toast.error('Veuillez saisir une marge sur matériaux valide');
      return;
    }

    // Validation informations bancaires (obligatoires)
    if (!formData.accountHolder || formData.accountHolder.trim() === '') {
      toast.error('Veuillez saisir le nom du titulaire du compte');
      return;
    }

    if (!formData.iban || formData.iban.trim() === '') {
      toast.error('Veuillez saisir votre IBAN');
      return;
    }

    // Validation basique format IBAN (doit commencer par 2 lettres)
    if (!/^[A-Z]{2}/.test(formData.iban)) {
      toast.error('Format IBAN invalide (doit commencer par le code pays, ex: FR)');
      return;
    }

    // Logo NON obligatoire (suppression de la validation)

    setLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('af_config_artisan', JSON.stringify({
        tauxHoraire: parseFloat(formData.tauxHoraire),
        margeMateriaux: parseFloat(formData.margeMateriaux),
        tvaStatus: formData.tvaStatus,
        logoUploaded: formData.logo ? true : false,
        // Ajout informations bancaires
        accountHolder: formData.accountHolder,
        iban: formData.iban,
        bic: formData.bic,
        configCompleted: true
      }));
      
      toast.success('Configuration enregistrée avec succès !');
      setLoading(false);
      
      if (onComplete) {
        onComplete();
      }
    }, 1500);
  };

  // Ne pas afficher la modal si open est false - empêche l'overlay fantôme
  if (!open) return null;

  return (
    <Dialog open={true} modal={true}>
      <DialogContent 
        className="bg-gray-900 text-white border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            ⭐ Configuration de votre profil artisan
          </DialogTitle>
          <p className="text-gray-400 text-center text-sm">
            Étape obligatoire pour automatiser vos devis et factures
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-400 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-blue-300 font-semibold text-sm mb-2">
                  Pourquoi ces informations sont essentielles ?
                </p>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• <strong>Calcul automatique des prix</strong> (taux horaire + marge matériaux)</li>
                  <li>• <strong>Application correcte de la TVA</strong> selon votre statut</li>
                  <li>• <strong>Totaux HT/TTC précis</strong> sur tous vos documents</li>
                  <li>• <strong>Logo sur devis et factures</strong> (PDF professionnels)</li>
                  <li>• <strong>Gain de temps maximal</strong> : plus besoin de recalculer manuellement !</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Taux horaire HTVA (€/heure) *
            </label>
            <input
              type="number"
              value={formData.tauxHoraire}
              onChange={(e) => setFormData({ ...formData, tauxHoraire: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Ex: 45"
              min="0"
              step="0.01"
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              Ce taux sera utilisé pour calculer automatiquement le coût de la main d'œuvre
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Marge sur les matériaux (%) *
            </label>
            <input
              type="number"
              value={formData.margeMateriaux}
              onChange={(e) => setFormData({ ...formData, margeMateriaux: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Ex: 20"
              min="0"
              max="100"
              step="0.1"
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              Marge appliquée sur le prix d'achat des matériaux
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Statut TVA *
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition">
                <input
                  type="radio"
                  name="tvaStatus"
                  value="assujetti"
                  checked={formData.tvaStatus === 'assujetti'}
                  onChange={(e) => setFormData({ ...formData, tvaStatus: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Assujetti à la TVA</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Vous facturez avec TVA (20% en France)
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition">
                <input
                  type="radio"
                  name="tvaStatus"
                  value="non_assujetti"
                  checked={formData.tvaStatus === 'non_assujetti'}
                  onChange={(e) => setFormData({ ...formData, tvaStatus: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Non assujetti à la TVA</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Auto-entrepreneur ou micro-entreprise
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition">
                <input
                  type="radio"
                  name="tvaStatus"
                  value="intracommunautaire"
                  checked={formData.tvaStatus === 'intracommunautaire'}
                  onChange={(e) => setFormData({ ...formData, tvaStatus: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">TVA Intracommunautaire</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Factures UE avec autoliquidation TVA
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Logo de votre entreprise *
            </label>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition">
              {logoPreview ? (
                <div className="space-y-4">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-h-32 mx-auto rounded"
                  />
                  <p className="text-green-400 text-sm font-semibold">✓ Logo téléchargé</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer transition">
                    <Upload size={18} />
                    Changer le logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <Upload size={32} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">
                        Cliquez pour télécharger votre logo
                      </p>
                      <p className="text-gray-400 text-xs">
                        PNG, JPG ou SVG • Max 5 MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Votre logo apparaîtra automatiquement sur tous vos devis et factures (PDF)
            </p>
          </div>

          {/* Section Informations Bancaires */}
          <div className="border-t border-gray-700 pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                🏦 Informations bancaires
              </h3>
              
              <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
                <p className="text-green-300 font-semibold text-sm mb-2">
                  🔒 Sécurité de vos informations bancaires
                </p>
                <div className="text-green-200 text-xs space-y-1">
                  <p>Vos informations bancaires <strong>ne sont jamais collectées ni conservées</strong> par ArtisanFlow.</p>
                  <p>Elles servent uniquement à préremplir automatiquement vos devis et vos factures (acompte et paiement par virement).</p>
                  <p className="mt-2 font-semibold">➡️ Ces données restent strictement confidentielles.</p>
                  <p className="font-semibold">➡️ Tous les paiements sont effectués directement sur votre compte, sans passer par ArtisanFlow.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du titulaire du compte <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="Ex: Jean Dupont SARL"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Nom de l'entreprise ou du titulaire tel qu'il apparaît sur votre RIB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IBAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-green-500"
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  maxLength="34"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Numéro IBAN complet (27 à 34 caractères selon le pays)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BIC / SWIFT <span className="text-gray-500 text-xs">(optionnel mais recommandé)</span>
                </label>
                <input
                  type="text"
                  value={formData.bic}
                  onChange={(e) => setFormData({ ...formData, bic: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-green-500"
                  placeholder="Ex: BNPAFRPPXXX"
                  maxLength="11"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Code d'identification de votre banque (8 ou 11 caractères)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/40 rounded-lg p-4">
            <p className="text-purple-300 font-semibold text-sm text-center">
              🚀 Ces informations garantissent une cohérence parfaite dans tous vos documents et vous font gagner un temps précieux !
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold"
            >
              {loading ? 'Enregistrement...' : 'Valider et continuer →'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
