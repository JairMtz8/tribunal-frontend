// src/pages/catalogos/ListaConductas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

import conductaService from '../../services/conductaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const ListaConductas = () => {
  const navigate = useNavigate();
  const [conductas, setConductas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    activo: '',
    fuero_default: ''
  });

  useEffect(() => {
    loadConductas();
  }, [filters]);

  const loadConductas = async () => {
    setIsLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await conductaService.getAll(cleanFilters);
      const data = Array.isArray(response) ? response : (response.data || []);
      setConductas(data);
    } catch (error) {
      toast.error('Error al cargar conductas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadConductas();
      return;
    }

    setIsLoading(true);
    try {
      const response = await conductaService.getAll({ search: searchTerm });
      const data = Array.isArray(response) ? response : (response.data || []);
      setConductas(data);
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({ activo: '', fuero_default: '' });
    loadConductas();
  };

  const handleToggleActivo = async (id) => {
    try {
      await conductaService.toggleActivo(id);
      toast.success('Estado actualizado correctamente');
      loadConductas();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta conducta?')) return;

    try {
      await conductaService.delete(id);
      toast.success('Conducta eliminada correctamente');
      loadConductas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar conducta');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Conductas (Delitos)</h1>
            <p className="text-gray-600">Catálogo de conductas delictivas</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => navigate('/catalogos/conductas/nuevo')}>
          Nueva Conducta
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar conducta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filters.activo || filters.fuero_default) && (
            <Button variant="secondary" onClick={handleClearSearch}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Fuero"
            value={filters.fuero_default}
            onChange={(e) => setFilters(prev => ({ ...prev, fuero_default: e.target.value }))}
            options={[
              { value: '', label: 'Todos' },
              { value: 'FEDERAL', label: 'FEDERAL' },
              { value: 'COMUN', label: 'COMÚN' }
            ]}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando conductas...</p>
          </div>
        ) : conductas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron conductas</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuero</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conductas.map((conducta) => (
                <tr key={conducta.id_conducta} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {conducta.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {conducta.descripcion || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${conducta.fuero_default === 'FEDERAL'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {conducta.fuero_default || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActivo(conducta.id_conducta)}
                      className="flex items-center gap-2"
                    >
                      {conducta.activo ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Activo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/catalogos/conductas/${conducta.id_conducta}/editar`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(conducta.id_conducta)}
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
      </div>
    </div>
  );
};

export default ListaConductas;
