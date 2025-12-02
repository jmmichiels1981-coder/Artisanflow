/**
 * Système centralisé de gestion de la TVA
 * 
 * Règles métier :
 * - Particulier → TVA du pays du client
 * - Entreprise assujettie → TVA 0% (auto-liquidation)
 * - Entreprise non assujettie → TVA du pays du client
 */

// Taux de TVA par pays (en %)
export const TVA_RATES = {
  FR: 20,      // France
  BE: 21,      // Belgique
  LU: 17,      // Luxembourg
  DE: 19,      // Allemagne
  IT: 22,      // Italie
  ES: 21,      // Espagne
  CH: 8.1,     // Suisse
  CA: 14.975,  // Québec
  US: 0,       // USA
  GB: 20,      // Royaume-Uni
};

// Labels des pays
export const COUNTRY_LABELS = {
  FR: 'France',
  BE: 'Belgique',
  LU: 'Luxembourg',
  DE: 'Allemagne',
  IT: 'Italie',
  ES: 'Espagne',
  CH: 'Suisse',
  CA: 'Québec',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
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
