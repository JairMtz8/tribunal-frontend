// src/pages/cems/EditarCEMS.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

import cemsService from '../../services/cemsService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const editarCEMSSchema = yup.object().shape({
  numero_cems: yup.string()
    .required('El número de CEMS es requerido')
    .matches(/^CEMS-\d+\/\d{4}$/, 'Formato inválido (debe ser: CEMS-001/2025)'),

  // Campos principales - todos opcionales
  fecha_recepcion: yup.string().nullable(),
  estado_procesal_id: yup.string().nullable(),
  status: yup.boolean(),
  jto: yup.string().nullable(),
  cmva: yup.string().nullable(),
  ceip: yup.string().nullable(),
  plan_actividad_fecha_inicio: yup.string().nullable(),
  declinacion_comperencia: yup.boolean(),
  estado_declina: yup.string().nullable(),
  estado_recibe: yup.string().nullable(),
  adolescentes_orden_comparencia: yup.string().nullable(),
  observaciones: yup.string().nullable(),

  // Exhortación
  exhortacion_reparacion_dano: yup.boolean(),
  fecha_exhortacion_reparacion_dano: yup.string().nullable(),
  exhortacion_cumplimiento: yup.boolean(),
  fecha_exhortacion_cumplimiento: yup.string().nullable(),
  oficio_fiscal: yup.string().nullable(),

  // Seguimiento
  cumplimiento_anticipado: yup.boolean(),
  causa_ejecutoria: yup.string().nullable(),
  remision_postsancion: yup.string().nullable(),
  se_libra_orden: yup.boolean(),
  cumplimiento_orden: yup.string().nullable(), // ← FECHA
  se_declaro_sustraido: yup.string().nullable(), // ← FECHA
  obligaciones_suspendidos: yup.string().nullable(),
  obligaciones_sustraccion: yup.string().nullable(),
  obligaciones_externos: yup.string().nullable(),
});

const EditarCEMS = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cems, setCems] = useState(null);
  const [exhortacion, setExhortacion] = useState(null);
  const [seguimiento, setSeguimiento] = useState(null);
  const [estadosProcesales, setEstadosProcesales] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editarCEMSSchema),
  });

  useEffect(() => {
    loadEstadosProcesales();
    loadCEMS();
  }, [id]);

  const loadEstadosProcesales = async () => {
    try {
      const response = await catalogoService.getAll('estados-procesales');
      const data = Array.isArray(response) ? response : (response.data || []);
      setEstadosProcesales(data);
    } catch (error) {
      console.error('Error al cargar estados procesales:', error);
    }
  };

  const loadCEMS = async () => {
    setIsLoading(true);
    try {
      const response = await cemsService.getById(id);
      const cemsData = response.data || response;
      setCems(cemsData);

      const exhortaciones = cemsData.exhortaciones || [];
      const seguimientos = cemsData.seguimientos || [];

      const exhortacionData = exhortaciones.length > 0 ? exhortaciones[0] : null;
      const seguimientoData = seguimientos.length > 0 ? seguimientos[0] : null;

      setExhortacion(exhortacionData);
      setSeguimiento(seguimientoData);

      reset({
        numero_cems: cemsData.numero_cems || '',

        // Campos principales
        fecha_recepcion: cemsData.fecha_recepcion?.split('T')[0] || '',
        estado_procesal_id: cemsData.estado_procesal_id || '',
        status: cemsData.status || false,
        jto: cemsData.jto || '',
        cmva: cemsData.cmva || '',
        ceip: cemsData.ceip || '',
        plan_actividad_fecha_inicio: cemsData.plan_actividad_fecha_inicio?.split('T')[0] || '',
        declinacion_comperencia: cemsData.declinacion_comperencia || false,
        estado_declina: cemsData.estado_declina || '',
        estado_recibe: cemsData.estado_recibe || '',
        adolescentes_orden_comparencia: cemsData.adolescentes_orden_comparencia || '',
        observaciones: cemsData.observaciones || '',

        // Exhortación
        exhortacion_reparacion_dano: exhortacionData?.exhortacion_reparacion_dano || false,
        fecha_exhortacion_reparacion_dano: exhortacionData?.fecha_exhortacion_reparacion_dano?.split('T')[0] || '',
        exhortacion_cumplimiento: exhortacionData?.exhortacion_cumplimiento || false,
        fecha_exhortacion_cumplimiento: exhortacionData?.fecha_exhortacion_cumplimiento?.split('T')[0] || '',
        oficio_fiscal: exhortacionData?.oficio_fiscal || '',

        // Seguimiento
        cumplimiento_anticipado: seguimientoData?.cumplimiento_anticipado || false,
        causa_ejecutoria: seguimientoData?.causa_ejecutoria || '',
        remision_postsancion: seguimientoData?.remision_postsancion || '',
        se_libra_orden: seguimientoData?.se_libra_orden || false,
        cumplimiento_orden: seguimientoData?.cumplimiento_orden?.split('T')[0] || '', // ← FECHA
        se_declaro_sustraido: seguimientoData?.se_declaro_sustraido?.split('T')[0] || '', // ← FECHA
        obligaciones_suspendidos: seguimientoData?.obligaciones_suspendidos || '',
        obligaciones_sustraccion: seguimientoData?.obligaciones_sustraccion || '',
        obligaciones_externos: seguimientoData?.obligaciones_externos || '',
      });
    } catch (error) {
      toast.error('Error al cargar CEMS');
      console.error(error);
      navigate('/carpetas/cems');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const cemsData = {
        fecha_recepcion: data.fecha_recepcion || null,
        estado_procesal_id: data.estado_procesal_id || null,
        status: data.status || false,
        jto: data.jto || null,
        cmva: data.cmva || null,
        ceip: data.ceip || null,
        plan_actividad_fecha_inicio: data.plan_actividad_fecha_inicio || null,
        declinacion_comperencia: data.declinacion_comperencia || false,
        estado_declina: data.estado_declina || null,
        estado_recibe: data.estado_recibe || null,
        adolescentes_orden_comparencia: data.adolescentes_orden_comparencia || null,
        observaciones: data.observaciones || null,
      };

      if (data.numero_cems !== cems.numero_cems) {
        await cemsService.updateNumero(id, data.numero_cems);
      }

      await cemsService.update(id, cemsData);

      // Exhortación
      const tieneDatosExhortacion =
        data.exhortacion_reparacion_dano ||
        data.fecha_exhortacion_reparacion_dano ||
        data.exhortacion_cumplimiento ||
        data.fecha_exhortacion_cumplimiento ||
        data.oficio_fiscal;

      if (tieneDatosExhortacion) {
        const exhortacionData = {
          cems_id: parseInt(id),
          proceso_id: cems.proceso_id,
          exhortacion_reparacion_dano: data.exhortacion_reparacion_dano || false,
          fecha_exhortacion_reparacion_dano: data.fecha_exhortacion_reparacion_dano || null,
          exhortacion_cumplimiento: data.exhortacion_cumplimiento || false,
          fecha_exhortacion_cumplimiento: data.fecha_exhortacion_cumplimiento || null,
          oficio_fiscal: data.oficio_fiscal || null,
        };

        if (exhortacion && exhortacion.id_exhortacion) {
          await cemsService.updateExhortacion(exhortacion.id_exhortacion, exhortacionData);
        } else {
          await cemsService.createExhortacion(exhortacionData);
        }
      }

      // Seguimiento
      const tieneDatosSeguimiento =
        data.cumplimiento_anticipado ||
        data.causa_ejecutoria ||
        data.remision_postsancion ||
        data.se_libra_orden ||
        data.cumplimiento_orden ||
        data.se_declaro_sustraido ||
        data.obligaciones_suspendidos ||
        data.obligaciones_sustraccion ||
        data.obligaciones_externos;

      if (tieneDatosSeguimiento) {
        const seguimientoData = {
          cems_id: parseInt(id),
          proceso_id: cems.proceso_id,
          cumplimiento_anticipado: data.cumplimiento_anticipado || false,
          causa_ejecutoria: data.causa_ejecutoria || null,
          remision_postsancion: data.remision_postsancion || null,
          se_libra_orden: data.se_libra_orden || false,
          cumplimiento_orden: data.cumplimiento_orden || null, // ← FECHA
          se_declaro_sustraido: data.se_declaro_sustraido || null, // ← FECHA
          obligaciones_suspendidos: data.obligaciones_suspendidos || null,
          obligaciones_sustraccion: data.obligaciones_sustraccion || null,
          obligaciones_externos: data.obligaciones_externos || null,
        };

        if (seguimiento && seguimiento.id_seguimiento) {
          await cemsService.updateSeguimiento(seguimiento.id_seguimiento, seguimientoData);
        } else {
          await cemsService.createSeguimiento(seguimientoData);
        }
      }

      toast.success('CEMS actualizada exitosamente');
      navigate(`/carpetas/cems/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar CEMS');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/carpetas/cems/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Carpeta CEMS</h1>
          <p className="text-gray-600">CJ Origen: {cems?.numero_cj}</p>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Carpeta auto-creada</h3>
            <p className="text-sm text-blue-700">
              Esta CEMS fue creada automáticamente cuando la CJO {cems?.numero_cjo} tuvo sentencia CONDENATORIA o MIXTA.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Información General */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Información General</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Número CEMS"
              placeholder="EJ: CEMS-001/2025"
              required
              error={errors.numero_cems?.message}
              {...register('numero_cems')}
            />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">CJ Origen</p>
              <p className="text-gray-900">{cems?.numero_cj || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">CJO</p>
              <p className="text-gray-900">{cems?.numero_cjo || 'N/A'}</p>
            </div>

            <Input
              label="Fecha de Recepción"
              type="date"
              {...register('fecha_recepcion')}
            />

            <Select
              label="Estado Procesal"
              {...register('estado_procesal_id')}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...estadosProcesales.map(ep => ({
                  value: ep.id_estado,
                  label: ep.nombre
                }))
              ]}
            />

            <div className="flex items-center pt-7">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                {...register('status')}
              />
              <label className="ml-2 text-sm text-gray-700">
                Status Activo
              </label>
            </div>

            <Input
              label="JTO"
              placeholder="JTO"
              {...register('jto')}
            />

            <Input
              label="CMVA"
              placeholder="CMVA"
              {...register('cmva')}
            />

            <Input
              label="CEIP"
              placeholder="CEIP"
              {...register('ceip')}
            />

            <Input
              label="Plan Actividad - Fecha Inicio"
              type="date"
              {...register('plan_actividad_fecha_inicio')}
            />

            <div className="flex items-center pt-7">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                {...register('declinacion_comperencia')}
              />
              <label className="ml-2 text-sm text-gray-700">
                Declinación de Competencia
              </label>
            </div>

            <Input
              label="Estado que Declina"
              placeholder="Estado que declina"
              {...register('estado_declina')}
            />

            <Input
              label="Estado que Recibe"
              placeholder="Estado que recibe"
              {...register('estado_recibe')}
            />

            <div className="md:col-span-3">
              <Input
                label="Adolescentes Orden Comparecencia"
                placeholder="Adolescentes con orden de comparecencia"
                {...register('adolescentes_orden_comparencia')}
              />
            </div>
          </div>
        </div>

        {/* Exhortación */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Exhortación</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                {...register('exhortacion_reparacion_dano')}
              />
              <label className="ml-2 text-sm text-gray-700">
                Exhortación de Reparación del Daño
              </label>
            </div>

            <Input
              label="Fecha Exhortación Reparación Daño"
              type="date"
              {...register('fecha_exhortacion_reparacion_dano')}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                {...register('exhortacion_cumplimiento')}
              />
              <label className="ml-2 text-sm text-gray-700">
                Exhortación de Cumplimiento
              </label>
            </div>

            <Input
              label="Fecha Exhortación Cumplimiento"
              type="date"
              {...register('fecha_exhortacion_cumplimiento')}
            />

            <div className="md:col-span-2">
              <Input
                label="Oficio Fiscal"
                placeholder="Número de oficio fiscal"
                {...register('oficio_fiscal')}
              />
            </div>
          </div>
        </div>

        {/* Seguimiento */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Seguimiento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                {...register('cumplimiento_anticipado')}
              />
              <label className="ml-2 text-sm text-gray-700">
                Cumplimiento Anticipado
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                {...register('se_libra_orden')}
              />
              <label className="ml-2 text-sm text-gray-700">
                Se Libra Orden
              </label>
            </div>

            <Input
              label="Causa Ejecutoria"
              placeholder="Causa ejecutoria"
              {...register('causa_ejecutoria')}
            />

            <Input
              label="Remisión Post-sanción"
              placeholder="Remisión post-sanción"
              {...register('remision_postsancion')}
            />

            <Input
              label="Cumplimiento de Orden"
              type="date"
              {...register('cumplimiento_orden')}
            />

            <Input
              label="Se Declaró Sustraído"
              type="date"
              {...register('se_declaro_sustraido')}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obligaciones Suspendidos
              </label>
              <textarea
                rows={2}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                {...register('obligaciones_suspendidos')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obligaciones Sustracción
              </label>
              <textarea
                rows={2}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                {...register('obligaciones_sustraccion')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obligaciones Externos
              </label>
              <textarea
                rows={2}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                {...register('obligaciones_externos')}
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Observaciones</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones Generales
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="Observaciones adicionales..."
              {...register('observaciones')}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(`/carpetas/cems/${id}`)}>
              Cancelar
            </Button>
            <Button type="submit" icon={Save} isLoading={isSaving}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditarCEMS;
