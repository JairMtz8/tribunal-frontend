// src/pages/procesos/DetalleProceso.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Calendar, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
      const response = await fetch(`/api/procesos/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar proceso');

      const data = await response.json();
      setProceso(data.data || data);
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
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/procesos')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Proceso #{proceso.id_proceso}
            </h1>
            <p className="text-gray-600">Vista completa del caso</p>
          </div>
        </div>
        <Button
          icon={Edit}
          onClick={() => navigate(`/procesos/${id}/editar`)}
        >
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/adolescentes/${proceso.adolescente_id}`)}
          >
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
          <div>
            <p className="text-sm text-gray-500">Fecha de Creación</p>
            <p className="font-medium text-gray-900">{formatDate(proceso.created_at)}</p>
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
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                  Investigación
                </span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cj.numero_cj}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/carpetas/cj/${proceso.cj.id_cj}`)}
              >
                Ver CJ
              </Button>
            </div>
          )}

          {/* CJO */}
          {proceso.cjo && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CJO</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Juicio Oral
                </span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cjo.numero_cjo}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/carpetas/cjo/${proceso.cjo.id_cjo}`)}
              >
                Ver CJO
              </Button>
            </div>
          )}

          {/* CEMCI */}
          {proceso.cemci && proceso.cemci.length > 0 && proceso.cemci.map((cemci) => (
            <div key={cemci.id_cemci} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CEMCI</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  Cautelar
                </span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{cemci.numero_cemci}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/carpetas/cemci/${cemci.id_cemci}`)}
              >
                Ver CEMCI
              </Button>
            </div>
          ))}

          {/* CEMS */}
          {proceso.cems && proceso.cems.length > 0 && proceso.cems.map((cems) => (
            <div key={cems.id_cems} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CEMS</span>
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                  Ejecución
                </span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{cems.numero_cems}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/carpetas/cems/${cems.id_cems}`)}
              >
                Ver CEMS
              </Button>
            </div>
          ))}
        </div>

        {!proceso.cj && !proceso.cjo && (!proceso.cemci || proceso.cemci.length === 0) && (!proceso.cems || proceso.cems.length === 0) && (
          <p className="text-gray-500 text-center py-8">
            No hay carpetas asociadas a este proceso
          </p>
        )}
      </div>

      {/* Audiencias */}
      {proceso.audiencias && proceso.audiencias.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Audiencias</h2>
          </div>

          <div className="space-y-3">
            {proceso.audiencias.map((audiencia) => (
              <div key={audiencia.id_audiencia} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{audiencia.tipo}</p>
                  <p className="text-sm text-gray-500">{formatDate(audiencia.fecha_audiencia)}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                  {audiencia.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleProceso;
