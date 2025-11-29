import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Mic, MicOff, Save, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { API } from '@/config';

export default function DevisDicteeVocale() {
  const navigate = useNavigate();
  const username = localStorage.getItem('af_username');
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [structuredData, setStructuredData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
      toast.success('Enregistrement démarré');
    } catch (error) {
      toast.error('Erreur d\'accès au microphone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Enregistrement terminé');
    }
  };

  const processAudio = async () => {
    if (!audioBlob) {
      toast.error('Aucun enregistrement disponible');
      return;
    }

    setLoading(true);
    try {
      // Étape 1: Transcription (à implémenter avec votre backend)
      toast.info('Transcription en cours...');
      
      // TODO: Appeler votre API de transcription
      // const transcriptionResponse = await axios.post(`${API}/transcribe`, formData);
      
      // Pour la démo, simulons une transcription
      const mockTranscription = "Devis pour monsieur Dupont, email dupont@example.com. Peinture de deux chambres, 200 euros chacune. Pose de parquet dans le salon, 800 euros.";
      setTranscription(mockTranscription);
      
      // Étape 2: Structuration par IA
      toast.info('Structuration par IA...');
      
      // TODO: Appeler votre API de structuration IA
      // const structuredResponse = await axios.post(`${API}/structure-quote`, { text: transcription });
      
      // Pour la démo, simulons une structure
      const mockStructure = {
        client_name: 'Monsieur Dupont',
        client_email: 'dupont@example.com',
        description: 'Travaux de peinture et pose de parquet',
        items: [
          { name: 'Peinture chambre 1', quantity: 1, unit_price: 200 },
          { name: 'Peinture chambre 2', quantity: 1, unit_price: 200 },
          { name: 'Pose parquet salon', quantity: 1, unit_price: 800 },
        ],
      };
      
      setStructuredData(mockStructure);
      toast.success('Devis structuré avec succès !');
      
    } catch (error) {
      toast.error('Erreur lors du traitement audio');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveQuote = async () => {
    if (!structuredData) {
      toast.error('Aucune donnée à sauvegarder');
      return;
    }

    setLoading(true);
    try {
      const total_ht = structuredData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const total_ttc = total_ht * 1.2;

      await axios.post(`${API}/quotes`, {
        username,
        ...structuredData,
        total_ht,
        total_ttc,
      });

      toast.success('Devis créé avec succès !');
      navigate('/quotes');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!structuredData) return 0;
    return structuredData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
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
            <h1 className="text-3xl font-bold text-white">Dictée vocale</h1>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full flex items-center gap-1">
              <Sparkles size={14} />
              IA
            </span>
          </div>
          <p className="text-gray-400">Dictez votre devis, l'IA le structure automatiquement</p>
        </div>

        {/* Recording Section */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-700/40 mb-6">
          <div className="text-center">
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
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {isRecording ? 'Enregistrement en cours...' : 'Cliquez pour commencer'}
            </h3>
            <p className="text-gray-400 mb-4">
              Dictez les informations du devis : client, travaux, prix...
            </p>

            {audioBlob && !isRecording && (
              <Button
                onClick={processAudio}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="mr-2" />
                    Structurer avec l'IA
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Transcription */}
        {transcription && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Transcription</h3>
            <p className="text-gray-300 italic">"{transcription}"</p>
          </div>
        )}

        {/* Structured Data Preview */}
        {structuredData && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Informations extraites</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Client</span>
                  <p className="text-white font-medium">{structuredData.client_name}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Email</span>
                  <p className="text-white font-medium">{structuredData.client_email}</p>
                </div>
              </div>
              {structuredData.description && (
                <div className="mt-4">
                  <span className="text-gray-400 text-sm">Description</span>
                  <p className="text-white">{structuredData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Lignes du devis</h3>
              <div className="space-y-3">
                {structuredData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">Qté: {item.quantity}</p>
                    </div>
                    <span className="text-purple-400 font-semibold">
                      {(item.quantity * item.unit_price).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/40">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-purple-300">Total TTC</span>
                <span className="text-3xl font-bold text-purple-400">
                  {(calculateTotal() * 1.2).toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={() => navigate('/quotes')}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Annuler
              </Button>
              <Button
                onClick={saveQuote}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save size={18} className="mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder le devis'}
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/40 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Astuce :</strong> Cette fonctionnalité utilise l'IA pour transcrire et structurer automatiquement
            vos dictées vocales en devis professionnels. Parlez naturellement et l'IA s'occupe du reste !
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
