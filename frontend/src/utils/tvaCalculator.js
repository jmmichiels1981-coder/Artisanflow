/**
 * Système centralisé de gestion de la TVA - VERSION MANUELLE
 * 
 * Règles métier simplifiées :
 * - L'artisan choisit son pays dans sa configuration
 * - Pour chaque devis, il sélectionne manuellement le taux TVA applicable
 * - Aucune logique automatique complexe
 */

// Taux de TVA disponibles par pays
export const TVA_RATES_BY_COUNTRY = {
  FR: [
    { rate: 20, label: '20 % (taux normal)' },
    { rate: 10, label: '10 % (taux réduit)' },
    { rate: 5.5, label: '5,5 % (taux réduit)' },
    { rate: 0, label: '0 % (autoliquidation intracom)' },
    { rate: 0, label: '0 % (export hors UE)', key: 'export' }
  ],
  BE: [
    { rate: 21, label: '21 % (taux normal)' },
    { rate: 12, label: '12 % (réduit)' },
    { rate: 6, label: '6 % (réduit)' },
    { rate: 0, label: '0 % (autoliquidation B2B — immobilier uniquement)', key: 'b2b' },
    { rate: 0, label: '0 % (autoliquidation intracom)', key: 'intracom' },
    { rate: 0, label: '0 % (export hors UE)', key: 'export' }
  ],
  LU: [
    { rate: 17, label: '17 % (taux normal)' },
    { rate: 8, label: '8 % (réduit)' },
    { rate: 3, label: '3 % (super réduit)' },
    { rate: 0, label: '0 % (intracom)', key: 'intracom' },
    { rate: 0, label: '0 % (export hors UE)', key: 'export' }
  ],
  DE: [
    { rate: 19, label: '19 % (taux normal)' },
    { rate: 7, label: '7 % (réduit)' },
    { rate: 0, label: '0 % (intracom)', key: 'intracom' },
    { rate: 0, label: '0 % (export hors UE)', key: 'export' }
  ],
  IT: [
    { rate: 22, label: '22 % (taux normal)' },
    { rate: 10, label: '10 % (réduit)' },
    { rate: 5, label: '5 % (réduit)' },
    { rate: 4, label: '4 % (super réduit)' },
    { rate: 0, label: '0 % (intracom)', key: 'intracom' },
    { rate: 0, label: '0 % (export hors UE)', key: 'export' }
  ],
  ES: [
    { rate: 21, label: '21 % (taux normal)' },
    { rate: 10, label: '10 % (réduit)' },
    { rate: 4, label: '4 % (super réduit)' },
    { rate: 0, label: '0 % (intracom)', key: 'intracom' },
    { rate: 0, label: '0 % (export hors UE)', key: 'export' }
  ],
  CH: [
    { rate: 8.1, label: '8,1 % (taux normal)' },
    { rate: 3.8, label: '3,8 % (hébergement)' },
    { rate: 2.6, label: '2,6 % (réduit)' },
    { rate: 0, label: '0 % (export)' }
  ],
  CA: [
    { rate: 14.975, label: '14,975 % (taux combiné TPS + TVQ)' },
    { rate: 5, label: '5 % (TPS seulement)' },
    { rate: 9.975, label: '9,975 % (TVQ seulement)' },
    { rate: 0, label: '0 % (hors Canada)' }
  ],
  US: [
    { rate: 0, label: '0 % (standard pour export ou service international)' }
  ],
  GB: [
    { rate: 20, label: '20 % (taux normal)' },
    { rate: 5, label: '5 % (réduit)' },
    { rate: 0, label: '0 % (zéro rate)', key: 'zero' },
    { rate: 0, label: '0 % (export)', key: 'export' },
    { rate: 0, label: '0 % (intracom entreprise étrangère)', key: 'intracom' }
  ]
};

// Labels des pays
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
  GB: '🇬🇧 Royaume-Uni',
};

/**
 * Détermine si un client est une entreprise
 * @param {object} client - Objet client
 * @returns {boolean}
 */
export const isEntreprise = (client) => {
  return client?.fullData?.company && client.fullData.company.trim() !== '';
};

/**
 * Calcule le taux de TVA applicable pour un client
 * 
 * @param {object} client - Objet client avec fullData
 * @returns {number} Taux de TVA en % (ex: 20 pour 20%)
 */
export const getTVARate = (client) => {
  if (!client || !client.fullData) {
    return 0;
  }

  const clientData = client.fullData;
  const country = clientData.country || 'FR'; // Par défaut France

  // Cas 1 : Particulier (pas d'entreprise)
  if (!clientData.company || clientData.company.trim() === '') {
    return TVA_RATES[country] || 0;
  }

  // Cas 2 : Entreprise
  // Si assujetti à la TVA → 0% (auto-liquidation)
  // Si non assujetti → TVA du pays
  if (clientData.tvaAssujetti === true) {
    return 0; // Auto-liquidation
  } else {
    return TVA_RATES[country] || 0;
  }
};

/**
 * Calcule les montants avec TVA
 * 
 * @param {number} totalHT - Total HT
 * @param {object} client - Objet client
 * @returns {object} { totalHT, tvaRate, tvaAmount, totalTTC }
 */
export const calculateTVA = (totalHT, client) => {
  const tvaRate = getTVARate(client);
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  return {
    totalHT: parseFloat(totalHT.toFixed(2)),
    tvaRate: tvaRate,
    tvaAmount: parseFloat(tvaAmount.toFixed(2)),
    totalTTC: parseFloat(totalTTC.toFixed(2))
  };
};

/**
 * Obtient le label TVA pour affichage
 * @param {number} tvaRate - Taux de TVA
 * @returns {string} Label formaté (ex: "TVA (20%)" ou "TVA (auto-liquidation)")
 */
export const getTVALabel = (tvaRate) => {
  if (tvaRate === 0) {
    return 'TVA (auto-liquidation)';
  }
  return `TVA (${tvaRate}%)`;
};

/**
 * Vérifie si un client nécessite la question TVA (entreprise)
 * @param {string} companyName - Nom de l'entreprise
 * @returns {boolean}
 */
export const needsTVAQuestion = (companyName) => {
  return companyName && companyName.trim() !== '';
};
