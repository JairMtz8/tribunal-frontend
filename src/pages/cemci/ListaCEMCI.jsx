// src/pages/cemci/ListaCEMCI.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, FileText, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import cemciService from '../../services/cemciService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const ListaCEMCI = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState([]);
  const [estadosProcesales, setEstadosProcesales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado_procesal_id: '',
    concluido: ''
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadEstadosProcesales();
    loadCarpetas();
  }, [filters, page]);


  const loadEstadosProcesales = async () => {
    try {
      const response = await catalogoService.getAll('estados-procesales');
      const data = Array.isArray(response) ? response : (response.data || []);
      setEstadosProcesales(data);
    } catch (error) {
      console.error('Error al cargar estados procesales:', error);
    }
  };

  const loadCarpetas = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit
      };

      if (filters.estado_procesal_id)
        params.estado_procesal_id = Number(filters.estado_procesal_id);

      if (filters.concluido !== '')
        params.concluido = filters.concluido;

      if (searchTerm)
        params.search = searchTerm;

      const response = await cemciService.getAll(params);

      const data = response.data || [];
      setCarpetas(data);
      setTotalPages(response.totalPages || 1);

    } catch (error) {
      toast.error('Error al cargar carpetas CEMCI');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCarpetas();
      return;
    }

    setIsLoading(true);
    try {
      const response = await cemciService.getAll({ search: searchTerm });
      const data = Array.isArray(response) ? response : (response.data || []);
      setCarpetas(data);
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ estado_procesal_id: '', concluido: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta CEMCI? Esta acción no se puede deshacer.')) return;

    try {
      await cemciService.delete(id);
      toast.success('Carpeta CEMCI eliminada correctamente');
      loadCarpetas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar carpeta CEMCI');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carpetas CEMCI</h1>
          <p className="text-gray-600">Centro de Medidas Cautelares de Internamiento</p>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Generación automática</h3>
            <p className="text-sm text-blue-700">
              Las carpetas CEMCI se crean automáticamente al aplicar una medida cautelar de internamiento.
              Desde aquí puedes ver, editar y gestionar los seguimientos.
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por número CEMCI o CJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filters.estado_procesal_id || filters.concluido) && (
            <Button variant="secondary" onClick={handleClearFilters}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Estado Procesal"
            value={filters.estado_procesal_id}
            onChange={(e) => setFilters(prev => ({ ...prev, estado_procesal_id: e.target.value }))}
            options={[
              { value: '', label: 'Todos' },
              ...estadosProcesales.map(ep => ({
                value: ep.id_estado,
                label: ep.nombre
              }))
            ]}
          />

          {(filters.estado_procesal_id || filters.concluido) && (
            <div className="flex items-end">
              <Button variant="secondary" onClick={handleClearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando carpetas CEMCI...</p>
          </div>
        ) : carpetas.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay carpetas CEMCI</p>
            <p className="text-sm text-gray-400">Las carpetas CEMCI se crean automáticamente al aplicar medidas cautelares de internamiento</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número CEMCI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CJ Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CJO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha Recepción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado Procesal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carpetas.map((carpeta) => (
                <tr key={carpeta.id_cemci} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {carpeta.numero_cemci}
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(carpeta.fecha_recepcion_cemci)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {carpeta.estado_procesal_nombre ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {carpeta.estado_procesal_nombre}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin estado</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {carpeta.concluido ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Concluido
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/carpetas/cemci/${carpeta.id_cemci}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/carpetas/cemci/${carpeta.id_cemci}/editar`)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(carpeta.id_cemci)}
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
        )}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListaCEMCI;
