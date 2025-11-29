import React from 'react';
import { AlertCircle, FileText, Receipt, Calendar, Bell, X } from 'lucide-react';

export default function TraiterSidebar({ tasks = [], isOpen, onClose }) {
  return (
    <>
      {/* Overlay sombre sur mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar "À TRAITER" */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-900 to-gray-950 border-l border-orange-700/40 shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-orange-400" size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">À TRAITER</h2>
            </div>
            {/* Bouton fermer (toujours visible) */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
              title="Fermer la colonne"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {tasks.length} tâche{tasks.length > 1 ? 's' : ''} en attente
          </p>
        </div>

        {/* Liste des tâches */}
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {tasks.map((task, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer hover:scale-[1.02] transition ${
                task.priority === 'high'
                  ? 'bg-red-900/20 border-red-700/40 hover:border-red-500'
                  : task.priority === 'medium'
                  ? 'bg-orange-900/20 border-orange-700/40 hover:border-orange-500'
                  : 'bg-blue-900/20 border-blue-700/40 hover:border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    task.type === 'quote'
                      ? 'bg-purple-600/20'
                      : task.type === 'invoice'
                      ? 'bg-green-600/20'
                      : task.type === 'job'
                      ? 'bg-blue-600/20'
                      : 'bg-yellow-600/20'
                  }`}
                >
                  {task.type === 'quote' && <FileText className="text-purple-400" size={20} />}
                  {task.type === 'invoice' && <Receipt className="text-green-400" size={20} />}
                  {task.type === 'job' && <Calendar className="text-blue-400" size={20} />}
                  {task.type === 'notification' && <Bell className="text-yellow-400" size={20} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">{task.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{task.description}</p>
                  {task.date && (
                    <p className="text-gray-500 text-xs mt-2">
                      📅 {task.date}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer (optionnel) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-950 border-t border-gray-800">
          <button className="w-full py-2 px-4 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-700/40 rounded-lg text-orange-400 text-sm font-semibold transition">
            Tout marquer comme lu
          </button>
        </div>
      </div>
    </>
  );
}
