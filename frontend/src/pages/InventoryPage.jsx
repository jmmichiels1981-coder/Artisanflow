import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function InventoryPage() {
  const username = localStorage.getItem('af_username');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    quantity: 0,
    unit_price: 0,
    min_stock: 10,
    category: 'Matériaux',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API}/inventory`, { params: { username } });
      setInventory(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du stock');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inventory`, formData, { params: { username } });
      toast.success('Article ajouté avec succès !');
      setShowModal(false);
      fetchInventory();
      setFormData({
        name: '',
        reference: '',
        quantity: 0,
        unit_price: 0,
        min_stock: 10,
        category: 'Matériaux',
      });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'article');
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await axios.delete(`${API}/inventory/${itemId}`, { params: { username } });
      toast.success('Article supprimé');
      fetchInventory();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`${API}/inventory/${itemId}`, null, {
        params: { username, quantity: newQuantity },
      });
      toast.success('Quantité mise à jour');
      fetchInventory();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-400">Chargement...</div></div>;
  }

  return (
    <div className="min-h-screen p-6" data-testid="inventory-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-white">Gestion du stock</h1>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full flex items-center gap-2"
            data-testid="add-inventory-button"
          >
            <Plus size={20} />
            Ajouter un article
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border ${
                item.quantity <= item.min_stock ? 'border-red-600' : 'border-gray-700'
              }`}
              data-testid={`inventory-item-${item.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">{item.category}</div>
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-400"
                  data-testid={`delete-item-${item.id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">Réf: {item.reference}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Prix unitaire:</span>
                  <span className="text-white font-semibold">{item.unit_price.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stock min:</span>
                  <span className="text-white">{item.min_stock}</span>
                </div>
              </div>
              
              {item.quantity <= item.min_stock && (
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-2 mb-4">
                  <p className="text-red-400 text-xs text-center font-semibold">⚠️ Stock faible</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg"
                  data-testid={`decrease-qty-${item.id}`}
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-orange-500">{item.quantity}</div>
                  <div className="text-xs text-gray-400">en stock</div>
                </div>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg"
                  data-testid={`increase-qty-${item.id}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {inventory.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Aucun article en stock</p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full"
            >
              Ajouter votre premier article
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Nouvel article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom de l'article</label>
              <input
                type="text"
                name="name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.name}
                onChange={handleChange}
                required
                data-testid="inventory-name-input"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Référence</label>
              <input
                type="text"
                name="reference"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.reference}
                onChange={handleChange}
                required
                data-testid="inventory-reference-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Quantité</label>
                <input
                  type="number"
                  name="quantity"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  data-testid="inventory-quantity-input"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Stock minimum</label>
                <input
                  type="number"
                  name="min_stock"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.min_stock}
                  onChange={handleChange}
                  required
                  min="0"
                  data-testid="inventory-minstock-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Prix unitaire (€)</label>
              <input
                type="number"
                name="unit_price"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.unit_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                data-testid="inventory-price-input"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
              <select
                name="category"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.category}
                onChange={handleChange}
                data-testid="inventory-category-select"
              >
                <option value="Matériaux">Matériaux</option>
                <option value="Outils">Outils</option>
                <option value="Consommables">Consommables</option>
                <option value="Équipements">Equipements</option>
                <option value="Autres">Autres</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                data-testid="submit-inventory-button"
              >
                Ajouter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}