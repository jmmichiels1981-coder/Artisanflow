#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Frontend Batch - Ajout de fonctionnalités UX pour ArtisanFlow:
  1. Sélecteur de langue (Français, English, Deutsch, Italiano, Español, Nederlands)
  2. Champ "Profession" dans le formulaire d'inscription avec 95+ métiers d'artisans
  3. Auto-déconnexion lors de la fermeture de l'onglet/navigateur
  4. Pré-remplissage automatique de l'email sur la page de connexion

backend:
  - task: "Ajout champs profession et professionOther dans User model et RegisterRequest"
    implemented: true
    working: "NA"
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Refonte complète de l'endpoint:
          - Ajout des paramètres firstName, lastName, companyName, countryCode dans SetupIntentRequest
          - Création du Customer avec toutes les infos (nom complet, email, metadata) AVANT le SetupIntent
          - SetupIntent lié à ce Customer
          - Logs détaillés ajoutés pour débugger le flux
          - Customer maintenant créé avec description et metadata complètes
      - working: "NA"
        agent: "main"
        comment: |
          Ajout de 2 nouveaux champs dans le modèle User et RegisterRequest:
          - profession: str (métier de l'artisan)
          - professionOther: str (si "Autre" est sélectionné)
          
          Mise à jour de l'endpoint /auth/register pour:
          - Accepter ces 2 nouveaux champs
          - Les sauvegarder dans MongoDB lors de la création de l'utilisateur
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Amélioration de la logique d'enregistrement:
          - Récupération du Customer existant depuis le payment_method (créé dans setup-intent)
          - Mise à jour du Customer avec infos complètes (username, stage, metadata)
          - Création de la Subscription avec trial_end jusqu'au 1er septembre 2026
          - Ajout du stripe_customer_id dans le record MongoDB subscriptions
          - Logs détaillés à chaque étape pour débugger
          - Gestion d'erreurs améliorée avec logging
      - working: true
        agent: "testing"
        comment: |
          ✅ Endpoint fonctionne correctement:
          - Endpoint accessible et traite les requêtes
          - Gestion d'erreur appropriée pour payment_method invalide
          - Logs détaillés présents pour le debugging
          - Erreur attendue avec pm_invalid_test: "No such PaymentMethod"
          - Code d'erreur approprié (500 pour erreur Stripe, pas 404)
          
          Minor: Correction appliquée pour la gestion d'erreurs Stripe (stripe.error.StripeError -> Exception)

frontend:
  - task: "Sélecteur de langue - Intégration dans toutes les pages"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/LanguageSelector.jsx, LoginPage.jsx, RegisterPage.jsx, LandingPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          ✅ LanguageSelector créé avec 6 langues: Français, English, Deutsch, Italiano, Español, Nederlands
          ✅ Intégré en haut à droite dans LoginPage, RegisterPage et LandingPage
          ✅ Sauvegarde de la langue sélectionnée dans localStorage (clé: af_language)
          ✅ Configuration i18n avec react-i18next
          📝 Note: Application reste en français, traductions complètes à faire plus tard

  - task: "Champ Profession dans RegisterPage"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/RegisterPage.jsx, /app/frontend/src/constants/professions.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          ✅ Création du fichier constants/professions.js avec 95+ métiers d'artisans (ordre alphabétique)
          ✅ Ajout du dropdown "Métier" dans RegisterPage après le champ Mobile
          ✅ Option "Autre" en dernière position
          ✅ Si "Autre" sélectionné → champ texte "Précisez votre métier" apparaît
          ✅ Validation: profession obligatoire, professionOther obligatoire si "Autre"
          ✅ Envoi des champs profession et professionOther à l'API /auth/register

  - task: "Pré-remplissage email sur LoginPage"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/LoginPage.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          ✅ Stockage automatique de l'email dans localStorage (clé: af_last_email) lors d'une connexion réussie
          ✅ Pré-remplissage automatique du champ email au chargement de LoginPage
          ✅ Pas de checkbox "Se souvenir de moi", tout est automatique

  - task: "Auto-déconnexion à la fermeture de l'onglet"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/App.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          ✅ Événement beforeunload écouté dans App.js
          ✅ Nettoyage de af_access_token, af_refresh_token et af_username lors de la fermeture
          ✅ af_last_email est conservé pour le pré-remplissage
          📝 Note: Pas de timeout d'inactivité implémenté (uniquement fermeture d'onglet)

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 2
  run_ui: true

test_plan:
  current_focus:
    - "Sélecteur de langue - Intégration dans toutes les pages"
    - "Champ Profession dans RegisterPage"
    - "Pré-remplissage email sur LoginPage"
    - "Auto-déconnexion à la fermeture de l'onglet"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      🎯 FRONTEND BATCH IMPLÉMENTÉ - Prêt pour tests
      
      ✅ TÂCHE 1: Sélecteur de langue
      - Composant LanguageSelector créé avec design selon mockup utilisateur
      - 6 langues supportées: Français, English, Deutsch, Italiano, Español, Nederlands
      - Intégré dans LoginPage, RegisterPage, LandingPage (en haut à droite)
      - Sauvegarde de la préférence dans localStorage
      
      ✅ TÂCHE 2: Champ Profession
      - 95+ métiers d'artisans listés dans constants/professions.js
      - Dropdown ajouté dans RegisterPage après le champ Mobile
      - Option "Autre" en dernière position avec champ texte conditionnel
      - Validation complète (profession obligatoire, professionOther si Autre)
      - Backend mis à jour: champs profession/professionOther dans User model et RegisterRequest
      
      ✅ TÂCHE 3: Pré-remplissage email
      - Stockage automatique de l'email lors d'une connexion réussie (af_last_email)
      - Pré-remplissage automatique dans LoginPage
      
      ✅ TÂCHE 4: Auto-déconnexion
      - Événement beforeunload écouté dans App.js
      - Nettoyage des tokens à la fermeture de l'onglet/navigateur
      - af_last_email conservé pour le pré-remplissage
      
      📝 TESTS REQUIS:
      1. Backend: Vérifier que les champs profession/professionOther sont bien sauvegardés
      2. Frontend: Tester le sélecteur de langue (changement + sauvegarde)
      3. Frontend: Tester le dropdown profession et l'option "Autre"
      4. Frontend: Vérifier le pré-remplissage de l'email après un login
      5. Frontend: Vérifier l'auto-déconnexion à la fermeture de l'onglet
      
      Backend redémarré avec succès. Frontend hot reload actif.