import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
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

  const [activeAlerts, setActiveAlerts] = useState([]);

  const simulateEvent = (type) => {
    console.log("🔔 SIMULER ÉVÉNEMENT:", type);

    setNotifications(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));

    if (!activeAlerts.includes(type)) {
      setActiveAlerts(prev => [...prev, type]);
    }
  };

  const markAsHandled = (type) => {
    setActiveAlerts(prev => prev.filter(a => a !== type));

    setNotifications(prev => ({
      ...prev,
      [type]: 0
    }));
  };

  const fetchNotifications = async () => {
    try {
      const username = localStorage.getItem("af_username");
      if (!username) return;

      console.log("Fetching notifications for:", username);

      // IMPORTANT:
      // Do NOT create fake notifications
      // Do NOT increment anything automatically

    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      activeAlerts,
      simulateEvent,
      markAsHandled
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
