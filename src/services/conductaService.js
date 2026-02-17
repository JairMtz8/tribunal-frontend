// src/services/conductaService.js
import api from './api';

const conductaService = {
    /**
     * Obtener todas las conductas
     */
    getAll: async (params = {}) => {
        const response = await api.get('/catalogo-conductas', { params });
        return response;
    },

    /**
     * Obtener solo conductas activas (para selects)
     */
    getActivas: async () => {
        const response = await api.get('/catalogo-conductas/activas');
        return response;
    },

    /**
     * Obtener conductas por fuero
     */
    getByFuero: async (fuero) => {
        const response = await api.get(`/catalogo-conductas/fuero/${fuero}`);
        return response;
    },

    /**
     * Obtener conducta por ID
     */
    getById: async (id) => {
        const response = await api.get(`/catalogo-conductas/${id}`);
        return response;
    },

    /**
     * Crear conducta
     */
    create: async (data) => {
        const response = await api.post('/catalogo-conductas', data);
        return response;
    },

    /**
     * Actualizar conducta
     */
    update: async (id, data) => {
        const response = await api.put(`/catalogo-conductas/${id}`, data);
        return response;
    },

    /**
     * Eliminar conducta
     */
    delete: async (id) => {
        const response = await api.delete(`/catalogo-conductas/${id}`);
        return response;
    },

    /**
     * Activar/Desactivar conducta
     */
    toggleActivo: async (id) => {
        const response = await api.put(`/catalogo-conductas/${id}/toggle`);
        return response;
    },

    /**
     * Estadísticas de uso
     */
    getStats: async () => {
        const response = await api.get('/catalogo-conductas/stats');
        return response;
    }
};

export default conductaService;