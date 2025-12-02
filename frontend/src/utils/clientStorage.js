/**
 * Gestion centralisée des clients dans localStorage
 * Permet de partager la liste de clients entre toutes les pages de création de devis
 */

const STORAGE_KEY = 'af_clients';

// Clients mock par défaut
const DEFAULT_CLIENTS = [
  { id: 1, name: 'Dupont Jean', email: 'jean.dupont@example.com', phone: '' },
  { id: 2, name: 'Martin Sophie', email: 'sophie.martin@example.com', phone: '' },
  { id: 3, name: 'Bernard Entreprise SARL', email: 'contact@bernard.fr', phone: '' }
];

/**
 * Récupérer tous les clients
 */
export const getClients = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialiser avec les clients par défaut
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLIENTS));
    return DEFAULT_CLIENTS;
  } catch (e) {
    console.error('Erreur lecture clients:', e);
    return DEFAULT_CLIENTS;
  }
};

/**
 * Ajouter un nouveau client
 * @returns {object} Le client créé ou null si doublon
 */
export const addClient = (clientData) => {
  try {
    const clients = getClients();
    
    // Vérifier les doublons (email unique)
    const existingByEmail = clients.find(c => 
      c.email.toLowerCase() === clientData.email.toLowerCase()
    );
    
    if (existingByEmail) {
      return { error: 'Un client avec cet email existe déjà', duplicate: true };
    }
    
    // Vérifier doublon par nom + prénom (si pas de société)
    if (!clientData.company) {
      const fullName = `${clientData.firstName} ${clientData.lastName}`.toLowerCase();
      const existingByName = clients.find(c => 
        c.name.toLowerCase() === fullName
      );
      
      if (existingByName) {
        return { error: 'Un client avec ce nom existe déjà', duplicate: true };
      }
    }
    
    // Enrichir les données client
    const enrichedClientData = {
      ...clientData
    };
    
    // Créer le nouveau client
    const newId = Math.max(...clients.map(c => c.id), 0) + 1;
    const newClient = {
      id: newId,
      name: `${clientData.firstName} ${clientData.lastName}${clientData.company ? ` (${clientData.company})` : ''}`,
      email: clientData.email,
      phone: clientData.phone || '',
      // Stocker toutes les données enrichies pour usage futur
      fullData: enrichedClientData
    };
    
    clients.push(newClient);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    
    return { client: newClient, success: true };
  } catch (e) {
    console.error('Erreur ajout client:', e);
    return { error: 'Erreur lors de l\'ajout du client' };
  }
};

/**
 * Supprimer un client
 */
export const deleteClient = (clientId) => {
  try {
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== clientId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Erreur suppression client:', e);
    return false;
  }
};

/**
 * Mettre à jour un client
 */
export const updateClient = (clientId, updatedData) => {
  try {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updatedData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Erreur mise à jour client:', e);
    return false;
  }
};
