// src/pages/medidas-sancionadoras/EditarMedidaSancionadora.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Shield, Calculator } from 'lucide-react';

import medidaSancionadoraService from '../../services/medidaSancionadoraService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const editarMedidaSchema = yup.object().shape({
  tipo_medida_sancionadora_id: yup.string().required('El tipo de medida es requerido'),
  plazo_anios: yup.number().min(0, 'Debe ser mayor o igual a 0').nullable(),
  plazo_meses: yup.number().min(0).max(11, 'Máximo 11 meses').nullable(),
  plazo_dias: yup.number().min(0).max(30, 'Máximo 30 días').nullable(),
});

const EditarMedidaSancionadora = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tiposMedidas, setTiposMedidas] = useState([]);
  const [medida, setMedida] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [plazoTotal, setPlazoTotal] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editarMedidaSchema),
  });

  const watchAnios = watch('plazo_anios');
  const watchMeses = watch('plazo_meses');
  const watchDias = watch('plazo_dias');
  const watchTipo = watch('tipo_medida_sancionadora_id');

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    // Calcular plazo total en días
    const anios = parseInt(watchAnios) || 0;
    const meses = parseInt(watchMeses) || 0;
    const dias = parseInt(watchDias) || 0;
    
    const total = (anios * 365) + (meses * 30) + dias;
    setPlazoTotal(total);
  }, [watchAnios, watchMeses, watchDias]);

  useEffect(() => {
    // Actualizar tipo seleccionado
    if (watchTipo) {
      const tipo = tiposMedidas.find(t => t.id_tipo_medida_sancionadora === parseInt(watchTipo));
      setTipoSeleccionado(tipo);
    } else {
      setTipoSeleccionado(null);
    }
  }, [watchTipo, tiposMedidas]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar tipos de medidas
      const responseTipos = await catalogoService.getAll('tipos-medidas-sancionadoras');
      const tipos = Array.isArray(responseTipos) ? responseTipos : (responseTipos.data || []);
      setTiposMedidas(tipos);

      // Cargar medida existente
      const response = await medidaSancionadoraService.getById(id);
      const medidaData = response.data || response;
      setMedida(medidaData);

      reset({
        tipo_medida_sancionadora_id: medidaData.tipo_medida_sancionadora_id || '',
        plazo_anios: medidaData.plazo_anios || 0,
        plazo_meses: medidaData.plazo_meses || 0,
        plazo_dias: medidaData.plazo_dias || 0,
      });
    } catch (error) {
      toast.error('Error al cargar medida');
      console.error(error);
      navigate('/medidas-sancionadoras');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const medidaData = {
        tipo_medida_sancionadora_id: parseInt(data.tipo_medida_sancionadora_id),
        plazo_anios: parseInt(data.plazo_anios) || 0,
        plazo_meses: parseInt(data.plazo_meses) || 0,
        plazo_dias: parseInt(data.plazo_dias) || 0,
      };

      await medidaSancionadoraService.update(id, medidaData);
      
      toast.success('Medida sancionadora actualizada exitosamente');
      navigate(`/medidas-sancionadoras/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar medida');
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
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/medidas-sancionadoras/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Medida Sancionadora</h1>
          <p className="text-gray-600">ID: {id}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Tipo de Medida */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Tipo de Medida</h2>
          
          <div className="space-y-4">
            <Select
              label="Tipo de Medida Sancionadora"
              required
              error={errors.tipo_medida_sancionadora_id?.message}
              {...register('tipo_medida_sancionadora_id')}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...tiposMedidas.map(tipo => ({
                  value: tipo.id_tipo_medida_sancionadora,
                  label: tipo.nombre
                }))
              ]}
            />

            {tipoSeleccionado && (
              <div className={`p-4 rounded-lg border ${
                tipoSeleccionado.es_privativa 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  {tipoSeleccionado.es_privativa && <Shield className="w-5 h-5 text-red-600" />}
                  <div>
                    <p className={`text-sm font-medium ${
                      tipoSeleccionado.es_privativa ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {tipoSeleccionado.es_privativa ? 'Medida Privativa de Libertad' : 'Medida No Privativa'}
                    </p>
                    <p className={`text-sm ${
                      tipoSeleccionado.es_privativa ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {tipoSeleccionado.descripcion || tipoSeleccionado.nombre}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plazo */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Plazo de la Medida</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Total: {plazoTotal} días
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Años"
              type="number"
              min="0"
              placeholder="0"
              error={errors.plazo_anios?.message}
              {...register('plazo_anios')}
            />

            <Input
              label="Meses"
              type="number"
              min="0"
              max="11"
              placeholder="0"
              error={errors.plazo_meses?.message}
              {...register('plazo_meses')}
            />

            <Input
              label="Días"
              type="number"
              min="0"
              max="30"
              placeholder="0"
              error={errors.plazo_dias?.message}
              {...register('plazo_dias')}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Plazo configurado:</strong>{' '}
              {watchAnios > 0 && `${watchAnios} año${watchAnios > 1 ? 's' : ''}`}
              {watchAnios > 0 && (watchMeses > 0 || watchDias > 0) && ', '}
              {watchMeses > 0 && `${watchMeses} mes${watchMeses > 1 ? 'es' : ''}`}
              {watchMeses > 0 && watchDias > 0 && ', '}
              {watchDias > 0 && `${watchDias} día${watchDias > 1 ? 's' : ''}`}
              {!watchAnios && !watchMeses && !watchDias && 'Sin plazo definido'}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(`/medidas-sancionadoras/${id}`)}>
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

export default EditarMedidaSancionadora;
