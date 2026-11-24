import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { ManageServicesPage } from './pages/owner/ManageServicesPage';
import { ManageBarbersPage } from './pages/owner/ManageBarbersPage';

import { JoinQueuePage } from './pages/customer/JoinQueuePage';
import { CustomerHistoryPage } from './pages/customer/CustomerHistoryPage';
import { ReceptionDashboardPage } from './pages/reception/ReceptionDashboardPage';
import { BarberDashboardPage } from './pages/barber/BarberDashboardPage';

import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { OwnerAnalyticsPage } from './pages/owner/OwnerAnalyticsPage';
import { OwnerSettingsPage } from './pages/owner/OwnerSettingsPage';

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="p-6 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
        Feature under active construction
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public TV Display */}
            <Route
              path="/tv"
              element={
                <PlaceholderPage
                  title="TV Queue Display"
                  description="Real-time multi-barber public display"
                />
              }
            />

            {/* Authenticated Application */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Customer Home / Join Queue */}
              <Route path="/" element={<JoinQueuePage />} />
              <Route path="/history" element={<CustomerHistoryPage />} />

              {/* Receptionist Routes */}
              <Route
                path="/reception"
                element={
                  <ProtectedRoute allowedRoles={['RECEPTIONIST', 'OWNER']}>
                    <ReceptionDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception/barbers"
                element={
                  <ProtectedRoute allowedRoles={['RECEPTIONIST', 'OWNER']}>
                    <PlaceholderPage
                      title="Barber Status Overview"
                      description="Monitor barber stations and break times"
                    />
                  </ProtectedRoute>
                }
              />

              {/* Barber Routes */}
              <Route
                path="/barber"
                element={
                  <ProtectedRoute allowedRoles={['BARBER', 'OWNER']}>
                    <BarberDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Owner Routes */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/services"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <ManageServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/barbers"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <ManageBarbersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/analytics"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <OwnerAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/settings"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <OwnerSettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SocketProvider>
  </ThemeProvider>
  );
}

export default App;
