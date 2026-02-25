// src/pages/cems/ListaCEMS.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

import cemsService from '../../services/cemsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/formatters';

const ListaCEMS = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCarpetas();
  }, []);

  const loadCarpetas = async () => {
    setIsLoading(true);
    try {
      const response = await cemsService.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setCarpetas(data);
    } catch (error) {
      toast.error('Error al cargar carpetas CEMS');
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
      const response = await cemsService.getAll({ search: searchTerm });
      const data = Array.isArray(response) ? response : (response.data || []);
      setCarpetas(data);
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadCarpetas();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta CEMS? Esta acción no se puede deshacer.')) return;

    try {
      await cemsService.delete(id);
      toast.success('Carpeta CEMS eliminada correctamente');
      loadCarpetas();
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

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
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
          {searchTerm && (
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
            <p className="mt-4 text-gray-600">Cargando carpetas CEMS...</p>
          </div>
        ) : carpetas.length === 0 ? (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número CEMS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CJ Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CJO
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carpetas.map((carpeta) => (
                <tr key={carpeta.id_cems} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {carpeta.numero_cems}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ListaCEMS;
