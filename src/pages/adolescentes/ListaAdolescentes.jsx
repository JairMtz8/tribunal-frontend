// src/pages/adolescentes/ListaAdolescentes.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import adolescenteService from '../../services/adolescenteService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatDate, calculateAge } from '../../utils/formatters';

const ListaAdolescentes = () => {
  const navigate = useNavigate();
  const [adolescentes, setAdolescentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    loadAdolescentes();
  }, [pagination.page]);

  const loadAdolescentes = async () => {
    setIsLoading(true);
    try {
      const response = await adolescenteService.getAll({
        page: pagination.page,
        limit: pagination.limit,
      });

      let adolescentes = [];
      let paginationData = {};

      if (Array.isArray(response)) {
        adolescentes = response;
      } else if (response.data && Array.isArray(response.data)) {
        adolescentes = response.data;
        paginationData = response.pagination || {};
      }

      console.log('5. Adolescentes extraídos:', adolescentes);
      console.log('6. Longitud:', adolescentes.length);

      setAdolescentes(adolescentes);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || adolescentes.length || 0
      }));
    } catch (error) {
      toast.error('Error al cargar adolescentes');
      console.error('❌ Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAdolescentes();
      return;
    }

    setIsLoading(true);
    try {
      const response = await adolescenteService.search(searchTerm);
      const adolescentes = Array.isArray(response.data) ? response.data : [];
      setAdolescentes(adolescentes);
      setPagination(prev => ({
        ...prev,
        total: adolescentes.length
      }));
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadAdolescentes();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este adolescente?')) return;

    try {
      await adolescenteService.delete(id);
      toast.success('Adolescente eliminado correctamente');
      loadAdolescentes();
    } catch (error) {
      toast.error('Error al eliminar adolescente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adolescentes</h1>
          <p className="text-gray-600">Gestión de adolescentes del sistema</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => navigate('/adolescentes/nuevo')}
        >
          Nuevo Adolescente
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            Buscar
          </Button>
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
            <p className="mt-4 text-gray-600">Cargando adolescentes...</p>
          </div>
        ) : adolescentes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron adolescentes</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nacimiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adolescentes.map((adolescente) => (
                  <tr key={adolescente.id_adolescente} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {adolescente.nombre} {adolescente.apellido_paterno} {adolescente.apellido_materno}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{adolescente.telefono || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(adolescente.fecha_nacimiento)} años
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{adolescente.sexo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(adolescente.fecha_nacimiento)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/adolescentes/${adolescente.id_adolescente}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/adolescentes/${adolescente.id_adolescente}/editar`)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(adolescente.id_adolescente)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.total}</span> resultados
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListaAdolescentes;
