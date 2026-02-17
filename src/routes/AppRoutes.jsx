// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// Auth
import Login from '../pages/auth/Login';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Adolescentes
import ListaAdolescentes from '../pages/adolescentes/ListaAdolescentes';
import CrearAdolescente from '../pages/adolescentes/CrearAdolescente';
import DetalleAdolescente from '../pages/adolescentes/DetalleAdolescente';
import EditarAdolescente from '../pages/adolescentes/EditarAdolescente';

// Procesos
import ListaProcesos from '../pages/procesos/ListaProcesos';
import DetalleProceso from '../pages/procesos/DetalleProceso';

// Catálogos
import ListaCatalogo from '../pages/catalogos/ListaCatalogo';
import FormularioCatalogo from '../pages/catalogos/FormularioCatalogo';
import ListaConductas from '../pages/catalogos/ListaConductas';
import FormularioConducta from '../pages/catalogos/FormularioConducta';
import ListaCalificativas from '../pages/catalogos/ListaCalificativas';
import FormularioCalificativa from '../pages/catalogos/FormularioCalificativa';

import useAuthStore from '../store/useAuthStore';

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      {/* Toaster para notificaciones */}
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
        {/* ============================================ */}
        {/* RUTAS PÚBLICAS */}
        {/* ============================================ */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* ============================================ */}
        {/* RUTAS PROTEGIDAS (requieren autenticación) */}
        {/* ============================================ */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect raíz a dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* ========== DASHBOARD ========== */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* ========== ADOLESCENTES ========== */}
          <Route path="adolescentes" element={<ListaAdolescentes />} />
          <Route path="adolescentes/nuevo" element={<CrearAdolescente />} />
          <Route path="adolescentes/:id/editar" element={<EditarAdolescente />} />
          <Route path="adolescentes/:id" element={<DetalleAdolescente />} />

          {/* ========== PROCESOS ========== */}
          <Route path="procesos" element={<ListaProcesos />} />
          <Route path="procesos/:id" element={<DetalleProceso />} />

          {/* ========== CATÁLOGOS ========== */}
          {/* Conductas (Delitos) */}
          <Route path="catalogos/conductas" element={<ListaConductas />} />
          <Route path="catalogos/conductas/nuevo" element={<FormularioConducta />} />
          <Route path="catalogos/conductas/:id/editar" element={<FormularioConducta />} />

          {/* Calificativas del Delito */}
          <Route path="catalogos/calificativas" element={<ListaCalificativas />} />
          <Route path="catalogos/calificativas/nuevo" element={<FormularioCalificativa />} />
          <Route path="catalogos/calificativas/:id/editar" element={<FormularioCalificativa />} />

          {/* Catálogos Genéricos */}
          <Route path="catalogos/:tipo" element={<ListaCatalogo />} />
          <Route path="catalogos/:tipo/nuevo" element={<FormularioCatalogo />} />
          <Route path="catalogos/:tipo/:id/editar" element={<FormularioCatalogo />} />

          {/* ========== 404 - PÁGINA NO ENCONTRADA ========== */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900">404</h1>
                  <p className="text-xl text-gray-600 mt-4">
                    Página no encontrada
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Volver atrás
                  </button>
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
