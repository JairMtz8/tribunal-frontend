// src/pages/catalogos/ListaCalificativas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

import calificativaService from '../../services/calificativaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const ListaCalificativas = () => {
  const navigate = useNavigate();
  const [calificativas, setCalificativas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');

  useEffect(() => {
    loadCalificativas();
  }, [filtroActivo]);

  const loadCalificativas = async () => {
    setIsLoading(true);
    try {
      const params = filtroActivo !== '' ? { activo: filtroActivo } : {};
      const response = await calificativaService.getAll(params);
      const data = Array.isArray(response) ? response : (response.data || []);
      setCalificativas(data);
    } catch (error) {
      toast.error('Error al cargar calificativas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCalificativas();
      return;
    }

    setIsLoading(true);
    try {
      const response = await calificativaService.getAll({ search: searchTerm });
      const data = Array.isArray(response) ? response : (response.data || []);
      setCalificativas(data);
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFiltroActivo('');
    loadCalificativas();
  };

  const handleToggleActivo = async (id) => {
    try {
      await calificativaService.toggleActivo(id);
      toast.success('Estado actualizado correctamente');
      loadCalificativas();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta calificativa?')) return;

    try {
      await calificativaService.delete(id);
      toast.success('Calificativa eliminada correctamente');
      loadCalificativas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar calificativa');
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
            <h1 className="text-2xl font-bold text-gray-900">Calificativas del Delito</h1>
            <p className="text-gray-600">Catálogo de calificativas aplicables a las conductas</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => navigate('/catalogos/calificativas/nuevo')}>
          Nueva Calificativa
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar calificativa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filtroActivo) && (
            <Button variant="secondary" onClick={handleClearSearch}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando calificativas...</p>
          </div>
        ) : calificativas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron calificativas</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calificativas.map((calificativa) => (
                <tr key={calificativa.id_calificativa} className="hover:bg-gray-50">

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {calificativa.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActivo(calificativa.id_calificativa)}
                      className="flex items-center gap-2"
                    >
                      {calificativa.activo ? (
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
                        onClick={() => navigate(`/catalogos/calificativas/${calificativa.id_calificativa}/editar`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(calificativa.id_calificativa)}
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

export default ListaCalificativas;
