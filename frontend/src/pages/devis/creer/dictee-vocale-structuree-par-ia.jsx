import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mic, MicOff, ArrowLeft, Eye, Send, UserPlus, Sparkles, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import BankingInfoDisplay from '@/components/devis/BankingInfoDisplay';
import AcompteDisplay from '@/components/devis/AcompteDisplay';
import DocumentsSection from '@/components/devis/DocumentsSection';
import { getClients, addClient } from '@/utils/clientStorage';
import { getAvailableTVARates, calculateTVAManual, getTVALabel, COUNTRY_LABELS } from '@/utils/tvaCalculator';
import { useCurrency } from '@/hooks/useCurrency';

export default function DevisDicteeVocale() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  const { formatAmount } = useCurrency();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isStructured, setIsStructured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Mock - Informations entreprise
  const [companyInfo] = useState({
    name: 'SARL ArtisanFlow',
    address: '123 Rue de la République',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
    siret: '123 456 789 00012',
    tva: 'FR12345678900'
  });

  // Mock - Liste clients
  const [clients, setClients] = useState([]);
  
  useEffect(() => {
    setClients(getClients());
  }, []);

  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: 'FR',
    email: '',
    phone: '',
    tvaAssujetti: null
  });
  
  const [formData, setFormData] = useState({
    description: '',
    items: [],
    selectedTVARate: 20
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Enregistrement démarré - Dictez votre devis');
    } catch (error) {
      toast.error('Erreur d\'accès au microphone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Mock - Transcription
      setTimeout(() => {
        const mockTranscription = "Devis pour Monsieur Dupont. Peinture de deux chambres à 250 euros chacune. Fourniture de peinture premium pour 180 euros. Préparation des surfaces et rebouchage pour 120 euros.";
        setTranscription(mockTranscription);
        setFormData({ ...formData, description: mockTranscription });
        toast.success('Transcription terminée');
      }, 1000);
    }
  };

  const handleStructureQuote = () => {
    if (!transcription) {
      toast.error('Aucune transcription disponible');
      return;
    }

    setLoading(true);
    
    // Mock - Structuration IA
    setTimeout(() => {
      const config = localStorage.getItem('af_config_artisan');
      let tauxHoraire = 45;
      if (config) {
        try {
          const configData = JSON.parse(config);
          tauxHoraire = parseFloat(configData.tauxHoraire) || 45;
        } catch (e) {}
      }
      
      const mockItems = [
        { name: 'Peinture chambre 1', category: 'main_oeuvre', quantity: 1, unit_price: tauxHoraire, purchase_price: 0, margeApplied: false },
        { name: 'Peinture chambre 2', category: 'main_oeuvre', quantity: 1, unit_price: tauxHoraire, purchase_price: 0, margeApplied: false },
        { name: 'Peinture premium (pots)', category: 'materiaux', quantity: 1, unit_price: 180, purchase_price: 144, margeApplied: true },
        { name: 'Préparation surfaces + rebouchage', category: 'main_oeuvre', quantity: 1, unit_price: tauxHoraire / 2, purchase_price: 0, margeApplied: false },
      ];
      
      setFormData({ ...formData, items: mockItems });
      setIsStructured(true);
      setLoading(false);
      toast.success('Devis structuré avec succès par l\'IA !');
    }, 2000);
  };

  const getArtisanConfig = () => {
    const config = localStorage.getItem('af_config_artisan');
    if (config) {
      try {
        return JSON.parse(config);
      } catch (e) {
        console.error('Erreur lecture config artisan:', e);
      }
    }
    return null;
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    const configData = getArtisanConfig();
    
    // Si la catégorie change vers "main_oeuvre", remplir automatiquement le prix avec le taux horaire
    if (field === 'category' && value === 'main_oeuvre') {
      if (configData && configData.tauxHoraire) {
        newItems[index].unit_price = parseFloat(configData.tauxHoraire);
        newItems[index].purchase_price = '';
        newItems[index].margeApplied = false;
      }
    }
    
    // Si la catégorie change vers "materiaux", réinitialiser les prix
    if (field === 'category' && value === 'materiaux') {
      newItems[index].unit_price = '';
      newItems[index].purchase_price = '';
      newItems[index].margeApplied = false;
    }
    
    // Si la catégorie change vers "autre", réinitialiser les prix (pas de marge)
    if (field === 'category' && value === 'autre') {
      newItems[index].unit_price = '';
      newItems[index].purchase_price = '';
      newItems[index].margeApplied = false;
    }
    
    // Note: Le calcul de la marge est fait sur onBlur dans l'input, pas ici
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const handleAddNewClient = () => {
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
      toast.error('Veuillez remplir au minimum : Prénom, Nom et Email');
      return;
    }
    
    const result = addClient(newClientData);
    
    if (result.error) {
      toast.error(result.error);
      return;
    }
    
    if (result.success && result.client) {
      setClients(getClients());
      setSelectedClient(result.client.id);
      toast.success(`Client ${newClientData.firstName} ${newClientData.lastName} ajouté avec succès !`);
      setShowNewClientModal(false);
      setNewClientData({
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        number: '',
        postalCode: '',
        city: '',
        country: 'FR',
        email: '',
        phone: '',
        tvaAssujetti: null
      });
    }
  };

  const handlePreview = () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    toast.info('Prévisualisation du devis (fonctionnalité à venir)');
  };

  const handleSendToClient = () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Veuillez structurer le devis d\'abord');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      toast.success(`Devis envoyé à ${selectedClient.email} !`);
      toast.success('Le devis a été déplacé dans "Devis envoyés"');
      setLoading(false);
      navigate('/devis/creer');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Créer un devis — Dictée vocale</h1>
            <span className="px-3 py-1 bg-purple-600/30 text-purple-300 text-sm font-bold rounded-full">IA</span>
          </div>
          <p className="text-gray-400">Dictez votre devis, l'IA le structure automatiquement</p>
        </div>

        {/* Informations entreprise */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Vos informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Entreprise :</span>
              <p className="text-white font-medium">{companyInfo.name}</p>
            </div>
            <div>
              <span className="text-gray-400">SIRET :</span>
              <p className="text-white font-medium">{companyInfo.siret}</p>
            </div>
            <div>
              <span className="text-gray-400">Adresse :</span>
              <p className="text-white font-medium">{companyInfo.address}</p>
            </div>
            <div>
              <span className="text-gray-400">TVA :</span>
              <p className="text-white font-medium">{companyInfo.tva}</p>
            </div>
          </div>
        </div>

        {/* Sélection client */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Client</h2>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <UserPlus size={18} />
              Ajouter un nouveau client
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sélectionner un client *
            </label>
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const client = clients.find(c => c.id === parseInt(e.target.value));
                setSelectedClient(client);
              }}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Choisir un client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {selectedClient && (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-white font-semibold">{selectedClient.name}</p>
              <p className="text-gray-400 text-sm">{selectedClient.email}</p>
            </div>
          )}
        </div>

        {/* Dictée vocale */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-8 rounded-xl border border-purple-700/40 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Dictée vocale</h2>
            <p className="text-gray-300 mb-6">Dictez toutes les informations du devis : travaux, matériaux, quantités, prix...</p>
            
            <div className="mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all transform hover:scale-110 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isRecording ? (
                  <MicOff size={40} className="text-white" />
                ) : (
                  <Mic size={40} className="text-white" />
                )}
              </button>
            </div>
            
            <p className="text-white font-semibold mb-2">
              {isRecording ? 'Enregistrement en cours...' : audioBlob ? 'Enregistrement terminé' : 'Cliquez pour commencer la dictée'}
            </p>

            {transcription && (
              <div className="mt-6">
                <div className="bg-gray-900/50 p-4 rounded-lg text-left mb-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">Transcription :</h3>
                  <p className="text-gray-300 italic">"{transcription}"</p>
                </div>

                {!isStructured && (
                  <Button
                    onClick={handleStructureQuote}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Structuration en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        Structurer le devis avec l'IA
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lignes du devis (après structuration) */}
        {isStructured && formData.items.length > 0 && (
          <>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Devis structuré par l'IA</h2>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                    {editingIndex === index ? (
                      // Mode édition
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-3">
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="main_oeuvre">Main d'œuvre</option>
                            <option value="materiaux">Matériaux</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            min="1"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                              updateItem(index, 'unit_price', value);
                              if (item.category === 'materiaux') {
                                const newItems = [...formData.items];
                                newItems[index].margeApplied = false;
                                setFormData({ ...formData, items: newItems });
                              }
                            }}
                            onBlur={(e) => {
                              // UNIQUEMENT pour matériaux (pas pour "autre")
                              if (item.category === 'materiaux' && !item.margeApplied) {
                                const currentPrice = parseFloat(e.target.value) || 0;
                                const config = getArtisanConfig();
                                if (config && config.margeMateriaux && currentPrice > 0) {
                                  const marge = parseFloat(config.margeMateriaux);
                                  const newItems = [...formData.items];
                                  newItems[index].unit_price = currentPrice * (1 + marge / 100);
                                  newItems[index].margeApplied = true;
                                  setFormData({ ...formData, items: newItems });
                                }
                              }
                            }}
                            placeholder={item.category === 'materiaux' ? 'Prix d\'achat' : 'Prix HT'}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-1">
                          <Button
                            onClick={() => setEditingIndex(null)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            ✓
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              item.category === 'main_oeuvre' 
                                ? 'bg-blue-600/30 text-blue-300' 
                                : 'bg-green-600/30 text-green-300'
                            }`}>
                              {item.category === 'main_oeuvre' ? 'Main d\'œuvre' : 'Matériaux'}
                            </span>
                          </div>
                          <p className="text-white font-semibold">{item.name}</p>
                          <p className="text-gray-400 text-sm">Quantité: {item.quantity} × {item.unit_price.toFixed(2)} €</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-purple-400 font-semibold text-lg">
                            {(item.quantity * item.unit_price).toFixed(2)} €
                          </span>
                          <Button
                            onClick={() => setEditingIndex(index)}
                            variant="outline"
                            className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                          >
                            <Edit2 size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sélecteur de TVA Manuel */}
            <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-6 mb-6">
              <label className="block text-sm font-medium text-blue-300 mb-3">
                Taux de TVA applicable *
              </label>
              <select
                value={formData.selectedTVARate}
                onChange={(e) => setFormData({ ...formData, selectedTVARate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-blue-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                {getAvailableTVARates().map((tvaOption) => (
                  <option key={tvaOption.id} value={tvaOption.rate}>
                    {tvaOption.label}
                  </option>
                ))}
              </select>
              <p className="text-blue-200 text-xs mt-2">
                💡 Sélectionnez le taux de TVA correspondant à votre situation et à celle de votre client
              </p>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/40 mb-6">
              {(() => {
                const totalHT = calculateTotal();
                const tvaCalculation = calculateTVAManual(totalHT, formData.selectedTVARate);
                
                return (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Total HT</span>
                      <span className="text-2xl font-bold text-white">{tvaCalculation.totalHT.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">{getTVALabel(tvaCalculation.tvaRate)}</span>
                      <span className="text-xl text-gray-400">{tvaCalculation.tvaAmount.toFixed(2)} €</span>
                    </div>
                    <div className="border-t border-purple-700/40 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-purple-300">Total TTC</span>
                        <span className="text-3xl font-bold text-purple-400">
                          {tvaCalculation.totalTTC.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePreview}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Eye size={18} />
                Prévisualiser
              </Button>
              <Button
                onClick={handleSendToClient}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
              >
                <Send size={18} />
                {loading ? 'Envoi...' : 'Valider et envoyer'}
              </Button>
            </div>
          </>
        )}

        {/* Acompte automatique */}
        <div className="mb-6">
          <AcompteDisplay totalHT={calculateTotal()} />
        </div>

        {/* Informations bancaires */}
        <div className="mb-6">
          <BankingInfoDisplay />
        </div>

        {/* Documents PDF */}
        <div className="mb-6">
          <DocumentsSection />
        </div>
      </div>

      {/* Modale Nouveau Client */}
      <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Ajouter un nouveau client</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  value={newClientData.lastName}
                  onChange={(e) => setNewClientData({...newClientData, lastName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={newClientData.firstName}
                  onChange={(e) => setNewClientData({...newClientData, firstName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Entreprise</label>
              <input
                type="text"
                value={newClientData.company}
                onChange={(e) => setNewClientData({...newClientData, company: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Laisser vide si particulier"
              />
            </div>

            {/* Module TVA pour entreprise */}
            {newClientData.company && newClientData.company.trim() !== '' && (
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-300 mb-3">
                  Cette entreprise est-elle assujettie à la TVA ?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tvaAssujetti"
                      checked={newClientData.tvaAssujetti === true}
                      onChange={() => setNewClientData({...newClientData, tvaAssujetti: true})}
                      className="w-4 h-4"
                    />
                    <span className="text-white">Oui (auto-liquidation, TVA 0%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tvaAssujetti"
                      checked={newClientData.tvaAssujetti === false}
                      onChange={() => setNewClientData({...newClientData, tvaAssujetti: false})}
                      className="w-4 h-4"
                    />
                    <span className="text-white">Non (TVA du pays applicable)</span>
                  </label>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Numéro</label>
                <input
                  type="text"
                  value={newClientData.number}
                  onChange={(e) => setNewClientData({...newClientData, number: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">Rue *</label>
                <input
                  type="text"
                  value={newClientData.street}
                  onChange={(e) => setNewClientData({...newClientData, street: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code postal *</label>
                <input
                  type="text"
                  value={newClientData.postalCode}
                  onChange={(e) => setNewClientData({...newClientData, postalCode: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Ville *</label>
                <input
                  type="text"
                  value={newClientData.city}
                  onChange={(e) => setNewClientData({...newClientData, city: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pays *</label>
              <select
                value={newClientData.country || 'FR'}
                onChange={(e) => setNewClientData({...newClientData, country: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
              <input
                type="tel"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              onClick={() => setShowNewClientModal(false)}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddNewClient}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ajouter le client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
