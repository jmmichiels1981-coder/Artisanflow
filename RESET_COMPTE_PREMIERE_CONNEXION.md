# 🔄 RÉINITIALISATION COMPTE - Première Connexion

**Date** : 29 Novembre 2025  
**Compte** : artisan@test.fr  
**Objectif** : Voir tous les tutoriels et messages de première connexion

---

## ✅ ÉTAPE 1 : Réinitialisation MongoDB (FAIT)

```bash
✅ Tous les devis supprimés
✅ Flags de tutoriels réinitialisés en base
```

---

## 📋 ÉTAPE 2 : Nettoyage LocalStorage (À FAIRE)

### Instructions pour l'utilisateur :

1. **Ouvrir la console du navigateur** :
   - Windows/Linux : `F12` ou `Ctrl + Shift + J`
   - Mac : `Cmd + Option + J`

2. **Aller dans l'onglet "Console"**

3. **Copier/Coller ce code** :

```javascript
// Supprimer tous les flags de tutoriels
localStorage.removeItem('af_devis_tutorial_seen');
localStorage.removeItem('af_welcome_modal_seen');
localStorage.removeItem('af_tutorial_dashboard_seen');
localStorage.removeItem('af_notification_dismissed_time');
localStorage.removeItem('af_notification_granted');

// Optionnel : Supprimer complètement tout le localStorage ArtisanFlow
// Object.keys(localStorage).forEach(key => {
//   if (key.startsWith('af_')) {
//     localStorage.removeItem(key);
//   }
// });

console.log('✅ LocalStorage nettoyé pour une première connexion');
```

4. **Appuyer sur "Entrée"**

5. **Rafraîchir la page** : `Ctrl + Shift + R` (hard refresh)

---

## 🎭 TUTORIELS QUI VONT S'AFFICHER

### 1. **Modale de Bienvenue** (Premier login)
- Affichée automatiquement à la connexion
- Scroll obligatoire jusqu'en bas pour valider
- Bouton "Commencer" en bas

### 2. **Dashboard - Tutoriels par section**
- Modale tutoriel pour chaque section (Devis, Factures, etc.)
- S'affiche au premier clic sur chaque carte
- Contenu spécifique à chaque section

### 3. **Devis - Tutoriel Création**
- Grande modale explicative avec les 3 modes :
  - 🔹 Manuel
  - 🔹 Dictée vocale (IA)
  - 🔹 Assisté par IA
- Bouton orange "OK, j'ai compris — Ne plus afficher"
- Scroll vertical si contenu long

### 4. **Sidebar "À TRAITER"** (Notifications)
- Sidebar automatique avec alertes
- Notifications clignotantes pour nouveaux événements
- Demande d'autorisation pour notifications push (PWA)

---

## 🔐 INFORMATIONS DE CONNEXION

**URL** : https://french-artisan.preview.emergentagent.com  
ou  
**URL** : www.artisanflow-appli.com

**Email** : `artisan@test.fr`  
**Mot de passe** : `Test123!`  
**PIN** : `1234`

---

## 📱 WORKFLOW PREMIÈRE CONNEXION COMPLET

```
1. Se connecter avec artisan@test.fr
   ↓
2. 🎉 Modale de Bienvenue
   - Scroll jusqu'en bas
   - Cliquer "Commencer"
   ↓
3. 🏠 Dashboard principal
   - Voir les 7 cartes
   - Cliquer sur "Devis"
   ↓
4. 📋 Page Devis
   - Voir le grand bouton "Créer un devis"
   - Cliquer dessus
   ↓
5. 📚 Modale Tutoriel Devis
   - Lire les 3 modes
   - Scroll jusqu'en bas
   - Cliquer "OK, j'ai compris — Ne plus afficher"
   ↓
6. 🎨 3 tuiles apparaissent
   - Manuel
   - Dictée vocale
   - Assisté par IA
   ↓
7. ✅ Navigation libre
```

---

## 🧪 VÉRIFICATION

### Checklist après reset :

- [ ] Modale de bienvenue s'affiche au login
- [ ] Tutoriels des sections dashboard s'affichent au premier clic
- [ ] Tutoriel création devis s'affiche au premier clic
- [ ] Sidebar "À TRAITER" apparaît (si notifications)
- [ ] Demande permission notifications (si PWA)
- [ ] Aucun devis dans la liste

---

## 🔧 DEBUGGING

### Si un tutoriel ne s'affiche pas :

1. **Vérifier localStorage** :
```javascript
console.log('Tutorial devis vu :', localStorage.getItem('af_devis_tutorial_seen'));
console.log('Welcome modal vu :', localStorage.getItem('af_welcome_modal_seen'));
```

2. **Forcer la suppression d'un flag spécifique** :
```javascript
localStorage.removeItem('af_devis_tutorial_seen');
location.reload();
```

3. **Voir tous les flags ArtisanFlow** :
```javascript
Object.keys(localStorage)
  .filter(key => key.startsWith('af_'))
  .forEach(key => console.log(key, ':', localStorage.getItem(key)));
```

---

## 📝 NOTES IMPORTANTES

### Tutoriels "One-Time"
- Une fois validés, ils ne se réaffichent plus
- C'est normal et voulu (UX)
- Pour les revoir : supprimer le flag localStorage correspondant

### Service Worker
- Si l'application est installée (PWA), le SW peut cacher les changements
- Solution : Désinstaller l'app et réinstaller
- Ou : DevTools > Application > Service Workers > "Unregister"

### Cache navigateur
- Toujours faire un hard refresh : `Ctrl + Shift + R`
- Ou vider le cache : `Ctrl + Shift + Delete`

---

## ✅ COMPTE PRÊT

Le compte `artisan@test.fr` est maintenant complètement réinitialisé.

**Prochaines étapes** :
1. Nettoyer le localStorage (console navigateur)
2. Rafraîchir la page
3. Se connecter
4. Profiter de l'expérience "première connexion" ! 🎉

---

**Réinitialisation effectuée avec succès ! 🚀**
