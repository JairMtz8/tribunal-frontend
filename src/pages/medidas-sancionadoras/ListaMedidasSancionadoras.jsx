// src/pages/medidas-sancionadoras/ListaMedidasSancionadoras.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Scale, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import medidaSancionadoraService from '../../services/medidaSancionadoraService';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';

const ListaMedidasSancionadoras = () => {
  const navigate = useNavigate();
  const [medidas, setMedidas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas'); // todas, privativas, no-privativas
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadMedidas();
  }, [filtro]);

  const loadMedidas = async () => {
    setIsLoading(true);
    try {
      let response;
      if (filtro === 'privativas') {
        response = await medidaSancionadoraService.getPrivativas();
      } else if (filtro === 'no-privativas') {
        response = await medidaSancionadoraService.getNoPrivativas();
      } else {
        // Obtener todas las medidas
        response = await medidaSancionadoraService.getAll();
      }

      const data = Array.isArray(response) ? response : (response.data || []);

      const medidasAgrupadas = [];
      const procesosVistos = new Set();

      data.forEach(medida => {
        const procesoId = medida.id_proceso || medida.proceso_id;

        if (!procesosVistos.has(procesoId)) {
          procesosVistos.add(procesoId);

          const medidasDelProceso = data.filter(
            m => (m.id_proceso || m.proceso_id) === procesoId
          );

          // Filtrar según el tipo activo
          const candidatos = medidasDelProceso.filter(m => {
            if (filtro === 'privativas') return m.es_privativa;
            if (filtro === 'no-privativas') return !m.es_privativa;
            return true;
          });

          // Si no hay candidatos (caso extremo), usar todas
          const medidasBase = candidatos.length > 0 ? candidatos : medidasDelProceso;

          const tienePrivativa = medidasBase.some(m => m.es_privativa);
          const tieneNoPrivativa = medidasBase.some(m => !m.es_privativa);

          const tipoSentencia = (tienePrivativa && tieneNoPrivativa) ? 'MIXTA' : 'UNICA';

          // Tipos según filtro
          const tiposMedidas = medidasBase.map(m => m.tipo_nombre);

          // Medida de mayor duración
          const medidaMayor = medidasBase.reduce((max, m) => {
            const diasM = (m.plazo_anios * 365) + (m.plazo_meses * 30) + m.plazo_dias;
            const diasMax = (max.plazo_anios * 365) + (max.plazo_meses * 30) + max.plazo_dias;
            return diasM > diasMax ? m : max;
          });

          medidasAgrupadas.push({
            ...medidaMayor,
            total_medidas_proceso: medidasBase.length,
            tipos_medidas: tiposMedidas,
            tipo_sentencia: tipoSentencia
          });
        }
      });

      setMedidas(medidasAgrupadas);
    } catch (error) {
      toast.error('Error al cargar medidas sancionadoras');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularPlazoTotal = (anios, meses, dias) => {
    const totalDias = (anios * 365) + (meses * 30) + dias;
    return totalDias;
  };

  const formatearPlazo = (anios, meses, dias) => {
    const partes = [];
    if (anios > 0) partes.push(`${anios} año${anios > 1 ? 's' : ''}`);
    if (meses > 0) partes.push(`${meses} mes${meses > 1 ? 'es' : ''}`);
    if (dias > 0) partes.push(`${dias} día${dias > 1 ? 's' : ''}`);
    return partes.length > 0 ? partes.join(', ') : 'Sin plazo';
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta medida sancionadora?')) return;

    try {
      await medidaSancionadoraService.delete(id);
      toast.success('Medida sancionadora eliminada correctamente');
      loadMedidas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar medida');
    }
  };

  const total = medidas.length;
  const { page, limit } = pagination;
  const medidasPagina = medidas.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medidas Sancionadoras</h1>
          <p className="text-gray-600">Gestión de medidas aplicadas a adolescentes</p>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Aplicación de medidas</h3>
            <p className="text-sm text-blue-700">
              Las medidas sancionadoras se aplican desde la carpeta CEMS cuando hay sentencia CONDENATORIA o MIXTA.
              Ve a la carpeta CEMS correspondiente para aplicar una nueva medida.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="max-w-xs">
          <Select
            label="Tipo de Medida"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            options={[
              { value: 'todas', label: 'Todas las medidas' },
              { value: 'privativas', label: 'Solo Privativas' },
              { value: 'no-privativas', label: 'Solo No Privativas' }
            ]}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando medidas...</p>
          </div>
        ) : medidas.length === 0 ? (
          <div className="p-12 text-center">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay medidas sancionadoras</p>
            <p className="text-sm text-gray-400">
              Las medidas se aplican desde las carpetas CEMS
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Adolescente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo de Medida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Días
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo Sentencia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medidasPagina.map((medida) => (
                <tr key={medida.id_medida} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {medida.adolescente_nombre || medida.adolescente_iniciales}
                    </div>
                    {medida.total_medidas_proceso > 1 && (
                      <span className="text-xs text-blue-600 font-semibold">
                        {medida.total_medidas_proceso} medidas
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {medida.tipos_medidas && medida.tipos_medidas.length > 1 ? (
                        <div className="flex flex-col gap-1">
                          {medida.tipos_medidas.map((tipo, index) => (
                            <span key={index} className="text-xs">
                              {index + 1}. {tipo}
                            </span>
                          ))}
                        </div>
                      ) : (
                        medida.tipo_nombre
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatearPlazo(medida.plazo_anios, medida.plazo_meses, medida.plazo_dias)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {calcularPlazoTotal(medida.plazo_anios, medida.plazo_meses, medida.plazo_dias)} días
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {medida.es_privativa ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <Shield className="w-3 h-3" />
                        Privativa
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        No Privativa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {medida.tipo_sentencia === 'MIXTA' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Mixta
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Única
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/medidas-sancionadoras/proceso/${medida.id_proceso || medida.proceso_id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title={medida.total_medidas_proceso > 1 ? `Ver ${medida.total_medidas_proceso} medidas` : 'Ver detalle'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(medida.id_medida)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar primera medida"
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
        {total > limit && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Mostrando {((page - 1) * limit) + 1} a{' '}
              {Math.min(page * limit, total)} de{' '}
              {total} resultados
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaMedidasSancionadoras;
