// src/pages/ejecucion/ListaEjecucion.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import internamientoService from '../../services/internamientoService';
import libertadService from '../../services/libertadService';
import condenaService from '../../services/condenaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const ListaEjecucion = () => {
  const navigate = useNavigate();
  const [tipoActivo, setTipoActivo] = useState('internamiento');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    internamiento: { total: 0, activos: 0, cumplidos: 0 },
    libertad: { total: 0, activas: 0, cumplidas: 0, vencidas: 0 },
    condena: { total: 0, activas: 0, cumplidas: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState(''); // Para Libertad y Condena
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadData();
  }, [tipoActivo, filtro]);

  const loadStats = async () => {
    try {
      const [interStats, libStats, condStats] = await Promise.all([
        internamientoService.getStats(),
        libertadService.getStats(),
        condenaService.getStats()
      ]);

      setStats({
        internamiento: interStats.data || interStats,
        libertad: libStats.data || libStats,
        condena: condStats.data || condStats
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      let response;

      switch (tipoActivo) {
        case 'internamiento':
          response = await internamientoService.getAll();
          break;
        case 'libertad':
          if (filtro === 'activas') {
            response = await libertadService.getActivas();
          } else if (filtro === 'cumplidas') {
            response = await libertadService.getAll({ cumplida: true });
          } else {
            response = await libertadService.getAll();
          }
          break;
        case 'condena':
          if (filtro === 'activas') {
            response = await condenaService.getAll({ cumplida: false });
          } else if (filtro === 'cumplidas') {
            response = await condenaService.getAll({ cumplida: true });
          } else {
            response = await condenaService.getAll();
          }
          break;
      }

      const raw = Array.isArray(response) ? response : (response.data ?? response);
      const datos = Array.isArray(raw) ? raw : [];
      setData(datos);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`¿Estás seguro de eliminar este ${tipoActivo}?`)) return;

    try {
      switch (tipoActivo) {
        case 'internamiento':
          await internamientoService.delete(id);
          break;
        case 'libertad':
          await libertadService.delete(id);
          break;
        case 'condena':
          await condenaService.delete(id);
          break;
      }

      toast.success(`${tipoActivo.charAt(0).toUpperCase() + tipoActivo.slice(1)} eliminado correctamente`);
      loadData();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleMarcarCumplida = async (id) => {
    try {
      if (tipoActivo === 'libertad') {
        await libertadService.marcarCumplida(id);
      } else if (tipoActivo === 'condena') {
        await condenaService.marcarCumplida(id);
      }

      toast.success('Marcado como cumplida exitosamente');
      loadData();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar como cumplida');
    }
  };

  const getEstadoBadge = (item) => {
    if (tipoActivo === 'internamiento') {
      const cumplido = item.fecha_cumplimiento && new Date(item.fecha_cumplimiento) <= new Date();
      return cumplido ? (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Cumplido
        </span>
      ) : (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Activo
        </span>
      );
    }

    if (tipoActivo === 'libertad') {
      if (item.cumplida) {
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Cumplida
          </span>
        );
      }
      if (item.termino_obligaciones && new Date(item.termino_obligaciones) < new Date()) {
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Vencida
          </span>
        );
      }
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Activa
        </span>
      );
    }

    if (tipoActivo === 'condena') {
      return item.cumplida ? (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Cumplida
        </span>
      ) : (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Activa
        </span>
      );
    }
  };

  const calcularDiasRestantes = (terminoObligaciones) => {
    if (!terminoObligaciones) return null;
    const hoy = new Date();
    const termino = new Date(terminoObligaciones);
    const diff = Math.ceil((termino - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ejecución de Medidas</h1>
          <p className="text-gray-600">Internamiento, Libertad y Condena</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => navigate(`/ejecucion/nueva?tipo=${tipoActivo}`)}
        >
          Nuevo {tipoActivo.charAt(0).toUpperCase() + tipoActivo.slice(1)}
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setTipoActivo('internamiento');
                setFiltro('');
                setSearchTerm('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${tipoActivo === 'internamiento'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Internamiento
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                {stats.internamiento.total}
              </span>
            </button>

            <button
              onClick={() => {
                setTipoActivo('libertad');
                setFiltro('');
                setSearchTerm('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${tipoActivo === 'libertad'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Libertad
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                {stats.libertad.total}
              </span>
            </button>

            <button
              onClick={() => {
                setTipoActivo('condena');
                setFiltro('');
                setSearchTerm('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${tipoActivo === 'condena'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Condena
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                {stats.condena.total}
              </span>
            </button>
          </nav>
        </div>

        {/* Filtros */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                icon={Search}
                placeholder="Buscar por nombre del adolescente..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              />
            </div>
            {searchTerm && (
              <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
                Limpiar
              </Button>
            )}
            {tipoActivo !== 'internamiento' && (
              <>
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <Select
                  value={filtro}
                  onChange={(e) => { setFiltro(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                  options={[
                    { value: '', label: 'Todas' },
                    { value: 'activas', label: 'Activas' },
                    { value: 'cumplidas', label: 'Cumplidas' }
                  ]}
                />
              </>
            )}
          </div>
        </div>

        {/* Tabla */}
        {(() => {
          const dataArray = Array.isArray(data) ? data : [];
          const dataFiltrada = searchTerm.trim()
            ? dataArray.filter(item =>
                (item.adolescente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.adolescente_iniciales || '').toLowerCase().includes(searchTerm.toLowerCase())
              )
            : dataArray;

          const total = dataFiltrada.length;
          const { page, limit } = pagination;
          const dataPagina = dataFiltrada.slice((page - 1) * limit, page * limit);

          return (
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
              ) : dataFiltrada.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-600">
                    {searchTerm
                      ? `No se encontraron resultados para "${searchTerm}"`
                      : `No hay registros de ${tipoActivo}`}
                  </p>
                </div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Adolescente
                        </th>
                        {tipoActivo === 'internamiento' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Fecha Cumplimiento
                          </th>
                        )}
                        {tipoActivo === 'libertad' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Fecha Inicio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Término Obligaciones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Días Restantes
                            </th>
                          </>
                        )}
                        {tipoActivo === 'condena' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Tipo Reparación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Inicio Cómputo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Compurga
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataPagina.map((item) => (
                        <tr key={item[`id_${tipoActivo}`]} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.adolescente_nombre || item.adolescente_iniciales || 'N/A'}
                          </td>

                          {tipoActivo === 'internamiento' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.fecha_cumplimiento ? formatDate(item.fecha_cumplimiento) : 'Sin fecha'}
                            </td>
                          )}

                          {tipoActivo === 'libertad' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(item.fecha_inicial_ejecucion)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.termino_obligaciones ? formatDate(item.termino_obligaciones) : 'Sin fecha'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {item.termino_obligaciones && !item.cumplida ? (
                                  (() => {
                                    const dias = calcularDiasRestantes(item.termino_obligaciones);
                                    return dias > 0 ? (
                                      <span className={`px-2 py-1 rounded-full ${dias <= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {dias} días
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                                        Vencida
                                      </span>
                                    );
                                  })()
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </>
                          )}

                          {tipoActivo === 'condena' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.tipo_reparacion_nombre || 'Sin tipo'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.inicio_computo_sancion ? formatDate(item.inicio_computo_sancion) : 'Sin fecha'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.compurga ? formatDate(item.compurga) : '-'}
                              </td>
                            </>
                          )}

                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoBadge(item)}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate(`/ejecucion/${tipoActivo}/${item[`id_${tipoActivo}`]}`)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/ejecucion/${tipoActivo}/${item[`id_${tipoActivo}`]}/editar`)}
                                className="text-green-600 hover:text-green-900"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {tipoActivo !== 'internamiento' && !item.cumplida && (
                                <button
                                  onClick={() => handleMarcarCumplida(item[`id_${tipoActivo}`])}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Marcar como cumplida"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(item[`id_${tipoActivo}`])}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

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
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ListaEjecucion;
