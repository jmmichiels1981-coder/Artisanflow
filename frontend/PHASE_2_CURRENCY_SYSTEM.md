# 💰 PHASE 2 - Système de Gestion des Devises

## 🎯 Objectif

Gérer automatiquement la devise affichée dans toute l'application en fonction du pays sélectionné par l'artisan lors de sa configuration initiale.

---

## 📋 Règle métier

**Principe** : La devise est déterminée par le **pays de l'artisan**, pas par le pays du client.

**Exemple** :
- Un artisan français → Tous ses devis/factures en **€**
- Un artisan suisse → Tous ses devis/factures en **CHF**
- Un artisan américain → Tous ses devis/factures en **$**

---

## 🗺️ Mapping Pays → Devise

```javascript
// Déjà implémenté dans /app/frontend/src/utils/currencyMapper.js

Zone Euro : FR, BE, LU, DE, IT, ES, PT, NL, AT → €
Suisse : CH → CHF
Royaume-Uni : GB → £
USA : US → $
Canada : CA → $ CA
Australie : AU → $ AU
Nouvelle-Zélande : NZ → $ NZ
```

---

## ✅ Phase 1 - Implémentation actuelle (Mock)

### 1. Fichiers créés

**`/app/frontend/src/utils/currencyMapper.js`**
- Mapping pays → devise
- Fonction `getCurrencyForCountry(countryCode)`
- Fonction `formatAmountWithCurrency(amount, countryCode)`

**`/app/frontend/src/components/ConfigurationArtisanModal.jsx`** (modifié)
- Ajout du champ `currency` dans formData
- useEffect qui met à jour automatiquement la devise quand le pays change
- Affichage visuel de la devise sélectionnée
- Sauvegarde de la devise dans localStorage

### 2. Comportement actuel

```javascript
// Lors de la configuration
1. Artisan sélectionne "France" → currency = "EUR"
2. Artisan sélectionne "Suisse" → currency = "CHF"
3. Artisan sélectionne "USA" → currency = "USD"

// Sauvegarde dans localStorage
{
  country: "FR",
  currency: "EUR",  // 🆕 Ajouté automatiquement
  tauxHoraire: 45,
  margeMateriaux: 20,
  ...
}
```

---

## 🚀 Phase 2 - Backend & Persistance

### 1. Structure de données MongoDB

**Collection `users`** (ou `artisans`)

```javascript
{
  _id: ObjectId("..."),
  email: "artisan@example.com",
  
  // Configuration artisan
  config: {
    country: "FR",
    currency: "EUR",  // 🆕 Stocké en base
    currency_symbol: "€",
    taux_horaire: 45,
    marge_materiaux: 20,
    tva_status: "assujetti",
    banking: {
      iban: "FR76...",
      bic: "..."
    }
  },
  
  created_at: "2024-12-03T10:00:00Z",
  updated_at: "2024-12-03T10:00:00Z"
}
```

### 2. Endpoints Backend (FastAPI)

**Sauvegarder la configuration**

```python
# backend/routes/artisan.py

from pydantic import BaseModel
from typing import Optional

class ArtisanConfig(BaseModel):
    country: str
    currency: str  # 🆕
    currency_symbol: str  # 🆕
    taux_horaire: float
    marge_materiaux: float
    tva_status: str
    banking: dict

@app.put("/api/artisan/{artisan_id}/config")
async def update_artisan_config(artisan_id: str, config: ArtisanConfig):
    """
    Met à jour la configuration de l'artisan
    Inclut la devise basée sur le pays
    """
    result = await db.users.update_one(
        {"_id": ObjectId(artisan_id)},
        {"$set": {
            "config.country": config.country,
            "config.currency": config.currency,
            "config.currency_symbol": config.currency_symbol,
            "config.taux_horaire": config.taux_horaire,
            "config.marge_materiaux": config.marge_materiaux,
            "config.tva_status": config.tva_status,
            "config.banking": config.banking,
            "updated_at": datetime.now()
        }}
    )
    
    return {"success": True, "currency": config.currency}
```

**Récupérer la configuration**

```python
@app.get("/api/artisan/{artisan_id}/config")
async def get_artisan_config(artisan_id: str):
    """
    Récupère la configuration de l'artisan
    Retourne notamment la devise pour l'affichage
    """
    user = await db.users.find_one({"_id": ObjectId(artisan_id)})
    
    if not user or "config" not in user:
        return {"currency": "EUR", "currency_symbol": "€"}  # Défaut
    
    return {
        "country": user["config"]["country"],
        "currency": user["config"]["currency"],
        "currency_symbol": user["config"]["currency_symbol"],
        "taux_horaire": user["config"]["taux_horaire"],
        ...
    }
```

### 3. Création de devis avec la devise

```python
# backend/routes/devis.py

@app.post("/api/devis")
async def create_devis(devis: DevisCreate, artisan_id: str):
    """
    Crée un nouveau devis avec la devise de l'artisan
    """
    # Récupérer la config artisan
    artisan = await db.users.find_one({"_id": ObjectId(artisan_id)})
    currency = artisan["config"]["currency"]
    currency_symbol = artisan["config"]["currency_symbol"]
    
    # Créer le devis
    nouveau_devis = {
        "numero": generate_devis_number(),
        "artisan_id": artisan_id,
        "client": devis.client,
        "montant_ttc": devis.montant_ttc,
        "currency": currency,  # 🆕
        "currency_symbol": currency_symbol,  # 🆕
        "date_creation": datetime.now(),
        ...
    }
    
    result = await db.devis.insert_one(nouveau_devis)
    return nouveau_devis
```

---

## 🎨 Frontend - Utilisation de la devise

### 1. Hook personnalisé pour la devise

```javascript
// /app/frontend/src/hooks/useCurrency.js

import { useState, useEffect } from 'react';
import { getCurrencyForCountry } from '@/utils/currencyMapper';

export const useCurrency = () => {
  const [currency, setCurrency] = useState({ code: 'EUR', symbol: '€' });
  
  useEffect(() => {
    // Phase 1: Récupérer depuis localStorage
    const config = JSON.parse(localStorage.getItem('af_config_artisan') || '{}');
    
    if (config.currency) {
      const currencyInfo = getCurrencyForCountry(config.country);
      setCurrency(currencyInfo);
    }
    
    // Phase 2: Récupérer depuis l'API
    /*
    const fetchCurrency = async () => {
      const response = await fetch(`${API_URL}/artisan/config`);
      const data = await response.json();
      setCurrency({ code: data.currency, symbol: data.currency_symbol });
    };
    fetchCurrency();
    */
  }, []);
  
  const formatAmount = (amount) => {
    return `${amount.toFixed(2).replace('.', ',')} ${currency.symbol}`;
  };
  
  return { currency, formatAmount };
};
```

### 2. Utilisation dans les composants

```javascript
// Exemple dans une page de devis

import { useCurrency } from '@/hooks/useCurrency';

const DevisPage = () => {
  const { currency, formatAmount } = useCurrency();
  
  return (
    <div>
      <h1>Devis</h1>
      <p>Montant TTC : {formatAmount(5200)}</p>
      {/* Affichera : 5 200,00 € (si artisan français) */}
      {/* Affichera : 5 200,00 CHF (si artisan suisse) */}
      {/* Affichera : 5 200,00 $ (si artisan américain) */}
    </div>
  );
};
```

### 3. Composant utilitaire

```javascript
// /app/frontend/src/components/CurrencyDisplay.jsx

import React from 'react';
import { useCurrency } from '@/hooks/useCurrency';

export const CurrencyDisplay = ({ amount, className = '' }) => {
  const { formatAmount } = useCurrency();
  
  return (
    <span className={className}>
      {formatAmount(amount)}
    </span>
  );
};

// Utilisation
<CurrencyDisplay amount={5200} className="text-white font-bold" />
```

---

## 📄 Génération de PDF avec devise

### 1. Devis PDF

```python
# backend/services/pdf_generator.py

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table

def generate_devis_pdf(devis_data):
    """
    Génère un PDF de devis avec la devise correcte
    """
    currency_symbol = devis_data["currency_symbol"]
    
    # Table des prestations
    data = [
        ["Prestation", "Quantité", "Prix unitaire", "Total"],
        ["Main d'œuvre", "8h", f"45,00 {currency_symbol}", f"360,00 {currency_symbol}"],
        ["Matériaux", "1", f"200,00 {currency_symbol}", f"200,00 {currency_symbol}"],
        ["", "", "Total HT", f"560,00 {currency_symbol}"],
        ["", "", "TVA (20%)", f"112,00 {currency_symbol}"],
        ["", "", "Total TTC", f"672,00 {currency_symbol}"]
    ]
    
    table = Table(data)
    # ... style et génération PDF
```

### 2. Facture d'acompte PDF

```python
def generate_facture_acompte_pdf(facture_data):
    """
    Génère une facture d'acompte avec la devise
    """
    currency = facture_data["currency_symbol"]
    
    # Montants
    total_ttc = facture_data["total_ttc"]
    acompte = facture_data["acompte"]
    
    content = [
        f"Montant total TTC : {total_ttc:.2f} {currency}",
        f"Acompte demandé : {acompte:.2f} {currency}",
        f"Reste à payer : {(total_ttc - acompte):.2f} {currency}"
    ]
    
    # ... génération PDF
```

---

## 🧮 Module Comptabilité

### 1. Affichage des montants

```javascript
// /app/frontend/src/pages/Comptabilite.jsx

import { useCurrency } from '@/hooks/useCurrency';

const ComptabilitePage = () => {
  const { currency, formatAmount } = useCurrency();
  const [stats, setStats] = useState({
    ca_mensuel: 12500,
    tva_collectee: 2500,
    charges: 3200
  });
  
  return (
    <div>
      <h1>Comptabilité</h1>
      <div>
        <p>CA mensuel : {formatAmount(stats.ca_mensuel)}</p>
        <p>TVA collectée : {formatAmount(stats.tva_collectee)}</p>
        <p>Charges : {formatAmount(stats.charges)}</p>
      </div>
    </div>
  );
};
```

### 2. Graphiques avec devise

```javascript
// Graphique CA avec devise dynamique

const ChartCA = () => {
  const { currency } = useCurrency();
  
  const options = {
    ...
    scales: {
      y: {
        ticks: {
          callback: (value) => `${value} ${currency.symbol}`
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => `CA: ${context.parsed.y} ${currency.symbol}`
      }
    }
  };
  
  return <Line data={data} options={options} />;
};
```

---

## 📊 Tableaux avec devise

```javascript
// Tableau de devis avec devise

<table>
  <thead>
    <tr>
      <th>Client</th>
      <th>Montant TTC</th>
      <th>Acompte</th>
    </tr>
  </thead>
  <tbody>
    {devis.map(d => (
      <tr key={d.id}>
        <td>{d.client}</td>
        <td><CurrencyDisplay amount={d.montant_ttc} /></td>
        <td><CurrencyDisplay amount={d.acompte} /></td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 🔔 Notifications avec devise

```javascript
// Toast avec montant

toast.success('Paiement reçu !', {
  description: `Montant : ${formatAmount(1500)}`,
  duration: 3000
});

// Notification système
const sendNotification = (montant) => {
  const { formatAmount } = useCurrency();
  
  new Notification('Nouveau paiement', {
    body: `Vous avez reçu ${formatAmount(montant)}`
  });
};
```

---

## 🧪 Tests de non-régression

### Test 1 : Configuration initiale
1. Artisan français sélectionne "France" → Vérifier affichage "€ (EUR)"
2. Artisan suisse sélectionne "Suisse" → Vérifier affichage "CHF (CHF)"
3. Sauvegarder → Vérifier localStorage contient `currency: "EUR"` ou `"CHF"`

### Test 2 : Affichage dans les pages
1. Créer un devis
2. Vérifier que tous les montants affichent la bonne devise
3. Naviguer entre pages → Devise reste cohérente

### Test 3 : PDF généré
1. Générer un devis PDF
2. Vérifier que la devise affichée correspond au pays artisan
3. Vérifier tous les montants dans le PDF

### Test 4 : Changement de pays
1. Artisan modifie son pays (France → Suisse)
2. Vérifier que la devise change automatiquement (€ → CHF)
3. Vérifier que les nouveaux devis utilisent CHF

---

## 📝 Checklist d'implémentation Phase 2

**Backend**
- [ ] Ajouter champ `currency` dans collection `users`
- [ ] Endpoint POST `/api/artisan/config` avec gestion devise
- [ ] Endpoint GET `/api/artisan/config`
- [ ] Modifier endpoint POST `/api/devis` pour inclure devise
- [ ] Modifier endpoint POST `/api/factures` pour inclure devise
- [ ] Fonction `generate_devis_pdf()` avec devise
- [ ] Fonction `generate_facture_pdf()` avec devise

**Frontend**
- [x] Créer `/app/frontend/src/utils/currencyMapper.js` ✅
- [x] Modifier `ConfigurationArtisanModal.jsx` ✅
- [ ] Créer hook `/app/frontend/src/hooks/useCurrency.js`
- [ ] Créer composant `<CurrencyDisplay />`
- [ ] Modifier pages de devis pour utiliser useCurrency
- [ ] Modifier page comptabilité pour utiliser useCurrency
- [ ] Modifier graphiques pour afficher devise

**Tests**
- [ ] Test configuration avec différents pays
- [ ] Test affichage devise dans toutes les pages
- [ ] Test génération PDF avec devise
- [ ] Test changement de pays → changement devise

---

## 🎯 Résultat final attendu

**Cohérence totale** :
- ✅ Une seule devise par artisan (basée sur son pays)
- ✅ Tous les montants affichés avec la même devise
- ✅ PDF générés avec la bonne devise
- ✅ Comptabilité cohérente

**Simplicité** :
- ✅ Automatique (pas de saisie manuelle)
- ✅ Basé sur le pays (logique claire)
- ✅ Un seul point de configuration

**Internationalisation** :
- ✅ Support de 10+ pays
- ✅ Facilement extensible
- ✅ Prêt pour l'expansion internationale

---

**Version** : Phase 2 - Currency System v1.0  
**Date** : 2024-12-03  
**Statut** : Spécifications complètes - Phase 1 implémentée - Phase 2 documentée
