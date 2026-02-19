// src/pages/procesos/EditarProceso.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import procesoService from '../../services/procesoService';
import statusService from '../../services/statusService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const EditarProceso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusList, setStatusList] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [procesoResponse, statusResponse] = await Promise.all([
        procesoService.getById(id),
        statusService.getActivos()
      ]);

      const { proceso: procesoData } = procesoResponse.data || procesoResponse;
      const statusData = statusResponse.data || statusResponse;

      setStatusList(Array.isArray(statusData) ? statusData : []);

      // Convertir status_id a string para que el select lo reconozca
      reset({
        status_id: procesoData.status_id ? String(procesoData.status_id) : '',
        observaciones: procesoData.observaciones || '',
      });
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
      navigate('/procesos');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await procesoService.update(id, data);
      toast.success('Proceso actualizado exitosamente');
      navigate(`/procesos/${id}`);
    } catch (error) {
      toast.error('Error al actualizar proceso');
      console.error(error);
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
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/procesos/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Proceso</h1>
          <p className="text-gray-600">Modificar información del proceso</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Información del Proceso</h2>

          <div className="space-y-4">
            <Select
              label="Status"
              error={errors.status_id?.message}
              options={[
                { value: '', label: 'Seleccione un status' },
                ...statusList.map(status => ({
                  value: status.id_status,
                  label: status.nombre
                }))
              ]}
              {...register('status_id')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                rows={4}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                {...register('observaciones')}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => navigate(`/procesos/${id}`)}>
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

export default EditarProceso;
