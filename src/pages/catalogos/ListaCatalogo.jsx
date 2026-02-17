// src/pages/catalogos/ListaCatalogo.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import catalogoService, { getCatalogoConfig } from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ListaCatalogo = () => {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const config = getCatalogoConfig(tipo);

  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    if (!config) {
      toast.error('Tipo de catálogo no válido');
      navigate('/dashboard');
      return;
    }
    loadRegistros();
  }, [tipo, pagination.page]);

  const loadRegistros = async () => {
    setIsLoading(true);
    try {
      const response = await catalogoService.getAll(tipo, {
        page: pagination.page,
        limit: pagination.limit,
      });

      const data = Array.isArray(response) ? response : (response.data || []);
      const paginationData = response.pagination || {};

      setRegistros(data);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || data.length || 0
      }));
    } catch (error) {
      toast.error('Error al cargar registros');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadRegistros();
      return;
    }

    setIsLoading(true);
    try {
      const response = await catalogoService.getAll(tipo, { search: searchTerm });
      const data = Array.isArray(response) ? response : (response.data || []);
      setRegistros(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadRegistros();
  };

  const handleDelete = async (id) => {
    if (!confirm(`¿Estás seguro de eliminar este ${config.singular.toLowerCase()}?`)) {
      return;
    }

    try {
      await catalogoService.delete(tipo, id);
      toast.success(`${config.singular} eliminado correctamente`);
      loadRegistros();
    } catch (error) {
      toast.error('Error al eliminar registro');
    }
  };

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600">{config.descripcion}</p>
          </div>
        </div>
        <Button
          icon={Plus}
          onClick={() => navigate(`/catalogos/${tipo}/nuevo`)}
        >
          Nuevo {config.singular}
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={`Buscar ${config.singular.toLowerCase()}...`}
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
            <p className="mt-4 text-gray-600">Cargando registros...</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron registros</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  {config.hasDescription && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                  )}
                  {config.extraFields.map(field => (
                    <th
                      key={field.name}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registros.map((registro) => (
                  <tr key={registro[config.idField]} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registro.nombre}
                      </div>
                    </td>
                    {config.hasDescription && (
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {registro.descripcion || 'Sin descripción'}
                        </div>
                      </td>
                    )}
                    {config.extraFields.map(field => (
                      <td key={field.name} className="px-6 py-4 whitespace-nowrap">
                        {field.type === 'checkbox' ? (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${registro[field.name]
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {registro[field.name] ? 'Sí' : 'No'}
                          </span>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {registro[field.name] || 'N/A'}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/catalogos/${tipo}/${registro[config.idField]}/editar`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(registro[config.idField])}
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

export default ListaCatalogo;
