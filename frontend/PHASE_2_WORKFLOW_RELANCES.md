# 📋 PHASE 2 - WORKFLOW COMPLET DES RELANCES

## 🎯 Objectif

Harmoniser totalement le workflow des relances pour garantir :
- Une cohérence dans les automatisations
- Une logique unique du compteur J+10
- Un classement automatique fiable
- Une analyse IA pertinente des devis refusés

---

## ✔ Règles métier essentielles

### Principe fondamental : **Une seule relance par devis**

Peu importe d'où vient la relance (page "Envoyés & en attente" ou "À relancer"), le résultat final doit être identique :
1. `date_relance` est remplie avec la date du jour
2. Le bouton de relance devient désactivé
3. Le compteur J+10 démarre
4. Après J+10 sans action → classement automatique en "Devis refusés"

---

## 📊 Cas 1 — Relance depuis "Devis envoyés & en attente"

### Contexte
- L'artisan est sur la page **"Devis envoyés & en attente"**
- Il clique sur le bouton **"Relancer"**
- Le devis a été envoyé il y a au moins 7 jours (workflow normal)

### Actions à exécuter (Phase 2)

```javascript
// Fonction handleRelancer dans EnvoyesEtEnAttente.jsx

const handleRelancer = async (devis) => {
  // 1. Envoyer l'email de relance (via API)
  await sendRelanceEmail(devis.id);
  
  // 2. Mettre à jour le devis dans la base
  await updateDevis(devis.id, {
    date_relance: new Date().toISOString(), // Date du jour
    status: 'a_relancer' // Nouveau statut
  });
  
  // 3. Déplacer le devis vers "Devis à relancer"
  // (Automatique via le changement de statut)
  
  // 4. Démarrer le compteur J+10
  // (Automatique via un cron job ou webhook qui vérifie date_relance)
  
  // 5. Toast de confirmation
  toast.success('✅ Relance envoyée avec succès', {
    description: `Le devis ${devis.devisNum} a été déplacé dans "Devis à relancer". 
                  Si aucune réponse sous 10 jours, il sera classé automatiquement en refusé.`,
    duration: 5000
  });
};
```

### Résultat attendu
- ✅ `date_relance` = date du jour
- ✅ Devis déplacé dans **"Devis à relancer"**
- ✅ Dans "Devis à relancer", le bouton "Préparer email (IA)" est **désactivé** (badge "Déjà relancé le XX")
- ✅ Compteur J+10 démarré
- ✅ Après J+10 sans action → classement automatique en "Devis refusés"

---

## 📊 Cas 2 — Relance depuis "Devis à relancer" via Modal IA

### Contexte
- L'artisan est sur la page **"Devis à relancer"**
- Il clique sur **"Préparer email (IA)"**
- Un modal s'ouvre avec un email pré-rempli par l'IA
- L'artisan peut modifier le texte si nécessaire
- Il clique sur **"Valider & envoyer"**

### Actions à exécuter (Phase 2)

```javascript
// Fonction handlePreparerEmailRelance dans ARelancer.jsx

const handlePreparerEmailRelance = async (devisId) => {
  // 1. Ouvrir le modal avec l'email généré par IA
  const emailGenere = await generateEmailIA(devisId);
  setModalData({
    isOpen: true,
    devisId: devisId,
    emailContent: emailGenere
  });
};

// Fonction handleValiderEtEnvoyer dans le modal

const handleValiderEtEnvoyer = async () => {
  // 1. Envoyer l'email (avec le contenu modifié ou non)
  await sendRelanceEmail(modalData.devisId, modalData.emailContent);
  
  // 2. Mettre à jour le devis dans la base
  await updateDevis(modalData.devisId, {
    date_relance: new Date().toISOString(), // Date du jour
    status: 'a_relancer' // Reste dans "À relancer" mais avec date_relance remplie
  });
  
  // 3. Démarrer le compteur J+10
  // (Automatique via un cron job ou webhook qui vérifie date_relance)
  
  // 4. Mettre à jour l'UI locale
  setDevisList(prevList => 
    prevList.map(d => 
      d.id === modalData.devisId 
        ? { ...d, date_relance: new Date().toISOString() }
        : d
    )
  );
  
  // 5. Fermer le modal et afficher le toast
  setModalData({ isOpen: false });
  
  toast.success('✅ Relance envoyée avec succès', {
    description: `Le bouton "Préparer email" est maintenant désactivé. 
                  Si aucune réponse sous 10 jours, le devis sera classé automatiquement en refusé.`,
    duration: 5000
  });
};
```

### Résultat attendu
- ✅ `date_relance` = date du jour
- ✅ Le bouton "Préparer email (IA)" devient **désactivé** (badge "Déjà relancé le XX")
- ✅ Compteur J+10 démarré
- ✅ Après J+10 sans action → classement automatique en "Devis refusés"

---

## 🔄 Équivalence des deux cas

Les **Cas 1** et **Cas 2** doivent produire **exactement le même résultat** :

| Élément | Cas 1 | Cas 2 | Résultat |
|---------|-------|-------|----------|
| `date_relance` | Date du jour | Date du jour | ✅ Identique |
| Bouton relance | N/A (déplacé) | Badge "Déjà relancé" | ✅ Désactivé |
| Compteur J+10 | Démarré | Démarré | ✅ Identique |
| Classement auto | Après J+10 | Après J+10 | ✅ Identique |
| Analyse IA | Disponible | Disponible | ✅ Identique |

---

## ⏱️ Workflow complet J+0 → J+17

```
J+0  : Envoi initial du devis
       └─ Statut : "envoyé"
       
J+7  : Déplacement automatique vers "Devis à relancer"
       └─ Statut : "a_relancer"
       └─ date_relance = null
       
J+7 à J+16 : Artisan peut envoyer une relance (via Cas 1 ou Cas 2)
       └─ date_relance = date du jour
       └─ Bouton désactivé
       └─ Compteur J+10 démarre
       
J+17 (= J+7 + J+10) : Sans réponse client
       └─ Statut : "refusé" (automatique)
       └─ Déplacement dans "Devis refusés"
       └─ Analyse IA générée automatiquement
```

---

## 🤖 Automatisations à implémenter (Phase 2)

### 1. Cron Job : Déplacement J+7

**Fréquence** : Toutes les heures (ou une fois par jour à minuit)

```python
# Exemple backend (FastAPI)

@app.get("/api/cron/move-to-relancer")
async def move_to_relancer():
    """
    Déplace les devis envoyés depuis 7+ jours sans réponse
    vers "Devis à relancer"
    """
    seven_days_ago = datetime.now() - timedelta(days=7)
    
    # Trouver les devis envoyés il y a 7+ jours
    devis_to_move = await db.devis.find({
        "status": "envoye",
        "date_envoi": {"$lte": seven_days_ago},
        "date_relance": None
    }).to_list(None)
    
    # Mettre à jour le statut
    for devis in devis_to_move:
        await db.devis.update_one(
            {"id": devis["id"]},
            {"$set": {"status": "a_relancer"}}
        )
        
        # Notification optionnelle
        await send_notification(devis["artisan_id"], 
                               f"Le devis {devis['numero']} est à relancer")
    
    return {"moved": len(devis_to_move)}
```

### 2. Cron Job : Classement automatique en refusé J+10

**Fréquence** : Toutes les heures (ou une fois par jour à minuit)

```python
@app.get("/api/cron/auto-refuse")
async def auto_refuse():
    """
    Classe automatiquement en refusé les devis dont la relance
    date de 10+ jours sans réponse
    """
    ten_days_ago = datetime.now() - timedelta(days=10)
    
    # Trouver les devis avec relance depuis 10+ jours
    devis_to_refuse = await db.devis.find({
        "status": "a_relancer",
        "date_relance": {"$lte": ten_days_ago, "$ne": None}
    }).to_list(None)
    
    # Mettre à jour le statut
    for devis in devis_to_refuse:
        await db.devis.update_one(
            {"id": devis["id"]},
            {"$set": {
                "status": "refuse",
                "date_refus": datetime.now(),
                "type_refus": "automatique"
            }}
        )
        
        # Générer l'analyse IA
        await generate_ai_analysis(devis["id"])
        
        # Notification optionnelle
        await send_notification(devis["artisan_id"], 
                               f"Le devis {devis['numero']} a été classé en refusé")
    
    return {"refused": len(devis_to_refuse)}
```

### 3. Génération automatique de l'analyse IA

```python
async def generate_ai_analysis(devis_id: str):
    """
    Génère une analyse IA pour un devis refusé
    """
    # Récupérer les données du devis
    devis = await db.devis.find_one({"id": devis_id})
    
    # Analyser avec l'IA
    prompt = f"""
    Analyse ce devis refusé et fournis :
    - Raison probable du refus
    - Suggestions d'amélioration
    - Comportement du client (historique)
    - Impact sur le taux de conversion
    
    Données : 
    - Montant : {devis['montant_ttc']}€
    - Délai réponse : {calculate_delay(devis)}
    - Historique client : {get_client_history(devis['client_id'])}
    """
    
    analysis = await call_ai_api(prompt)
    
    # Stocker l'analyse
    await db.devis.update_one(
        {"id": devis_id},
        {"$set": {"analyse_ia": analysis}}
    )
```

---

## 🎨 Modifications UI nécessaires (Phase 2)

### Fichier : `EnvoyesEtEnAttente.jsx`

```javascript
// Modifier la fonction handleRelancer pour appeler l'API
const handleRelancer = async (devis) => {
  try {
    // Appel API
    const response = await fetch(`${API_URL}/devis/${devis.id}/relancer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      // Retirer le devis de la liste locale (car il est déplacé)
      setDevisList(prev => prev.filter(d => d.id !== devis.id));
      
      toast.success('✅ Relance envoyée', {
        description: `Le devis a été déplacé dans "Devis à relancer"`,
        duration: 4000
      });
    }
  } catch (error) {
    toast.error('❌ Erreur lors de l\'envoi de la relance');
  }
};
```

### Fichier : `ARelancer.jsx`

```javascript
// Ajouter un modal pour l'email IA
const [modalData, setModalData] = useState({
  isOpen: false,
  devisId: null,
  emailContent: ''
});

const handlePreparerEmailRelance = async (devisId) => {
  try {
    // Générer l'email via IA
    const response = await fetch(`${API_URL}/devis/${devisId}/generate-email`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    setModalData({
      isOpen: true,
      devisId: devisId,
      emailContent: data.email_content
    });
  } catch (error) {
    toast.error('❌ Erreur lors de la génération de l\'email');
  }
};

const handleValiderEtEnvoyer = async () => {
  try {
    // Envoyer l'email
    await fetch(`${API_URL}/devis/${modalData.devisId}/send-relance`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_content: modalData.emailContent })
    });
    
    // Mettre à jour la liste locale
    setDevisList(prev => 
      prev.map(d => 
        d.id === modalData.devisId 
          ? { ...d, date_relance: new Date().toISOString() }
          : d
      )
    );
    
    setModalData({ isOpen: false });
    
    toast.success('✅ Relance envoyée', {
      description: 'Le compteur J+10 a démarré',
      duration: 4000
    });
  } catch (error) {
    toast.error('❌ Erreur lors de l\'envoi');
  }
};
```

---

## 🧪 Tests de non-régression (Phase 2)

### Test 1 : Relance depuis "Envoyés & en attente"
1. Envoyer un devis (date_envoi = aujourd'hui)
2. Attendre 7 jours (ou simuler J+7)
3. Vérifier que le devis apparaît dans "À relancer"
4. Cliquer sur "Relancer" dans "Envoyés & en attente"
5. ✅ Vérifier : date_relance remplie
6. ✅ Vérifier : devis dans "À relancer"
7. ✅ Vérifier : bouton "Préparer email" désactivé (badge)

### Test 2 : Relance depuis "À relancer"
1. Aller dans "À relancer"
2. Cliquer sur "Préparer email (IA)"
3. Modifier l'email si souhaité
4. Cliquer sur "Valider & envoyer"
5. ✅ Vérifier : date_relance remplie
6. ✅ Vérifier : bouton devient badge "Déjà relancé"
7. ✅ Vérifier : compteur J+10 démarré

### Test 3 : Classement automatique en refusé
1. Envoyer une relance (Cas 1 ou Cas 2)
2. Attendre 10 jours (ou simuler J+10)
3. Exécuter le cron job de classement
4. ✅ Vérifier : devis dans "Devis refusés"
5. ✅ Vérifier : type_refus = "automatique"
6. ✅ Vérifier : analyse IA générée

### Test 4 : Équivalence Cas 1 = Cas 2
1. Relancer un devis via Cas 1
2. Relancer un autre devis via Cas 2
3. ✅ Vérifier : les deux ont date_relance
4. ✅ Vérifier : les deux ont bouton désactivé
5. ✅ Vérifier : les deux passent en refusé après J+10

---

## 🚨 Points d'attention

### ⚠️ Gestion des fuseaux horaires
- Utiliser UTC pour toutes les dates
- Convertir en heure locale côté frontend uniquement
- Cron jobs doivent tourner en UTC

### ⚠️ Gestion des erreurs d'envoi d'email
- Si l'email échoue, ne PAS remplir date_relance
- Afficher un message d'erreur clair
- Permettre un nouvel essai

### ⚠️ Actions manuelles après relance
- Si l'artisan coche "Paiement reçu" → annuler le compteur J+10
- Si l'artisan coche "Refusé" → classer immédiatement en refusé (type = "manuel")

---

## 📝 Checklist d'implémentation Phase 2

**Backend**
- [ ] Endpoint `/api/devis/:id/relancer` (Cas 1)
- [ ] Endpoint `/api/devis/:id/generate-email` (IA)
- [ ] Endpoint `/api/devis/:id/send-relance` (Cas 2)
- [ ] Cron job déplacement J+7
- [ ] Cron job classement refus J+10
- [ ] Fonction génération analyse IA
- [ ] Gestion des erreurs d'envoi d'email

**Frontend**
- [ ] Modifier `handleRelancer` dans `EnvoyesEtEnAttente.jsx`
- [ ] Ajouter modal IA dans `ARelancer.jsx`
- [ ] Fonction `handlePreparerEmailRelance` réelle
- [ ] Fonction `handleValiderEtEnvoyer` réelle
- [ ] Affichage conditionnel du badge (déjà fait ✅)
- [ ] Gestion des états de chargement (spinner)

**Tests**
- [ ] Test relance Cas 1
- [ ] Test relance Cas 2
- [ ] Test équivalence Cas 1 = Cas 2
- [ ] Test compteur J+10
- [ ] Test classement automatique
- [ ] Test analyse IA générée

---

## 🎯 Résultat final attendu

**Cohérence totale** :
- ✅ Une seule relance par devis (quelque soit le point d'entrée)
- ✅ Un seul compteur J+10 par devis
- ✅ Un seul classement automatique après J+10
- ✅ Une seule analyse IA par refus

**Workflow clair** :
- Envoyé → (J+7) → À relancer → (Relance) → (J+10) → Refusé (auto) + Analyse IA

**Aucune régression possible** :
- Les deux cas produisent le même résultat
- Le bouton est désactivé après la première relance
- Le système est prévisible et fiable

---

**Version** : Phase 2 - Workflow Relances v1.0  
**Date** : 2024-12-03  
**Statut** : Spécifications complètes - Prêt pour implémentation
