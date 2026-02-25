// src/pages/cemci/DetalleCEMCI.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Shield, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

import cemciService from '../../services/cemciService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';
import { formatDate } from '../../utils/formatters';

const DetalleCEMCI = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cemci, setCemci] = useState(null);
  const [seguimiento, setSeguimiento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCEMCI();
  }, [id]);

  const loadCEMCI = async () => {
    setIsLoading(true);
    try {
      const response = await cemciService.getById(id);
      const cemciData = response.data || response;
      setCemci(cemciData);

      // El seguimiento viene incluido en la respuesta
      const seguimientos = cemciData.seguimientos || [];
      setSeguimiento(seguimientos.length > 0 ? seguimientos[0] : null);
    } catch (error) {
      toast.error('Error al cargar CEMCI');
      console.error(error);
      navigate('/carpetas/cemci');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando carpeta CEMCI...</p>
        </div>
      </div>
    );
  }

  if (!cemci) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carpeta CEMCI no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/carpetas/cemci')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cemci.numero_cemci}</h1>
            <p className="text-gray-600">Centro de Medidas Cautelares de Internamiento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => navigate(`/carpetas/cj/${cemci.cj_id}`)}
          >
            Ver CJ Origen
          </Button>
          {cemci.cjo_id && (
            <Button
              variant="secondary"
              icon={FileText}
              onClick={() => navigate(`/carpetas/cjo/${cemci.cjo_id}`)}
            >
              Ver CJO
            </Button>
          )}
          <Button icon={Edit} onClick={() => navigate(`/carpetas/cemci/${id}/editar`)}>
            Editar CEMCI
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Información General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoField label="Número CEMCI" value={cemci.numero_cemci} />
          <InfoField label="CJ Origen" value={cemci.numero_cj} />
          <InfoField label="CJO" value={cemci.numero_cjo || 'Sin CJO'} />
          <InfoField label="Fecha de Recepción" value={formatDate(cemci.fecha_recepcion_cemci)} />
          <InfoField label="Estado Procesal" value={cemci.estado_procesal_nombre} />
          <InfoField label="Estado" value={cemci.concluido || 'Activo'} />
        </div>

        {cemci.observaciones && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Observaciones</p>
            <p className="text-gray-900 whitespace-pre-wrap">{cemci.observaciones}</p>
          </div>
        )}
      </div>

      {/* Seguimiento CEMCI */}
      <AccordionSection title="Seguimiento CEMCI" defaultOpen={true}>
        {seguimiento ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="Fecha de Radicación" value={formatDate(seguimiento.fecha_radicacion)} />
              <InfoField
                label="Fecha Recepción Plan de Actividades"
                value={formatDate(seguimiento.fecha_recepcion_plan_actividades)}
              />
              <InfoField
                label="Fecha Audiencia Inicial CEMCI"
                value={formatDate(seguimiento.fecha_audiencia_inicial_cemci)}
              />
              <InfoField
                label="Fecha Aprobación Plan de Actividades"
                value={formatDate(seguimiento.fecha_aprobacion_plan_actividades)}
              />
              <InfoField
                label="Fecha de Suspensión"
                value={formatDate(seguimiento.fecha_suspension)}
              />
              <InfoField
                label="Motivo de Suspensión"
                value={seguimiento.motivo_suspension}
              />
            </div>

            {seguimiento.obligaciones_plan_actividades && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Obligaciones del Plan de Actividades</p>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                  {seguimiento.obligaciones_plan_actividades}
                </p>
              </div>
            )}

            {seguimiento.ultimo_informe && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Último Informe</p>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                  {seguimiento.ultimo_informe}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay seguimiento registrado</p>
            <p className="text-gray-400 text-xs mt-1">Puede agregarlo desde el botón "Editar CEMCI"</p>
          </div>
        )}
      </AccordionSection>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Carpeta auto-creada</h3>
            <p className="text-sm text-blue-700">
              Esta CEMCI fue creada automáticamente al aplicar una medida cautelar de internamiento
              en el proceso asociado a la CJ {cemci.numero_cj}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente AccordionSection
const AccordionSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

export default DetalleCEMCI;
