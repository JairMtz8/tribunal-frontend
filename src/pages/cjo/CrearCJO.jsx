// src/pages/cjo/CrearCJO.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

import cjoService from '../../services/cjoService';
import cjService from '../../services/cjService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const crearCJOSchema = yup.object().shape({
  numero_cjo: yup.string()
    .required('El número de CJO es requerido')
    .matches(/^CJO-\d+\/\d{4}$/, 'Formato inválido (debe ser: CJO-001/2025)'),
  fecha_ingreso: yup.date()
    .required('La fecha de ingreso es requerida')
    .typeError('Fecha inválida'),
  fecha_auto_apertura: yup.date().nullable().typeError('Fecha inválida'),
  sentencia: yup.string().nullable(),
  fecha_sentencia: yup.date().nullable().typeError('Fecha inválida'),
  monto_reparacion_dano: yup.number().nullable().typeError('Debe ser un número'),
  fecha_causo_estado: yup.date().nullable().typeError('Fecha inválida'),
  toca_apelacion: yup.string().nullable(),
  fecha_sentencia_enviada_ejecucion: yup.date().nullable().typeError('Fecha inválida'),
  juez_envia: yup.string().nullable(),
  juez_recibe: yup.string().nullable(),
  compurga_totalidad: yup.boolean(),
  representante_pp_nnya: yup.string().nullable(),
  tipo_representacion_pp_nnya: yup.string().nullable(),
});

const CrearCJO = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cj_id = searchParams.get('cj_id');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cj, setCj] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(crearCJOSchema),
    defaultValues: {
      numero_cjo: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      fecha_auto_apertura: '',
      sentencia: '',
      fecha_sentencia: '',
      monto_reparacion_dano: '',
      fecha_causo_estado: '',
      toca_apelacion: '',
      fecha_sentencia_enviada_ejecucion: '',
      juez_envia: '',
      juez_recibe: '',
      compurga_totalidad: false,
      representante_pp_nnya: '',
      tipo_representacion_pp_nnya: '',
    }
  });

  const sentenciaSeleccionada = watch('sentencia');
  const generaCEMS = sentenciaSeleccionada &&
    (sentenciaSeleccionada.includes('CONDENATORI') || sentenciaSeleccionada.includes('MIXTA'));

  useEffect(() => {
    if (!cj_id) {
      toast.error('No se especificó la CJ origen');
      navigate('/carpetas/cj');
      return;
    }
    loadCJ();
  }, [cj_id]);

  const loadCJ = async () => {
    setIsLoading(true);
    try {
      const response = await cjService.getById(cj_id);
      const cjData = response.data || response;
      setCj(cjData);
    } catch (error) {
      toast.error('Error al cargar CJ');
      console.error(error);
      navigate('/carpetas/cj');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const cjoData = {
        cj_id: parseInt(cj_id),
        numero_cjo: data.numero_cjo,
        fecha_ingreso: data.fecha_ingreso || null,
        fecha_auto_apertura: data.fecha_auto_apertura || null,
        sentencia: data.sentencia || null,
        fecha_sentencia: data.fecha_sentencia || null,
        monto_reparacion_dano: data.monto_reparacion_dano || null,
        fecha_causo_estado: data.fecha_causo_estado || null,
        toca_apelacion: data.toca_apelacion || null,
        fecha_sentencia_enviada_ejecucion: data.fecha_sentencia_enviada_ejecucion || null,
        juez_envia: data.juez_envia || null,
        juez_recibe: data.juez_recibe || null,
        compurga_totalidad: data.compurga_totalidad || false,
        representante_pp_nnya: data.representante_pp_nnya || null,
        tipo_representacion_pp_nnya: data.tipo_representacion_pp_nnya || null,
      };

      const response = await cjoService.create(cjoData);

      if (response.data?.cems_creado) {
        toast.success('CJO creada exitosamente. Se ha generado automáticamente el CEMS', { duration: 5000 });
      } else {
        toast.success('CJO creada exitosamente');
      }

      const cjoId = response.data?.cjo?.id_cjo || response.cjo_id;
      navigate(`/carpetas/cjo/${cjoId}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al crear CJO');
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
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/carpetas/cj/${cj_id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crear Carpeta CJO</h1>
          <p className="text-gray-600">CJ Origen: {cj?.numero_cj}</p>
        </div>
      </div>

      {/* Alerta si genera CEMS */}
      {generaCEMS && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Generación automática de CEMS</h3>
              <p className="text-sm text-yellow-700">
                Al seleccionar una sentencia CONDENATORIA o MIXTA, se creará automáticamente
                un registro CEMS (Centro de Ejecución de Medidas Sancionadoras).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Información General */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Información General</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número CJO"
              placeholder="EJ: CJO-001/2025"
              required
              error={errors.numero_cjo?.message}
              {...register('numero_cjo')}
            />

            <Input
              label="Fecha de Ingreso"
              type="date"
              required
              error={errors.fecha_ingreso?.message}
              {...register('fecha_ingreso')}
            />

            <Input
              label="Fecha Auto de Apertura"
              type="date"
              error={errors.fecha_auto_apertura?.message}
              {...register('fecha_auto_apertura')}
            />

            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">
                <strong>Fuero:</strong> {cj?.tipo_fuero || 'N/A'} (heredado de CJ)
              </p>
            </div>
          </div>
        </div>

        {/* Sentencia */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Sentencia</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Sentencia"
              error={errors.sentencia?.message}
              options={[
                { value: '', label: 'Seleccione...' },
                { value: 'CONDENATORIA', label: 'CONDENATORIA' },
                { value: 'ABSOLUTORIA', label: 'ABSOLUTORIA' },
                { value: 'MIXTA', label: 'MIXTA' }
              ]}
              {...register('sentencia')}
            />

            <Input
              label="Fecha de Sentencia"
              type="date"
              error={errors.fecha_sentencia?.message}
              {...register('fecha_sentencia')}
            />

            <Input
              label="Monto Reparación del Daño"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.monto_reparacion_dano?.message}
              {...register('monto_reparacion_dano')}
            />

            <Input
              label="Fecha Causó Estado"
              type="date"
              error={errors.fecha_causo_estado?.message}
              {...register('fecha_causo_estado')}
            />

            <Input
              label="Toca de Apelación"
              placeholder="Número de toca"
              error={errors.toca_apelacion?.message}
              {...register('toca_apelacion')}
            />

            <Input
              label="Fecha Sentencia Enviada a Ejecución"
              type="date"
              error={errors.fecha_sentencia_enviada_ejecucion?.message}
              {...register('fecha_sentencia_enviada_ejecucion')}
            />
          </div>
        </div>

        {/* Jueces */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Información de Jueces</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Juez que Envía"
              placeholder="Nombre del juez"
              {...register('juez_envia')}
            />

            <Input
              label="Juez que Recibe"
              placeholder="Nombre del juez"
              {...register('juez_recibe')}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="compurga_totalidad"
                className="w-4 h-4 text-blue-600 rounded"
                {...register('compurga_totalidad')}
              />
              <label htmlFor="compurga_totalidad" className="text-sm font-medium text-gray-700">
                Compurga Totalidad
              </label>
            </div>
          </div>
        </div>

        {/* Representante PP NNyA */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Representante PP NNyA</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Representante PP NNyA"
              placeholder="Nombre del representante"
              {...register('representante_pp_nnya')}
            />

            <Input
              label="Tipo de Representación"
              placeholder="Tipo de representación"
              {...register('tipo_representacion_pp_nnya')}
            />

          </div>
        </div>

        {/* Botones */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(`/carpetas/cj/${cj_id}`)}>
              Cancelar
            </Button>
            <Button type="submit" icon={Save} isLoading={isSaving}>
              Crear CJO
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CrearCJO;
