// src/pages/audiencias/CrearAudiencia.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Calendar, AlertCircle } from 'lucide-react';

import audienciaService from '../../services/audienciaService';
import procesoService from '../../services/procesoService';
import cjService from '../../services/cjService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const crearAudienciaSchema = yup.object().shape({
  proceso_id: yup.number().required('Debe seleccionar un proceso'),
  fecha_audiencia: yup.string().required('La fecha es requerida'),
  tipo: yup.string().nullable(),
  observaciones: yup.string().nullable(),
});

const CrearAudiencia = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proceso_id_param = searchParams.get('proceso_id');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [procesos, setProcesos] = useState([]);
  const [carpetasCJ, setCarpetasCJ] = useState([]);
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  const [tipoCarpeta, setTipoCarpeta] = useState('CJ'); // CJ, CJO, CEMCI, CEMS

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(crearAudienciaSchema),
    defaultValues: {
      proceso_id: proceso_id_param || '',
      fecha_audiencia: '',
      tipo: '',
      observaciones: '',
    }
  });

  const procesoIdWatch = watch('proceso_id');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (proceso_id_param) {
      loadProcesoCompleto(proceso_id_param);
    }
  }, [proceso_id_param]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar todos los procesos
      const procesosResponse = await procesoService.getAll();
      const procesosData = Array.isArray(procesosResponse) ? procesosResponse : (procesosResponse.data || []);
      setProcesos(procesosData);

      // Cargar todas las CJ
      const cjResponse = await cjService.getAll();
      const cjData = Array.isArray(cjResponse) ? cjResponse : (cjResponse.data || []);
      setCarpetasCJ(cjData);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProcesoCompleto = async (procesoId) => {
    try {
      const response = await procesoService.getById(procesoId);
      const { proceso: procesoData, carpetas } = response.data || response;
      setProcesoSeleccionado({ ...procesoData, carpetas });
    } catch (error) {
      console.error('Error al cargar proceso:', error);
    }
  };

  // Cuando cambia el proceso seleccionado
  const handleProcesoChange = async (e) => {
    const procesoId = e.target.value;
    setValue('proceso_id', procesoId);

    if (procesoId) {
      await loadProcesoCompleto(procesoId);
    } else {
      setProcesoSeleccionado(null);
    }
  };

  // Cuando cambia la CJ seleccionada
  const handleCJChange = async (e) => {
    const cjId = e.target.value;

    if (cjId) {
      // Buscar el proceso que tiene esta CJ
      const cjSeleccionada = carpetasCJ.find(cj => cj.id_cj === parseInt(cjId));
      if (cjSeleccionada && cjSeleccionada.proceso_id) {
        setValue('proceso_id', cjSeleccionada.proceso_id);
        await loadProcesoCompleto(cjSeleccionada.proceso_id);
      }
    }
  };

  // Determinar qué carpeta usar según el checkbox
  const getCarpetaId = () => {
    if (!procesoSeleccionado?.carpetas) return null;

    switch (tipoCarpeta) {
      case 'CJ':
        return procesoSeleccionado.carpetas.cj?.id_cj || null;
      case 'CJO':
        return procesoSeleccionado.carpetas.cjo?.id_cjo || null;
      case 'CEMCI':
        return procesoSeleccionado.carpetas.cemci?.id_cemci || null;
      case 'CEMS':
        return procesoSeleccionado.carpetas.cems?.id_cems || null;
      default:
        return null;
    }
  };

  const getCarpetaNumero = () => {
    if (!procesoSeleccionado?.carpetas) return null;

    switch (tipoCarpeta) {
      case 'CJ':
        return procesoSeleccionado.carpetas.cj?.numero_cj || null;
      case 'CJO':
        return procesoSeleccionado.carpetas.cjo?.numero_cjo || null;
      case 'CEMCI':
        return procesoSeleccionado.carpetas.cemci?.numero_cemci || null;
      case 'CEMS':
        return procesoSeleccionado.carpetas.cems?.numero_cems || null;
      default:
        return null;
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const carpetaId = getCarpetaId();

      if (!carpetaId) {
        toast.error(`El proceso no tiene carpeta ${tipoCarpeta} asociada`);
        setIsSaving(false);
        return;
      }

      const audienciaData = {
        proceso_id: parseInt(data.proceso_id),
        fecha_audiencia: data.fecha_audiencia,
        tipo: data.tipo || null,
        observaciones: data.observaciones || null,
      };

      // Asignar la carpeta según el tipo seleccionado
      switch (tipoCarpeta) {
        case 'CJ':
          audienciaData.cj_id = carpetaId;
          break;
        case 'CJO':
          audienciaData.cjo_id = carpetaId;
          break;
        case 'CEMCI':
          audienciaData.cemci_id = carpetaId;
          break;
        case 'CEMS':
          audienciaData.cems_id = carpetaId;
          break;
      }

      await audienciaService.create(audienciaData);

      toast.success('Audiencia creada exitosamente');
      navigate('/audiencias');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al crear audiencia');
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
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/audiencias')}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programar Audiencia</h1>
          <p className="text-gray-600">Selecciona el proceso por adolescente o por carpeta CJ</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Selección del Proceso */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Seleccionar Proceso</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select por Adolescente */}
            <Select
              label="Buscar por Adolescente"
              value={procesoIdWatch}
              onChange={handleProcesoChange}
              error={errors.proceso_id?.message}
              options={[
                { value: '', label: 'Seleccione un adolescente...' },
                ...procesos.map(proceso => ({
                  value: proceso.id_proceso,
                  label: `${proceso.adolescente_nombre || proceso.adolescente_iniciales}`
                }))
              ]}
            />

            {/* Select por CJ */}
            <Select
              label="Buscar por Carpeta CJ"
              onChange={handleCJChange}
              value={procesoSeleccionado?.carpetas?.cj?.id_cj || ''}
              options={[
                { value: '', label: 'Seleccione una CJ...' },
                ...carpetasCJ.map(cj => ({
                  value: cj.id_cj,
                  label: `${cj.numero_cj}`
                }))
              ]}
            />
          </div>

          {/* Información del Proceso Seleccionado */}
          {procesoSeleccionado && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 mb-2">Proceso Seleccionado:</p>
                  <p className="text-blue-900 font-semibold mb-2">
                    {procesoSeleccionado.adolescente?.nombre || procesoSeleccionado.adolescente?.iniciales}
                  </p>

                  {/* Mostrar carpetas disponibles */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {procesoSeleccionado.carpetas?.cj && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                        CJ: {procesoSeleccionado.carpetas.cj.numero_cj}
                      </span>
                    )}
                    {procesoSeleccionado.carpetas?.cjo && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        CJO: {procesoSeleccionado.carpetas.cjo.numero_cjo}
                      </span>
                    )}
                    {procesoSeleccionado.carpetas?.cemci && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        CEMCI: {procesoSeleccionado.carpetas.cemci.numero_cemci}
                      </span>
                    )}
                    {procesoSeleccionado.carpetas?.cems && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                        CEMS: {procesoSeleccionado.carpetas.cems.numero_cems}
                      </span>
                    )}
                  </div>

                  {/* Checkboxes - Solo uno seleccionable */}
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-2">Asociar audiencia a:</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={tipoCarpeta === 'CJ'}
                          onChange={() => setTipoCarpeta('CJ')}
                          disabled={!procesoSeleccionado.carpetas?.cj}
                          className="rounded text-purple-600"
                        />
                        <span className={`text-sm ${procesoSeleccionado.carpetas?.cj ? 'text-gray-900' : 'text-gray-400'}`}>
                          CJ
                        </span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={tipoCarpeta === 'CJO'}
                          onChange={() => setTipoCarpeta('CJO')}
                          disabled={!procesoSeleccionado.carpetas?.cjo}
                          className="rounded text-blue-600"
                        />
                        <span className={`text-sm ${procesoSeleccionado.carpetas?.cjo ? 'text-gray-900' : 'text-gray-400'}`}>
                          CJO
                        </span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={tipoCarpeta === 'CEMCI'}
                          onChange={() => setTipoCarpeta('CEMCI')}
                          disabled={!procesoSeleccionado.carpetas?.cemci}
                          className="rounded text-green-600"
                        />
                        <span className={`text-sm ${procesoSeleccionado.carpetas?.cemci ? 'text-gray-900' : 'text-gray-400'}`}>
                          CEMCI
                        </span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={tipoCarpeta === 'CEMS'}
                          onChange={() => setTipoCarpeta('CEMS')}
                          disabled={!procesoSeleccionado.carpetas?.cems}
                          className="rounded text-orange-600"
                        />
                        <span className={`text-sm ${procesoSeleccionado.carpetas?.cems ? 'text-gray-900' : 'text-gray-400'}`}>
                          CEMS
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Mostrar carpeta seleccionada */}
                  {getCarpetaNumero() && (
                    <div className="mt-3 p-2 bg-blue-100 rounded">
                      <p className="text-xs text-blue-800">
                        ✓ Audiencia se asociará a: <strong>{tipoCarpeta}: {getCarpetaNumero()}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

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
          </div>
        </div>

        {/* Botones */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate('/audiencias')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              icon={Save}
              isLoading={isSaving}
              disabled={!procesoSeleccionado}
            >
              Crear Audiencia
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CrearAudiencia;
