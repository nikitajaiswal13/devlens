import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LogoutPage } from './pages/LogoutPage';
import './App.css';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page at root URL */}
      <Route path="/" element={<LandingPage />} />

      {/* Public-only routes: Redirect to dashboard if already authenticated */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/code-analysis" element={<DashboardPage />} />
        <Route path="/analysis" element={<DashboardPage />} />
      </Route>

      {/* Logout confirmation route */}
      <Route path="/logout" element={<LogoutPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
