import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Receipt, Package, Brain, Mic } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="af-app-shell" data-testid="landing-page">
      <div className="af-logo-circle">
        <img src="/logo.png" alt="ArtisanFlow Logo" />
      </div>

      <div className="af-brand-title">ArtisanFlow</div>
      <div className="af-brand-subtitle">Gérer &bull; Facturer &bull; Optimiser</div>

      <main className="af-landing-main">
        <div className="af-offer-card" data-testid="offer-trial">
          <FileText size={16} style={{ color: 'var(--accent)' }} />
          <div>
            <strong>Offre gratuite jusqu'à 14 jours</strong>{' '}
            <span style={{ color: '#c0c0e0' }}>— sans engagement</span>
          </div>
        </div>

        <div className="af-offer-card" style={{ marginBottom: 18 }}>
          <Receipt size={16} style={{ color: 'var(--accent)' }} />
          <div>
            <strong>Aucun prélèvement</strong>{' '}
            <span style={{ color: '#c0c0e0' }}>– carte bancaire non requise</span>
          </div>
        </div>

        <h1 className="af-landing-title">
          Gérez votre entreprise artisanale facilement
        </h1>
        <p className="af-landing-sub">
          Devis dictés, factures automatiques, gestion de stock et comptabilité IA.
          Un tableau de bord pensé pour les artisans qui préfèrent le terrain à la paperasse.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
            <Mic className="text-orange-500 mb-3" size={28} />
            <h3 className="font-semibold text-base mb-2">Devis dictés</h3>
            <p className="text-sm text-gray-400">Créez vos devis à la voix avec l'IA</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
            <Receipt className="text-orange-500 mb-3" size={28} />
            <h3 className="font-semibold text-base mb-2">Factures auto</h3>
            <p className="text-sm text-gray-400">Génération automatique depuis les devis</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
            <Package className="text-orange-500 mb-3" size={28} />
            <h3 className="font-semibold text-base mb-2">Gestion stock</h3>
            <p className="text-sm text-gray-400">Suivez vos matériaux en temps réel</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
            <Brain className="text-orange-500 mb-3" size={28} />
            <h3 className="font-semibold text-base mb-2">Comptabilité IA</h3>
            <p className="text-sm text-gray-400">Analyses et recommandations GPT-5</p>
          </div>
        </div>

        <div className="af-landing-actions">
          <Link
            to="/login"
            className="af-btn-primary"
            style={{ maxWidth: 260 }}
            data-testid="login-button"
          >
            Connexion artisan
          </Link>

          <Link to="/register" className="af-btn-ghost" data-testid="register-button">
            Activer mon compte
          </Link>
        </div>
      </main>
    </div>
  );
}