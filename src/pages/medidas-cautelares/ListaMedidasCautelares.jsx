// src/pages/medidas-cautelares/ListaMedidasCautelares.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Shield, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import cjService from '../../services/cjService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const LIMIT = 10;

const ListaMedidasCautelares = () => {
  const navigate = useNavigate();
  const [todas, setTodas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFuero, setFiltroFuero] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadCarpetas = async (fuero = '') => {
    setIsLoading(true);
    try {
      let allData = [];
      let page = 1;
      const limit = 50;

      while (true) {
        const params = { page, limit };
        if (fuero) params.tipo_fuero = fuero;
        const response = await cjService.getAll(params);
        const data = Array.isArray(response) ? response : (response.data || []);
        const total = response.pagination?.total ?? data.length;

        allData = [...allData, ...data];

        if (allData.length >= total || data.length < limit) break;
        page++;
      }

      setTodas(allData.filter(c => Number(c.total_medidas_cautelares) > 0));
      setCurrentPage(1);
    } catch (error) {
      toast.error('Error al cargar carpetas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCarpetas(); }, []);

  const handleSearch = () => setCurrentPage(1);

  const handleFueroChange = (e) => {
    const val = e.target.value;
    setFiltroFuero(val);
    loadCarpetas(val);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFiltroFuero('');
    loadCarpetas('');
  };

  const filtradas = useMemo(() => {
    if (!searchTerm.trim()) return todas;
    const q = searchTerm.trim().toLowerCase();
    return todas.filter(c =>
      (c.numero_cj || '').toLowerCase().includes(q) ||
      (c.adolescente_nombre || '').toLowerCase().includes(q) ||
      (c.adolescente_iniciales || '').toLowerCase().includes(q)
    );
  }, [todas, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / LIMIT));
  const pagina = filtradas.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medidas Cautelares</h1>
          <p className="text-gray-600">Gestión de medidas cautelares por carpeta CJ</p>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Aplicación de medidas</h3>
            <p className="text-sm text-blue-700">
              Las medidas cautelares se aplican desde la carpeta CJ correspondiente.
              Ve a la carpeta CJ para aplicar o gestionar nuevas medidas cautelares.
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
              placeholder="Buscar por número CJ o nombre del adolescente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filtroFuero) && (
            <Button variant="secondary" onClick={handleClearFilters}>
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Fuero"
            value={filtroFuero}
            onChange={handleFueroChange}
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
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No hay carpetas CJ con medidas cautelares aplicadas</p>
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
              {pagina.map((carpeta) => (
                <tr key={carpeta.id_cj} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {carpeta.numero_cj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {carpeta.adolescente_nombre || carpeta.adolescente_iniciales || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(carpeta.fecha_ingreso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${carpeta.tipo_fuero === 'FEDERAL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {carpeta.tipo_fuero || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                      <Shield className="w-3 h-3" />
                      {carpeta.total_medidas_cautelares} medida{carpeta.total_medidas_cautelares > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/medidas-cautelares/${carpeta.proceso_id}/ver`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver medidas cautelares"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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

export default ListaMedidasCautelares;
