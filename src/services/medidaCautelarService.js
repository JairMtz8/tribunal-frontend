// src/services/medidaCautelarService.js
import api from './api';

const medidaCautelarService = {
    /**
     * Obtener todas las medidas cautelares
     */
    getAll: async (params = {}) => {
        const response = await api.get('/medidas-cautelares', { params });
        return response.data;
    },

    /**
     * Obtener medidas cautelares por proceso
     */
    getByProceso: async (procesoId) => {
        const response = await api.get(`/medidas-cautelares/proceso/${procesoId}`);
        return response.data;
    },

    /**
     * Obtener medida cautelar por ID
     */
    getById: async (id) => {
        const response = await api.get(`/medidas-cautelares/${id}`);
        return response.data;
    },

    /**
     * Aplicar nueva medida cautelar
     */
    aplicar: async (data) => {
        const response = await api.post('/medidas-cautelares', data);
        return response.data;
    },

    /**
     * Revocar medida cautelar
     */
    revocar: async (id, data) => {
        const response = await api.put(`/medidas-cautelares/${id}/revocar`, data);
        return response.data;
    },

    /**
     * Actualizar medida cautelar
     */
    update: async (id, data) => {
        const response = await api.put(`/medidas-cautelares/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar medida cautelar
     */
    delete: async (id) => {
        const response = await api.delete(`/medidas-cautelares/${id}`);
        return response.data;
    }
};

export default medidaCautelarService;
