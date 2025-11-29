import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TraiterSidebar from './TraiterSidebar';
import { useNotifications } from '@/contexts/NotificationContext';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Fermée par défaut
  const [traiterSidebarOpen, setTraiterSidebarOpen] = useState(false);
  const { notifications } = useNotifications();

  // Convertir les notifications en tâches pour la sidebar "À TRAITER"
  // Si pas de notifications, afficher un message par défaut
  const tasks = React.useMemo(() => {
    if (!notifications || typeof notifications !== 'object') {
      // Afficher message par défaut quand pas de tâches
      return [{
        title: 'Aucune tâche en attente',
        description: 'Tout est à jour ! Cliquez sur "Simuler événement" dans le dashboard pour tester.',
        type: 'notification',
        priority: 'low',
        date: new Date().toLocaleDateString('fr-FR')
      }];
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
    
    // Si aucune tâche réelle, retourner le message par défaut
    if (taskList.length === 0) {
      return [{
        title: 'Aucune tâche en attente',
        description: 'Tout est à jour ! Cliquez sur "Simuler événement" dans le dashboard pour tester.',
        type: 'notification',
        priority: 'low',
        date: new Date().toLocaleDateString('fr-FR')
      }];
    }
    
    return taskList;
  }, [notifications]);

  // Toujours ouvrir la sidebar "À TRAITER" même sans tâches (affichage par défaut)
  React.useEffect(() => {
    setTraiterSidebarOpen(true);
  }, []);

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
