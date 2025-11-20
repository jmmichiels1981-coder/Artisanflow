import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="af-app-shell" data-testid="landing-page">
      <div className="af-logo-circle">
        <img src="/logo.png" alt="ArtisanFlow Logo" />
      </div>

      <div className="af-brand-title">ArtisanFlow</div>
      <div className="af-brand-subtitle" style={{ fontSize: '13px', maxWidth: '500px', margin: '0 auto 24px' }}>
        Concentrez-vous sur votre activité, ArtisanFlow automatise tout le reste.
      </div>

      <main className="af-landing-main">
        <div className="af-offer-card" style={{ padding: '14px 24px', fontSize: '13px' }} data-testid="offer-trial">
          <div>
            <strong>Accès Gratuit à toutes les fonctions jusqu'au 31 août 2026</strong>
          </div>
        </div>

        <div className="af-offer-card" style={{ padding: '14px 24px', fontSize: '13px', marginBottom: 24 }}>
          <div>
            <strong>Aucun prélèvement avant le 1er septembre</strong>
          </div>
        </div>

        <h1 className="af-landing-title">
          ArtisanFlow : L'IA gère l'intégralité, vous créez l'essentiel.
        </h1>
        <p className="af-landing-sub">
          Devis dictés, factures automatiques, gestion de stock et comptabilité IA.
        </p>

        <div className="af-landing-actions" style={{ marginTop: '32px' }}>
          <Link
            to="/login"
            className="af-btn-primary"
            style={{ maxWidth: 260 }}
            data-testid="login-button"
          >
            Connexion artisan
          </Link>

          <Link
            to="/register"
            className="af-btn-primary"
            style={{ maxWidth: 260 }}
            data-testid="register-button"
          >
            Inscription
          </Link>
        </div>

        <div className="af-admin-link" style={{ marginTop: '24px' }}>
          <a href="/admin" style={{ fontSize: '11px', opacity: 0.6 }}>accès admin</a>
        </div>
      </main>
    </div>
  );
}