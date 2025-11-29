import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Mic, MicOff, Trash2, ChevronDown, Edit, Volume2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';

export default function QuotesPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    description: '',
    items: [{ name: '', quantity: 1, unit_price: 0 }],
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(`${API}/quotes`, { params: { username } });
      setQuotes(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Enregistrement démarré...');
    } catch (error) {
      toast.error('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info('Transcription en cours...');
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const response = await axios.post(`${API}/voice/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const transcribedText = response.data.text;
      setFormData(prev => ({ ...prev, description: transcribedText }));
      toast.success('Transcription réussie !');
    } catch (error) {
      toast.error('Erreur lors de la transcription');
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

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/quotes`, formData, { params: { username } });
      toast.success('Devis créé avec succès !');
      setShowModal(false);
      fetchQuotes();
      setFormData({
        client_name: '',
        client_email: '',
        description: '',
        items: [{ name: '', quantity: 1, unit_price: 0 }],
      });
    } catch (error) {
      toast.error('Erreur lors de la création du devis');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-400">Chargement...</div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto" data-testid="quotes-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Devis</h1>
            <p className="text-gray-400">Créez et gérez vos devis</p>
          </div>
          
          {/* Dropdown Menu - Créer un devis */}
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
              data-testid="create-quote-button"
            >
              <Plus size={20} />
              Créer un devis
              <ChevronDown size={18} className={`transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showCreateMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="py-2">
                  {/* Option 1: Manuel */}
                  <button
                    onClick={() => {
                      navigate('/devis/creer/manuel');
                      setShowCreateMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Edit className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Manuel</p>
                      <p className="text-gray-400 text-xs">Saisie classique du devis</p>
                    </div>
                  </button>

                  {/* Option 2: Dictée vocale */}
                  <button
                    onClick={() => {
                      navigate('/devis/creer/dictee-vocale-structuree-par-ia');
                      setShowCreateMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Volume2 className="text-purple-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">Dictée vocale</p>
                        <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-[10px] font-bold rounded">IA</span>
                      </div>
                      <p className="text-gray-400 text-xs">Structuré par IA</p>
                    </div>
                  </button>

                  {/* Option 3: Assisté par IA */}
                  <button
                    onClick={() => {
                      navigate('/devis/creer/assiste-par-ia');
                      setShowCreateMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                      <Sparkles className="text-purple-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">Assisté par IA</p>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 text-[10px] font-bold rounded">IA</span>
                      </div>
                      <p className="text-gray-400 text-xs">Génération intelligente</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700"
              data-testid={`quote-card-${quote.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-gray-400">{quote.id}</div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    quote.status === 'draft' ? 'bg-yellow-900/50 text-yellow-400' :
                    quote.status === 'sent' ? 'bg-blue-900/50 text-blue-400' :
                    quote.status === 'accepted' ? 'bg-green-900/50 text-green-400' :
                    'bg-red-900/50 text-red-400'
                  }`}
                >
                  {quote.status === 'draft' ? 'Brouillon' :
                   quote.status === 'sent' ? 'Envoyé' :
                   quote.status === 'accepted' ? 'Accepté' : 'Refusé'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{quote.client_name}</h3>
              <p className="text-sm text-gray-400 mb-4">{quote.client_email}</p>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{quote.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">{quote.items?.length || 0} article(s)</div>
                <div className="text-xl font-bold text-orange-500">{quote.total_ttc.toFixed(2)} €</div>
              </div>
            </div>
          ))}
        </div>

        {quotes.length === 0 && (
          <div className="text-center py-20" data-testid="no-quotes">
            <p className="text-gray-400 text-lg mb-4">Aucun devis pour le moment</p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full"
            >
              Créer votre premier devis
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Nouveau devis</DialogTitle>
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
                data-testid="quote-client-name-input"
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
                data-testid="quote-client-email-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Description</label>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                  data-testid="voice-record-button"
                >
                  {isRecording ? <><MicOff size={16} /> Arrêter</> : <><Mic size={16} /> Dicter</>}
                </button>
              </div>
              <textarea
                name="description"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
                required
                data-testid="quote-description-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Articles</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-orange-500 text-sm hover:text-orange-400"
                  data-testid="add-item-button"
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
                    data-testid={`item-name-${index}`}
                  />
                  <input
                    type="number"
                    placeholder="Qté"
                    className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    required
                    min="1"
                    data-testid={`item-quantity-${index}`}
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
                    data-testid={`item-price-${index}`}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-400"
                      data-testid={`remove-item-${index}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600"
                data-testid="cancel-quote-button"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                data-testid="submit-quote-button"
              >
                Créer le devis
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}