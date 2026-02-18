// src/services/cjConductaService.js
import api from './api';

const cjConductaService = {
    /**
     * Crear conducta asociada a CJ
     */
    create: async (data) => {
        const response = await api.post('/cj-conductas', data);
        return response;
    },

    /**
     * Obtener conductas de una CJ
     */
    getByCJ: async (cjId) => {
        const response = await api.get(`/cj-conductas/cj/${cjId}`);
        return response;
    },

    /**
     * Eliminar conducta
     */
    delete: async (id) => {
        const response = await api.delete(`/cj-conductas/${id}`);
        return response;
    }
};

export default cjConductaService;