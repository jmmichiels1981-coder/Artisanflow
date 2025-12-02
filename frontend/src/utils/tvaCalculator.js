/**
 * Système centralisé de gestion de la TVA - VERSION 100% MANUELLE
 * 
 * Règles métier :
 * - L'artisan choisit son pays dans sa configuration
 * - Pour chaque devis, il sélectionne MANUELLEMENT le taux TVA applicable
 * - AUCUNE logique automatique complexe
 * - Les taux disponibles dépendent du pays de l'artisan
 */

// Taux de TVA disponibles par pays (avec identifiants uniques pour gérer les taux à 0%)
export const TVA_RATES_BY_COUNTRY = {
  FR: [
    { id: 'fr_20', rate: 20, label: '20 %' },
    { id: 'fr_10', rate: 10, label: '10 %' },
    { id: 'fr_5_5', rate: 5.5, label: '5,5 %' },
    { id: 'fr_intracom', rate: 0, label: '0 % (intracom)' },
    { id: 'fr_export', rate: 0, label: '0 % (hors UE)' }
  ],
  BE: [
    { id: 'be_21', rate: 21, label: '21 %' },
    { id: 'be_12', rate: 12, label: '12 %' },
    { id: 'be_6', rate: 6, label: '6 %' },
    { id: 'be_auto_immo', rate: 0, label: '0 % (autoliquidation B2B immobilier)' },
    { id: 'be_intracom', rate: 0, label: '0 % (intracom)' },
    { id: 'be_export', rate: 0, label: '0 % (hors UE)' }
  ],
  LU: [
    { id: 'lu_17', rate: 17, label: '17 %' },
    { id: 'lu_8', rate: 8, label: '8 %' },
    { id: 'lu_3', rate: 3, label: '3 %' },
    { id: 'lu_intracom', rate: 0, label: '0 % (intracom)' },
    { id: 'lu_export', rate: 0, label: '0 % (hors UE)' }
  ],
  DE: [
    { id: 'de_19', rate: 19, label: '19 %' },
    { id: 'de_7', rate: 7, label: '7 %' },
    { id: 'de_intracom', rate: 0, label: '0 % (intracom)' },
    { id: 'de_export', rate: 0, label: '0 % (export)' }
  ],
  IT: [
    { id: 'it_22', rate: 22, label: '22 %' },
    { id: 'it_10', rate: 10, label: '10 %' },
    { id: 'it_5', rate: 5, label: '5 %' },
    { id: 'it_4', rate: 4, label: '4 %' },
    { id: 'it_intracom', rate: 0, label: '0 % (intracom)' },
    { id: 'it_export', rate: 0, label: '0 % (export)' }
  ],
  ES: [
    { id: 'es_21', rate: 21, label: '21 %' },
    { id: 'es_10', rate: 10, label: '10 %' },
    { id: 'es_4', rate: 4, label: '4 %' },
    { id: 'es_intracom', rate: 0, label: '0 % (intracom)' },
    { id: 'es_export', rate: 0, label: '0 % (export)' }
  ],
  CH: [
    { id: 'ch_8_1', rate: 8.1, label: '8,1 %' },
    { id: 'ch_3_8', rate: 3.8, label: '3,8 %' },
    { id: 'ch_2_6', rate: 2.6, label: '2,6 %' },
    { id: 'ch_export', rate: 0, label: '0 % (export)' }
  ],
  CA: [
    { id: 'ca_14_975', rate: 14.975, label: '14,975 % (TPS + TVQ)' },
    { id: 'ca_5', rate: 5, label: '5 % (TPS)' },
    { id: 'ca_9_975', rate: 9.975, label: '9,975 % (TVQ)' },
    { id: 'ca_export', rate: 0, label: '0 % (hors Canada)' }
  ],
  US: [
    { id: 'us_0', rate: 0, label: '0 %' }
  ],
  GB: [
    { id: 'gb_20', rate: 20, label: '20 %' },
    { id: 'gb_5', rate: 5, label: '5 %' },
    { id: 'gb_zero', rate: 0, label: '0 % (zéro rate / export)' }
  ]
};

// Labels des pays avec drapeaux
export const COUNTRY_LABELS = {
  FR: '🇫🇷 France',
  BE: '🇧🇪 Belgique',
  LU: '🇱🇺 Luxembourg',
  DE: '🇩🇪 Allemagne',
  IT: '🇮🇹 Italie',
  ES: '🇪🇸 Espagne',
  CH: '🇨🇭 Suisse',
  CA: '🇨🇦 Québec (Canada)',
  US: '🇺🇸 États-Unis',
  GB: '🇬🇧 Royaume-Uni'
};

// Liste des pays pour le sélecteur (ordre alphabétique par label)
export const COUNTRIES = [
  { code: 'FR', label: COUNTRY_LABELS.FR },
  { code: 'BE', label: COUNTRY_LABELS.BE },
  { code: 'LU', label: COUNTRY_LABELS.LU },
  { code: 'DE', label: COUNTRY_LABELS.DE },
  { code: 'IT', label: COUNTRY_LABELS.IT },
  { code: 'ES', label: COUNTRY_LABELS.ES },
  { code: 'CH', label: COUNTRY_LABELS.CH },
  { code: 'CA', label: COUNTRY_LABELS.CA },
  { code: 'US', label: COUNTRY_LABELS.US },
  { code: 'GB', label: COUNTRY_LABELS.GB }
];

/**
 * Récupère le pays de l'artisan depuis sa configuration
 * @returns {string} Code pays (ex: 'FR') ou 'FR' par défaut
 */
export const getArtisanCountry = () => {
  try {
    const config = localStorage.getItem('af_config_artisan');
    if (config) {
      const parsed = JSON.parse(config);
      return parsed.country || 'FR';
    }
    return 'FR';
  } catch (e) {
    console.error('Erreur lecture pays artisan:', e);
    return 'FR';
  }
};

/**
 * Récupère les taux de TVA disponibles pour le pays de l'artisan
 * @returns {Array} Liste des taux disponibles
 */
export const getAvailableTVARates = () => {
  const country = getArtisanCountry();
  return TVA_RATES_BY_COUNTRY[country] || TVA_RATES_BY_COUNTRY.FR;
};

/**
 * Calcule les montants avec TVA (VERSION MANUELLE)
 * 
 * @param {number} totalHT - Total HT
 * @param {number} tvaRate - Taux de TVA sélectionné manuellement (ex: 20 pour 20%)
 * @returns {object} { totalHT, tvaRate, tvaAmount, totalTTC }
 */
export const calculateTVAManual = (totalHT, tvaRate) => {
  const rate = parseFloat(tvaRate) || 0;
  const tvaAmount = totalHT * (rate / 100);
  const totalTTC = totalHT + tvaAmount;

  return {
    totalHT: parseFloat(totalHT.toFixed(2)),
    tvaRate: rate,
    tvaAmount: parseFloat(tvaAmount.toFixed(2)),
    totalTTC: parseFloat(totalTTC.toFixed(2))
  };
};

/**
 * Obtient le label TVA pour affichage
 * @param {number} tvaRate - Taux de TVA
 * @returns {string} Label formaté (ex: "TVA (20%)" ou "TVA (0%)")
 */
export const getTVALabel = (tvaRate) => {
  const rate = parseFloat(tvaRate) || 0;
  return `TVA (${rate}%)`;
};
