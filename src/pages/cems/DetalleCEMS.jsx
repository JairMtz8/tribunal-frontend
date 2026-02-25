// src/pages/cems/DetalleCEMS.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Scale, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import cemsService from '../../services/cemsService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';
import { formatDate } from '../../utils/formatters';

const DetalleCEMS = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cems, setCems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    adicional: false,
    exhortacion: false,
    seguimiento: false,
  });

  useEffect(() => {
    loadCEMS();
  }, [id]);

  const loadCEMS = async () => {
    setIsLoading(true);
    try {
      const response = await cemsService.getById(id);
      const cemsData = response.data || response;
      setCems(cemsData);
    } catch (error) {
      toast.error('Error al cargar CEMS');
      console.error(error);
      navigate('/carpetas/cems');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando carpeta CEMS...</p>
        </div>
      </div>
    );
  }

  if (!cems) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carpeta CEMS no encontrada</p>
        </div>
      </div>
    );
  }

  const exhortacion = cems.exhortaciones && cems.exhortaciones.length > 0 ? cems.exhortaciones[0] : null;
  const seguimiento = cems.seguimientos && cems.seguimientos.length > 0 ? cems.seguimientos[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/carpetas/cems')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cems.numero_cems}</h1>
            <p className="text-gray-600">Carpeta de Ejecución de Medida Sancionadora</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => navigate(`/carpetas/cj/${cems.cj_id}`)}
          >
            Ver CJ Origen
          </Button>
          {cems.cjo_id && (
            <Button
              variant="secondary"
              icon={FileText}
              onClick={() => navigate(`/carpetas/cjo/${cems.cjo_id}`)}
            >
              Ver CJO
            </Button>
          )}
          {cems.cemci_id && (
            <Button
              variant="secondary"
              icon={FileText}
              onClick={() => navigate(`/carpetas/cemci/${cems.cemci_id}`)}
            >
              Ver CEMCI
            </Button>
          )}
          <Button icon={Edit} onClick={() => navigate(`/carpetas/cems/${id}/editar`)}>
            Editar CEMS
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white shadow rounded-lg">
        <button
          onClick={() => toggleSection('general')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Información General
          </h2>
          {expandedSections.general ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.general && (
          <div className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              <InfoField label="Número CEMS" value={cems.numero_cems} />
              <InfoField label="CJ Origen" value={cems.numero_cj} />
              <InfoField label="CJO" value={cems.numero_cjo || 'Sin CJO'} />
              <InfoField label="CEMCI" value={cems.numero_cemci || 'Sin CEMCI'} />
              <InfoField label="Fecha de Recepción" value={formatDate(cems.fecha_recepcion)} />
              <InfoField label="Estado Procesal" value={cems.estado_procesal_nombre || 'Sin estado'} />
              <InfoField label="Status" value={cems.status ? 'ACTIVO' : 'INACTIVO'} />
              <InfoField label="JTO" value={cems.jto} />
              <InfoField label="CMVA" value={cems.cmva} />
              <InfoField label="CEIP" value={cems.ceip} />
            </div>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="bg-white shadow rounded-lg">
        <button
          onClick={() => toggleSection('adicional')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información Adicional
          </h2>
          {expandedSections.adicional ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.adicional && (
          <div className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <InfoField
                label="Plan Actividad - Fecha Inicio"
                value={formatDate(cems.plan_actividad_fecha_inicio)}
              />
              <InfoField
                label="Declinación de Competencia"
                value={cems.declinacion_comperencia ? 'SÍ' : 'NO'}
              />
              <InfoField label="Estado que Declina" value={cems.estado_declina} />
              <InfoField label="Estado que Recibe" value={cems.estado_recibe} />
              <div className="md:col-span-2">
                <InfoField
                  label="Adolescentes Orden Comparecencia"
                  value={cems.adolescentes_orden_comparencia}
                />
              </div>
            </div>

            {cems.observaciones && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Observaciones Generales</p>
                <p className="text-gray-900 whitespace-pre-wrap">{cems.observaciones}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exhortación */}
      <div className="bg-white shadow rounded-lg">
        <button
          onClick={() => toggleSection('exhortacion')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exhortación
            {exhortacion && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Registrada
              </span>
            )}
          </h2>
          {expandedSections.exhortacion ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.exhortacion && (
          <div className="px-6 pb-6 border-t">
            {exhortacion ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <InfoField
                  label="Exhortación Reparación Daño"
                  value={exhortacion.exhortacion_reparacion_dano ? 'SÍ' : 'NO'}
                />
                <InfoField
                  label="Fecha Exhortación Reparación"
                  value={formatDate(exhortacion.fecha_exhortacion_reparacion_dano)}
                />
                <InfoField
                  label="Exhortación Cumplimiento"
                  value={exhortacion.exhortacion_cumplimiento ? 'SÍ' : 'NO'}
                />
                <InfoField
                  label="Fecha Exhortación Cumplimiento"
                  value={formatDate(exhortacion.fecha_exhortacion_cumplimiento)}
                />
                <div className="md:col-span-2">
                  <InfoField label="Oficio Fiscal" value={exhortacion.oficio_fiscal} />
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm pt-4">No hay información de exhortación registrada</p>
            )}
          </div>
        )}
      </div>

      {/* Seguimiento */}
      <div className="bg-white shadow rounded-lg">
        <button
          onClick={() => toggleSection('seguimiento')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Seguimiento
            {seguimiento && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Registrado
              </span>
            )}
          </h2>
          {expandedSections.seguimiento ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.seguimiento && (
          <div className="px-6 pb-6 border-t">
            {seguimiento ? (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Cumplimiento Anticipado"
                    value={seguimiento.cumplimiento_anticipado ? 'SÍ' : 'NO'}
                  />
                  <InfoField
                    label="Se Libra Orden"
                    value={seguimiento.se_libra_orden ? 'SÍ' : 'NO'}
                  />
                  <InfoField label="Causa Ejecutoria" value={seguimiento.causa_ejecutoria} />
                  <InfoField label="Remisión Post-sanción" value={seguimiento.remision_postsancion} />
                  <InfoField
                    label="Cumplimiento Orden"
                    value={formatDate(seguimiento.cumplimiento_orden)}
                  />
                  <InfoField
                    label="Se Declaró Sustraído"
                    value={formatDate(seguimiento.se_declaro_sustraido)}
                  />
                </div>

                {seguimiento.obligaciones_suspendidos && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Obligaciones Suspendidos</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{seguimiento.obligaciones_suspendidos}</p>
                  </div>
                )}

                {seguimiento.obligaciones_sustraccion && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Obligaciones Sustracción</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{seguimiento.obligaciones_sustraccion}</p>
                  </div>
                )}

                {seguimiento.obligaciones_externos && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Obligaciones Externos</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{seguimiento.obligaciones_externos}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm pt-4">No hay información de seguimiento registrada</p>
            )}
          </div>
        )}
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Carpeta auto-creada</h3>
            <p className="text-sm text-blue-700">
              Esta CEMS fue creada automáticamente cuando la CJO {cems.numero_cjo} tuvo sentencia
              CONDENATORIA o MIXTA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleCEMS;
