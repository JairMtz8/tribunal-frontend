// src/services/audienciaService.js
import api from './api';

const audienciaService = {
    /**
     * Obtener todas las audiencias
     */
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.tipo) params.append('tipo', filters.tipo);
        if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
        if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
        
        const response = await api.get(`/audiencias?${params.toString()}`);
        return response.data;
    },

    /**
     * Obtener audiencia por ID
     */
    getById: async (id) => {
        const response = await api.get(`/audiencias/${id}`);
        return response.data;
    },

    /**
     * Obtener audiencias por proceso
     */
    getByProcesoId: async (procesoId) => {
        const response = await api.get(`/audiencias/proceso/${procesoId}`);
        return response.data;
    },

    /**
     * Obtener audiencias por carpeta
     */
    getByCarpeta: async (tipoCarpeta, carpetaId) => {
        const response = await api.get(`/audiencias/carpeta/${tipoCarpeta}/${carpetaId}`);
        return response.data;
    },

    /**
     * Obtener audiencias próximas
     */
    getProximas: async (dias = 30) => {
        const response = await api.get(`/audiencias/proximas?dias=${dias}`);
        return response.data;
    },

    /**
     * Obtener audiencias del día
     */
    getDelDia: async (fecha = null) => {
        const url = fecha ? `/audiencias/del-dia?fecha=${fecha}` : '/audiencias/del-dia';
        const response = await api.get(url);
        return response.data;
    },

    /**
     * Crear audiencia
     */
    create: async (audienciaData) => {
        const response = await api.post('/audiencias', audienciaData);
        return response.data;
    },

    /**
     * Actualizar audiencia
     */
    update: async (id, audienciaData) => {
        const response = await api.put(`/audiencias/${id}`, audienciaData);
        return response.data;
    },

    /**
     * Eliminar audiencia
     */
    delete: async (id) => {
        const response = await api.delete(`/audiencias/${id}`);
        return response.data;
    },

    /**
     * Obtener estadísticas
     */
    getStats: async () => {
        const response = await api.get('/audiencias/stats');
        return response.data;
    },

    /**
     * Obtener estadísticas por tipo
     */
    getStatsByTipo: async () => {
        const response = await api.get('/audiencias/stats/tipo');
        return response.data;
    },
};

export default audienciaService;
