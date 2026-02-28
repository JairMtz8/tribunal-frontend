// src/pages/audiencias/DetalleAudiencia.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Clock, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

import audienciaService from '../../services/audienciaService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';
import { formatDateTime } from '../../utils/formatters';

const DetalleAudiencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [audiencia, setAudiencia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudiencia();
  }, [id]);

  const loadAudiencia = async () => {
    setIsLoading(true);
    try {
      const response = await audienciaService.getById(id);
      const audienciaData = response.data || response;
      setAudiencia(audienciaData);
    } catch (error) {
      toast.error('Error al cargar audiencia');
      console.error(error);
      navigate('/audiencias');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando audiencia...</p>
        </div>
      </div>
    );
  }

  if (!audiencia) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Audiencia no encontrada</p>
        </div>
      </div>
    );
  }

  const getCarpetaAsociada = () => {
    if (audiencia.numero_cj) return { tipo: 'CJ', numero: audiencia.numero_cj, id: audiencia.cj_id, ruta: 'cj' };
    if (audiencia.numero_cjo) return { tipo: 'CJO', numero: audiencia.numero_cjo, id: audiencia.cjo_id, ruta: 'cjo' };
    if (audiencia.numero_cemci) return { tipo: 'CEMCI', numero: audiencia.numero_cemci, id: audiencia.cemci_id, ruta: 'cemci' };
    if (audiencia.numero_cems) return { tipo: 'CEMS', numero: audiencia.numero_cems, id: audiencia.cems_id, ruta: 'cems' };
    return null;
  };

  const carpeta = getCarpetaAsociada();

  const esFutura = new Date(audiencia.fecha_audiencia) > new Date();
  const esHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaAud = new Date(audiencia.fecha_audiencia).toISOString().split('T')[0];
    return hoy === fechaAud;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/audiencias')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Audiencia</h1>
            <p className="text-gray-600">
              {audiencia.adolescente_nombre || audiencia.adolescente_iniciales}
            </p>
          </div>
        </div>
        <Button icon={Edit} onClick={() => navigate(`/audiencias/${id}/editar`)}>
          Editar Audiencia
        </Button>
      </div>

      {/* Estado de la Audiencia */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Estado de la Audiencia</p>
            {esHoy() ? (
              <span className="px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                HOY - {formatDateTime(audiencia.fecha_audiencia)}
              </span>
            ) : esFutura ? (
              <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                PRÓXIMA - {formatDateTime(audiencia.fecha_audiencia)}
              </span>
            ) : (
              <span className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                REALIZADA - {formatDateTime(audiencia.fecha_audiencia)}
              </span>
            )}
          </div>
          {carpeta && (
            <button
              onClick={() => navigate(`/carpetas/${carpeta.ruta}/${carpeta.id}`)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
            >
              Ver Carpeta {carpeta.tipo}: {carpeta.numero}
            </button>
          )}
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Información General
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField 
            label="Adolescente" 
            value={audiencia.adolescente_nombre || audiencia.adolescente_iniciales} 
            icon={User}
          />
          
          <InfoField 
            label="Fecha y Hora" 
            value={formatDateTime(audiencia.fecha_audiencia)} 
            icon={Clock}
          />

          <InfoField 
            label="Tipo de Audiencia" 
            value={audiencia.tipo || 'No especificado'} 
            icon={FileText}
          />

          {carpeta && (
            <InfoField 
              label="Carpeta Asociada" 
              value={`${carpeta.tipo}: ${carpeta.numero}`}
              icon={FileText}
            />
          )}
        </div>
      </div>

      {/* Observaciones */}
      {audiencia.observaciones && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{audiencia.observaciones}</p>
        </div>
      )}

      {/* Información del Proceso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Audiencia del Proceso</h3>
            <p className="text-sm text-blue-700">
              Esta audiencia está asociada al proceso judicial del adolescente{' '}
              <strong>{audiencia.adolescente_nombre || audiencia.adolescente_iniciales}</strong>
              {carpeta && (
                <> en la carpeta <strong>{carpeta.tipo}: {carpeta.numero}</strong></>
              )}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleAudiencia;
