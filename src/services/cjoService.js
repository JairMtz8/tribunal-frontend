// src/services/cjoService.js
import api from './api';

const cjoService = {
    /**
     * Obtener todas las CJO
     */
    getAll: async (params = {}) => {
        const response = await api.get('/cjo', { params });
        return response.data;
    },

    /**
     * Obtener CJO por ID
     */
    getById: async (id) => {
        const response = await api.get(`/cjo/${id}`);
        return response.data;
    },

    /**
     * Obtener CJO por CJ_ID
     */
    getByCjId: async (cjId) => {
        const response = await api.get(`/cjo/cj/${cjId}`);
        return response.data;
    },

    /**
     * Crear nueva CJO
     * Auto-crea CEMS si sentencia es CONDENATORIA o MIXTA
     */
    create: async (data) => {
        const response = await api.post('/cjo', data);
        return response.data;
    },

    /**
     * Actualizar CJO
     * Auto-crea CEMS si sentencia cambia a CONDENATORIA o MIXTA
     */
    update: async (id, data) => {
        const response = await api.put(`/cjo/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar CJO
     */
    delete: async (id) => {
        const response = await api.delete(`/cjo/${id}`);
        return response.data;
    },

    /**
     * Obtener estadísticas de CJO
     */
    getStats: async () => {
        const response = await api.get('/cjo/stats');
        return response.data;
    }
};

export default cjoService;
