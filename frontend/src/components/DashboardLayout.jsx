import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Fermée par défaut

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
