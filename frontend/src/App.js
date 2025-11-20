import React from 'react';
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
import { Toaster } from '@/components/ui/sonner';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('af_access_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
    </>
  );
}

export default App;