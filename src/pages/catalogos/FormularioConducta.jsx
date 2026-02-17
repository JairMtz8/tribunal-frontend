// src/pages/catalogos/FormularioConducta.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import conductaService from '../../services/conductaService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const conductaSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  descripcion: yup.string().max(500, 'Máximo 500 caracteres'),
  fuero_default: yup.string(),
  activo: yup.boolean(),
});

const FormularioConducta = () => {
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
    resolver: yupResolver(conductaSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      fuero_default: 'COMUN',
      activo: true,
    }
  });

  useEffect(() => {
    if (isEditing) {
      loadConducta();
    }
  }, [id]);

  const loadConducta = async () => {
    setIsLoadingData(true);
    try {
      const response = await conductaService.getById(id);
      const data = response.data || response;

      reset({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        fuero_default: data.fuero_default || 'COMUN',
        activo: data.activo ?? true,
      });
    } catch (error) {
      toast.error('Error al cargar la conducta');
      navigate('/catalogos/conductas');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const conductaData = {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        fuero_default: data.fuero_default,
        activo: data.activo,
      };

      if (isEditing) {
        await conductaService.update(id, conductaData);
        toast.success('Conducta actualizada correctamente');
      } else {
        await conductaService.create(conductaData);
        toast.success('Conducta creada correctamente');
      }

      navigate('/catalogos/conductas');
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
          onClick={() => navigate('/catalogos/conductas')}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar' : 'Nueva'} Conducta
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modificar información de la conducta' : 'Agregar nueva conducta al catálogo'}
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
              placeholder="EJ: ROBO"
              error={errors.nombre?.message}
              required
              {...register('nombre')}
            />

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="Descripción de la conducta delictiva"
                {...register('descripcion')}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Fuero Default */}
            <Select
              label="Fuero por Defecto"
              error={errors.fuero_default?.message}
              options={[
                { value: 'COMUN', label: 'COMÚN' },
                { value: 'FEDERAL', label: 'FEDERAL' }
              ]}
              {...register('fuero_default')}
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
                  Las conductas inactivas no aparecerán en los formularios
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
            onClick={() => navigate('/catalogos/conductas')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            icon={Save}
            isLoading={isLoading}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Conducta'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormularioConducta;
