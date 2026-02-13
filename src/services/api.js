// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Manejo de errores global
api.interceptors.response.use(
    (response) => {
        // Retornar solo response.data para simplificar
        // response.data ya contiene { success, data, message }
        return response.data;
    },
    (error) => {
        // Manejo de errores
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Token inválido o expirado
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
                    break;

                case 403:
                    toast.error('No tienes permisos para realizar esta acción');
                    break;

                case 404:
                    toast.error(data.error?.message || 'Recurso no encontrado');
                    break;

                case 409:
                    toast.error(data.error?.message || 'Conflicto con los datos');
                    break;

                case 500:
                    toast.error('Error del servidor. Intenta más tarde.');
                    break;

                default:
                    toast.error(data.error?.message || 'Ocurrió un error inesperado');
            }
        } else if (error.request) {
            // Error de red
            toast.error('No se pudo conectar con el servidor');
        } else {
            toast.error('Error al procesar la petición');
        }

        return Promise.reject(error);
    }
);

export default api;