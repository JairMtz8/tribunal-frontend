// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuthStore();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifican roles permitidos, verificar
    if (allowedRoles.length > 0) {
        const hasPermission = allowedRoles.includes(user?.rol_nombre);

        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Acceso Denegado
                        </h2>
                        <p className="text-gray-600 mb-6">
                            No tienes permisos para acceder a esta página.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;
