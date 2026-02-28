// src/pages/audiencias/EditarAudiencia.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import audienciaService from '../../services/audienciaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Schema de validación
const editarAudienciaSchema = yup.object().shape({
  fecha_audiencia: yup.string().required('La fecha es requerida'),
  tipo: yup.string().nullable(),
  observaciones: yup.string().nullable(),
});

const EditarAudiencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audiencia, setAudiencia] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editarAudienciaSchema),
  });

  useEffect(() => {
    loadAudiencia();
  }, [id]);

  const loadAudiencia = async () => {
    setIsLoading(true);
    try {
      const response = await audienciaService.getById(id);
      const audienciaData = response.data || response;
      setAudiencia(audienciaData);

      // Formatear fecha para datetime-local
      const fechaFormateada = audienciaData.fecha_audiencia 
        ? new Date(audienciaData.fecha_audiencia).toISOString().slice(0, 16)
        : '';

      reset({
        fecha_audiencia: fechaFormateada,
        tipo: audienciaData.tipo || '',
        observaciones: audienciaData.observaciones || '',
      });
    } catch (error) {
      toast.error('Error al cargar audiencia');
      console.error(error);
      navigate('/audiencias');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const audienciaData = {
        fecha_audiencia: data.fecha_audiencia,
        tipo: data.tipo || null,
        observaciones: data.observaciones || null,
      };

      await audienciaService.update(id, audienciaData);
      
      toast.success('Audiencia actualizada exitosamente');
      navigate(`/audiencias/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar audiencia');
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

  const getCarpetaAsociada = () => {
    if (audiencia.numero_cj) return { tipo: 'CJ', numero: audiencia.numero_cj };
    if (audiencia.numero_cjo) return { tipo: 'CJO', numero: audiencia.numero_cjo };
    if (audiencia.numero_cemci) return { tipo: 'CEMCI', numero: audiencia.numero_cemci };
    if (audiencia.numero_cems) return { tipo: 'CEMS', numero: audiencia.numero_cems };
    return null;
  };

  const carpeta = getCarpetaAsociada();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/audiencias/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Audiencia</h1>
          <p className="text-gray-600">
            {audiencia.adolescente_nombre || audiencia.adolescente_iniciales}
          </p>
        </div>
      </div>

      {/* Información del Proceso */}
      {carpeta && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Proceso Asociado</p>
              <p className="text-blue-900 font-semibold">
                {audiencia.adolescente_nombre || audiencia.adolescente_iniciales}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {carpeta.tipo}: {carpeta.numero}
            </span>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Información de la Audiencia */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Información de la Audiencia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha y Hora de la Audiencia"
              type="datetime-local"
              required
              error={errors.fecha_audiencia?.message}
              {...register('fecha_audiencia')}
            />

            <Input
              label="Tipo de Audiencia"
              placeholder="Ej: Inicial, Control, Juicio..."
              error={errors.tipo?.message}
              {...register('tipo')}
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
              placeholder="Observaciones adicionales sobre la audiencia..."
              {...register('observaciones')}
            />
            {errors.observaciones && (
              <p className="mt-1 text-sm text-red-600">{errors.observaciones.message}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(`/audiencias/${id}`)}>
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

export default EditarAudiencia;
