// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import ListaAdolescentes from '../pages/adolescentes/ListaAdolescentes';
import CrearAdolescente from '../pages/adolescentes/CrearAdolescente';
import DetalleAdolescente from '../pages/adolescentes/DetalleAdolescente';
import ListaProcesos from '../pages/procesos/ListaProcesos';
import DetalleProceso from '../pages/procesos/DetalleProceso';
// ... más imports según necesites

import useAuthStore from '../store/useAuthStore';

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Adolescentes */}
          <Route path="adolescentes" element={<ListaAdolescentes />} />
          <Route path="adolescentes/nuevo" element={<CrearAdolescente />} />
          <Route path="adolescentes/:id" element={<DetalleAdolescente />} />

          {/* Procesos */}
          <Route path="procesos" element={<ListaProcesos />} />
          <Route path="procesos/:id" element={<DetalleProceso />} />

          {/* Catálogos - Solo Admin */}
          <Route
            path="catalogos"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                {/* <AdminCatalogos /> */}
                <div>Catálogos (Solo Admin)</div>
              </ProtectedRoute>
            }
          />

          {/* 404 - Ruta no encontrada */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900">404</h1>
                  <p className="text-xl text-gray-600 mt-4">
                    Página no encontrada
                  </p>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
