// src/pages/cjo/EditarCJO.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

import cjoService from '../../services/cjoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const editarCJOSchema = yup.object().shape({
  numero_cjo: yup.string()
    .required('El número de CJO es requerido')
    .matches(/^CJO-\d+\/\d{4}$/, 'Formato inválido (debe ser: CJO-001/2025)'),
  fecha_ingreso: yup.string().nullable(),
  fecha_auto_apertura: yup.string().nullable(),
  sentencia: yup.string().nullable(),
  fecha_sentencia: yup.string().nullable(),
  monto_reparacion_dano: yup.number().nullable().typeError('Debe ser un número'),
  fecha_causo_estado: yup.string().nullable(),
  toca_apelacion: yup.string().nullable(),
  fecha_sentencia_enviada_ejecucion: yup.string().nullable(),
  juez_envia: yup.string().nullable(),
  juez_recibe: yup.string().nullable(),
  compurga_totalidad: yup.boolean(),
  representante_pp_nnya: yup.string().nullable(),
  tipo_representacion_pp_nnya: yup.string().nullable(),
});

const EditarCJO = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cjo, setCjo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editarCJOSchema),
  });

  const sentenciaSeleccionada = watch('sentencia');
  const generaCEMS = sentenciaSeleccionada &&
    (sentenciaSeleccionada.includes('CONDENATORI') || sentenciaSeleccionada.includes('MIXTA'));

  useEffect(() => {
    loadCJO();
  }, [id]);

  const loadCJO = async () => {
    setIsLoading(true);
    try {
      const response = await cjoService.getById(id);
      const cjoData = response.data || response;
      setCjo(cjoData);

      reset({
        numero_cjo: cjoData.numero_cjo || '',
        fecha_ingreso: cjoData.fecha_ingreso?.split('T')[0] || '',
        fecha_auto_apertura: cjoData.fecha_auto_apertura?.split('T')[0] || '',
        sentencia: cjoData.sentencia || '',
        fecha_sentencia: cjoData.fecha_sentencia?.split('T')[0] || '',
        monto_reparacion_dano: cjoData.monto_reparacion_dano || '',
        fecha_causo_estado: cjoData.fecha_causo_estado?.split('T')[0] || '',
        toca_apelacion: cjoData.toca_apelacion || '',
        fecha_sentencia_enviada_ejecucion: cjoData.fecha_sentencia_enviada_ejecucion?.split('T')[0] || '',
        juez_envia: cjoData.juez_envia || '',
        juez_recibe: cjoData.juez_recibe || '',
        compurga_totalidad: cjoData.compurga_totalidad || false,
        representante_pp_nnya: cjoData.representante_pp_nnya || '',
        tipo_representacion_pp_nnya: cjoData.tipo_representacion_pp_nnya || '',
      });
    } catch (error) {
      toast.error('Error al cargar CJO');
      console.error(error);
      navigate('/carpetas/cjo');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const cjoData = {
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

      const response = await cjoService.update(id, cjoData);

      if (response.data?.cems_creado) {
        toast.success('CJO actualizada exitosamente. Se ha generado automáticamente el CEMS', { duration: 5000 });
      } else {
        toast.success('CJO actualizada exitosamente');
      }

      navigate(`/carpetas/cjo/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar CJO');
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
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/carpetas/cjo/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Carpeta CJO</h1>
          <p className="text-gray-600">CJ Origen: {cjo?.numero_cj}</p>
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
                un registro CEMS (Centro de Ejecución de Medidas Sancionadoras) si no existe.
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
                <strong>Fuero:</strong> {cjo?.fuero || 'N/A'} (heredado de CJ)
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
            <Button type="button" variant="secondary" onClick={() => navigate(`/carpetas/cjo/${id}`)}>
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

export default EditarCJO;
