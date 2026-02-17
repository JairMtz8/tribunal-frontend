// src/utils/formatters.js
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear fecha en formato DD/MM/YYYY
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
        return 'Fecha inválida';
    }
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
        return 'Fecha inválida';
    }
};

/**
 * Formatear fecha relativa (hace 2 días, etc.)
 */
export const formatRelativeDate = (date) => {
    if (!date) return 'N/A';
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(parsedDate, { addSuffix: true, locale: es });
    } catch (error) {
        return 'Fecha inválida';
    }
};

/**
 * Calcular edad a partir de fecha de nacimiento
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    try {
        const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Formatear número de carpeta
 */
export const formatCarpetaNumber = (numero) => {
    return numero || 'Sin número';
};

/**
 * Formatear monto de dinero
 */
export const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

/**
 * Truncar texto largo
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Formatear iniciales
 */
export const formatInitials = (nombre) => {
    if (!nombre) return '??';
    const words = nombre.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Formatear número de teléfono
 */
export const formatPhone = (phone) => {
    if (!phone) return 'No registrado';

    // Formato: (777) 123-4567
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatear texto con mayúsculas y sin acentos
 */
export const formatUpperNoAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
};

/**
 * Formatear booleano a Sí/No
 */
export const formatBoolean = (value) => {
    return value ? 'Sí' : 'No';
};

/**
 * Formatear estado procesal con color
 */
export const getEstadoColor = (estado) => {
    const colores = {
        'ACTIVO': 'green',
        'EN_PROCESO': 'blue',
        'SUSPENDIDO': 'yellow',
        'CONCLUIDO': 'gray',
        'ARCHIVADO': 'red'
    };
    return colores[estado] || 'gray';
};