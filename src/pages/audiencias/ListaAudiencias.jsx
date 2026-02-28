// src/pages/audiencias/ListaAudiencias.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import audienciaService from '../../services/audienciaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const parseLocalDate = (fecha) => {
  if (!fecha) return new Date(0);

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

const ListaAudiencias = () => {
  const navigate = useNavigate();
  const [audiencias, setAudiencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadAudiencias();
  }, []);

  const loadAudiencias = async () => {
    setIsLoading(true);
    try {
      const response = await audienciaService.getAll(filtros);
      const data = Array.isArray(response) ? response : (response.data || []);

      const audienciasAgrupadas = [];
      const procesosVistos = new Set();

      data.forEach(audiencia => {
        if (!procesosVistos.has(audiencia.proceso_id)) {
          procesosVistos.add(audiencia.proceso_id);

          // Contar audiencias de este proceso
          const audienciasDelProceso = data.filter(a => a.proceso_id === audiencia.proceso_id);

          // Encontrar próxima audiencia
          const ahora = new Date();
          const proximasAudiencias = audienciasDelProceso
            .filter(a => parseLocalDate(a.fecha_audiencia) >= ahora)
            .sort((a, b) =>
              parseLocalDate(a.fecha_audiencia) - parseLocalDate(b.fecha_audiencia)
            );

          const proximaAudiencia = proximasAudiencias[0] || audienciasDelProceso[0];

          audienciasAgrupadas.push({
            ...proximaAudiencia,
            total_audiencias: audienciasDelProceso.length,
            proximas_audiencias: proximasAudiencias.length
          });
        }
      });

      setAudiencias(audienciasAgrupadas);
    } catch (error) {
      toast.error('Error al cargar audiencias');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltrar = () => {
    loadAudiencias();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ tipo: '', fecha_desde: '', fecha_hasta: '' });
    setTimeout(() => loadAudiencias(), 100);
  };

  const formatDateTime = (fecha) => {
    if (!fecha) return 'N/A';

    const date = parseLocalDate(fecha);

    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCarpetaAsociada = (audiencia) => {
    if (audiencia.numero_cj) return { tipo: 'CJ', numero: audiencia.numero_cj };
    if (audiencia.numero_cjo) return { tipo: 'CJO', numero: audiencia.numero_cjo };
    if (audiencia.numero_cemci) return { tipo: 'CEMCI', numero: audiencia.numero_cemci };
    if (audiencia.numero_cems) return { tipo: 'CEMS', numero: audiencia.numero_cems };
    return { tipo: 'N/A', numero: 'Sin carpeta' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audiencias por Proceso</h1>
          <p className="text-gray-600">Gestión y programación de audiencias</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/audiencias/nueva')}>
          Nueva Audiencia
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Tipo de Audiencia"
                placeholder="Ej: Inicial, Control..."
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              />
              <Input
                label="Fecha Desde"
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              />
              <Input
                label="Fecha Hasta"
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFiltrar} size="sm">
                Aplicar Filtros
              </Button>
              <Button onClick={handleLimpiarFiltros} variant="secondary" size="sm">
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Vista Agrupada</h3>
            <p className="text-sm text-blue-700">
              Las audiencias están agrupadas por proceso. Click en "Ver Audiencias" para ver todas las audiencias de cada proceso.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando audiencias...</p>
          </div>
        ) : audiencias.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay audiencias registradas</p>
            <p className="text-sm text-gray-400 mb-4">
              Comienza agregando una nueva audiencia
            </p>
            <Button onClick={() => navigate('/audiencias/nueva')}>
              Nueva Audiencia
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Adolescente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Audiencias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Próxima Audiencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Carpeta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {audiencias.map((audiencia) => {
                const carpeta = getCarpetaAsociada(audiencia);

                return (
                  <tr key={audiencia.proceso_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {audiencia.adolescente_nombre || audiencia.adolescente_iniciales}
                      </div>
                      {audiencia.total_audiencias > 1 && (
                        <span className="text-xs text-blue-600 font-semibold">
                          {audiencia.total_audiencias} audiencias
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {audiencia.total_audiencias}
                        </span>
                        {audiencia.proximas_audiencias > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {audiencia.proximas_audiencias} próximas
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(audiencia.fecha_audiencia)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{audiencia.tipo || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {carpeta.tipo}: {carpeta.numero}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/audiencias/proceso/${audiencia.proceso_id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                        title={`Ver ${audiencia.total_audiencias} audiencias`}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Ver Audiencias</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ListaAudiencias;
