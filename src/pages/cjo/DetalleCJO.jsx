// src/pages/cjo/DetalleCJO.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

import cjoService from '../../services/cjoService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';
import { formatDate } from '../../utils/formatters';

const DetalleCJO = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cjo, setCjo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCJO();
  }, [id]);

  const loadCJO = async () => {
    setIsLoading(true);
    try {
      const response = await cjoService.getById(id);
      const cjoData = response.data || response;
      setCjo(cjoData);
    } catch (error) {
      toast.error('Error al cargar CJO');
      console.error(error);
      navigate('/carpetas/cjo');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando carpeta CJO...</p>
        </div>
      </div>
    );
  }

  if (!cjo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carpeta CJO no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/carpetas/cjo')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cjo.numero_cjo}</h1>
            <p className="text-gray-600">Carpeta de Juicio Oral</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={FileText} 
            onClick={() => navigate(`/carpetas/cj/${cjo.cj_id}`)}
          >
            Ver CJ Origen
          </Button>
          <Button icon={Edit} onClick={() => navigate(`/carpetas/cjo/${id}/editar`)}>
            Editar CJO
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoField label="Número CJO" value={cjo.numero_cjo} />
          <InfoField label="CJ Origen" value={cjo.numero_cj} />
          <InfoField label="Fecha de Ingreso" value={formatDate(cjo.fecha_ingreso)} />
          <InfoField label="Tipo de Fuero" value={cjo.fuero} />
          <InfoField label="Fecha Auto de Apertura" value={formatDate(cjo.fecha_auto_apertura)} />
        </div>
      </div>

      {/* Sentencia */}
      <AccordionSection title="Sentencia" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField label="Tipo de Sentencia" value={cjo.sentencia} />
            <InfoField label="Fecha de Sentencia" value={formatDate(cjo.fecha_sentencia)} />
            <InfoField label="Monto Reparación del Daño" value={cjo.monto_reparacion_dano ? `$${cjo.monto_reparacion_dano}` : 'N/A'} />
            <InfoField label="Fecha Causó Estado" value={formatDate(cjo.fecha_causo_estado)} />
            <InfoField label="Toca de Apelación" value={cjo.toca_apelacion} />
            <InfoField label="Fecha Sentencia Enviada a Ejecución" value={formatDate(cjo.fecha_sentencia_enviada_ejecucion)} />
          </div>

          {/* Badge si genera CEMS */}
          {cjo.sentencia && (cjo.sentencia.includes('CONDENATORI') || cjo.sentencia.includes('MIXTA')) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Genera CEMS:</strong> Esta sentencia ({cjo.sentencia}) genera automáticamente 
                un registro en el Centro de Ejecución de Medidas Sancionadoras (CEMS).
              </p>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Información de Jueces */}
      <AccordionSection title="Información de Jueces">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Juez que Envía" value={cjo.juez_envia} />
          <InfoField label="Juez que Recibe" value={cjo.juez_recibe} />
          <div className="flex items-center gap-2">
            {cjo.compurga_totalidad ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium">
              Compurga Totalidad: {cjo.compurga_totalidad ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
      </AccordionSection>

      {/* Representante PP NNyA */}
      <AccordionSection title="Representante PP NNyA">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Representante PP NNyA" value={cjo.representante_pp_nnya} />
          <InfoField label="Tipo de Representación" value={cjo.tipo_representacion_pp_nnya} />
        </div>
      </AccordionSection>
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

export default DetalleCJO;
