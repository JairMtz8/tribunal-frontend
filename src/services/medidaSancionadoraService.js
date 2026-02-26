// src/services/medidaSancionadoraService.js
import api from './api';

const medidaSancionadoraService = {
    /**
     * Obtener todas las medidas
     */
    getAll: async () => {
        const response = await api.get('/medidas-sancionadoras');
        return response.data;
    },

    /**
     * Obtener medidas de un proceso
     */
    getByProcesoId: async (procesoId) => {
        const response = await api.get(`/medidas-sancionadoras/proceso/${procesoId}`);
        return response.data;
    },

    /**
     * Obtener medida por ID
     */
    getById: async (id) => {
        const response = await api.get(`/medidas-sancionadoras/${id}`);
        return response.data;
    },

    /**
     * Crear medida sancionadora
     */
    create: async (medidaData) => {
        const response = await api.post('/medidas-sancionadoras', medidaData);
        return response.data;
    },

    /**
     * Actualizar medida
     */
    update: async (id, medidaData) => {
        const response = await api.put(`/medidas-sancionadoras/${id}`, medidaData);
        return response.data;
    },

    /**
     * Eliminar medida
     */
    delete: async (id) => {
        const response = await api.delete(`/medidas-sancionadoras/${id}`);
        return response.data;
    },

    /**
     * Obtener medidas privativas
     */
    getPrivativas: async () => {
        const response = await api.get('/medidas-sancionadoras/privativas');
        return response.data;
    },

    /**
     * Obtener medidas no privativas
     */
    getNoPrivativas: async () => {
        const response = await api.get('/medidas-sancionadoras/no-privativas');
        return response.data;
    },

    /**
     * Verificar si proceso tiene medidas privativas
     */
    verificarPrivativas: async (procesoId) => {
        const response = await api.get(`/medidas-sancionadoras/proceso/${procesoId}/verificar-privativas`);
        return response.data;
    },

    /**
     * Obtener estadísticas
     */
    getStats: async () => {
        const response = await api.get('/medidas-sancionadoras/stats');
        return response.data;
    },
};

export default medidaSancionadoraService;
