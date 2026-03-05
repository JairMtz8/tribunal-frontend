// src/services/authService.js
import api from './api';

const authService = {
    // Login
    login: async (usuario, contrasena) => {
        const response = await api.post('/auth/login', { usuario, contrasena });
        // response.data ya tiene { success: true, data: { usuario, token } }
        return response.data;
    },

    // Obtener perfil del usuario actual
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Actualizar mi perfil
    updateProfile: async (data) => {
        const response = await api.put('/auth/me', data);
        return response.data;
    },

    // Cambiar contraseña
    changePassword: async (contrasena_actual, contrasena_nueva) => {
        const response = await api.post('/auth/change-password', {
            contrasena_actual,
            contrasena_nueva,
        });
        return response.data;
    },
};

export default authService;