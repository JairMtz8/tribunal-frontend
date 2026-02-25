// src/pages/medidas-cautelares/ListaMedidasCautelares.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Shield, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import cjService from '../../services/cjService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const ListaMedidasCautelares = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo_fuero: '',
    tiene_medidas: '',
  });

  useEffect(() => {
    loadCarpetas();
  }, [filters]);

  const loadCarpetas = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 100 };

      if (filters.tipo_fuero) params.tipo_fuero = filters.tipo_fuero;
      if (filters.tiene_medidas !== '') params.tiene_medidas = filters.tiene_medidas;

      const response = await cjService.getAll(params);
      const data = response.data || [];
      setCarpetas(data);
    } catch (error) {
      toast.error('Error al cargar carpetas');
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
      const response = await cjService.getAll({ search: searchTerm, limit: 100 });
      const data = response.data || [];
      setCarpetas(data);
    } catch (error) {
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ tipo_fuero: '', tiene_medidas: '' });
    loadCarpetas();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medidas Cautelares</h1>
          <p className="text-gray-600">Gestión de medidas cautelares por carpeta CJ</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por número CJ o AMPEA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filters.tipo_fuero || filters.tiene_medidas) && (
            <Button variant="secondary" onClick={handleClearFilters}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Fuero"
            value={filters.tipo_fuero}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo_fuero: e.target.value }))}
            options={[
              { value: '', label: 'Todos' },
              { value: 'FEDERAL', label: 'FEDERAL' },
              { value: 'COMUN', label: 'COMÚN' }
            ]}
          />

          <Select
            label="Medidas Cautelares"
            value={filters.tiene_medidas}
            onChange={(e) => setFilters(prev => ({ ...prev, tiene_medidas: e.target.value }))}
            options={[
              { value: '', label: 'Todas' },
              { value: '1', label: 'Con Medidas Cautelares' },
              { value: '0', label: 'Sin Medidas Cautelares' }
            ]}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando carpetas...</p>
          </div>
        ) : carpetas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron carpetas CJ</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número CJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adolescente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Ingreso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuero</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medidas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carpetas.map((carpeta) => (
                <tr key={carpeta.id_cj} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{carpeta.numero_cj}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {carpeta.adolescente_nombre || carpeta.adolescente_iniciales || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(carpeta.fecha_ingreso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${carpeta.tipo_fuero === 'FEDERAL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {carpeta.tipo_fuero || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {carpeta.total_medidas_cautelares > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Con medida aplicada
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        Sin medida aplicada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/medidas-cautelares/${carpeta.proceso_id}/ver`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver medidas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/medidas-cautelares/${carpeta.proceso_id}/aplicar`)}
                        className="text-green-600 hover:text-green-900"
                        title="Aplicar medida cautelar"
                      >
                        <Shield className="w-4 h-4" />
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

export default ListaMedidasCautelares;
