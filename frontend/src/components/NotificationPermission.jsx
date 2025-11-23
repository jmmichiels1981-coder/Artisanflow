import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';

export default function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est installée (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = window.navigator.standalone || isStandalone;
    
    // Vérifier si l'utilisateur a déjà répondu
    const notificationDismissed = localStorage.getItem('af_notification_dismissed');
    const notificationGranted = Notification.permission === 'granted';

    // Afficher seulement si :
    // 1. L'app est installée
    // 2. L'utilisateur n'a pas déjà répondu
    // 3. Les notifications ne sont pas déjà autorisées
    if (isInstalled && !notificationDismissed && !notificationGranted && Notification.permission !== 'denied') {
      // Afficher après 5 secondes
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notifications autorisées');
        localStorage.setItem('af_notification_granted', 'true');
        
        // Afficher une notification de test
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          new Notification('ArtisanFlow', {
            body: 'Les notifications sont maintenant activées ! Vous recevrez des alertes importantes.',
            icon: '/logo192.png',
            badge: '/logo192.png'
          });
        }
      }

      setShowPrompt(false);
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('af_notification_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '90%',
      width: '420px',
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      border: '1px solid rgba(255, 122, 47, 0.3)',
      borderRadius: '16px',
      padding: '24px',
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
          color: '#fff'
        }}
      >
        <X size={16} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF7A2F 0%, #FF5C00 100%)',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Bell size={28} color="#fff" />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '17px',
            fontWeight: '600',
            color: '#fff'
          }}>
            Activer les notifications
          </h3>
          <p style={{
            margin: '0 0 18px 0',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong style={{ color: '#FF7A2F' }}>Important :</strong> les notifications permettent de profiter pleinement d'ArtisanFlow.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleRequestPermission}
              style={{
                flex: 1,
                background: 'linear-gradient(90deg, #FF7A2F 0%, #FF5C00 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Activer
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
