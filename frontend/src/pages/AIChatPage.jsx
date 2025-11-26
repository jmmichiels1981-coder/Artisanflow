import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AIChatPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Chat IA Métier</h1>
          <p className="text-gray-400">Votre assistant intelligent spécialisé</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Chat IA avec GPT-5</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Le chat IA métier sera bientôt disponible pour vous assister dans vos projets.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600/20 rounded-lg text-pink-400 text-sm">
            <span>🤖</span>
            <span>Propulsé par OpenAI GPT-5</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}