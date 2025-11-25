import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Brain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { BACKEND_URL } from '@/config';
import { API } from '@/config';

export default function AccountingPage() {
  const username = localStorage.getItem('af_username');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const payload = {
        period,
        year,
        ...(period === 'month' && { month }),
      };

      const response = await axios.post(`${API}/accounting/analyze`, payload, {
        params: { username },
      });

      setAnalysis(response.data);
      toast.success('Analyse terminée !');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" data-testid="accounting-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white">Comptabilité IA</h1>
        </div>

        {/* Control Panel */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="text-orange-500" size={32} />
            <div>
              <h2 className="text-xl font-semibold text-white">Analyse GPT-5</h2>
              <p className="text-sm text-gray-400">
                Intelligence artificielle pour analyser votre comptabilité
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Période</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                data-testid="period-select"
              >
                <option value="month">Mois</option>
                <option value="quarter">Trimestre</option>
                <option value="year">Année</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Année</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                min="2020"
                max="2030"
                data-testid="year-input"
              />
            </div>

            {period === 'month' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mois</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  data-testid="month-select"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            data-testid="analyze-button"
          >
            {loading ? (
              <>Analyse en cours...</>
            ) : (
              <>
                <Brain size={20} />
                Lancer l'analyse IA
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="analysis-stats">
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-6 rounded-2xl border border-green-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-400" size={24} />
                  <span className="text-xs text-gray-400">REVENUS</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analysis.stats.total_revenue.toFixed(2)} €
                </div>
                <div className="text-sm text-gray-400">Total encaissé</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 p-6 rounded-2xl border border-yellow-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-yellow-400" size={24} />
                  <span className="text-xs text-gray-400">EN ATTENTE</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analysis.stats.total_pending.toFixed(2)} €
                </div>
                <div className="text-sm text-gray-400">Factures impayées</div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-2xl border border-blue-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-blue-400" size={24} />
                  <span className="text-xs text-gray-400">FACTURES</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analysis.stats.invoice_count}
                </div>
                <div className="text-sm text-gray-400">Total émis</div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="text-orange-500" size={28} />
                <h3 className="text-xl font-semibold text-white">Analyse GPT-5</h3>
              </div>
              <div
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap"
                data-testid="analysis-result"
              >
                {analysis.analysis}
              </div>
            </div>
          </div>
        )}

        {!analysis && (
          <div className="text-center py-20">
            <Brain className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-400 text-lg">
              Sélectionnez une période et lancez l'analyse pour obtenir des recommandations IA
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
