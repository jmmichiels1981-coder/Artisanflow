import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    quotesAccepted: 0,
    paymentsReceived: 0,
    datesAccepted: 0,
    datesProposed: 0,
    lowStock: 0,
    jobsCompleted: 0,
    unpaidInvoices: 0,
    quotesNoResponse: 0,
    quotesRejected: 0
  });

  const [activeAlerts, setActiveAlerts] = useState([]); // Liste des alertes actives qui clignotent

  // Simuler un événement (pour démo)
  const simulateEvent = (eventType) => {
    console.log('🔔 SIMULER ÉVÉNEMENT:', eventType);
    setNotifications(prev => {
      const newValue = {
        ...prev,
        [eventType]: (prev[eventType] || 0) + 1
      };
      console.log('📊 Nouvelles notifications:', newValue);
      return newValue;
    });
    
    // Ajouter à la liste des alertes actives (clignotement)
    if (!activeAlerts.includes(eventType)) {
      setActiveAlerts(prev => [...prev, eventType]);
    }
  };

  // Marquer une alerte comme traitée (arrêter le clignotement)
  const markAsHandled = (eventType) => {
    setActiveAlerts(prev => prev.filter(alert => alert !== eventType));
    // Optionnellement, réinitialiser le compteur
    setNotifications(prev => ({
      ...prev,
      [eventType]: 0
    }));
  };

  // Fonction pour récupérer les notifications depuis le backend (à implémenter)
  const fetchNotifications = async () => {
    try {
      const username = localStorage.getItem('af_username');
      if (!username) return;

      // TODO: Appeler l'API backend pour récupérer les vraies notifications
      // const response = await axios.get(`${API}/notifications`, { params: { username } });
      // setNotifications(response.data);
      
      console.log('Fetching notifications for:', username);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Rafraîchir les notifications toutes les 30 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    activeAlerts,
    simulateEvent,
    markAsHandled,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
