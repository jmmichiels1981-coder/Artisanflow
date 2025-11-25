/**
 * Configuration globale de l'application
 * Détecte automatiquement le bon backend URL selon le domaine
 */

// Fonction pour détecter le backend URL
const getBackendURL = () => {
  // Si on est sur le domaine personnalisé, utiliser ce domaine
  if (window.location.hostname === 'artisanflow-appli.com') {
    return 'https://artisanflow-appli.com';
  }
  
  // Sinon, utiliser la variable d'environnement
  return process.env.REACT_APP_BACKEND_URL || 'https://craft-admin-2.preview.emergentagent.com';
};

export const BACKEND_URL = getBackendURL();
export const API = `${BACKEND_URL}/api`;

export default {
  BACKEND_URL,
  API
};
