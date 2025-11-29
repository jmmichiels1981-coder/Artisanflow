import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà refusé l'installation
    const installDismissed = localStorage.getItem('af_pwa_install_dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = window.navigator.standalone || isStandalone;

    if (installDismissed || isInstalled) {
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Afficher le prompt après 3 secondes
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installée');
      // Marquer comme installé
      localStorage.setItem('af_pwa_installed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('af_pwa_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '90%',
      width: '400px',
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      border: '1px solid rgba(255, 122, 47, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 122, 47, 0.2)',
      zIndex: 9999,
      animation: 'slideUp 0.4s ease-out'
    }}>
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>

      <button
        onClick={handleDismiss}
        data-testid="pwa-dismiss-button"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <X size={16} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF7A2F 0%, #FF5C00 100%)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Smartphone size={24} color="#fff" />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff'
          }}>
            Installer ArtisanFlow
          </h3>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.5'
          }}>
            Accédez rapidement à votre espace depuis votre écran d'accueil
          </p>

          <button
            onClick={handleInstall}
            data-testid="pwa-install-button"
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #FF7A2F 0%, #FF5C00 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Download size={16} />
            Installer l'application
          </button>
        </div>
      </div>
    </div>
  );
}
