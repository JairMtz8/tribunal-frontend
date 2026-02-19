// src/pages/medidas-cautelares/AplicarMedidaCautelar.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Shield } from 'lucide-react';

import medidaCautelarService from '../../services/medidaCautelarService';
import tipoMedidaCautelarService from '../../services/tipoMedidaCautelarService';
import procesoService from '../../services/procesoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const aplicarMedidaSchema = yup.object().shape({
  tipo_medida_cautelar_id: yup.number().required('Seleccione un tipo de medida').typeError('Seleccione un tipo de medida'),
  fecha_medida_cautelar: yup.date().required('La fecha es requerida').typeError('Fecha inválida'),
  fecha_revocacion_medida: yup.date().nullable().typeError('Fecha inválida'),
  observaciones: yup.string().nullable(),
});

const AplicarMedidaCautelar = () => {
  const { procesoId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tiposMedida, setTiposMedida] = useState([]);
  const [proceso, setProceso] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(aplicarMedidaSchema),
    defaultValues: {
      fecha_medida_cautelar: new Date().toISOString().split('T')[0],
    }
  });

  const tipoSeleccionado = watch('tipo_medida_cautelar_id');

  useEffect(() => {
    loadData();
  }, [procesoId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [procesoResponse, tiposResponse] = await Promise.all([
        procesoService.getById(procesoId),
        tipoMedidaCautelarService.getActivos()
      ]);

      const { proceso: procesoData } = procesoResponse.data || procesoResponse;
      const tiposData = tiposResponse.data || tiposResponse;

      setProceso(procesoData);
      setTiposMedida(Array.isArray(tiposData) ? tiposData : []);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
      navigate('/medidas-cautelares');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const payload = {
        proceso_id: parseInt(procesoId),
        tipo_medida_cautelar_id: parseInt(data.tipo_medida_cautelar_id),
        fecha_medida_cautelar: data.fecha_medida_cautelar,
        revocacion_medida: false,
        fecha_revocacion_medida: data.fecha_revocacion_medida || null,
        observaciones: data.observaciones || null,
      };

      const response = await medidaCautelarService.aplicar(payload);

      // Verificar si se generó CEMCI
      const tipoMedida = tiposMedida.find(t => t.id_tipo_medida_cautelar === parseInt(data.tipo_medida_cautelar_id));

      if (tipoMedida?.genera_cemci) {
        toast.success('Medida cautelar aplicada. Se ha generado automáticamente el CEMCI', { duration: 5000 });
      } else {
        toast.success('Medida cautelar aplicada correctamente');
      }

      navigate(`/medidas-cautelares/${procesoId}/ver`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al aplicar medida cautelar');
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

  const tipoMedidaSeleccionada = tiposMedida.find(t => t.id_tipo_medida_cautelar === parseInt(tipoSeleccionado));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/medidas-cautelares')}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aplicar Medida Cautelar</h1>
          <p className="text-gray-600">
            Proceso: {proceso?.adolescente?.nombre || proceso?.adolescente?.iniciales || 'N/A'}
            {proceso?.cj && ` - CJ: ${proceso.cj.numero_cj}`}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Datos de la Medida Cautelar</h2>
          </div>

          <div className="space-y-4">
            <Select
              label="Tipo de Medida Cautelar"
              required
              error={errors.tipo_medida_cautelar_id?.message}
              options={[
                { value: '', label: 'Seleccione una medida cautelar' },
                ...tiposMedida.map(tipo => ({
                  value: tipo.id_tipo_medida_cautelar,
                  label: tipo.nombre
                }))
              ]}
              {...register('tipo_medida_cautelar_id')}
            />

            {tipoMedidaSeleccionada?.genera_cemci && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Atención:</strong> Esta medida cautelar generará automáticamente un registro CEMCI
                  (Centro de Medidas Cautelares para Internamiento).
                </p>
              </div>
            )}

            <Input
              label="Fecha de Imposición"
              type="date"
              required
              error={errors.fecha_medida_cautelar?.message}
              {...register('fecha_medida_cautelar')}
            />

            <Input
              label="Fecha de Término (Opcional)"
              type="date"
              error={errors.fecha_revocacion_medida?.message}
              helpText="Fecha en que termina la medida cautelar"
              {...register('fecha_revocacion_medida')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                rows={4}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="Observaciones sobre la medida cautelar..."
                {...register('observaciones')}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => navigate('/medidas-cautelares')}>
              Cancelar
            </Button>
            <Button type="submit" icon={Save} isLoading={isSaving}>
              Aplicar Medida Cautelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AplicarMedidaCautelar;
