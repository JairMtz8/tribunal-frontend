// src/pages/procesos/ListaProcesos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

import procesoService from '../../services/procesoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/formatters';

const ListaProcesos = () => {
  const navigate = useNavigate();
  const [procesos, setProcesos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    loadProcesos();
  }, [pagination.page]);

  const loadProcesos = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await procesoService.getAll(params);
      // response ya es { success, data, pagination }
      const procesosData = response.data || [];

      setProcesos(procesosData);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || procesosData.length || 0
      }));
    } catch (error) {
      toast.error('Error al cargar procesos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProcesos();
      return;
    }

    setIsLoading(true);
    try {
      const response = await procesoService.getAll({ search: searchTerm });
      // response ya es { success, data, pagination }
      const procesosData = response.data || [];

      setProcesos(procesosData);
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadProcesos();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procesos</h1>
          <p className="text-gray-600">Vista general de todos los procesos del sistema</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/procesos/nuevo')}>
          Nuevo Proceso
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por adolescente, número CJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {searchTerm && (
            <Button variant="secondary" onClick={handleClearSearch}>
              Limpiar
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Buscando: "<span className="font-medium">{searchTerm}</span>"
            {' · '}
            <button
              onClick={handleClearSearch}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Ver todos
            </button>
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando procesos...</p>
          </div>
        ) : procesos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron procesos</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Adolescente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número CJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
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
                {procesos.map((proceso) => (
                  <tr key={proceso.id_proceso} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proceso.adolescente_nombre || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {proceso.cj_numero || 'Sin CJ'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {proceso.status_nombre || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proceso.observaciones || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/procesos/${proceso.id_proceso}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/procesos/${proceso.id_proceso}/editar`)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {pagination.total > pagination.limit && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} resultados
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page * pagination.limit >= pagination.total}
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
    </div>
  );
};

export default ListaProcesos;
