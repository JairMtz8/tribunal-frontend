// src/services/tipoMedidaCautelarService.js
import api from './api';

const tipoMedidaCautelarService = {
    /**
     * Obtener todos los tipos activos
     */
    getActivos: async () => {
        const response = await api.get('/catalogos/tipos-medidas-cautelares');
        return response.data;
    },

    /**
     * Obtener todos los tipos
     */
    getAll: async () => {
        const response = await api.get('/catalogos/tipos-medidas-cautelares');
        return response.data;
    },

    /**
     * Obtener tipo por ID
     */
    getById: async (id) => {
        const response = await api.get(`/catalogos/tipos-medidas-cautelares/${id}`);
        return response.data;
    }
};

export default tipoMedidaCautelarService;
