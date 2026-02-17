// src/pages/catalogos/FormularioCalificativa.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import calificativaService from '../../services/calificativaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const calificativaSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  activo: yup.boolean(),
});

const FormularioCalificativa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(calificativaSchema),
    defaultValues: {
      nombre: '',
      activo: true,
    }
  });

  useEffect(() => {
    if (isEditing) {
      loadCalificativa();
    }
  }, [id]);

  const loadCalificativa = async () => {
    setIsLoadingData(true);
    try {
      const response = await calificativaService.getById(id);
      const data = response.data || response;

      reset({
        nombre: data.nombre || '',
        activo: data.activo ?? true,
      });
    } catch (error) {
      toast.error('Error al cargar la calificativa');
      navigate('/catalogos/calificativas');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const calificativaData = {
        nombre: data.nombre.trim(),
        activo: data.activo,
      };

      if (isEditing) {
        await calificativaService.update(id, calificativaData);
        toast.success('Calificativa actualizada correctamente');
      } else {
        await calificativaService.create(calificativaData);
        toast.success('Calificativa creada correctamente');
      }

      navigate('/catalogos/calificativas');
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/catalogos/calificativas')}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar' : 'Nueva'} Calificativa
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modificar información de la calificativa' : 'Agregar nueva calificativa al catálogo'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {/* Nombre */}
            <Input
              label="Nombre"
              placeholder="EJ: TENTATIVA, CONSUMADA, CALIFICADO"
              error={errors.nombre?.message}
              required
              {...register('nombre')}
            />

            {/* Activo */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="activo"
                className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500"
                {...register('activo')}
              />
              <div>
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Activo
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Las calificativas inactivas no aparecerán en los formularios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalogos/calificativas')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            icon={Save}
            isLoading={isLoading}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Calificativa'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCalificativa;
