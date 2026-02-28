// src/pages/audiencias/DetalleAudienciasProceso.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import audienciaService from '../../services/audienciaService';
import Button from '../../components/common/Button';
import { formatDateTime } from '../../utils/formatters';

const parseLocalDate = (fecha) => {
  if (!fecha) return new Date(0);

  // Separar fecha y hora ignorando zona horaria
  const [datePart, timePartRaw] = fecha.split('T');
  const timePart = timePartRaw?.split('.')[0] || '00:00:00';

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour || 0,
    minute || 0,
    second || 0
  );
};

const DetalleAudienciasProceso = () => {
  const { proceso_id } = useParams();
  const navigate = useNavigate();

  const [audiencias, setAudiencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudiencias();
  }, [proceso_id]);

  const loadAudiencias = async () => {
    setIsLoading(true);
    try {
      const response = await audienciaService.getByProcesoId(proceso_id);
      const audienciasData = Array.isArray(response) ? response : (response.data || []);

      // Ordenar: próximas primero, luego pasadas
      const ordenadas = audienciasData.sort((a, b) => {
        const fechaA = parseLocalDate(a.fecha_audiencia);
        const fechaB = parseLocalDate(b.fecha_audiencia);
        return fechaA - fechaB;
      });

      setAudiencias(ordenadas);
    } catch (error) {
      toast.error('Error al cargar audiencias');
      console.error(error);
      navigate('/audiencias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta audiencia?')) return;

    try {
      await audienciaService.delete(id);
      toast.success('Audiencia eliminada correctamente');
      loadAudiencias();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar audiencia');
    }
  };

  const getCarpetaInfo = (audiencia) => {
    if (audiencia.numero_cj) return { tipo: 'CJ', numero: audiencia.numero_cj, color: 'purple' };
    if (audiencia.numero_cjo) return { tipo: 'CJO', numero: audiencia.numero_cjo, color: 'blue' };
    if (audiencia.numero_cemci) return { tipo: 'CEMCI', numero: audiencia.numero_cemci, color: 'green' };
    if (audiencia.numero_cems) return { tipo: 'CEMS', numero: audiencia.numero_cems, color: 'orange' };
    return null;
  };

  const getEstadoAudiencia = (fecha) => {
    const ahora = new Date();
    const fechaAud = parseLocalDate(fecha);

    const hoy = ahora.toISOString().split('T')[0];
    const fechaAudStr = fechaAud.toISOString().split('T')[0];

    if (hoy === fechaAudStr) {
      return { label: 'HOY', color: 'green' };
    } else if (fechaAud > ahora) {
      return { label: 'PRÓXIMA', color: 'blue' };
    } else {
      return { label: 'REALIZADA', color: 'gray' };
    }
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando audiencias...</p>
        </div>
      </div>
    );
  }

  const adolescente = audiencias.length > 0
    ? (audiencias[0].adolescente_nombre || audiencias[0].adolescente_iniciales)
    : 'N/A';

  const proximasAudiencias = audiencias.filter(
    a => parseLocalDate(a.fecha_audiencia) >= new Date()
  );

  const pasadas = audiencias.filter(
    a => parseLocalDate(a.fecha_audiencia) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/audiencias')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audiencias del Proceso</h1>
            <p className="text-gray-600">
              {adolescente} - {audiencias.length} audiencia{audiencias.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          icon={Plus}
          onClick={() => navigate(`/audiencias/nueva?proceso_id=${proceso_id}`)}
        >
          Nueva Audiencia
        </Button>
      </div>

      {/* Resumen */}
      {audiencias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{audiencias.length}</p>
            <p className="text-xs text-gray-500">Audiencias registradas</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Próximas</p>
            <p className="text-2xl font-bold text-gray-900">{proximasAudiencias.length}</p>
            <p className="text-xs text-gray-500">Por realizarse</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <p className="text-sm text-gray-600">Pasadas</p>
            <p className="text-2xl font-bold text-gray-900">{pasadas.length}</p>
            <p className="text-xs text-gray-500">Ya realizadas</p>
          </div>
        </div>
      )}

      {/* Lista de Audiencias */}
      {audiencias.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay audiencias programadas</p>
          <p className="text-sm text-gray-400 mb-4">
            Este proceso aún no tiene audiencias
          </p>
          <Button
            icon={Plus}
            onClick={() => navigate(`/audiencias/nueva?proceso_id=${proceso_id}`)}
          >
            Programar Primera Audiencia
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Carpeta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Observaciones
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {audiencias.map((audiencia, index) => {
                const carpeta = getCarpetaInfo(audiencia);
                const estado = getEstadoAudiencia(audiencia.fecha_audiencia);

                return (
                  <tr key={audiencia.id_audiencia} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDateTime(audiencia.fecha_audiencia)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {audiencia.tipo || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {carpeta ? (
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${colorClasses[carpeta.color]}`}>
                          {carpeta.tipo}: {carpeta.numero}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin carpeta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[estado.color]}`}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {audiencia.observaciones || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/audiencias/${audiencia.id_audiencia}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/audiencias/${audiencia.id_audiencia}/editar`)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(audiencia.id_audiencia)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">Gestión de Audiencias</h3>
            <p className="text-sm text-gray-600">
              Aquí puedes ver todas las audiencias programadas para este proceso.
              Las audiencias se ordenan cronológicamente y se marcan según su estado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleAudienciasProceso;
