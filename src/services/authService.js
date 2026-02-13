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

    // Cambiar contraseña
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};

export default authService;