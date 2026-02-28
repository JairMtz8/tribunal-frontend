// src/pages/cjo/ListaCJO.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import cjoService from '../../services/cjoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const ListaCJO = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    fuero: '',
    sentencia: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10
  });

  useEffect(() => {
    loadCarpetas();
  }, [filters, currentPage]);

  const loadCarpetas = async () => {
    setIsLoading(true);
    try {
      const params = {};

      if (filters.fuero) params.fuero = filters.fuero;
      if (filters.sentencia) params.sentencia = filters.sentencia;

      params.page = currentPage;
      params.limit = 10;

      const response = await cjoService.getAll(params);

      setCarpetas(response.data || []);
      setPagination(response.pagination || { total: 0, totalPages: 1, limit: 10 });
    } catch (error) {
      toast.error('Error al cargar carpetas CJO');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ fuero: '', sentencia: '' });
  };

  const handleSearch = async () => {

    if (!searchTerm.trim()) {
      loadCarpetas();
      return;
    }

    setIsLoading(true);
    try {
      const response = await cjoService.getAll({ search: searchTerm });

      const data = Array.isArray(response) ? response : (response.data || []);

      setCarpetas(data);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta CJO? Esta acción no se puede deshacer.')) return;

    try {
      await cjoService.delete(id);
      toast.success('Carpeta CJO eliminada correctamente');
      loadCarpetas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar carpeta CJO');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carpetas CJO</h1>
          <p className="text-gray-600">Carpetas de Juicio Oral</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por número CJO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filters.fuero || filters.sentencia) && (
            <Button variant="secondary" onClick={handleClearFilters}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Fuero"
            value={filters.fuero}
            onChange={(e) => setFilters(prev => ({ ...prev, fuero: e.target.value }))}
            options={[
              { value: '', label: 'Todos' },
              { value: 'FEDERAL', label: 'FEDERAL' },
              { value: 'COMUN', label: 'COMÚN' }
            ]}
          />

          <Select
            label="Sentencia"
            value={filters.sentencia}
            onChange={(e) => setFilters(prev => ({ ...prev, sentencia: e.target.value }))}
            options={[
              { value: '', label: 'Todas' },
              { value: 'CONDENATORIA', label: 'CONDENATORIA' },
              { value: 'ABSOLUTORIA', label: 'ABSOLUTORIA' },
              { value: 'MIXTA', label: 'MIXTA' }
            ]}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando carpetas CJO...</p>
          </div>
        ) : carpetas.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay carpetas CJO</p>
            <p className="text-sm text-gray-400">Las carpetas CJO se crean desde las carpetas CJ cuando van a juicio oral</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número CJO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CJ Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha Ingreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fuero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sentencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha Sentencia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carpetas.map((carpeta) => (
                <tr key={carpeta.id_cjo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {carpeta.numero_cjo}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(carpeta.fecha_ingreso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${carpeta.fuero === 'FEDERAL'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {carpeta.fuero || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {carpeta.sentencia ? (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${carpeta.sentencia.toLowerCase().includes('condenatori')
                        ? 'bg-red-100 text-red-800'
                        : carpeta.sentencia.toLowerCase().includes('absolutori')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {carpeta.sentencia}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin sentencia</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(carpeta.fecha_sentencia)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/carpetas/cjo/${carpeta.id_cjo}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/carpetas/cjo/${carpeta.id_cjo}/editar`)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(carpeta.id_cjo)}
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
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Anterior
            </Button>

            <Button
              variant="secondary"
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaCJO;
