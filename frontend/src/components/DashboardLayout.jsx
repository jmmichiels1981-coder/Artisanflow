import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TraiterSidebar from './TraiterSidebar';
import { useNotifications } from '@/contexts/NotificationContext';
import { ChevronRight } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Fermée par défaut
  // Lire l'état de la sidebar "À TRAITER" depuis localStorage
  const [traiterSidebarOpen, setTraiterSidebarOpen] = useState(false);
  const { notifications, markAsHandled } = useNotifications();

  // Convertir les notifications en tâches pour la sidebar "À TRAITER"
  const tasks = React.useMemo(() => {
    if (!notifications || typeof notifications !== 'object') {
      return [];
    }
    
    const taskList = [];
    
    // Convertir chaque type de notification en tâche si > 0
    Object.entries(notifications).forEach(([key, count]) => {
      // IMPORTANT: Vérifier que count est un nombre ET > 0
      if (typeof count === 'number' && count > 0) {
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
          date: new Date().toLocaleDateString('fr-FR'),
          eventKey: key // Ajouter la clé pour pouvoir supprimer la notification
        });
      }
    });
    
    return taskList;
  }, [notifications]);

  // Déterminer si la sidebar doit être visible : uniquement s'il y a des tâches
  const hasTasks = tasks.length > 0;

  // Debug: Log pour vérifier l'état
  useEffect(() => {
    console.log('🔍 DashboardLayout - hasTasks:', hasTasks, 'tasks:', tasks.length, 'traiterSidebarOpen:', traiterSidebarOpen);
  }, [hasTasks, tasks, traiterSidebarOpen]);

  // Si plus de tâches, fermer automatiquement la sidebar
  useEffect(() => {
    if (!hasTasks && traiterSidebarOpen) {
      setTraiterSidebarOpen(false);
    }
  }, [hasTasks, traiterSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      {/* Sidebar "À TRAITER" à gauche - seulement si des tâches existent */}
      {hasTasks && (
        <>
          <TraiterSidebar 
            tasks={tasks}
            isOpen={traiterSidebarOpen}
            onClose={() => {
              setTraiterSidebarOpen(false);
            }}
            onTaskClick={(task) => {
              // Marquer la tâche comme traitée
              if (task.eventKey) {
                markAsHandled(task.eventKey);
              }
              // Fermer la sidebar
              setTraiterSidebarOpen(false);
            }}
            position="left"
          />
          
          {/* Bouton flottant pour ouvrir la sidebar "À TRAITER" quand fermée */}
          {!traiterSidebarOpen && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTraiterSidebarOpen(true);
              }}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-r-lg shadow-lg transition-all"
              title="Ouvrir la colonne À TRAITER"
              data-testid="open-traiter-sidebar"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </>
      )}
      
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } ${hasTasks && traiterSidebarOpen ? 'lg:ml-[400px]' : ''}`}
      >
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
