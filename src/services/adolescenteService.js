// src/services/adolescenteService.js
import api from './api';

const adolescenteService = {
    // Obtener todos los adolescentes con paginación y búsqueda
    getAll: async (params = {}) => {
        const response = await api.get('/adolescentes', { params });
        return response;
    },

    // Obtener adolescente por ID
    getById: async (id) => {
        const response = await api.get(`/adolescentes/${id}`);
        return response;
    },

    // Crear nuevo adolescente
    create: async (data) => {
        const response = await api.post('/adolescentes', data);
        return response;
    },

    // Actualizar adolescente
    update: async (id, data) => {
        const response = await api.put(`/adolescentes/${id}`, data);
        return response;
    },

    // Eliminar adolescente
    delete: async (id) => {
        const response = await api.delete(`/adolescentes/${id}`);
        return response;
    },

    search: async (searchTerm) => {
        const response = await api.get('/adolescentes', {
            params: { search: searchTerm }
        });
        return response;
    }
};

export default adolescenteService;