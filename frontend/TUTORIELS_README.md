# Gestion des Tutoriels - ArtisanFlow

## Problème résolu
Les tutoriels réapparaissaient à chaque fork car le `localStorage` du navigateur était vierge dans le nouveau preview.

## Solution implémentée

### Variable globale de contrôle
Une variable globale `window.__disableTutorials` a été ajoutée pour contrôler l'affichage des tutoriels indépendamment du `localStorage`.

### Comment désactiver les tutoriels définitivement

#### Option 1 : Via la console du navigateur
Ouvrez la console (F12) et exécutez :
```javascript
window.__disableTutorials = true;
```

#### Option 2 : Dans le fichier `/app/frontend/public/index.html`
Modifiez la ligne 23 :
```javascript
window.__disableTutorials = true; // Changez false en true
```

### Comportement
- Si `window.__disableTutorials = true` → **Aucun tutoriel ne s'affichera**, même si le `localStorage` est vide
- Si `window.__disableTutorials = false` (par défaut) → Les tutoriels s'affichent normalement selon le `localStorage`

### Composants modifiés
Tous les tutoriels ont été mis à jour pour vérifier cette variable :
- ✅ HistoriqueTutorial
- ✅ EnAttenteTutorial
- ✅ AgendaTutorial
- ✅ EnCoursTutorial
- ✅ CreerPlageTutorial
- ✅ PlanifiesToutorial
- ✅ AIQuoteTutorial
- ✅ VoiceQuoteTutorial
- ✅ ManualQuoteTutorial

### Utilisation pour les forks
Lors d'un fork, si vous souhaitez que les tutoriels ne réapparaissent pas :
1. Définissez `window.__disableTutorials = true` dans le fichier `index.html`
2. Les tutoriels seront désactivés pour tous les utilisateurs du fork

### Réactiver les tutoriels
Pour réactiver les tutoriels :
1. Remettez `window.__disableTutorials = false`
2. Les tutoriels s'afficheront selon les préférences du `localStorage`
