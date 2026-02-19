// src/pages/procesos/DetalleProceso.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import procesoService from '../../services/procesoService';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const DetalleProceso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceso, setProceso] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProceso();
  }, [id]);

  const loadProceso = async () => {
    setIsLoading(true);
    try {
      const response = await procesoService.getById(id);
      console.log('📦 Response completo:', response);

      const { proceso: procesoData, carpetas } = response.data || response;

      // Combinar proceso con sus carpetas
      const procesoCompleto = {
        ...procesoData,
        cj: carpetas?.cj || null,
        cjo: carpetas?.cjo || null,
        cemci: carpetas?.cemci || null,
        cems: carpetas?.cems || null
      };

      console.log('📦 Proceso completo:', procesoCompleto);
      setProceso(procesoCompleto);
    } catch (error) {
      toast.error('Error al cargar el proceso');
      console.error(error);
      navigate('/procesos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando proceso...</p>
        </div>
      </div>
    );
  }

  if (!proceso) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Proceso no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/procesos')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proceso #{proceso.id_proceso}</h1>
            <p className="text-gray-600">Vista completa del caso</p>
          </div>
        </div>
        <Button icon={Edit} onClick={() => navigate(`/procesos/${id}/editar`)}>
          Editar Proceso
        </Button>
      </div>

      {/* Información del Adolescente */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Información del Adolescente</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.nombre || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Iniciales</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.iniciales || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha Nacimiento</p>
            <p className="font-medium text-gray-900">{formatDate(proceso.adolescente?.fecha_nacimiento)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sexo</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.sexo || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nacionalidad</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.nacionalidad || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Escolaridad</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.escolaridad || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button size="sm" variant="outline" onClick={() => navigate(`/adolescentes/${proceso.adolescente_id}`)}>
            Ver Perfil Completo
          </Button>
        </div>
      </div>

      {/* Información del Proceso */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Proceso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {proceso.status_nombre || 'N/A'}
            </span>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Observaciones</p>
            <p className="font-medium text-gray-900">{proceso.observaciones || 'Sin observaciones'}</p>
          </div>
        </div>
      </div>

      {/* Carpetas Asociadas */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Carpetas del Proceso</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CJ */}
          {proceso.cj && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CJ</span>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Investigación</span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cj.numero_cj}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/carpetas/cj/${proceso.cj.id_cj}`)}>
                Ver CJ
              </Button>
            </div>
          )}

          {/* CJO */}
          {proceso.cjo && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CJO</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Juicio Oral</span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cjo.numero_cjo}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/carpetas/cjo/${proceso.cjo.id_cjo}`)}>
                Ver CJO
              </Button>
            </div>
          )}
        </div>

        {!proceso.cj && !proceso.cjo && (
          <p className="text-gray-500 text-center py-8">No hay carpetas asociadas a este proceso</p>
        )}
      </div>
    </div>
  );
};

export default DetalleProceso;
