// src/pages/cj/ListaCJ.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, FileText, Shield, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import cjService from '../../services/cjService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const LIMIT = 10;

const ListaCJ = () => {
  const navigate = useNavigate();
  const [todas, setTodas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo_fuero: '',
    con_cjo: '',
    con_medidas: ''
  });
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

      setTodas(allData);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Error al cargar carpetas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCarpetas(); }, []);

  const handleSearch = () => setCurrentPage(1);

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({ tipo_fuero: '', con_cjo: '', con_medidas: '' });
    loadCarpetas('');
  };

  const handleFueroChange = (e) => {
    const val = e.target.value;
    setFilters(prev => ({ ...prev, tipo_fuero: val }));
    loadCarpetas(val);
  };

  // Filtros client-side (texto + con_cjo + con_medidas)
  const filtradas = useMemo(() => {
    let data = todas;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      data = data.filter(c =>
        (c.numero_cj || '').toLowerCase().includes(q) ||
        (c.numero_cjo || '').toLowerCase().includes(q) ||
        (c.adolescente_nombre || '').toLowerCase().includes(q) ||
        (c.adolescente_iniciales || '').toLowerCase().includes(q)
      );
    }
    if (filters.con_cjo === '1') data = data.filter(c => c.id_cjo);
    else if (filters.con_cjo === '0') data = data.filter(c => !c.id_cjo);
    if (filters.con_medidas === '1') data = data.filter(c => Number(c.total_medidas_cautelares) > 0);
    else if (filters.con_medidas === '0') data = data.filter(c => Number(c.total_medidas_cautelares) === 0);
    return data;
  }, [todas, searchTerm, filters]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filters.con_cjo, filters.con_medidas]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / LIMIT));
  const pagina = filtradas.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta CJ?')) return;

    try {
      await cjService.delete(id);
      toast.success('Carpeta eliminada correctamente');
      loadCarpetas(filters.tipo_fuero);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar carpeta');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carpetas CJ</h1>
          <p className="text-gray-600">Carpetas de Investigación</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/procesos/nuevo')}>
          Nueva Carpeta CJ
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por número CJ o Nombre del adolescente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          {(searchTerm || filters.tipo_fuero || filters.con_cjo || filters.con_medidas) && (
            <Button variant="secondary" onClick={handleClearSearch}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Fuero"
            value={filters.tipo_fuero}
            onChange={handleFueroChange}
            options={[
              { value: '', label: 'Todos' },
              { value: 'FEDERAL', label: 'FEDERAL' },
              { value: 'COMUN', label: 'COMÚN' }
            ]}
          />

          <Select
            label="Medidas Cautelares"
            value={filters.con_medidas}
            onChange={(e) => setFilters(prev => ({ ...prev, con_medidas: e.target.value }))}
            options={[
              { value: '', label: 'Todos' },
              { value: '1', label: 'Con Medidas' },
              { value: '0', label: 'Sin Medidas' }
            ]}
          />

          <Select
            label="CJO"
            value={filters.con_cjo}
            onChange={(e) => setFilters(prev => ({ ...prev, con_cjo: e.target.value }))}
            options={[
              { value: '', label: 'Todos' },
              { value: '1', label: 'Con CJO' },
              { value: '0', label: 'Sin CJO' }
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
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No se encontraron carpetas</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número CJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre del adolescente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fuero
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
                {pagina.map((carpeta) => (
                  <tr key={carpeta.id_cj} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {carpeta.numero_cj}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {carpeta.adolescente_nombre || carpeta.adolescente_iniciales || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(carpeta.fecha_ingreso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${carpeta.tipo_fuero === 'FEDERAL'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {carpeta.tipo_fuero || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {carpeta.id_cjo ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {carpeta.numero_cjo}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Sin CJO
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/carpetas/cj/${carpeta.id_cj}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/carpetas/cj/${carpeta.id_cj}/editar`)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {carpeta.id_cjo ? (
                          <button
                            onClick={() => navigate(`/carpetas/cjo/${carpeta.id_cjo}`)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Ver CJO"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/carpetas/cjo/nueva?cj_id=${carpeta.id_cj}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Crear CJO"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                        {Number(carpeta.total_medidas_cautelares) > 0 ? (
                          <button
                            onClick={() => navigate(`/medidas-cautelares/${carpeta.proceso_id}/ver?origen=cj`)}
                            className="text-teal-600 hover:text-teal-900"
                            title={`Ver ${carpeta.total_medidas_cautelares} medida${carpeta.total_medidas_cautelares > 1 ? 's' : ''} cautelar${carpeta.total_medidas_cautelares > 1 ? 'es' : ''}`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/medidas-cautelares/${carpeta.proceso_id}/aplicar?origen=cj`)}
                            className="text-teal-600 hover:text-teal-900"
                            title="Aplicar medida cautelar"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(carpeta.id_cj)}
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
            {filtradas.length > LIMIT && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <span className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * LIMIT) + 1}–{Math.min(currentPage * LIMIT, filtradas.length)} de {filtradas.length} resultados
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
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

export default ListaCJ;
