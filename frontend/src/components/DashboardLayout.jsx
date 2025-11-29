import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TraiterSidebar from './TraiterSidebar';
import { useNotifications } from '@/contexts/NotificationContext';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Fermée par défaut
  const [traiterSidebarOpen, setTraiterSidebarOpen] = useState(false);
  const { notifications } = useNotifications();

  // Convertir les notifications en tâches pour la sidebar "À TRAITER"
  const tasks = notifications.map(notif => ({
    title: notif.title || 'Notification',
    description: notif.message,
    type: notif.type === 'paymentsReceived' ? 'invoice' : 'notification',
    priority: 'medium',
    date: notif.timestamp ? new Date(notif.timestamp).toLocaleDateString('fr-FR') : null
  }));

  // Ouvrir automatiquement la sidebar si des tâches existent
  React.useEffect(() => {
    if (tasks.length > 0) {
      setTraiterSidebarOpen(true);
    }
  }, [tasks.length]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } ${tasks.length > 0 ? 'lg:mr-80' : ''}`}
      >
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Sidebar "À TRAITER" à droite */}
      <TraiterSidebar 
        tasks={tasks}
        isOpen={traiterSidebarOpen}
        onClose={() => setTraiterSidebarOpen(false)}
      />
    </div>
  );
}
