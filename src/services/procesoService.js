// src/services/procesoService.js
import api from './api';

const procesoService = {
    /**
     * Obtener todos los procesos
     */
    getAll: async (params = {}) => {
        const response = await api.get('/procesos', { params });
        return response;
    },

    /**
     * Obtener proceso por ID
     */
    getById: async (id) => {
        const response = await api.get(`/procesos/${id}`);
        return response;
    },

    /**
     * Crear proceso (con CJ)
     */
    create: async (data) => {
        const response = await api.post('/procesos', data);
        return response;
    },

    /**
     * Actualizar proceso
     */
    update: async (id, data) => {
        const response = await api.put(`/procesos/${id}`, data);
        return response;
    },

    /**
     * Eliminar proceso
     */
    delete: async (id) => {
        const response = await api.delete(`/procesos/${id}`);
        return response;
    },

    /**
     * Obtener estadísticas
     */
    getStats: async () => {
        const response = await api.get('/procesos/stats');
        return response;
    }
};

export default procesoService;