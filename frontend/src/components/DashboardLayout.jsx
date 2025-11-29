import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TraiterSidebar from './TraiterSidebar';
import { useNotifications } from '@/contexts/NotificationContext';
import { ChevronRight } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Fermée par défaut
  // Lire l'état de la sidebar "À TRAITER" depuis localStorage
  const [traiterSidebarOpen, setTraiterSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('af_traiter_sidebar_open');
    return saved === 'true';
  });
  const { notifications } = useNotifications();

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    localStorage.setItem('af_traiter_sidebar_open', traiterSidebarOpen);
  }, [traiterSidebarOpen]);

  // Convertir les notifications en tâches pour la sidebar "À TRAITER"
  const tasks = React.useMemo(() => {
    if (!notifications || typeof notifications !== 'object') {
      return [];
    }
    
    const taskList = [];
    
    // Convertir chaque type de notification en tâche si > 0
    Object.entries(notifications).forEach(([key, count]) => {
      if (count > 0) {
        let title = '';
        let description = '';
        let type = 'notification';
        
        switch (key) {
          case 'paymentsReceived':
            title = 'Paiement reçu';
            description = `${count} paiement${count > 1 ? 's' : ''} reçu${count > 1 ? 's' : ''}`;
            type = 'invoice';
            break;
          case 'quotesAccepted':
            title = 'Devis accepté';
            description = `${count} devis accepté${count > 1 ? 's' : ''}`;
            type = 'quote';
            break;
          case 'quotesNoResponse':
            title = 'Devis à relancer';
            description = `${count} devis sans réponse`;
            type = 'quote';
            break;
          default:
            title = 'Notification';
            description = `${count} notification${count > 1 ? 's' : ''}`;
        }
        
        taskList.push({
          title,
          description,
          type,
          priority: 'medium',
          date: new Date().toLocaleDateString('fr-FR')
        });
      }
    });
    
    return taskList;
  }, [notifications]);

  // Déterminer si la sidebar doit être visible : uniquement s'il y a des tâches
  const hasTasks = tasks.length > 0;

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
