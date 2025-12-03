import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TraiterSidebar from './TraiterSidebar';
import { useNotifications } from '@/contexts/NotificationContext';
import { eventBus } from '@/utils/eventBus';
import { ChevronRight } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Always closed by default
  const [traiterSidebarOpen, setTraiterSidebarOpen] = useState(false);
  const { notifications, markAsHandled } = useNotifications();

  console.log("🔒 DashboardLayout monté - traiterSidebarOpen:", traiterSidebarOpen);

  // Prevent sidebar opening on FIRST login
  useEffect(() => {
    const firstLoginFlag = localStorage.getItem("af_first_login");

    if (firstLoginFlag === "true") {
      console.log("🔒 PREMIER LOGIN → La sidebar À TRAITER est désactivée");
      setTraiterSidebarOpen(false);
    }
  }, []);

  // Listen for REAL open events only
  useEffect(() => {
    const openHandler = () => {
      console.log("🔓 ÉVÉNEMENT DÉTECTÉ: openTraiterSidebar");
      setTraiterSidebarOpen(true);
    };

    eventBus.on("openTraiterSidebar", openHandler);

    return () => {
      eventBus.off("openTraiterSidebar", openHandler);
    };
  }, []);

  const closeSidebar = () => {
    console.log("🔒 Fermeture manuelle sidebar");
    setTraiterSidebarOpen(false);
  };

  // Convert notifications → tasks ONLY if > 0
  const tasks = React.useMemo(() => {
    console.log('📊 Notifications actuelles:', notifications);
    
    if (!notifications) return [];

    const list = [];

    Object.entries(notifications).forEach(([key, count]) => {
      if (!count || count === 0) return; // 🔥 FIX: NO FAKE TASKS
      
      console.log(`✅ Tâche détectée: ${key} = ${count}`);

      let title = "";
      let description = "";
      let type = "notification";

      switch (key) {
        case "paymentsReceived":
          title = "Paiement reçu";
          description = `${count} paiement${count > 1 ? "s" : ""}`;
          type = "invoice";
          break;
        case "quotesAccepted":
          title = "Devis accepté";
          description = `${count} devis accepté${count > 1 ? "s" : ""}`;
          type = "quote";
          break;
        case "quotesNoResponse":
          title = "Devis à relancer";
          description = `${count} devis sans réponse`;
          type = "quote";
          break;
        default:
          title = "Notification";
          description = `${count} notification${count > 1 ? "s" : ""}`;
      }

      list.push({
        title,
        description,
        type,
        priority: "medium",
        eventKey: key,
        date: new Date().toLocaleDateString("fr-FR")
      });
    });

    console.log(`📋 Total tâches créées: ${list.length}`);
    return list;
  }, [notifications]);

  // FIX : Sidebar only exists if REAL tasks exist
  const hasTasks = tasks.length > 0;
  console.log(`🎯 hasTasks = ${hasTasks}, traiterSidebarOpen = ${traiterSidebarOpen}`);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Show sidebar ONLY if tasks exist */}
      {hasTasks && (
        <>
          <TraiterSidebar 
            tasks={tasks}
            isOpen={traiterSidebarOpen}
            onClose={closeSidebar}
            onTaskClick={(task) => {
              if (task.eventKey) {
                markAsHandled(task.eventKey);
              }
              closeSidebar();
            }}
            position="left"
          />

          {!traiterSidebarOpen && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setTraiterSidebarOpen(true);
              }}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-r-lg shadow-lg transition-all"
              title="Ouvrir la colonne À TRAITER"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </>
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } ${hasTasks && traiterSidebarOpen ? "lg:ml-[400px]" : ""}`}
      >
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
