// src/services/statusService.js
import api from './api';

const statusService = {
    /**
     * Obtener todos los status activos
     */
    getActivos: async () => {
        const response = await api.get('/catalogos/status');
        return response.data;
    },

    /**
     * Obtener todos los status
     */
    getAll: async () => {
        const response = await api.get('/catalogos/status');
        return response.data;
    },

    /**
     * Obtener status por ID
     */
    getById: async (id) => {
        const response = await api.get(`/catalogos/status/${id}`);
        return response.data;
    },

    /**
     * Crear nuevo status
     */
    create: async (data) => {
        const response = await api.post('/catalogos/status', data);
        return response.data;
    },

    /**
     * Actualizar status
     */
    update: async (id, data) => {
        const response = await api.put(`/catalogos/status/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar status
     */
    delete: async (id) => {
        const response = await api.delete(`/catalogos/status/${id}`);
        return response.data;
    }
};

export default statusService;
