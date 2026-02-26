// src/pages/medidas-sancionadoras/DetalleMedidasProceso.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Scale, Shield, Calculator, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import medidaSancionadoraService from '../../services/medidaSancionadoraService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';

const DetalleMedidasProceso = () => {
  const { proceso_id } = useParams();
  const navigate = useNavigate();

  const [medidas, setMedidas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedidas();
  }, [proceso_id]);

  const loadMedidas = async () => {
    setIsLoading(true);
    try {
      const response = await medidaSancionadoraService.getByProcesoId(proceso_id);
      const medidasData = Array.isArray(response) ? response : (response.data || []);
      setMedidas(medidasData);
    } catch (error) {
      toast.error('Error al cargar medidas');
      console.error(error);
      navigate('/medidas-sancionadoras');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularPlazoTotal = (anios, meses, dias) => {
    return (anios * 365) + (meses * 30) + dias;
  };

  const formatearPlazo = (anios, meses, dias) => {
    const partes = [];
    if (anios > 0) partes.push(`${anios} año${anios > 1 ? 's' : ''}`);
    if (meses > 0) partes.push(`${meses} mes${meses > 1 ? 'es' : ''}`);
    if (dias > 0) partes.push(`${dias} día${dias > 1 ? 's' : ''}`);
    return partes.length > 0 ? partes.join(', ') : 'Sin plazo definido';
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta medida sancionadora?')) return;

    try {
      await medidaSancionadoraService.delete(id);
      toast.success('Medida eliminada correctamente');
      loadMedidas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar medida');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando medidas sancionadoras...</p>
        </div>
      </div>
    );
  }

  const plazoTotalGeneral = medidas.reduce((acc, m) => 
    acc + calcularPlazoTotal(m.plazo_anios, m.plazo_meses, m.plazo_dias), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/medidas-sancionadoras')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medidas Sancionadoras del Proceso</h1>
            <p className="text-gray-600">{medidas.length} medida{medidas.length !== 1 ? 's' : ''} aplicada{medidas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button 
          icon={Plus} 
          onClick={() => navigate(`/medidas-sancionadoras/nueva?proceso_id=${proceso_id}`)}
        >
          Añadir Otra Medida
        </Button>
      </div>

      {/* Resumen General */}
      {medidas.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">Plazo Total Acumulado</h3>
              <p className="text-2xl font-bold text-blue-900">{plazoTotalGeneral} días</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Total de medidas</p>
              <p className="text-2xl font-bold text-blue-900">{medidas.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Medidas */}
      {medidas.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay medidas sancionadoras</p>
          <p className="text-sm text-gray-400 mb-4">
            Este proceso aún no tiene medidas aplicadas
          </p>
          <Button 
            icon={Plus} 
            onClick={() => navigate(`/medidas-sancionadoras/nueva?proceso_id=${proceso_id}`)}
          >
            Aplicar Primera Medida
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {medidas.map((medida, index) => {
            const plazoTotal = calcularPlazoTotal(medida.plazo_anios, medida.plazo_meses, medida.plazo_dias);
            
            return (
              <div key={medida.id_medida} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Medida #{index + 1}: {medida.tipo_nombre}
                    </h3>
                    {medida.es_privativa ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-2">
                        <Shield className="w-3 h-3" />
                        Medida Privativa de Libertad
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-2 inline-block">
                        Medida No Privativa
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/medidas-sancionadoras/${medida.id_medida}/editar`)}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(medida.id_medida)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InfoField label="Años" value={medida.plazo_anios || 0} />
                  <InfoField label="Meses" value={medida.plazo_meses || 0} />
                  <InfoField label="Días" value={medida.plazo_dias || 0} />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Total</p>
                    <p className="text-lg font-bold text-blue-900">{plazoTotal} días</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Plazo:</strong> {formatearPlazo(medida.plazo_anios, medida.plazo_meses, medida.plazo_dias)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alerta informativa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Scale className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">Sobre las medidas sancionadoras</h3>
            <p className="text-sm text-gray-600">
              Un proceso puede tener múltiples medidas sancionadoras. El plazo total se calcula como la suma de todas las medidas aplicadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleMedidasProceso;
