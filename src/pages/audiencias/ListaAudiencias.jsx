// src/pages/audiencias/ListaAudiencias.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import audienciaService from '../../services/audienciaService';
import cjService from '../../services/cjService';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    loadAudiencias();
  }, []);

  const loadAudiencias = async () => {
    setIsLoading(true);
    try {
      const [audienciasResponse, cjResponse] = await Promise.all([
        audienciaService.getAll({ limit: 500 }),
        cjService.getAll({ limit: 500 }),
      ]);

      const data = Array.isArray(audienciasResponse) ? audienciasResponse : (audienciasResponse.data || []);
      const cjData = Array.isArray(cjResponse) ? cjResponse : (cjResponse.data || []);

      // Mapa de id_cj -> numero_cj para enriquecer las audiencias
      const cjMap = {};
      cjData.forEach(cj => { cjMap[cj.id_cj] = cj.numero_cj; });

      const audienciasAgrupadas = [];
      const procesosVistos = new Set();

      data.forEach(audiencia => {
        if (!procesosVistos.has(audiencia.proceso_id)) {
          procesosVistos.add(audiencia.proceso_id);

          const audienciasDelProceso = data.filter(a => a.proceso_id === audiencia.proceso_id);

          const ahora = new Date();
          const proximasAudiencias = audienciasDelProceso
            .filter(a => parseLocalDate(a.fecha_audiencia) >= ahora)
            .sort((a, b) =>
              parseLocalDate(a.fecha_audiencia) - parseLocalDate(b.fecha_audiencia)
            );

          const proximaAudiencia = proximasAudiencias[0] || audienciasDelProceso[0];

          audienciasAgrupadas.push({
            ...proximaAudiencia,
            numero_cj: proximaAudiencia.numero_cj || cjMap[proximaAudiencia.cj_id] || null,
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

  const handleClearSearch = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const getNumeroCJ = (audiencia) => audiencia.numero_cj || null;

  const audienciasFiltradas = searchTerm.trim()
    ? audiencias.filter(a =>
        (a.adolescente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.adolescente_iniciales || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : audiencias;

  const total = audienciasFiltradas.length;
  const { page, limit } = pagination;
  const audienciasPagina = audienciasFiltradas.slice((page - 1) * limit, page * limit);

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

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por nombre del adolescente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          {searchTerm && (
            <Button variant="secondary" onClick={handleClearSearch}>
              Limpiar
            </Button>
          )}
        </div>
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
              {audienciasPagina.map((audiencia) => {
                const numeroCJ = getNumeroCJ(audiencia);

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
                      {numeroCJ ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          CJ: {numeroCJ}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                          Sin CJ
                        </span>
                      )}
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
        {total > limit && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Mostrando {((page - 1) * limit) + 1} a{' '}
              {Math.min(page * limit, total)} de{' '}
              {total} resultados
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaAudiencias;
