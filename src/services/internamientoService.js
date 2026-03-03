// src/services/internamientoService.js
import api from './api';

const internamientoService = {
  /**
   * Obtener todos los internamientos
   */
  getAll: async () => {
    const response = await api.get('/internamiento');
    return response;
  },

  /**
   * Obtener internamientos activos
   */
  getActivos: async () => {
    const response = await api.get('/internamiento/activos');
    return response;
  },

  /**
   * Obtener internamientos cumplidos
   */
  getCumplidos: async () => {
    const response = await api.get('/internamiento/cumplidos');
    return response;
  },

  /**
   * Obtener estadísticas
   */
  getStats: async () => {
    const response = await api.get('/internamiento/stats');
    return response;
  },

  /**
   * Obtener internamiento por ID
   */
  getById: async (id) => {
    const response = await api.get(`/internamiento/${id}`);
    return response;
  },

  /**
   * Obtener internamiento por proceso
   */
  getByProcesoId: async (procesoId) => {
    const response = await api.get(`/internamiento/proceso/${procesoId}`);
    return response;
  },

  /**
   * Crear internamiento
   */
  create: async (data) => {
    const response = await api.post('/internamiento', data);
    return response;
  },

  /**
   * Actualizar internamiento
   */
  update: async (id, data) => {
    const response = await api.put(`/internamiento/${id}`, data);
    return response;
  },

  /**
   * Eliminar internamiento
   */
  delete: async (id) => {
    const response = await api.delete(`/internamiento/${id}`);
    return response;
  }
};

export default internamientoService;
