// src/pages/cems/ListaCEMS.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

import cemsService from '../../services/cemsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const LIMIT = 10;

const ListaCEMS = () => {
  const navigate = useNavigate();
  const [todas, setTodas] = useState([]);       // todos los registros del backend
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMedidas, setFiltroMedidas] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Carga completa sin paginación server-side
  const loadCarpetas = async (search = '') => {
    setIsLoading(true);
    try {
      const response = await cemsService.getAll({ limit: 1000, search });
      setTodas(response.data || []);
      setCurrentPage(1);
    } catch {
      toast.error('Error al cargar carpetas CEMS');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCarpetas(); }, []);

  const handleSearch = () => loadCarpetas(searchTerm.trim());

  const handleClearSearch = () => {
    setSearchTerm('');
    setFiltroMedidas('');
    loadCarpetas('');
  };

  // Filtrado client-side
  const filtradas = useMemo(() => {
    if (filtroMedidas === '1') return todas.filter(c => Number(c.total_medidas) > 0);
    if (filtroMedidas === '0') return todas.filter(c => Number(c.total_medidas) === 0);
    return todas;
  }, [todas, filtroMedidas]);

  // Paginación client-side sobre los filtrados
  const totalPages = Math.max(1, Math.ceil(filtradas.length / LIMIT));
  const pagina = filtradas.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

  // Cuando cambia el filtro, volver a página 1
  useEffect(() => { setCurrentPage(1); }, [filtroMedidas]);

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta CEMS? Esta acción no se puede deshacer.')) return;
    try {
      await cemsService.delete(id);
      toast.success('Carpeta CEMS eliminada correctamente');
      loadCarpetas(searchTerm.trim());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar carpeta CEMS');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carpetas CEMS</h1>
          <p className="text-gray-600">Carpetas de Ejecución de Medida Sancionadora</p>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Generación automática</h3>
            <p className="text-sm text-blue-700">
              Las carpetas CEMS se crean automáticamente cuando una CJO tiene sentencia CONDENATORIA o MIXTA.
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por número CEMS, CJ o CJO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filtroMedidas) && (
            <Button variant="secondary" onClick={handleClearSearch}>Limpiar</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Medidas Sancionadoras"
            value={filtroMedidas}
            onChange={(e) => setFiltroMedidas(e.target.value)}
            options={[
              { value: '', label: 'Todas' },
              { value: '1', label: 'Con medidas' },
              { value: '0', label: 'Sin medidas' },
            ]}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Cargando carpetas CEMS...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay carpetas CEMS</p>
            <p className="text-sm text-gray-400">
              Las carpetas CEMS se crean automáticamente cuando hay sentencia CONDENATORIA o MIXTA
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número CEMS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CJ Origen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CJO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medidas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagina.map((carpeta) => {
                const tieneMedidas = Number(carpeta.total_medidas) > 0;
                return (
                  <tr key={carpeta.id_cems} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {carpeta.numero_cems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/carpetas/cj/${carpeta.cj_id}`)}
                        className="text-sm text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        {carpeta.numero_cj}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {carpeta.cjo_id ? (
                        <button
                          onClick={() => navigate(`/carpetas/cjo/${carpeta.cjo_id}`)}
                          className="text-sm text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {carpeta.numero_cjo}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Sin CJO</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tieneMedidas ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          <Scale className="w-3 h-3" />
                          {carpeta.total_medidas} medida{carpeta.total_medidas > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                          Sin medidas
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/carpetas/cems/${carpeta.id_cems}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/carpetas/cems/${carpeta.id_cems}/editar`)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {tieneMedidas ? (
                          <button
                            onClick={() => navigate(`/medidas-sancionadoras/proceso/${carpeta.proceso_id}`)}
                            className="text-purple-600 hover:text-purple-900"
                            title={`Ver ${carpeta.total_medidas} medida${carpeta.total_medidas > 1 ? 's' : ''}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/medidas-sancionadoras/nueva?proceso_id=${carpeta.proceso_id}&cems_id=${carpeta.id_cems}`)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Aplicar Medida Sancionadora"
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(carpeta.id_cems)}
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
        )}

        {/* Paginación client-side */}
        {filtradas.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * LIMIT) + 1}–{Math.min(currentPage * LIMIT, filtradas.length)} de {filtradas.length}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                Anterior
              </Button>
              <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaCEMS;
