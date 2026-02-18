// src/services/actorService.js
import api from './api';

const actorService = {
    /**
     * Obtener todos los actores
     */
    getAll: async () => {
        const response = await api.get('/actores');
        return response;
    },

    /**
     * Buscar actores por nombre
     */
    search: async (query) => {
        const response = await api.get('/actores/search', {
            params: { q: query }
        });
        return response;
    },

    /**
     * Crear nuevo actor
     */
    create: async (data) => {
        const response = await api.post('/actores', data);
        return response;
    },

    /**
     * Obtener actores de un proceso
     */
    getByProceso: async (procesoId) => {
        const response = await api.get(`/procesos/${procesoId}/actores`);
        return response;
    },

    /**
     * Obtener actores agrupados por carpeta
     */
    getAgrupados: async (procesoId) => {
        const response = await api.get(`/procesos/${procesoId}/actores/agrupados`);
        return response;
    },

    /**
     * Asignar actor a proceso/carpeta
     */
    asignar: async (procesoId, data) => {
        const response = await api.post(`/procesos/${procesoId}/actores`, data);
        return response;
    },

    /**
     * Asignar múltiples actores
     */
    asignarMultiples: async (procesoId, data) => {
        const response = await api.post(`/procesos/${procesoId}/actores/multiples`, data);
        return response;
    },

    /**
     * Desasignar actor de proceso/carpeta
     */
    desasignar: async (procesoId, tipoCarpeta, actorId) => {
        const response = await api.delete(`/procesos/${procesoId}/actores/${tipoCarpeta}/${actorId}`);
        return response;
    }
};

export default actorService;