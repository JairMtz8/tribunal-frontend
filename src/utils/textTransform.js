// src/utils/textTransform.js

/**
 * Eliminar acentos de un texto
 */
export const removeAccents = (str) => {
    if (!str) return str;
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Convertir a mayúsculas sin acentos
 */
export const toUpperNoAccents = (str) => {
    if (!str) return str;
    return removeAccents(str).toUpperCase();
};

/**
 * Transformar objeto con campos de texto a mayúsculas sin acentos
 * Excluye campos especificados (como email)
 */
export const transformFormData = (data, excludeFields = ['correo', 'email']) => {
    const transformed = {};

    Object.keys(data).forEach(key => {
        const value = data[key];

        // Si es un objeto anidado, procesarlo recursivamente
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            transformed[key] = transformFormData(value, excludeFields);
        }
        // Si es string y no está en la lista de exclusión
        else if (typeof value === 'string' && !excludeFields.includes(key)) {
            transformed[key] = toUpperNoAccents(value);
        }
        // Otros tipos de datos se mantienen igual
        else {
            transformed[key] = value;
        }
    });

    return transformed;
};

/**
 * Handler para inputs que convierte a mayúsculas sin acentos en tiempo real
 */
export const handleUppercaseInput = (e) => {
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = toUpperNoAccents(input.value);

    // Mantener la posición del cursor
    input.setSelectionRange(start, end);
};