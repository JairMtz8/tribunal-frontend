// src/pages/cemci/EditarCEMCI.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

import cemciService from '../../services/cemciService';
import cjoService from '../../services/cjoService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const editarCEMCISchema = yup.object().shape({
  numero_cemci: yup.string()
    .required('El número de CEMCI es requerido')
    .matches(/^CEMCI-\d+\/\d{4}$/, 'Formato inválido (debe ser: CEMCI-001/2025)'),
  fecha_recepcion_cemci: yup.date().nullable().typeError('Fecha inválida'),
  estado_procesal_id: yup.number().nullable().typeError('Seleccione un estado'),
  concluido: yup.string().nullable(),
  observaciones: yup.string().nullable(),

  // Campos de seguimiento - SIN VALIDACIÓN, todos opcionales
  fecha_radicacion: yup.string().nullable(),
  fecha_recepcion_plan_actividades: yup.string().nullable(),
  obligaciones_plan_actividades: yup.string().nullable(),
  fecha_audiencia_inicial_cemci: yup.string().nullable(),
  fecha_aprobacion_plan_actividades: yup.string().nullable(),
  ultimo_informe: yup.string().nullable(),
  fecha_suspension: yup.string().nullable(),
  motivo_suspension: yup.string().nullable(),
});

const EditarCEMCI = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cemci, setCemci] = useState(null);
  const [seguimiento, setSeguimiento] = useState(null);
  const [cjosDisponibles, setCjosDisponibles] = useState([]);
  const [estadosProcesales, setEstadosProcesales] = useState([]);
  const [numeroCJO, setNumeroCJO] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editarCEMCISchema),
  });

  useEffect(() => {
    loadCEMCI();
    loadCatalogos();
  }, [id]);

  const loadCEMCI = async () => {
    setIsLoading(true);
    try {
      const response = await cemciService.getById(id);
      const cemciData = response.data || response;
      setCemci(cemciData);

      // Cargar seguimientos
      const seguimientos = cemciData.seguimientos || [];
      const seguimientoData = seguimientos.length > 0 ? seguimientos[0] : null;

      setSeguimiento(seguimientoData);

      // Cargar CJO si existe CJ
      if (cemciData.cj_id) {
        loadCJO(cemciData.cj_id);
      }

      reset({
        numero_cemci: cemciData.numero_cemci || '',
        fecha_recepcion_cemci: cemciData.fecha_recepcion_cemci?.split('T')[0] || '',
        estado_procesal_id: cemciData.estado_procesal_id || '',
        concluido: cemciData.concluido || '',
        observaciones: cemciData.observaciones || '',
        cjo_id: cemciData.cjo_id || '',

        // Datos de seguimiento
        fecha_radicacion: seguimientoData?.fecha_radicacion?.split('T')[0] || '',
        fecha_recepcion_plan_actividades: seguimientoData?.fecha_recepcion_plan_actividades?.split('T')[0] || '',
        obligaciones_plan_actividades: seguimientoData?.obligaciones_plan_actividades || '',
        fecha_audiencia_inicial_cemci: seguimientoData?.fecha_audiencia_inicial_cemci?.split('T')[0] || '',
        fecha_aprobacion_plan_actividades: seguimientoData?.fecha_aprobacion_plan_actividades?.split('T')[0] || '',
        ultimo_informe: seguimientoData?.ultimo_informe || '',
        fecha_suspension: seguimientoData?.fecha_suspension?.split('T')[0] || '',
        motivo_suspension: seguimientoData?.motivo_suspension || '',
      });
    } catch (error) {
      toast.error('Error al cargar CEMCI');
      console.error(error);
      navigate('/carpetas/cemci');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCJO = async (cjId) => {
    try {
      const response = await cjoService.getByCjId(cjId);
      const cjoData = response.data || response;
      if (cjoData) {
        setCjosDisponibles([cjoData]);
        setNumeroCJO(cjoData.numero_cjo);

        reset(prev => ({
          ...prev,
          cjo_id: cjoData.id_cjo
        }));
      }
    } catch (error) {
      setCjosDisponibles([]);
    }
  };

  const loadCatalogos = async () => {
    try {
      const response = await catalogoService.getAll('estados-procesales');
      const data = Array.isArray(response) ? response : (response.data || []);
      setEstadosProcesales(data);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const cemciData = {
        cjo_id: data.cjo_id || null,
        fecha_recepcion_cemci: data.fecha_recepcion_cemci || null,
        estado_procesal_id: data.estado_procesal_id || null,
        concluido: data.concluido || null,
        observaciones: data.observaciones || null,
      };

      // Si el número cambió, actualizar por separado
      if (data.numero_cemci !== cemci.numero_cemci) {
        await cemciService.updateNumero(id, data.numero_cemci);
      }

      await cemciService.update(id, cemciData);

      // Solo actualizar/crear seguimiento si hay al menos un campo lleno
      const tieneDatosSeguimiento =
        data.fecha_radicacion ||
        data.fecha_recepcion_plan_actividades ||
        data.obligaciones_plan_actividades ||
        data.fecha_audiencia_inicial_cemci ||
        data.fecha_aprobacion_plan_actividades ||
        data.ultimo_informe ||
        data.fecha_suspension ||
        data.motivo_suspension;

      if (tieneDatosSeguimiento) {
        const seguimientoData = {
          cemci_id: parseInt(id),
          fecha_radicacion: data.fecha_radicacion || null,
          fecha_recepcion_plan_actividades: data.fecha_recepcion_plan_actividades || null,
          obligaciones_plan_actividades: data.obligaciones_plan_actividades || null,
          fecha_audiencia_inicial_cemci: data.fecha_audiencia_inicial_cemci || null,
          fecha_aprobacion_plan_actividades: data.fecha_aprobacion_plan_actividades || null,
          ultimo_informe: data.ultimo_informe || null,
          fecha_suspension: data.fecha_suspension || null,
          motivo_suspension: data.motivo_suspension || null,
        };

        // Agregar proceso_id solo si existe
        if (cemci.proceso_id) {
          seguimientoData.proceso_id = cemci.proceso_id;
        }

        // Verificar si existe seguimiento CON ID válido
        if (seguimiento && seguimiento.id_seguimiento) {
          await cemciService.updateSeguimiento(seguimiento.id_seguimiento, seguimientoData);
        } else {
          // Crear nuevo seguimiento
          await cemciService.createSeguimiento(seguimientoData);
        }
      }

      toast.success('CEMCI y seguimiento actualizados exitosamente');
      navigate(`/carpetas/cemci/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar CEMCI');
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
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/carpetas/cemci/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Carpeta CEMCI</h1>
          <p className="text-gray-600">CJ Origen: {cemci?.numero_cj}</p>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Carpeta auto-creada</h3>
            <p className="text-sm text-blue-700">
              Esta CEMCI fue creada automáticamente al aplicar una medida cautelar de internamiento.
              Aquí puedes completar los datos adicionales.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Información General */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Información General</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número CEMCI"
              placeholder="EJ: CEMCI-001/2025"
              required
              error={errors.numero_cemci?.message}
              {...register('numero_cemci')}
            />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">CJ Origen</p>
              <p className="text-gray-900">{cemci?.numero_cj || 'N/A'}</p>
            </div>

            <Input
              label="CJO"
              value={numeroCJO}
              onChange={(e) => setNumeroCJO(e.target.value)}
              placeholder="Ingrese número de CJO"
            />

            <input
              type="hidden"
              {...register('cjo_id')}
            />

            <Input
              label="Fecha de Recepción CEMCI"
              type="date"
              error={errors.fecha_recepcion_cemci?.message}
              {...register('fecha_recepcion_cemci')}
            />
          </div>
        </div>

        {/* Estado y Conclusión */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Estado Procesal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Estado Procesal"
              error={errors.estado_procesal_id?.message}
              options={[
                { value: '', label: 'Seleccione...' },
                ...estadosProcesales.map(ep => ({
                  value: ep.id_estado,
                  label: ep.nombre
                }))
              ]}
              {...register('estado_procesal_id')}
            />

            <Input
              label="Concluido"
              placeholder="EJ: Concluido, En proceso, etc."
              {...register('concluido')}
            />
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Observaciones</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="Observaciones adicionales..."
              {...register('observaciones')}
            />
          </div>
        </div>

        {/* Seguimiento CEMCI */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Seguimiento CEMCI</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Radicación"
              type="date"
              {...register('fecha_radicacion')}
            />

            <Input
              label="Fecha Recepción Plan de Actividades"
              type="date"
              {...register('fecha_recepcion_plan_actividades')}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obligaciones del Plan de Actividades
              </label>
              <textarea
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="EJ: Asistir a terapia psicológica, No consumir drogas..."
                {...register('obligaciones_plan_actividades')}
              />
            </div>

            <Input
              label="Fecha Audiencia Inicial CEMCI"
              type="date"
              {...register('fecha_audiencia_inicial_cemci')}
            />

            <Input
              label="Fecha Aprobación Plan de Actividades"
              type="date"
              {...register('fecha_aprobacion_plan_actividades')}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Último Informe
              </label>
              <textarea
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="Resumen del último informe de seguimiento..."
                {...register('ultimo_informe')}
              />
            </div>

            <Input
              label="Fecha de Suspensión"
              type="date"
              {...register('fecha_suspension')}
            />

            <Input
              label="Motivo de Suspensión"
              placeholder="Motivo de la suspensión (si aplica)"
              {...register('motivo_suspension')}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(`/carpetas/cemci/${id}`)}>
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

export default EditarCEMCI;
