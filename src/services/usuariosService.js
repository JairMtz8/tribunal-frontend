// src/services/usuariosService.js
import api from './api';

const usuariosService = {
  // Listar usuarios con filtros opcionales
  getAll: async (params = {}) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },

  // Crear usuario
  create: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, data) => {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data;
  },

  // Activar usuario
  activate: async (id) => {
    const response = await api.post(`/auth/users/${id}/activate`);
    return response.data;
  },

  // Desactivar usuario
  deactivate: async (id) => {
    const response = await api.post(`/auth/users/${id}/deactivate`);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

export default usuariosService;
