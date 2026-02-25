// src/services/cemciService.js
import api from './api';

const cemciService = {
    /**
     * Obtener todas las CEMCI
     */
    getAll: async (params = {}) => {
        const response = await api.get('/cemci', { params });
        return response.data;
    },

    /**
     * Obtener CEMCI por ID (con seguimientos)
     */
    getById: async (id) => {
        const response = await api.get(`/cemci/${id}`);
        return response.data;
    },

    /**
     * Obtener CEMCI por CJ_ID
     */
    getByCjId: async (cjId) => {
        const response = await api.get(`/cemci/cj/${cjId}`);
        return response.data;
    },

    /**
     * Actualizar CEMCI (completar datos adicionales)
     * NOTA: CEMCI se crea automáticamente al aplicar medida cautelar de internamiento
     */
    update: async (id, data) => {
        const response = await api.put(`/cemci/${id}`, data);
        return response.data;
    },

    /**
     * Actualizar número de CEMCI
     */
    updateNumero: async (id, numero_cemci) => {
        const response = await api.put(`/cemci/${id}/numero`, { numero_cemci });
        return response.data;
    },

    /**
     * Eliminar CEMCI
     */
    delete: async (id) => {
        const response = await api.delete(`/cemci/${id}`);
        return response.data;
    },

    /**
     * Obtener estadísticas de CEMCI
     */
    getStats: async () => {
        const response = await api.get('/cemci/stats');
        return response.data;
    },

    // =====================================================
    // SEGUIMIENTO DE CEMCI
    // =====================================================

    /**
     * Crear seguimiento de CEMCI
     */
    createSeguimiento: async (data) => {
        const response = await api.post('/cemci/seguimiento', data);
        return response.data;
    },

    /**
     * Obtener seguimientos de un CEMCI
     */
    getSeguimientosByCemci: async (cemciId) => {
        const response = await api.get(`/cemci/${cemciId}/seguimientos`);
        return response.data;
    },

    /**
     * Obtener seguimiento por proceso
     */
    getSeguimientoByProceso: async (procesoId) => {
        const response = await api.get(`/cemci/seguimiento/proceso/${procesoId}`);
        return response.data;
    },

    /**
     * Actualizar seguimiento
     */
    updateSeguimiento: async (id, data) => {
        const response = await api.put(`/cemci/seguimiento/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar seguimiento
     */
    deleteSeguimiento: async (id) => {
        const response = await api.delete(`/cemci/seguimiento/${id}`);
        return response.data;
    },

    /**
     * Obtener seguimientos suspendidos
     */
    getSuspendidos: async () => {
        const response = await api.get('/cemci/seguimiento/suspendidos');
        return response.data;
    },

    /**
     * Obtener estadísticas de seguimientos
     */
    getStatsSeguimiento: async () => {
        const response = await api.get('/cemci/seguimiento/stats');
        return response.data;
    }
};

export default cemciService;
