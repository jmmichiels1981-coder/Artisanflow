import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';

export default function InvoicesPage() {
  const username = localStorage.getItem('af_username');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    description: '',
    items: [{ name: '', quantity: 1, unit_price: 0 }],
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`, { params: { username } });
      setInvoices(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unit_price: 0 }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/invoices`, formData, { params: { username } });
      toast.success('Facture créée avec succès !');
      setShowModal(false);
      fetchInvoices();
      setFormData({
        client_name: '',
        client_email: '',
        description: '',
        items: [{ name: '', quantity: 1, unit_price: 0 }],
      });
    } catch (error) {
      toast.error('Erreur lors de la création de la facture');
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      await axios.put(`${API}/invoices/${invoiceId}/status`, null, {
        params: { username, status: 'paid' },
      });
      toast.success('Facture marquée comme payée');
      fetchInvoices();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-400">Chargement...</div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto" data-testid="invoices-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Factures</h1>
            <p className="text-gray-400">Gérez vos factures et paiements</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full flex items-center gap-2"
            data-testid="create-invoice-button"
          >
            <Plus size={20} />
            Nouvelle facture
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700"
              data-testid={`invoice-card-${invoice.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-gray-400">{invoice.id}</div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-900/50 text-green-400' :
                    invoice.status === 'unpaid' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}
                >
                  {invoice.status === 'paid' ? 'Payée' :
                   invoice.status === 'unpaid' ? 'Impayée' : 'Annulée'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{invoice.client_name}</h3>
              <p className="text-sm text-gray-400 mb-4">{invoice.client_email}</p>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{invoice.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">{invoice.items?.length || 0} article(s)</div>
                <div className="text-xl font-bold text-orange-500">{invoice.total_ttc.toFixed(2)} €</div>
              </div>
              {invoice.status === 'unpaid' && (
                <button
                  onClick={() => markAsPaid(invoice.id)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  data-testid={`mark-paid-${invoice.id}`}
                >
                  <Check size={18} />
                  Marquer comme payée
                </button>
              )}
            </div>
          ))}
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Aucune facture pour le moment</p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full"
            >
              Créer votre première facture
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Nouvelle facture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom du client</label>
              <input
                type="text"
                name="client_name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.client_name}
                onChange={handleChange}
                required
                data-testid="invoice-client-name-input"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email du client</label>
              <input
                type="email"
                name="client_email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.client_email}
                onChange={handleChange}
                required
                data-testid="invoice-client-email-input"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                name="description"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
                required
                data-testid="invoice-description-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Articles</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-orange-500 text-sm hover:text-orange-400"
                  data-testid="add-invoice-item-button"
                >
                  + Ajouter un article
                </button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nom"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qté"
                    className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Prix"
                    className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
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
                data-testid="submit-invoice-button"
              >
                Créer la facture
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}