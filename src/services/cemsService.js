// src/services/cemsService.js
import api from './api';

const cemsService = {
    /**
     * Obtener todas las CEMS
     */
    getAll: async (params = {}) => {
        const response = await api.get('/cems', { params });
        return response.data;
    },

    /**
     * Obtener CEMS por ID
     */
    getById: async (id) => {
        const response = await api.get(`/cems/${id}`);
        return response.data;
    },

    /**
     * Obtener CEMS por CJ_ID
     */
    getByCjId: async (cjId) => {
        const response = await api.get(`/cems/cj/${cjId}`);
        return response.data;
    },

    /**
     * Obtener CEMS por CJO_ID
     */
    getByCjoId: async (cjoId) => {
        const response = await api.get(`/cems/cjo/${cjoId}`);
        return response.data;
    },

    /**
     * Actualizar CEMS
     */
    update: async (id, cemsData) => {
        const response = await api.put(`/cems/${id}`, cemsData);
        return response.data;
    },

    /**
     * Actualizar número de CEMS
     */
    updateNumero: async (id, numeroCems) => {
        const response = await api.put(`/cems/${id}/numero`, { numero_cems: numeroCems });
        return response.data;
    },

    /**
     * Eliminar CEMS
     */
    delete: async (id) => {
        const response = await api.delete(`/cems/${id}`);
        return response.data;
    },

    /**
     * Obtener estadísticas
     */
    getStats: async () => {
        const response = await api.get('/cems/stats');
        return response.data;
    },

    // ========== EXHORTACIÓN ==========

    /**
     * Crear exhortación
     */
    createExhortacion: async (exhortacionData) => {
        const response = await api.post('/cems/exhortacion', exhortacionData);
        return response.data;
    },

    /**
     * Obtener exhortaciones de un CEMS
     */
    getExhortacionesByCems: async (cemsId) => {
        const response = await api.get(`/cems/${cemsId}/exhortaciones`);
        return response.data;
    },

    /**
     * Obtener exhortación por proceso
     */
    getExhortacionByProceso: async (procesoId) => {
        const response = await api.get(`/cems/exhortacion/proceso/${procesoId}`);
        return response.data;
    },

    /**
     * Actualizar exhortación
     */
    updateExhortacion: async (id, exhortacionData) => {
        const response = await api.put(`/cems/exhortacion/${id}`, exhortacionData);
        return response.data;
    },

    /**
     * Eliminar exhortación
     */
    deleteExhortacion: async (id) => {
        const response = await api.delete(`/cems/exhortacion/${id}`);
        return response.data;
    },

    // ========== SEGUIMIENTO ==========

    /**
     * Crear seguimiento
     */
    createSeguimiento: async (seguimientoData) => {
        const response = await api.post('/cems/seguimiento', seguimientoData);
        return response.data;
    },

    /**
     * Obtener seguimientos de un CEMS
     */
    getSeguimientosByCems: async (cemsId) => {
        const response = await api.get(`/cems/${cemsId}/seguimientos`);
        return response.data;
    },

    /**
     * Obtener seguimiento por proceso
     */
    getSeguimientoByProceso: async (procesoId) => {
        const response = await api.get(`/cems/seguimiento/proceso/${procesoId}`);
        return response.data;
    },

    /**
     * Actualizar seguimiento
     */
    updateSeguimiento: async (id, seguimientoData) => {
        const response = await api.put(`/cems/seguimiento/${id}`, seguimientoData);
        return response.data;
    },

    /**
     * Eliminar seguimiento
     */
    deleteSeguimiento: async (id) => {
        const response = await api.delete(`/cems/seguimiento/${id}`);
        return response.data;
    },
};

export default cemsService;
