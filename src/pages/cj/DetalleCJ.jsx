// src/pages/cj/DetalleCJ.jsx
// ==================== PARTE 1/4 ====================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, X, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import cjService from '../../services/cjService';
import cjConductaService from '../../services/cjConductaService';
import actorService from '../../services/actorService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';
import { formatDate } from '../../utils/formatters';

const DetalleCJ = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cj, setCJ] = useState(null);
  const [conductas, setConductas] = useState([]);
  const [actoresAsignados, setActoresAsignados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCJ();
  }, [id]);

  const loadCJ = async () => {
    setIsLoading(true);
    try {
      const response = await cjService.getById(id);
      const cjData = response.data || response;
      setCJ(cjData);
      loadConductas(id);
      if (cjData.proceso_id) {
        loadActoresAsignados(cjData.proceso_id);
      }
    } catch (error) {
      toast.error('Error al cargar CJ');
      console.error(error);
      navigate('/carpetas/cj');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConductas = async (cjId) => {
    try {
      console.log('🔍 Cargando conductas para CJ:', cjId);
      const response = await cjConductaService.getByCJ(cjId);
      console.log('📦 Respuesta del servicio:', response);
      const data = response.data || [];
      console.log('📋 Conductas obtenidas:', data);
      setConductas(data);
    } catch (error) {
      console.error('❌ Error al cargar conductas:', error);
    }
  };

  const loadActoresAsignados = async (procesoId) => {
    try {
      const response = await actorService.getByProceso(procesoId);
      const actores = response.data || [];
      const actoresCJ = actores.filter(a => a.tipo_carpeta === 'CJ');
      setActoresAsignados(actoresCJ);
    } catch (error) {
      console.error('Error al cargar actores:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando carpeta CJ...</p>
        </div>
      </div>
    );
  }

  if (!cj) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carpeta CJ no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/carpetas/cj')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cj.numero_cj}</h1>
            <p className="text-gray-600">Carpeta de Investigación Judicial</p>
          </div>
        </div>
        <Button icon={Edit} onClick={() => navigate(`/carpetas/cj/${id}/editar`)}>
          Editar CJ
        </Button>
      </div>

      {/* Información General */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoField label="Número CJ" value={cj.numero_cj} />
          <InfoField label="Fecha de Ingreso" value={formatDate(cj.fecha_ingreso)} />
          <InfoField label="Tipo de Fuero" value={cj.tipo_fuero} />
        </div>

        {/* Características especiales (badges) */}
        {(cj.control || cj.lesiones || cj.vinculacion || cj.reincidente || cj.sustraido ||
          cj.suspension_condicional_proceso_prueba || cj.audiencia_intermedia) && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Características:</p>
              <div className="flex flex-wrap gap-2">
                {cj.control && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Control
                  </span>
                )}
                {cj.lesiones && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Lesiones
                  </span>
                )}
                {cj.vinculacion && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Vinculado
                  </span>
                )}
                {cj.reincidente && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    Reincidente
                  </span>
                )}
                {cj.sustraido && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Sustraído
                  </span>
                )}
                {cj.suspension_condicional_proceso_prueba && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Suspensión Condicional
                  </span>
                )}
                {cj.audiencia_intermedia && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    Audiencia Intermedia
                  </span>
                )}
              </div>
            </div>
          )}
      </div>
      {/* ==================== PARTE 2/4 ==================== */}

      {/* Conductas */}
      <AccordionSection title="Conductas del Adolescente" defaultOpen={true}>
        {conductas.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay conductas registradas</p>
        ) : (
          <div className="space-y-3">
            {conductas.map((conducta, index) => (
              <div key={conducta.id_conducta} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <h4 className="font-semibold text-gray-900">
                        {conducta.conducta?.nombre || conducta.conducta_nombre || 'N/A'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Calificativa</p>
                        <p className="font-medium text-gray-900">
                          {conducta.calificativa?.nombre || conducta.calificativa_nombre || 'N/A'}
                        </p>
                      </div>
                      {conducta.especificacion_adicional && (
                        <div>
                          <p className="text-gray-500">Especificación</p>
                          <p className="font-medium text-gray-900">{conducta.especificacion_adicional}</p>
                        </div>
                      )}
                      {conducta.fecha_conducta && (
                        <div>
                          <p className="text-gray-500">Fecha</p>
                          <p className="font-medium text-gray-900">{formatDate(conducta.fecha_conducta)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AccordionSection>

      {/* Narcóticos */}
      <AccordionSection title="Narcóticos">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoField label="Número AMPEA" value={cj.numero_ampea} />
          <InfoField label="Tipo Narcótico Asegurado" value={cj.tipo_narcotico_asegurado} />
          <InfoField label="Peso en Gramos" value={cj.peso_narcotico_gramos} />
        </div>
      </AccordionSection>

      {/* Control y Formulación */}
      <AccordionSection title="Control y Formulación">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {cj.control ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
            <span className="font-medium">Control: {cj.control ? 'Sí' : 'No'}</span>
          </div>
          {cj.control && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
              <InfoField label="Fecha Control" value={formatDate(cj.fecha_control)} />
              <InfoField label="Fecha Formulación" value={formatDate(cj.fecha_formulacion)} />
            </div>
          )}
          <div className="flex items-center gap-2">
            {cj.lesiones ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
            <span className="font-medium">Lesiones: {cj.lesiones ? 'Sí' : 'No'}</span>
          </div>
        </div>
      </AccordionSection>

      {/* Vinculación */}
      <AccordionSection title="Vinculación">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {cj.vinculacion ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
            <span className="font-medium">Vinculación: {cj.vinculacion ? 'Sí' : 'No'}</span>
          </div>
          {cj.vinculacion && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
              <InfoField label="Fecha Vinculación" value={formatDate(cj.fecha_vinculacion)} />
              <InfoField label="Conducta Vinculación" value={cj.conducta_vinculacion} />
              <InfoField label="Declaró" value={cj.declaro} />
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Suspensión Condicional */}
      <AccordionSection title="Suspensión Condicional del Proceso">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {cj.suspension_condicional_proceso_prueba ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
            <span className="font-medium">Suspensión Condicional: {cj.suspension_condicional_proceso_prueba ? 'Sí' : 'No'}</span>
          </div>
          {cj.suspension_condicional_proceso_prueba && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
              <InfoField label="Plazo Suspensión" value={cj.plazo_suspension} />
              <InfoField label="Fecha Suspensión" value={formatDate(cj.fecha_suspension)} />
              <InfoField label="Fecha Terminación" value={formatDate(cj.fecha_terminacion_suspension)} />
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Audiencia Intermedia */}
      <AccordionSection title="Audiencia Intermedia">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {cj.audiencia_intermedia ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
            <span className="font-medium">Audiencia Intermedia: {cj.audiencia_intermedia ? 'Sí' : 'No'}</span>
          </div>
          {cj.audiencia_intermedia && (
            <div className="ml-7">
              <InfoField label="Fecha Audiencia Intermedia" value={formatDate(cj.fecha_audiencia_intermedia)} />
            </div>
          )}
        </div>
      </AccordionSection>
      {/* ==================== PARTE 3/4 ==================== */}

      {/* Otras Características */}
      <AccordionSection title="Otras Características">
        <div className="space-y-4">
          <InfoField label="Estatus Carpeta Preliminar" value={cj.estatus_carpeta_preliminar} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {cj.reincidente ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
              <span className="font-medium">Reincidente: {cj.reincidente ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              {cj.sustraido ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
              <span className="font-medium">Sustraído: {cj.sustraido ? 'Sí' : 'No'}</span>
            </div>
          </div>
          {cj.sustraido && (
            <div className="ml-7">
              <InfoField label="Fecha Sustracción" value={formatDate(cj.fecha_sustraccion)} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InfoField label="Medidas de Protección" value={cj.medidas_proteccion} />
            <InfoField label="Número Toca Apelación" value={cj.numero_toca_apelacion} />
            <InfoField label="Número Total de Audiencias" value={cj.numero_total_audiencias} />
            <InfoField label="Corporación Ejecutora" value={cj.corporacion_ejecutora} />
          </div>
        </div>
      </AccordionSection>

      {/* Representante PP NNyA */}
      <AccordionSection title="Representante PP NNyA">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Representante PP NNyA" value={cj.representante_pp_nnya} />
          <InfoField label="Tipo Representación" value={cj.tipo_representacion_pp_nnya} />
        </div>
      </AccordionSection>

      {/* Domicilio de los Hechos */}
      <AccordionSection title="Domicilio de los Hechos">
        {cj.domicilio_hechos ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="Municipio" value={cj.domicilio_hechos.municipio} />
            <InfoField label="Colonia" value={cj.domicilio_hechos.colonia} />
            <InfoField label="Calle y Número" value={cj.domicilio_hechos.calle_numero} />
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay domicilio registrado</p>
        )}
      </AccordionSection>
      {/* ==================== PARTE 4/4 ==================== */}

      {/* Actores Jurídicos */}
      <AccordionSection title="Actores Jurídicos de la CJ">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Actores Asignados ({actoresAsignados.length})
          </h3>
          {actoresAsignados.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay actores asignados a esta carpeta</p>
              <p className="text-gray-400 text-xs mt-1">Puede asignarlos desde el botón "Editar CJ"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actoresAsignados.map((actor) => (
                <div
                  key={actor.id_actor}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{actor.nombre}</p>
                    <p className="text-sm text-gray-500 capitalize">{actor.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Observaciones */}
      <AccordionSection title="Observaciones">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Observaciones CJ</p>
            <p className="text-gray-900 whitespace-pre-wrap">{cj.observaciones || <span className="text-gray-400 italic">Sin observaciones</span>}</p>
          </div>
          {cj.observaciones_adicionales && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Observaciones Adicionales</p>
              <p className="text-gray-900 whitespace-pre-wrap">{cj.observaciones_adicionales}</p>
            </div>
          )}
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
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

export default DetalleCJ;
