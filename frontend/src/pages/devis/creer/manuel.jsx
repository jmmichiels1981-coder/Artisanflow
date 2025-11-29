import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { API } from '@/config';

export default function DevisManuel() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    description: '',
    items: [{ name: '', quantity: 1, unit_price: 0 }],
  });

  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unit_price: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const total_ht = calculateTotal();
      const total_ttc = total_ht * 1.2; // TVA 20%

      await axios.post(`${API}/quotes`, {
        username,
        ...formData,
        total_ht,
        total_ttc,
      });

      toast.success('Devis créé avec succès !');
      navigate('/quotes');
    } catch (error) {
      toast.error('Erreur lors de la création du devis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/quotes')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            Retour aux devis
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Créer un devis (Manuel)</h1>
          <p className="text-gray-400">Saisissez les informations du devis manuellement</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Informations client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email du client *
                </label>
                <input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description du projet
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                rows={3}
                placeholder="Décrivez le projet..."
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
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
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Désignation
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Ex: Peinture chambre"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prix unitaire (€)
                    </label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-white font-semibold">
                      {(item.quantity * item.unit_price).toFixed(2)} €
                    </span>
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
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/40">
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => navigate('/quotes')}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Création...' : 'Créer le devis'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
