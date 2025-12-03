// currencyMapper.js - Mapping pays → devise pour l'application ArtisanFlow

/**
 * Mapping des codes pays ISO vers les devises
 * Utilisé pour afficher automatiquement la bonne devise selon le pays de l'artisan
 */
export const CURRENCY_BY_COUNTRY = {
  // Zone Euro
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  BE: { code: 'EUR', symbol: '€', name: 'Euro' },
  LU: { code: 'EUR', symbol: '€', name: 'Euro' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  PT: { code: 'EUR', symbol: '€', name: 'Euro' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro' },
  AT: { code: 'EUR', symbol: '€', name: 'Euro' },
  
  // Autres pays européens
  CH: { code: 'CHF', symbol: 'CHF', name: 'Franc suisse' },
  GB: { code: 'GBP', symbol: '£', name: 'Livre sterling' },
  
  // Amérique du Nord
  US: { code: 'USD', symbol: '$', name: 'Dollar américain' },
  CA: { code: 'CAD', symbol: '$ CA', name: 'Dollar canadien' },
  
  // Océanie
  AU: { code: 'AUD', symbol: '$ AU', name: 'Dollar australien' },
  NZ: { code: 'NZD', symbol: '$ NZ', name: 'Dollar néo-zélandais' }
};

/**
 * Récupère les informations de devise pour un pays donné
 * @param {string} countryCode - Code pays ISO (ex: 'FR', 'US', 'CH')
 * @returns {object} - Objet contenant code, symbol et name de la devise
 */
export const getCurrencyForCountry = (countryCode) => {
  return CURRENCY_BY_COUNTRY[countryCode] || CURRENCY_BY_COUNTRY['FR']; // Défaut: Euro
};

/**
 * Formate un montant avec la devise appropriée
 * @param {number} amount - Montant à formater
 * @param {string} countryCode - Code pays ISO
 * @param {boolean} showCode - Afficher le code devise au lieu du symbole
 * @returns {string} - Montant formaté avec devise
 */
export const formatAmountWithCurrency = (amount, countryCode, showCode = false) => {
  const currency = getCurrencyForCountry(countryCode);
  const formattedAmount = amount.toFixed(2).replace('.', ',');
  
  if (showCode) {
    return `${formattedAmount} ${currency.code}`;
  }
  
  return `${formattedAmount} ${currency.symbol}`;
};

/**
 * Liste de tous les pays supportés avec leurs devises
 * Utilisé pour l'affichage dans les sélecteurs
 */
export const COUNTRIES_WITH_CURRENCY = Object.keys(CURRENCY_BY_COUNTRY).map(code => ({
  code,
  currency: CURRENCY_BY_COUNTRY[code]
}));
