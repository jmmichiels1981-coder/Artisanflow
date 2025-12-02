import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mic, MicOff, ArrowLeft, Eye, Send, UserPlus, Sparkles, RefreshCw, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import BankingInfoDisplay from '@/components/devis/BankingInfoDisplay';
import AcompteDisplay from '@/components/devis/AcompteDisplay';
import DocumentsSection from '@/components/devis/DocumentsSection';
import { getClients, addClient } from '@/utils/clientStorage';
import { COUNTRY_LABELS, calculateTVA, getTVALabel } from '@/utils/tvaCalculator';

export default function DevisAssisteParIA() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  
  const [step, setStep] = useState(1); // 1: Dictée, 2: Génération, 3: Modification
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
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
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Enregistrement démarré - Décrivez votre projet');
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
        const mockTranscription = "Je dois rénover une cuisine complète de 12 mètres carrés. Il faut démonter l'ancienne cuisine, poser un nouveau carrelage au sol, peindre les murs, installer de nouveaux meubles de cuisine haut et bas, poser un plan de travail en granit, et raccorder l'électroménager. Le client souhaite une cuisine moderne dans les tons gris et blanc.";
        setTranscription(mockTranscription);
        setFormData({ ...formData, description: mockTranscription });
        toast.success('Transcription terminée');
        setStep(2);
      }, 1000);
    }
  };

  const handleGenerateQuote = () => {
    if (!transcription) {
      toast.error('Aucune description disponible');
      return;
    }

    setLoading(true);
    
    // Mock - Génération IA complète
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
        { name: 'Démontage ancienne cuisine + évacuation', category: 'main_oeuvre', quantity: 1, unit_price: tauxHoraire * 7, purchase_price: 0, margeApplied: false },
        { name: 'Carrelage sol 12m² (pose + fourniture)', category: 'materiaux', quantity: 12, unit_price: 45, purchase_price: 36, margeApplied: true },
        { name: 'Peinture murs + plafond', category: 'main_oeuvre', quantity: 1, unit_price: tauxHoraire * 6, purchase_price: 0, margeApplied: false },
        { name: 'Meubles cuisine (haut + bas)', category: 'materiaux', quantity: 1, unit_price: 1200, purchase_price: 960, margeApplied: true },
        { name: 'Plan de travail granit (fourniture + pose)', category: 'materiaux', quantity: 1, unit_price: 890, purchase_price: 712, margeApplied: true },
        { name: 'Raccordement électroménager', category: 'main_oeuvre', quantity: 1, unit_price: tauxHoraire * 4, purchase_price: 0, margeApplied: false },
      ];
      
      setFormData({ ...formData, items: mockItems });
      setStep(3);
      setLoading(false);
      toast.success('Devis complet généré par l\'IA !');
    }, 3000);
  };

  const handleRegenerateQuote = () => {
    setLoading(true);
    toast.info('Régénération du devis avec l\'IA...');
    
    setTimeout(() => {
      toast.success('Devis régénéré avec succès !');
      setLoading(false);
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
      toast.error('Veuillez générer le devis d\'abord');
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
            <h1 className="text-3xl font-bold text-white">Créer un devis — Assisté par IA</h1>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-pink-300 text-sm font-bold rounded-full flex items-center gap-1">
              <Sparkles size={14} />
              IA
            </span>
          </div>
          <p className="text-gray-400">Décrivez votre projet, l'IA génère un devis complet</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-purple-600' : 'bg-gray-700'
            } text-white font-semibold`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              step >= 2 ? 'bg-purple-600' : 'bg-gray-700'
            }`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-purple-600' : 'bg-gray-700'
            } text-white font-semibold`}>
              2
            </div>
            <div className={`w-16 h-1 ${
              step >= 3 ? 'bg-purple-600' : 'bg-gray-700'
            }`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-purple-600' : 'bg-gray-700'
            } text-white font-semibold`}>
              3
            </div>
          </div>
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

        {/* Étape 1: Dictée vocale */}
        {step === 1 && (
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-700/40 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Étape 1 : Décrivez votre projet</h2>
              <p className="text-gray-300 mb-6">Dictez une description complète du projet : travaux, matériaux, attentes du client...</p>
              
              <div className="mb-6">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all transform hover:scale-110 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                      : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {isRecording ? (
                    <MicOff size={40} className="text-white" />
                  ) : (
                    <Mic size={40} className="text-white" />
                  )}
                </button>
              </div>
              
              <p className="text-white font-semibold">
                {isRecording ? 'Enregistrement en cours...' : transcription ? 'Enregistrement terminé' : 'Cliquez pour commencer'}
              </p>
            </div>
          </div>
        )}

        {/* Étape 2: Génération IA */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Description du projet</h2>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-gray-300">{transcription}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-700/40 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Étape 2 : Génération du devis</h2>
              <p className="text-gray-300 mb-6">L'IA va analyser votre description et générer un devis complet avec structure, matériaux, quantités et prix.</p>
              
              <Button
                onClick={handleGenerateQuote}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={24} className="mr-2" />
                    Générer le devis complet
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3: Modification et envoi */}
        {step === 3 && formData.items.length > 0 && (
          <>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Devis généré par l'IA</h2>
                <Button
                  onClick={handleRegenerateQuote}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Regénérer avec IA
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                    {editingIndex === index ? (
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
                          <span className="text-pink-400 font-semibold text-lg">
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

            {/* Total */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-700/40 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Total HT</span>
                <span className="text-2xl font-bold text-white">{calculateTotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">TVA (20%)</span>
                <span className="text-xl text-gray-400">{(calculateTotal() * 0.2).toFixed(2)} €</span>
              </div>
              <div className="border-t border-purple-700/40 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-purple-300">Total TTC</span>
                  <span className="text-3xl font-bold text-pink-400">
                    {(calculateTotal() * 1.2).toFixed(2)} €
                  </span>
                </div>
              </div>
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
              <input
                type="text"
                value={newClientData.country}
                onChange={(e) => setNewClientData({...newClientData, country: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
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
