// src/services/estadisticasService.js
import api from './api';

// El interceptor de api.js ya hace `return response.data`,
// por lo que `res` en cada método es { success, data, message }.
// El payload real está en res.data (NO en res.data.data).

// Los endpoints nuevos usan _silent: true para no mostrar toast
// cuando el backend todavía no los tiene implementados.

const estadisticasService = {

  // ── Adolescentes ──────────────────────────────────────────────────
  getAdolescentesStats: async () => {
    const res = await api.get('/adolescentes/stats');
    return res.data;
  },
  getAdolescentesSinProceso: async () => {
    const res = await api.get('/adolescentes/sin-proceso');
    return res.data;
  },

  // ── Víctimas ──────────────────────────────────────────────────────
  getVictimasStats: async () => {
    const res = await api.get('/victimas/stats');
    return res.data;
  },

  // ── Actores Jurídicos ─────────────────────────────────────────────
  getActoresStats: async () => {
    const res = await api.get('/actores/stats');
    return res.data;
  },

  // ── Procesos ──────────────────────────────────────────────────────
  getProcesosStats: async () => {
    const res = await api.get('/procesos/stats');
    return res.data;
  },
  // NUEVO
  getTendenciaCasos: async (params = {}) => {
    const res = await api.get('/procesos/tendencia', { params, _silent: true });
    return res.data;
  },
  // NUEVO
  getTiempoPromedioProceso: async () => {
    const res = await api.get('/procesos/tiempo-promedio', { _silent: true });
    return res.data;
  },

  // ── Carpeta Judicial (CJ) ─────────────────────────────────────────
  getCJStats: async () => {
    const res = await api.get('/cj/stats');
    return res.data;
  },

  // ── CJ-Conductas ──────────────────────────────────────────────────
  getCJConductasStats: async () => {
    const res = await api.get('/cj-conductas/stats');
    return res.data;
  },
  getCJConductasMasFrecuentes: async (limit = 10) => {
    const res = await api.get('/cj-conductas/mas-frecuentes', { params: { limit } });
    return res.data;
  },
  // NUEVO
  getConductasPorMunicipio: async (params = {}) => {
    const res = await api.get('/cj-conductas/por-municipio', { params, _silent: true });
    return res.data;
  },
  // NUEVO
  getConductasPorEdad: async (params = {}) => {
    const res = await api.get('/cj-conductas/por-edad', { params, _silent: true });
    return res.data;
  },
  // NUEVO
  getReincidenciaPorConducta: async () => {
    const res = await api.get('/cj-conductas/reincidencia', { _silent: true });
    return res.data;
  },

  // ── Carpeta Juicio Oral (CJO) ─────────────────────────────────────
  getCJOStats: async () => {
    const res = await api.get('/cjo/stats');
    return res.data;
  },

  // ── CEMCI ─────────────────────────────────────────────────────────
  getCEMCIStats: async () => {
    const res = await api.get('/cemci/stats');
    return res.data;
  },
  getCEMCISeguimientoStats: async () => {
    const res = await api.get('/cemci/seguimiento/stats');
    return res.data;
  },

  // ── CEMS ──────────────────────────────────────────────────────────
  getCEMSStats: async () => {
    const res = await api.get('/cems/stats');
    return res.data;
  },
  getCEMSSeguimientoStats: async () => {
    const res = await api.get('/cems/seguimiento/stats');
    return res.data;
  },

  // ── Audiencias ────────────────────────────────────────────────────
  getAudienciasStats: async () => {
    const res = await api.get('/audiencias/stats');
    return res.data;
  },
  getAudienciasTipoStats: async () => {
    const res = await api.get('/audiencias/stats/tipo');
    return res.data;
  },
  getAudienciasProximas: async (dias = 30) => {
    const res = await api.get('/audiencias/proximas', { params: { dias } });
    return res.data;
  },

  // ── Medidas Cautelares ────────────────────────────────────────────
  getMedidasCautelaresStats: async () => {
    const res = await api.get('/medidas-cautelares/stats');
    return res.data;
  },

  // ── Medidas Sancionadoras ─────────────────────────────────────────
  getMedidasSancionadorasStats: async () => {
    const res = await api.get('/medidas-sancionadoras/stats');
    return res.data;
  },
  getMedidasSancionadorasGenerales: async () => {
    const res = await api.get('/medidas-sancionadoras/stats/generales');
    return res.data;
  },
  // NUEVO
  getMedidasSancionadorasPorConducta: async (params = {}) => {
    const res = await api.get('/medidas-sancionadoras/por-conducta', { params, _silent: true });
    return res.data;
  },

  // ── Condena / Internamiento / Libertad ───────────────────────────
  getCondenaStats: async () => {
    const res = await api.get('/condena/stats');
    return res.data;
  },
  getInternamientoStats: async () => {
    const res = await api.get('/internamiento/stats');
    return res.data;
  },
  getLibertadStats: async () => {
    const res = await api.get('/libertad/stats');
    return res.data;
  },

  // ── Catálogos ─────────────────────────────────────────────────────
  getCatalogoConductasStats: async () => {
    const res = await api.get('/catalogo-conductas/stats');
    return res.data;
  },
};

export default estadisticasService;
