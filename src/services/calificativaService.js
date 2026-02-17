// src/services/calificativaService.js
import api from './api';

const calificativaService = {
    /**
     * Obtener todas las calificativas
     */
    getAll: async (params = {}) => {
        const response = await api.get('/catalogo-calificativas', { params });
        return response;
    },

    /**
     * Obtener solo calificativas activas (para selects)
     */
    getActivas: async () => {
        const response = await api.get('/catalogo-calificativas/activas');
        return response;
    },

    /**
     * Obtener calificativa por ID
     */
    getById: async (id) => {
        const response = await api.get(`/catalogo-calificativas/${id}`);
        return response;
    },

    /**
     * Crear calificativa
     */
    create: async (data) => {
        const response = await api.post('/catalogo-calificativas', data);
        return response;
    },

    /**
     * Actualizar calificativa
     */
    update: async (id, data) => {
        const response = await api.put(`/catalogo-calificativas/${id}`, data);
        return response;
    },

    /**
     * Eliminar calificativa
     */
    delete: async (id) => {
        const response = await api.delete(`/catalogo-calificativas/${id}`);
        return response;
    },

    /**
     * Activar/Desactivar calificativa
     */
    toggleActivo: async (id) => {
        const response = await api.put(`/catalogo-calificativas/${id}/toggle`);
        return response;
    },

    /**
     * Estadísticas de uso
     */
    getStats: async () => {
        const response = await api.get('/catalogo-calificativas/stats');
        return response;
    }
};

export default calificativaService;