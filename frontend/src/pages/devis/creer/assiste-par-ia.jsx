import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Sparkles, Save, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { API } from '@/config';

export default function DevisAssisteParIA() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  
  const [step, setStep] = useState(1); // 1: Description, 2: Suggestions IA, 3: Finalisation
  const [projectDescription, setProjectDescription] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    description: '',
    items: [],
  });

  const generateSuggestions = async () => {
    if (!projectDescription.trim()) {
      toast.error('Veuillez décrire le projet');
      return;
    }

    setLoading(true);
    try {
      toast.info('L\'IA analyse votre projet...');
      
      // TODO: Appeler votre API d'IA pour générer les suggestions
      // const response = await axios.post(`${API}/ai/generate-quote`, { description: projectDescription });
      
      // Pour la démo, simulons une réponse IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions = {
        suggested_items: [
          { 
            name: 'Peinture murs et plafond',
            description: 'Peinture acrylique 2 couches, finition mate',
            quantity: 1,
            unit_price: 450,
            estimated_time: '2 jours'
          },
          {
            name: 'Préparation des surfaces',
            description: 'Rebouchage, ponçage, impression',
            quantity: 1,
            unit_price: 150,
            estimated_time: '1 jour'
          },
          {
            name: 'Fournitures',
            description: 'Peinture, enduit, consommables',
            quantity: 1,
            unit_price: 200,
            estimated_time: '-'
          },
        ],
        recommendations: [
          'Prévoir une peinture de qualité supérieure pour une meilleure tenue',
          'Ajouter une sous-couche pour un rendu optimal',
          'Délai estimé : 3-4 jours ouvrés',
        ],
        total_estimate: { min: 750, max: 850 },
      };
      
      setAiSuggestions(mockSuggestions);
      setFormData({
        ...formData,
        description: projectDescription,
        items: mockSuggestions.suggested_items,
      });
      setStep(2);
      toast.success('Suggestions générées !');
      
    } catch (error) {
      toast.error('Erreur lors de la génération');
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async () => {
    if (!formData.client_name || !formData.client_email) {
      toast.error('Veuillez renseigner les informations client');
      return;
    }

    setLoading(true);
    try {
      const total_ht = calculateTotal();
      const total_ttc = total_ht * 1.2;

      await axios.post(`${API}/quotes`, {
        username,
        ...formData,
        total_ht,
        total_ttc,
      });

      toast.success('Devis créé avec succès !');
      navigate('/quotes');
    } catch (error) {
      toast.error('Erreur lors de la création');
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Assisté par IA</h1>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full flex items-center gap-1">
              <Sparkles size={14} />
              IA
            </span>
          </div>
          <p className="text-gray-400">L'IA génère un devis détaillé à partir de votre description</p>
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

        {/* Step 1: Project Description */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-700/40">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="text-purple-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Décrivez votre projet</h2>
              </div>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 min-h-[200px]"
                placeholder="Exemple : Je dois peindre une chambre de 15m², murs et plafond, actuellement en blanc cassé. Le client souhaite un gris clair moderne. Les murs sont en bon état."
              />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={generateSuggestions}
                  disabled={loading || !projectDescription.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      Générer le devis avec l'IA
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-700/40 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 <strong>Conseil :</strong> Plus votre description est détaillée (surface, état actuel, attentes du client),
                plus les suggestions de l'IA seront précises et adaptées.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: AI Suggestions */}
        {step === 2 && aiSuggestions && (
          <div className="space-y-6">
            {/* Suggested Items */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Lignes suggérées par l'IA</h2>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-purple-500"
                        />
                        {item.description && (
                          <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-purple-500"
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-purple-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <span className="text-purple-400 font-semibold text-lg">
                          {(item.quantity * item.unit_price).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {aiSuggestions.recommendations && (
              <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-700/40">
                <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <Sparkles size={18} />
                  Recommandations de l'IA
                </h3>
                <ul className="space-y-2">
                  {aiSuggestions.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-200 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Total */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/40">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-purple-300">Total TTC estimé</span>
                <span className="text-3xl font-bold text-purple-400">
                  {(calculateTotal() * 1.2).toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Retour
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Client Information */}
        {step === 3 && (
          <div className="space-y-6">
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
            </div>

            {/* Summary */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Récapitulatif</h3>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-gray-300">
                    <span>{item.name} (x{item.quantity})</span>
                    <span className="text-purple-400 font-semibold">
                      {(item.quantity * item.unit_price).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-white">Total TTC</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {(calculateTotal() * 1.2).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save size={18} className="mr-2" />
                {loading ? 'Création...' : 'Créer le devis'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
