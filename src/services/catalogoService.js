// src/services/catalogoService.js
import api from './api';

/**
 * Servicio genérico para manejar todos los catálogos del sistema
 * 
 * Tipos disponibles:
 * - roles
 * - estados-procesales
 * - tipos-medidas-sancionadoras
 * - tipos-medidas-cautelares
 * - tipos-reparacion
 */

const catalogoService = {
    /**
     * Obtener todos los registros de un catálogo
     * @param {string} tipo - Tipo de catálogo
     * @param {object} params - Parámetros de búsqueda y paginación
     */
    getAll: async (tipo, params = {}) => {
        const response = await api.get(`/catalogos/${tipo}`, { params });
        return response;
    },

    /**
     * Obtener un registro específico por ID
     * @param {string} tipo - Tipo de catálogo
     * @param {number} id - ID del registro
     */
    getById: async (tipo, id) => {
        const response = await api.get(`/catalogos/${tipo}/${id}`);
        return response;
    },

    /**
     * Crear nuevo registro en el catálogo
     * @param {string} tipo - Tipo de catálogo
     * @param {object} data - Datos del registro
     */
    create: async (tipo, data) => {
        const response = await api.post(`/catalogos/${tipo}`, data);
        return response;
    },

    /**
     * Actualizar registro del catálogo
     * @param {string} tipo - Tipo de catálogo
     * @param {number} id - ID del registro
     * @param {object} data - Datos actualizados
     */
    update: async (tipo, id, data) => {
        const response = await api.put(`/catalogos/${tipo}/${id}`, data);
        return response;
    },

    /**
     * Eliminar registro del catálogo
     * @param {string} tipo - Tipo de catálogo
     * @param {number} id - ID del registro
     */
    delete: async (tipo, id) => {
        const response = await api.delete(`/catalogos/${tipo}/${id}`);
        return response;
    },

    /**
     * Obtener estadísticas del catálogo
     * @param {string} tipo - Tipo de catálogo
     */
    getStats: async (tipo) => {
        const response = await api.get(`/catalogos/${tipo}/stats`);
        return response;
    }
};

export default catalogoService;

/**
 * Configuración de catálogos
 * Define los campos y comportamiento de cada tipo
 */
export const catalogosConfig = {
    'roles': {
        title: 'Roles',
        singular: 'Rol',
        descripcion: 'Roles de usuarios del sistema',
        fields: ['nombre', 'descripcion'],
        idField: 'id_rol',
        hasDescription: true,
        extraFields: []
    },
    'estados-procesales': {
        title: 'Estados Procesales',
        singular: 'Estado Procesal',
        descripcion: 'Estados del proceso judicial',
        fields: ['nombre', 'descripcion'],
        idField: 'id_estado_procesal',
        hasDescription: true,
        extraFields: []
    },
    'tipos-medidas-sancionadoras': {
        title: 'Tipos de Medidas Sancionadoras',
        singular: 'Tipo de Medida Sancionadora',
        descripcion: 'Tipos de medidas sancionadoras aplicables',
        fields: ['nombre', 'descripcion', 'es_privativa'],
        idField: 'id_tipo_medida_sancionadora',
        hasDescription: true,
        extraFields: [
            {
                name: 'es_privativa',
                label: 'Es Privativa de Libertad',
                type: 'checkbox',
                description: 'Indica si la medida implica privación de libertad'
            }
        ]
    },
    'tipos-medidas-cautelares': {
        title: 'Tipos de Medidas Cautelares',
        singular: 'Tipo de Medida Cautelar',
        descripcion: 'Tipos de medidas cautelares aplicables',
        fields: ['nombre', 'descripcion', 'genera_cemci'],
        idField: 'id_tipo_medida_cautelar',
        hasDescription: true,
        extraFields: [
            {
                name: 'genera_cemci',
                label: 'Genera CEMCI',
                type: 'checkbox',
                description: 'Indica si la medida genera un registro CEMCI'
            }
        ]
    },
    'tipos-reparacion': {
        title: 'Tipos de Reparación del Daño',
        singular: 'Tipo de Reparación',
        descripcion: 'Tipos de reparación del daño',
        fields: ['nombre', 'descripcion'],
        idField: 'id_tipo_reparacion',
        hasDescription: true,
        extraFields: []
    }
};

/**
 * Helper para obtener configuración de un catálogo
 */
export const getCatalogoConfig = (tipo) => {
    return catalogosConfig[tipo] || null;
};