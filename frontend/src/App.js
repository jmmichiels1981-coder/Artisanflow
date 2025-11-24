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
import { Toaster } from '@/components/ui/sonner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import NotificationPermission from '@/components/NotificationPermission';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('af_access_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  // Auto-déconnexion lors de la fermeture de l'onglet/navigateur
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Nettoyer les données d'authentification
      localStorage.removeItem('af_access_token');
      localStorage.removeItem('af_refresh_token');
      localStorage.removeItem('af_username');
      // Note: af_last_email est conservé pour le pré-remplissage
    };

    // Écouter l'événement de fermeture de l'onglet/navigateur
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => console.log('Service Worker enregistré:', registration.scope))
        .catch((error) => console.error('Erreur Service Worker:', error));
    }

    // Nettoyage de l'écouteur d'événements
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-pin" element={<ForgotPinPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-pin" element={<ResetPinPage />} />
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
  );
}

export default App;