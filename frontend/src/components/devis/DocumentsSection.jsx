import React from 'react';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DocumentsSection() {
  const handlePreview = () => {
    toast.info('🚧 Prévisualisation PDF - Fonctionnalité en développement');
  };
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-3">
        📎 Documents qui seront envoyés au client
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded border border-gray-700">
          <FileText className="text-orange-400" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">devis.pdf</p>
            <p className="text-xs text-gray-500">Devis complet avec lignes de travaux et matériaux</p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Mock</span>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded border border-gray-700">
          <FileText className="text-blue-400" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">facture_acompte.pdf</p>
            <p className="text-xs text-gray-500">Facture d'acompte avec coordonnées bancaires</p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Mock</span>
        </div>
      </div>
      
      <Button
        onClick={handlePreview}
        variant="outline"
        className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
        disabled
      >
        <Eye size={16} className="mr-2" />
        Prévisualiser les PDF (non encore disponible)
      </Button>
    </div>
  );
}
