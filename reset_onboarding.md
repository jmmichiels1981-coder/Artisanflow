# 🔄 Réinitialisation complète de l'onboarding - Guide utilisateur

## ✅ Compte réinitialisé côté serveur

Le compte **artisan@test.fr** a été complètement réinitialisé :
- ✅ Tous les flags de configuration supprimés
- ✅ Compte comme nouveau (première connexion)

**Identifiants :**
- 📧 Email : `artisan@test.fr`
- 🔑 Password : `test123`
- 🔢 PIN : `1234`

---

## 🧹 Nettoyage localStorage (IMPORTANT)

Pour revivre l'expérience complète du premier login, vous devez nettoyer votre localStorage dans le navigateur.

### Option 1 : Nettoyage automatique (recommandé)

1. Ouvrez la console du navigateur (F12)
2. Collez ce script et appuyez sur Entrée :

```javascript
// Supprime TOUS les flags ArtisanFlow
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('af_')) {
    localStorage.removeItem(key);
  }
});
console.log('✅ LocalStorage nettoyé !');
location.reload();
```

### Option 2 : Nettoyage manuel

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **Application** (ou **Stockage**)
3. Cliquez sur **Local Storage** dans la barre latérale
4. Sélectionnez votre domaine
5. Supprimez toutes les clés commençant par `af_` :
   - `af_access_token` (garde celle-ci si tu es connecté)
   - `af_refresh_token` (garde celle-ci si tu es connecté)
   - `af_config_artisan`
   - `af_traiter_tutorial_seen`
   - `af_devis_creation_tutorial_seen`
   - `af_tutorial_manuel_quote_seen`
   - `af_tutorial_voice_quote_seen`
   - `af_tutorial_ai_quote_seen`
   - `af_traiter_sidebar_open`
   - `af_tutorial_*_seen` (tous les tutoriels)

### Option 3 : Navigation privée

Pour un test rapide sans affecter votre session actuelle :
1. Ouvrez une fenêtre de navigation privée (Ctrl+Shift+N sur Chrome/Edge)
2. Allez sur l'application
3. Connectez-vous avec artisan@test.fr

---

## 🎬 Scénario complet du premier login

Après le nettoyage, voici ce que vous verrez :

### 1. Page de connexion
- Formulaire email + password + PIN

### 2. Modal "Configuration de votre profil artisan"
- Taux horaire
- Marge matériaux
- Statut TVA
- Logo entreprise
- **🆕 Informations bancaires** (Titulaire, IBAN, BIC)

### 3. Modal "Tutoriel - À TRAITER"
- Explication de la colonne "À TRAITER"
- Bouton "Parfait, j'ai compris"

### 4. Dashboard
- Bouton "Simuler événement" pour tester la sidebar

### 5. Création de devis
- DEVIS → Créer un devis
- Clic sur une méthode → **Tutoriel spécifique s'affiche**
- Tutoriels disponibles :
  - 🟪 Mode Manuel
  - 🟫 Dictée vocale (structuré par IA)
  - 🟩 Assisté par IA

---

## 🧪 Flags localStorage utilisés

Pour référence, voici tous les flags que l'application utilise :

### Configuration
- `af_config_artisan` : Configuration artisan complétée

### Tutoriels
- `af_devis_creation_tutorial_seen` : Tutoriel page choix méthodes
- `af_tutorial_manuel_quote_seen` : Tutoriel mode manuel
- `af_tutorial_voice_quote_seen` : Tutoriel dictée vocale
- `af_tutorial_ai_quote_seen` : Tutoriel assisté IA
- `af_traiter_tutorial_seen` : Tutoriel sidebar "À TRAITER"
- `af_tutorial_*_seen` : Autres tutoriels par section

### État UI
- `af_traiter_sidebar_open` : État ouvert/fermé sidebar "À TRAITER"

### Session
- `af_access_token` : Token JWT
- `af_refresh_token` : Token de rafraîchissement
- `af_username` : Nom d'utilisateur
- `af_last_email` : Dernier email utilisé (pré-remplissage)

---

## ✅ Checklist de vérification

Avant de tester, assurez-vous que :
- [ ] Compte réinitialisé côté serveur (fait automatiquement)
- [ ] localStorage nettoyé dans le navigateur
- [ ] Page rechargée (F5)
- [ ] Déconnecté de toute session active

Bon test ! 🚀
