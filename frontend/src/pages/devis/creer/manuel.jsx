import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Eye, Send, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import BankingInfoDisplay from '@/components/devis/BankingInfoDisplay';
import AcompteDisplay from '@/components/devis/AcompteDisplay';
import DocumentsSection from '@/components/devis/DocumentsSection';
import { getClients, addClient } from '@/utils/clientStorage';

export default function DevisManuel() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  
  // Mock - Informations entreprise (pré-remplies depuis inscription)
  const [companyInfo] = useState({
    name: 'SARL ArtisanFlow',
    address: '123 Rue de la République',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
    siret: '123 456 789 00012',
    tva: 'FR12345678900'
  });

  // Liste clients depuis localStorage (partagée entre toutes les pages)
  const [clients, setClients] = useState([]);
  
  // Charger les clients au montage
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
    country: 'France',
    email: '',
    phone: ''
  });
  
  const [formData, setFormData] = useState(() => {
    const config = localStorage.getItem('af_config_artisan');
    let initialPrice = 0;
    if (config) {
      try {
        const configData = JSON.parse(config);
        initialPrice = parseFloat(configData.tauxHoraire) || 0;
      } catch (e) {
        console.error('Erreur lecture config artisan:', e);
      }
    }
    
    return {
      description: '',
      items: [{ name: '', category: 'main_oeuvre', quantity: 1, unit_price: initialPrice, purchase_price: 0 }],
    };
  });

  const [loading, setLoading] = useState(false);

  // Fonction utilitaire pour obtenir la config artisan
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

  const addItem = () => {
    const config = getArtisanConfig();
    const newItem = { 
      name: '', 
      category: 'main_oeuvre', 
      quantity: 1, 
      unit_price: 0,
      purchase_price: 0
    };
    
    // Si la catégorie par défaut est "main_oeuvre", remplir avec le taux horaire
    if (config && config.tauxHoraire) {
      newItem.unit_price = parseFloat(config.tauxHoraire);
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    const config = getArtisanConfig();
    
    // Si la catégorie change vers "main_oeuvre", remplir automatiquement le prix avec le taux horaire
    if (field === 'category' && value === 'main_oeuvre') {
      if (config && config.tauxHoraire) {
        newItems[index].unit_price = parseFloat(config.tauxHoraire);
        newItems[index].purchase_price = 0; // Réinitialiser le prix d'achat
      }
    }
    
    // Si la catégorie change vers "materiaux", réinitialiser les prix
    if (field === 'category' && value === 'materiaux') {
      newItems[index].unit_price = 0;
      newItems[index].purchase_price = 0;
    }
    
    // Si on modifie le prix d'achat pour un matériau, calculer automatiquement le prix HTVA
    if (field === 'purchase_price' && newItems[index].category === 'materiaux') {
      const purchasePrice = parseFloat(value) || 0;
      if (config && config.margeMateriaux) {
        const marge = parseFloat(config.margeMateriaux);
        newItems[index].unit_price = purchasePrice * (1 + marge / 100);
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const handleAddNewClient = () => {
    // Validation
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
      toast.error('Veuillez remplir au minimum : Prénom, Nom et Email');
      return;
    }
    
    // Ajouter le client via le système centralisé
    const result = addClient(newClientData);
    
    if (result.error) {
      toast.error(result.error);
      return;
    }
    
    if (result.success && result.client) {
      // Mettre à jour la liste locale
      setClients(getClients());
      
      // Sélectionner automatiquement le nouveau client
      setSelectedClient(result.client.id);
      
      toast.success(`Client ${newClientData.firstName} ${newClientData.lastName} ajouté avec succès !`);
      
      // Fermer la modale et réinitialiser le formulaire
      setShowNewClientModal(false);
      setNewClientData({
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        number: '',
        postalCode: '',
        city: '',
        country: 'France',
        email: '',
        phone: ''
      });
    }
  };

  const handlePreview = () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    // Mock - Prévisualisation
    toast.info('Prévisualisation du devis (fonctionnalité à venir)');
  };

  const handleSendToClient = async () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].name) {
      toast.error('Veuillez ajouter au moins une ligne au devis');
      return;
    }

    setLoading(true);
    
    // Mock - Envoi email
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
          <h1 className="text-3xl font-bold text-white mb-2">Créer un devis — Manuel</h1>
          <p className="text-gray-400">Saisissez les informations du devis manuellement</p>
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

        {/* Description projet */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Description du projet</h2>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            rows={3}
            placeholder="Décrivez le projet..."
          />
        </div>

        {/* Lignes du devis */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Lignes du devis</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <Plus size={18} />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                <div className="grid grid-cols-12 gap-4">
                  {/* Catégorie */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="main_oeuvre">Main d'œuvre</option>
                      <option value="materiaux">Matériaux</option>
                    </select>
                  </div>

                  {/* Désignation */}
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Désignation
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Ex: Peinture chambre"
                    />
                  </div>

                  {/* Quantité */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      min="1"
                    />
                  </div>

                  {/* Prix - Adapté selon la catégorie */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {item.category === 'materiaux' ? 'Prix d\'achat (€)' : 'Prix HT (€)'}
                    </label>
                    <input
                      type="number"
                      value={item.category === 'materiaux' ? item.purchase_price : item.unit_price}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (item.category === 'materiaux') {
                          updateItem(index, 'purchase_price', value);
                        } else {
                          updateItem(index, 'unit_price', value);
                        }
                      }}
                      onBlur={(e) => {
                        // Sur blur, si matériaux, calculer automatiquement le prix avec marge
                        if (item.category === 'materiaux') {
                          const purchasePrice = parseFloat(e.target.value) || 0;
                          const config = getArtisanConfig();
                          if (config && config.margeMateriaux) {
                            const marge = parseFloat(config.margeMateriaux);
                            const finalPrice = purchasePrice * (1 + marge / 100);
                            updateItem(index, 'unit_price', finalPrice);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      min="0"
                      step="0.01"
                      placeholder={item.category === 'materiaux' ? 'Prix d\'achat' : 'Prix HT'}
                    />
                    {item.category === 'materiaux' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Marge appliquée automatiquement au calcul
                      </p>
                    )}
                  </div>

                  {/* Total + Supprimer */}
                  <div className="col-span-4 md:col-span-1 flex items-end justify-between">
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-2">Total</span>
                      <span className="text-white font-semibold block">
                        {(item.quantity * item.unit_price).toFixed(2)} €
                      </span>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/40 mb-6">
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
              <span className="text-3xl font-bold text-purple-400">
                {(calculateTotal() * 1.2).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

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
            {loading ? 'Envoi...' : 'Envoyer au client'}
          </Button>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newClientData.lastName}
                  onChange={(e) => setNewClientData({...newClientData, lastName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={newClientData.firstName}
                  onChange={(e) => setNewClientData({...newClientData, firstName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Entreprise
              </label>
              <input
                type="text"
                value={newClientData.company}
                onChange={(e) => setNewClientData({...newClientData, company: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Numéro
                </label>
                <input
                  type="text"
                  value={newClientData.number}
                  onChange={(e) => setNewClientData({...newClientData, number: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rue *
                </label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={newClientData.postalCode}
                  onChange={(e) => setNewClientData({...newClientData, postalCode: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={newClientData.city}
                  onChange={(e) => setNewClientData({...newClientData, city: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pays *
              </label>
              <input
                type="text"
                value={newClientData.country}
                onChange={(e) => setNewClientData({...newClientData, country: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone *
              </label>
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
