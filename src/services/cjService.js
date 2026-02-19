// src/services/cjService.js
import api from './api';

const cjService = {
    /**
     * Obtener todas las CJ con filtros
     */
    getAll: async (params = {}) => {
        const response = await api.get('/cj', { params });
        return response.data;
    },

    /**
     * Obtener CJ por ID
     */
    getById: async (id) => {
        const response = await api.get(`/cj/${id}`);
        return response.data;
    },

    /**
     * Crear nueva CJ
     */
    create: async (data) => {
        const response = await api.post('/cj', data);
        return response.data;
    },

    /**
     * Actualizar CJ
     */
    update: async (id, data) => {
        const response = await api.put(`/cj/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar CJ
     */
    delete: async (id) => {
        const response = await api.delete(`/cj/${id}`);
        return response.data;
    },

    /**
     * Obtener estadísticas
     */
    getStats: async () => {
        const response = await api.get('/cj/stats');
        return response.data;
    }
};

export default cjService;