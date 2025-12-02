import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Composants de drapeaux SVG haute résolution
const FlagFR = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ borderRadius: '2px' }}>
    <rect width="8" height="24" fill="#002395"/>
    <rect x="8" width="8" height="24" fill="#FFFFFF"/>
    <rect x="16" width="8" height="24" fill="#ED2939"/>
  </svg>
);

const FlagGB = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ borderRadius: '2px' }}>
    <rect width="24" height="24" fill="#012169"/>
    <path d="M0 0L24 24M24 0L0 24" stroke="#FFF" strokeWidth="3"/>
    <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="2"/>
    <path d="M12 0V24M0 12H24" stroke="#FFF" strokeWidth="5"/>
    <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="3"/>
  </svg>
);

const FlagDE = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ borderRadius: '2px' }}>
    <rect width="24" height="8" fill="#000000"/>
    <rect y="8" width="24" height="8" fill="#DD0000"/>
    <rect y="16" width="24" height="8" fill="#FFCE00"/>
  </svg>
);

const FlagIT = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ borderRadius: '2px' }}>
    <rect width="8" height="24" fill="#009246"/>
    <rect x="8" width="8" height="24" fill="#FFFFFF"/>
    <rect x="16" width="8" height="24" fill="#CE2B37"/>
  </svg>
);

const FlagES = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ borderRadius: '2px' }}>
    <rect width="24" height="6" fill="#AA151B"/>
    <rect y="6" width="24" height="12" fill="#F1BF00"/>
    <rect y="18" width="24" height="6" fill="#AA151B"/>
  </svg>
);

const FlagNL = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ borderRadius: '2px' }}>
    <rect width="24" height="8" fill="#AE1C28"/>
    <rect y="8" width="24" height="8" fill="#FFFFFF"/>
    <rect y="16" width="24" height="8" fill="#21468B"/>
  </svg>
);

const languages = [
  { code: 'fr', name: 'Français', Flag: FlagFR },
  { code: 'en', name: 'English', Flag: FlagGB },
  { code: 'de', name: 'Deutsch', Flag: FlagDE },
  { code: 'it', name: 'Italiano', Flag: FlagIT },
  { code: 'es', name: 'Español', Flag: FlagES },
  { code: 'nl', name: 'Nederlands', Flag: FlagNL },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('af_language', langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 140ms cubic-bezier(0.16,1,0.3,1)',
          minWidth: '120px',
          maxWidth: '140px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.10)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        }}
      >
        {/* Icône Globe */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span>{currentLanguage.name}</span>
        {/* Flèche */}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none"
          style={{
            marginLeft: 'auto',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 140ms cubic-bezier(0.16,1,0.3,1)'
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            right: '0',
            top: 'calc(100% + 8px)',
            minWidth: '220px',
            background: '#0B0B0B',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: '14px',
            boxShadow: '0 0 18px rgba(255, 122, 47, 0.35), 0 8px 32px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdownFade 140ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>
            {`
              @keyframes dropdownFade {
                from {
                  opacity: 0;
                  transform: translateY(-6px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          <div style={{ padding: '8px' }}>
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    height: '48px',
                    borderRadius: '10px',
                    background: isSelected 
                      ? 'linear-gradient(90deg, #FF7A2F 0%, #FF5C00 100%)'
                      : 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 140ms cubic-bezier(0.16,1,0.3,1)',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Drapeau SVG haute résolution */}
                  <div style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                    <lang.Flag />
                  </div>
                  
                  {/* Nom de la langue */}
                  <span style={{ flex: 1, textAlign: 'left' }}>{lang.name}</span>
                  
                  {/* Checkmark pour l'élément sélectionné */}
                  {isSelected && (
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 14 14" 
                      fill="none"
                      style={{ flexShrink: 0 }}
                    >
                      <path 
                        d="M11.6667 3.5L5.25 9.91667L2.33333 7" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
