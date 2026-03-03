// src/services/libertadService.js
import api from './api';

const libertadService = {
  /**
   * Obtener todas las libertades
   */
  getAll: async (params = {}) => {
    const response = await api.get('/libertad', { params });
    return response;
  },

  /**
   * Obtener libertades activas
   */
  getActivas: async () => {
    const response = await api.get('/libertad/activas');
    return response;
  },

  /**
   * Obtener libertades próximas a vencer
   */
  getProximasVencer: async (dias = 30) => {
    const response = await api.get('/libertad/proximas-vencer', { params: { dias } });
    return response;
  },

  /**
   * Obtener estadísticas
   */
  getStats: async () => {
    const response = await api.get('/libertad/stats');
    return response;
  },

  /**
   * Obtener libertad por ID
   */
  getById: async (id) => {
    const response = await api.get(`/libertad/${id}`);
    return response;
  },

  /**
   * Obtener libertad por proceso
   */
  getByProcesoId: async (procesoId) => {
    const response = await api.get(`/libertad/proceso/${procesoId}`);
    return response;
  },

  /**
   * Crear libertad
   */
  create: async (data) => {
    const response = await api.post('/libertad', data);
    return response;
  },

  /**
   * Actualizar libertad
   */
  update: async (id, data) => {
    const response = await api.put(`/libertad/${id}`, data);
    return response;
  },

  /**
   * Marcar como cumplida
   */
  marcarCumplida: async (id, fechaCumplimiento = null) => {
    const response = await api.put(`/libertad/${id}/cumplir`, { fecha_cumplimiento: fechaCumplimiento });
    return response;
  },

  /**
   * Eliminar libertad
   */
  delete: async (id) => {
    const response = await api.delete(`/libertad/${id}`);
    return response;
  }
};

export default libertadService;
