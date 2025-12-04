import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import QuotesPage from '@/pages/QuotesPage';
import InvoicesPage from '@/pages/InvoicesPage';
import InventoryPage from '@/pages/InventoryPage';
import AccountingPage from '@/pages/AccountingPage';
import AdminPage from '@/pages/AdminPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ForgotPinPage from '@/pages/ForgotPinPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ResetPinPage from '@/pages/ResetPinPage';
import LegalPage from '@/pages/LegalPage';
import ClientsPage from '@/pages/ClientsPage';
import JobsPage from '@/pages/JobsPage';
import AIChatPage from '@/pages/AIChatPage';
import SettingsPage from '@/pages/SettingsPage';
import TutorialsPage from '@/pages/TutorialsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';

// Pages Devis - Créer
import CreerDevisChoix from '@/pages/devis/CreerDevisChoix';
import DevisManuel from '@/pages/devis/creer/manuel';
import DevisDicteeVocale from '@/pages/devis/creer/dictee-vocale-structuree-par-ia';
import DevisAssisteParIA from '@/pages/devis/creer/assiste-par-ia';

// Pages Devis - Sections
import EnvoyesEtEnAttente from '@/pages/devis/EnvoyesEtEnAttente';
import ARelancer from '@/pages/devis/ARelancer';
import Acceptes from '@/pages/devis/Acceptes';
import Refuses from '@/pages/devis/Refuses';
import Historique from '@/pages/devis/Historique';

// Page Menu Chantiers & Agenda
import ChantiersAgendaMenu from '@/pages/ChantiersAgendaMenu';

// Pages Agenda
import Agenda from '@/pages/agenda/Agenda';

// Pages Chantiers
import CreerPlage from '@/pages/chantiers/CreerPlage';
import ChantiersEnAttente from '@/pages/chantiers/EnAttente';
import ChantiersPlanifies from '@/pages/chantiers/Planifies';
import ChantiersEnCours from '@/pages/chantiers/EnCours';
import HistoriqueChantiers from '@/pages/chantiers/Historique';

import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import NotificationPermission from '@/components/NotificationPermission';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('af_access_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  // Enregistrer le service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => console.log('Service Worker enregistré:', registration.scope))
        .catch((error) => console.error('Erreur Service Worker:', error));
    }
  }, []);

  return (
    <NotificationProvider>
      <>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-pin" element={<ForgotPinPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-pin" element={<ResetPinPage />} />
          <Route 
            path="/clients" 
            element={
              <PrivateRoute>
                <ClientsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <PrivateRoute>
                <JobsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ai-chat" 
            element={
              <PrivateRoute>
                <AIChatPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tutorials" 
            element={
              <PrivateRoute>
                <TutorialsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <PrivateRoute>
                <RecommendationsPage />
              </PrivateRoute>
            } 
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotes"
            element={
              <PrivateRoute>
                <QuotesPage />
              </PrivateRoute>
            }
          />
          
          {/* Routes Devis - Créer */}
          <Route
            path="/devis/creer"
            element={
              <PrivateRoute>
                <CreerDevisChoix />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/creer/manuel"
            element={
              <PrivateRoute>
                <DevisManuel />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/creer/dictee-vocale-structuree-par-ia"
            element={
              <PrivateRoute>
                <DevisDicteeVocale />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/creer/assiste-par-ia"
            element={
              <PrivateRoute>
                <DevisAssisteParIA />
              </PrivateRoute>
            }
          />

          {/* Routes Devis - Sections */}
          <Route
            path="/devis/envoyes-et-en-attente"
            element={
              <PrivateRoute>
                <EnvoyesEtEnAttente />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/a-relancer"
            element={
              <PrivateRoute>
                <ARelancer />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/acceptes"
            element={
              <PrivateRoute>
                <Acceptes />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/refuses"
            element={
              <PrivateRoute>
                <Refuses />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis/historique"
            element={
              <PrivateRoute>
                <Historique />
              </PrivateRoute>
            }
          />
          
          {/* Route Menu Chantiers & Agenda */}
          <Route
            path="/chantiers-agenda"
            element={
              <PrivateRoute>
                <ChantiersAgendaMenu />
              </PrivateRoute>
            }
          />
          
          {/* Routes Agenda */}
          <Route
            path="/agenda"
            element={
              <PrivateRoute>
                <Agenda />
              </PrivateRoute>
            }
          />
          
          {/* Routes Chantiers */}
          <Route
            path="/chantiers/creer-plage"
            element={
              <PrivateRoute>
                <CreerPlage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chantiers/en-attente"
            element={
              <PrivateRoute>
                <ChantiersEnAttente />
              </PrivateRoute>
            }
          />
          <Route
            path="/chantiers/planifies"
            element={
              <PrivateRoute>
                <ChantiersPlanifies />
              </PrivateRoute>
            }
          />
          <Route
            path="/chantiers/en-cours"
            element={
              <PrivateRoute>
                <ChantiersEnCours />
              </PrivateRoute>
            }
          />
          <Route
            path="/chantiers/historique"
            element={
              <PrivateRoute>
                <HistoriqueChantiers />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <InvoicesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <InventoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/accounting"
            element={
              <PrivateRoute>
                <AccountingPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
      
      {/* Composants PWA */}
      <PWAInstallPrompt />
      <NotificationPermission />
    </>
    </NotificationProvider>
  );
}

export default App;