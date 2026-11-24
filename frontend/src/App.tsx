import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { ManageServicesPage } from './pages/owner/ManageServicesPage';
import { ManageBarbersPage } from './pages/owner/ManageBarbersPage';

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
              <Route
                path="/"
                element={
                  <PlaceholderPage
                    title="Join the Queue"
                    description="Select your services and barber to get your token"
                  />
                }
              />
              <Route
                path="/history"
                element={
                  <PlaceholderPage
                    title="Queue History"
                    description="Your previous salon visits and tokens"
                  />
                }
              />

              {/* Receptionist Routes */}
              <Route
                path="/reception"
                element={
                  <ProtectedRoute allowedRoles={['RECEPTIONIST', 'OWNER']}>
                    <PlaceholderPage
                      title="Reception Queue Dashboard"
                      description="Manage live waiting line, call next, skip, and register walk-ins"
                    />
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
                    <PlaceholderPage
                      title="Barber Workstation"
                      description="Manage current client, start & finish haircuts, take breaks"
                    />
                  </ProtectedRoute>
                }
              />

              {/* Owner Routes */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <PlaceholderPage
                      title="Owner Dashboard"
                      description="Salon KPIs, live queue summary, and quick actions"
                    />
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
                    <PlaceholderPage
                      title="Analytics & Reports"
                      description="Customer throughput, wait time metrics, popular services"
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/settings"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <PlaceholderPage
                      title="Salon Settings"
                      description="Queue open/close, operating hours, capacity"
                    />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
