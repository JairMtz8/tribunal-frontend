// src/pages/catalogos/FormularioCatalogo.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import catalogoService, { getCatalogoConfig } from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Esquema de validación básico
const createSchema = () => yup.object().shape({
  nombre: yup.string().required('El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  descripcion: yup.string().max(150, 'Máximo 150 caracteres'),
  es_privativa: yup.boolean(),
  genera_cemci: yup.boolean(),
});

const FormularioCatalogo = () => {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const config = getCatalogoConfig(tipo);
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(createSchema()),
    defaultValues: {
      nombre: '',
      descripcion: '',
      es_privativa: false,
      genera_cemci: false,
    }
  });

  useEffect(() => {
    if (!config) {
      toast.error('Tipo de catálogo no válido');
      navigate('/dashboard');
      return;
    }

    if (isEditing) {
      loadRegistro();
    }
  }, [tipo, id]);

  const loadRegistro = async () => {
    setIsLoadingData(true);
    try {
      const response = await catalogoService.getById(tipo, id);
      const data = response.data || response;

      reset({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        es_privativa: data.es_privativa || false,
        genera_cemci: data.genera_cemci || false,
      });
    } catch (error) {
      toast.error('Error al cargar el registro');
      navigate(`/catalogos/${tipo}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Limpiar campos que no aplican para este tipo de catálogo
      const cleanData = {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
      };

      // Agregar campos especiales según el tipo
      config.extraFields.forEach(field => {
        if (field.name in data) {
          cleanData[field.name] = data[field.name];
        }
      });

      if (isEditing) {
        await catalogoService.update(tipo, id, cleanData);
        toast.success(`${config.singular} actualizado correctamente`);
      } else {
        await catalogoService.create(tipo, cleanData);
        toast.success(`${config.singular} creado correctamente`);
      }

      navigate(`/catalogos/${tipo}`);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!config) {
    return null;
  }

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
          onClick={() => navigate(`/catalogos/${tipo}`)}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar' : 'Nuevo'} {config.singular}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modificar información del registro' : 'Agregar nuevo registro al catálogo'}
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
              placeholder={`Nombre del ${config.singular.toLowerCase()}`}
              error={errors.nombre?.message}
              required
              {...register('nombre')}
            />

            {/* Descripción */}
            {config.hasDescription && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="Descripción opcional"
                  {...register('descripcion')}
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
                )}
              </div>
            )}

            {/* Campos especiales */}
            {config.extraFields.map(field => (
              <div key={field.name} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={field.name}
                  className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500"
                  {...register(field.name)}
                />
                <div>
                  <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {field.description && (
                    <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/catalogos/${tipo}`)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            icon={Save}
            isLoading={isLoading}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Registro'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCatalogo;
