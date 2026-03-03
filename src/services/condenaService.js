// src/services/condenaService.js
import api from './api';

const condenaService = {
  /**
   * Obtener todas las condenas
   */
  getAll: async (params = {}) => {
    const response = await api.get('/condena', { params });
    return response;
  },

  /**
   * Obtener estadísticas
   */
  getStats: async () => {
    const response = await api.get('/condena/stats');
    return response;
  },

  /**
   * Obtener condena por ID
   */
  getById: async (id) => {
    const response = await api.get(`/condena/${id}`);
    return response;
  },

  /**
   * Obtener condena por proceso
   */
  getByProcesoId: async (procesoId) => {
    const response = await api.get(`/condena/proceso/${procesoId}`);
    return response;
  },

  /**
   * Crear condena
   */
  create: async (data) => {
    const response = await api.post('/condena', data);
    return response;
  },

  /**
   * Actualizar condena
   */
  update: async (id, data) => {
    const response = await api.put(`/condena/${id}`, data);
    return response;
  },

  /**
   * Marcar como cumplida
   */
  marcarCumplida: async (id) => {
    const response = await api.put(`/condena/${id}/cumplir`);
    return response;
  },

  /**
   * Eliminar condena
   */
  delete: async (id) => {
    const response = await api.delete(`/condena/${id}`);
    return response;
  }
};

export default condenaService;
