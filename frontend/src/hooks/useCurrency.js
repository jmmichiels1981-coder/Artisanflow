import { useState, useEffect } from 'react';
import { getCurrencyForCountry } from '@/utils/currencyMapper';

/**
 * Hook pour gérer la devise de l'artisan dans toute l'application
 * La devise est basée sur le pays sélectionné lors de la configuration
 */
export const useCurrency = () => {
  const [currency, setCurrency] = useState({ code: 'EUR', symbol: '€', name: 'Euro' });
  
  // Fonction pour charger la devise depuis localStorage
  const loadCurrency = () => {
    const configStr = localStorage.getItem('af_config_artisan');
    
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        
        if (config.country) {
          // Récupérer la devise correspondant au pays
          const currencyInfo = getCurrencyForCountry(config.country);
          setCurrency(currencyInfo);
          
          console.log('💰 Devise chargée:', currencyInfo.symbol, currencyInfo.code, 'pour pays:', config.country);
          return currencyInfo;
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la devise:', error);
      }
    } else {
      console.log('💰 Pas de config artisan, devise par défaut: EUR');
    }
    return null;
  };
  
  useEffect(() => {
    // Charger la devise au montage
    loadCurrency();
    
    // 🔧 FIX: Écouter les changements du localStorage (window.storage event)
    // Cet événement se déclenche quand localStorage change dans un autre onglet/fenêtre
    const handleStorageChange = (e) => {
      if (e.key === 'af_config_artisan' && e.newValue) {
        console.log('🔄 Changement de config détecté via storage event');
        loadCurrency();
      }
    };
    
    // 🔧 FIX: Écouter un événement personnalisé pour les changements dans le même onglet
    const handleConfigChange = () => {
      console.log('🔄 Changement de config détecté via événement personnalisé');
      loadCurrency();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('currencyConfigChanged', handleConfigChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currencyConfigChanged', handleConfigChange);
    };
  }, []);
  
  /**
   * Formate un montant avec la devise de l'artisan
   * @param {number} amount - Montant à formater
   * @param {boolean} showCode - Afficher le code (EUR) au lieu du symbole (€)
   * @returns {string} - Montant formaté avec devise
   */
  const formatAmount = (amount, showCode = false) => {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }
    
    const formattedAmount = amount.toFixed(2).replace('.', ',');
    
    if (showCode) {
      return `${formattedAmount} ${currency.code}`;
    }
    
    return `${formattedAmount} ${currency.symbol}`;
  };
  
  /**
   * Obtient juste le symbole de la devise
   * @returns {string} - Symbole (€, CHF, £, $, etc.)
   */
  const getSymbol = () => currency.symbol;
  
  /**
   * Obtient le code de la devise
   * @returns {string} - Code ISO (EUR, CHF, GBP, USD, etc.)
   */
  const getCode = () => currency.code;
  
  return { 
    currency, 
    formatAmount, 
    getSymbol, 
    getCode 
  };
};
