import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lightbulb } from 'lucide-react';

export default function TutorialModal({ isOpen, onClose, section, title, content }) {
  const handleDismiss = () => {
    // Marquer cette section comme vue dans localStorage
    localStorage.setItem(`af_tutorial_${section}_seen`, 'true');
    onClose();
  };



  // Guard: Do not render if content is missing or not open
  if (!isOpen || !content || !title) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
              <Lightbulb className="text-orange-500" size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold text-orange-500">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2 text-gray-300 leading-relaxed">
          {/* Split content by line breaks and render */}
          {content.split('\n').map((paragraph, index) => {
            // Skip empty lines
            if (!paragraph.trim()) return null;

            // Check if it's a bullet point
            if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
              return (
                <div key={index} className="flex gap-3 mb-3 items-start">
                  <CheckCircle className="text-orange-500 flex-shrink-0 mt-1" size={16} />
                  <p className="text-sm">{paragraph.trim().replace(/^[•-]\s*/, '')}</p>
                </div>
              );
            }

            // Check if it's a title (contains emojis or all caps)
            if (paragraph.includes('🔧') || paragraph.includes('✉️') || paragraph.match(/^[A-ZÀÈÉÊËÎÏÔÙÛÜ\s]+:/)) {
              return (
                <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
                  {paragraph}
                </h3>
              );
            }

            // Regular paragraph
            return (
              <p key={index} className="mb-3 text-sm">
                {paragraph}
              </p>
            );
          })}
        </div>

        <div className="flex justify-center mt-6 flex-shrink-0 pt-4 border-t border-gray-800">
          <Button
            onClick={handleDismiss}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-base font-semibold"
          >
            ✓ OK j'ai compris, ne plus afficher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
