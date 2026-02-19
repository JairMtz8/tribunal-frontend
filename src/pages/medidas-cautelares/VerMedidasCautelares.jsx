// src/pages/medidas-cautelares/VerMedidasCautelares.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Plus, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import medidaCautelarService from '../../services/medidaCautelarService';
import procesoService from '../../services/procesoService';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const VerMedidasCautelares = () => {
  const { procesoId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [medidas, setMedidas] = useState([]);
  const [proceso, setProceso] = useState(null);

  useEffect(() => {
    loadData();
  }, [procesoId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [medidasResponse, procesoResponse] = await Promise.all([
        medidaCautelarService.getByProceso(procesoId),
        procesoService.getById(procesoId)
      ]);

      const medidasData = medidasResponse.data || medidasResponse;
      const { proceso: procesoData } = procesoResponse.data || procesoResponse;

      setMedidas(Array.isArray(medidasData) ? medidasData : []);
      setProceso(procesoData);
    } catch (error) {
      toast.error('Error al cargar medidas');
      console.error(error);
      navigate('/medidas-cautelares');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (medidaId) => {
    if (!confirm('¿Está seguro de eliminar esta medida cautelar? Esta acción no se puede deshacer.')) return;

    try {
      await medidaCautelarService.delete(medidaId);
      toast.success('Medida cautelar eliminada');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar medida');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando medidas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/medidas-cautelares')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medidas Cautelares</h1>
            <p className="text-gray-600">
              Proceso: {proceso?.adolescente?.nombre || proceso?.adolescente?.iniciales || 'N/A'}
              {proceso?.cj && ` - CJ: ${proceso.cj.numero_cj}`}
            </p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => navigate(`/medidas-cautelares/${procesoId}/aplicar`)}>
          Aplicar Nueva Medida
        </Button>
      </div>

      {/* Lista de Medidas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {medidas.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No hay medidas cautelares aplicadas</p>
            <Button onClick={() => navigate(`/medidas-cautelares/${procesoId}/aplicar`)}>
              Aplicar Primera Medida
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {medidas.map((medida) => (
              <div key={medida.id_medida_cautelar} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {medida.tipo_medida_nombre || 'Medida Cautelar'}
                      </h3>
                      {medida.revocacion_medida ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          TERMINADA
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          VIGENTE
                        </span>
                      )}
                      {medida.genera_cemci === 1 && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          GENERA CEMCI
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Imposición</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(medida.fecha_medida_cautelar)}
                        </p>
                      </div>

                      {medida.fecha_revocacion_medida && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Término</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(medida.fecha_revocacion_medida)}
                          </p>
                        </div>
                      )}

                      {medida.observaciones && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Observaciones</p>
                          <p className="font-medium text-gray-900">{medida.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleEliminar(medida.id_medida_cautelar)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerMedidasCautelares;
