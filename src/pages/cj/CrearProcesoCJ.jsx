// src/pages/cj/CrearProcesoCJ.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

import adolescenteService from '../../services/adolescenteService';
import procesoService from '../../services/procesoService';
import cjService from '../../services/cjService';
import cjConductaService from '../../services/cjConductaService';
import conductaService from '../../services/conductaService';
import calificativaService from '../../services/calificativaService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const procesoSchema = yup.object().shape({
  // Tab 1: Adolescente
  adolescente_id: yup.number()
    .typeError('Debe seleccionar un adolescente')
    .required('Debe seleccionar un adolescente'),

  // Tab 2: Proceso y CJ
  numero_cj: yup.string()
    .required('El número de CJ es requerido')
    .matches(/^CJ-\d+\/\d{4}$/, 'Formato inválido (debe ser: CJ-001/2025)'),
  fecha_ingreso: yup.date()
    .typeError('Ingrese una fecha válida')
    .required('La fecha de ingreso es requerida'),
  tipo_fuero: yup.string()
    .required('El tipo de fuero es requerido'),
  status_id: yup.number()
    .typeError('Debe seleccionar un status')
    .required('El status es requerido'),

  // Tab 3: Conductas (opcional)
  conductas: yup.array().of(
    yup.object().shape({
      conducta_id: yup.number()
        .typeError('Seleccione un delito')
        .required('Seleccione un delito'),
      calificativa_id: yup.number()
        .typeError('Seleccione una calificativa')
        .required('Seleccione una calificativa'),
      especificacion_adicional: yup.string().nullable(),
      fecha_conducta: yup.date().nullable().typeError('Fecha inválida'),
    })
  ),
});

const CrearProcesoCJ = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Catálogos
  const [adolescentes, setAdolescentes] = useState([]);
  const [conductas, setConductas] = useState([]);
  const [calificativas, setCalificativas] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(procesoSchema),
    mode: 'onSubmit', // Solo validar al enviar
    reValidateMode: 'onChange', // Re-validar al cambiar después del primer submit
    defaultValues: {
      adolescente_id: '',
      numero_cj: '',
      fecha_ingreso: '',
      tipo_fuero: 'COMUN',
      status_id: '',
      observaciones: '',

      // Conductas (array dinámico)
      conductas: [],

      // Detalles CJ
      numero_ampea: '',
      tipo_narcotico_asegurado: '',
      peso_narcotico_gramos: '',
      control: false,
      lesiones: false,
      fecha_control: '',
      fecha_formulacion: '',
      vinculacion: false,
      fecha_vinculacion: '',
      conducta_vinculacion: '',
      declaro: '',
      suspension_condicional_proceso_prueba: false,
      plazo_suspension: '',
      fecha_suspension: '',
      fecha_terminacion_suspension: '',
      audiencia_intermedia: false,
      fecha_audiencia_intermedia: '',
      estatus_carpeta_preliminar: '',
      reincidente: false,
      sustraido: false,
      fecha_sustraccion: '',
      medidas_proteccion: '',
      numero_toca_apelacion: '',
      numero_total_audiencias: 0,
      corporacion_ejecutora: '',
      representante_pp_nnya: '',
      tipo_representacion_pp_nnya: '',
      observaciones_cj: '',
      observaciones_adicionales: '',

      // Domicilio de hechos
      domicilio_hechos_municipio: '',
      domicilio_hechos_colonia: '',
      domicilio_hechos_calle: '',
    }
  });

  // Array de conductas
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conductas'
  });

  // Watchers para campos condicionales
  const controlChecked = watch('control');
  const vinculacionChecked = watch('vinculacion');
  const sustraidoChecked = watch('sustraido');
  const suspensionChecked = watch('suspension_condicional_proceso_prueba');
  const audienciaIntermedCheck = watch('audiencia_intermedia');

  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      // Cargar adolescentes
      const adoResponse = await adolescenteService.getSinProceso();
      const adoData = Array.isArray(adoResponse) ? adoResponse : (adoResponse.data || []);
      setAdolescentes(adoData);

      // Cargar conductas activas
      const condResponse = await conductaService.getActivas();
      const condData = Array.isArray(condResponse) ? condResponse : (condResponse.data || []);
      setConductas(condData);

      // Cargar calificativas activas
      const califResponse = await calificativaService.getActivas();
      const califData = Array.isArray(califResponse) ? califResponse : (califResponse.data || []);
      setCalificativas(califData);

      // Cargar status
      const statusResponse = await catalogoService.getAll('status');
      const statusData = Array.isArray(statusResponse) ? statusResponse : (statusResponse.data || []);
      setStatusList(statusData);

    } catch (error) {
      toast.error('Error al cargar catálogos');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Validar que haya al menos una conducta
      if (!data.conductas || data.conductas.length === 0) {
        toast.error('Debe agregar al menos una conducta del adolescente');
        setCurrentTab(2); // Ir al tab de conductas
        setIsLoading(false);
        return;
      }

      // PASO 1: Crear Proceso + CJ básica
      const procesoData = {
        adolescente_id: data.adolescente_id,
        status_id: data.status_id,
        observaciones: data.observaciones || null,
        numero_cj: data.numero_cj,
        fecha_ingreso: data.fecha_ingreso,
        tipo_fuero: data.tipo_fuero,
      };

      const procesoResponse = await procesoService.create(procesoData);

      console.log('📦 Respuesta completa:', procesoResponse);

      // La respuesta puede venir en diferentes formatos según el backend
      const responseData = procesoResponse.data || procesoResponse;
      console.log('📦 responseData:', responseData);

      const proceso_id = responseData.proceso?.id_proceso || responseData.procesoId || responseData.proceso_id;
      const cj_id = responseData.carpetas?.cj?.id_cj || responseData.cjId || responseData.cj_id;

      console.log('📦 IDs extraídos:', { proceso_id, cj_id });

      // PASO 2: Actualizar CJ con detalles completos
      const cjData = {
        numero_ampea: data.numero_ampea || null,
        tipo_narcotico_asegurado: data.tipo_narcotico_asegurado || null,
        peso_narcotico_gramos: data.peso_narcotico_gramos || null,
        control: data.control || false,
        lesiones: data.lesiones || false,
        fecha_control: data.fecha_control || null,
        fecha_formulacion: data.fecha_formulacion || null,
        vinculacion: data.vinculacion || false,
        fecha_vinculacion: data.fecha_vinculacion || null,
        conducta_vinculacion: data.conducta_vinculacion || null,
        declaro: data.declaro || null,
        suspension_condicional_proceso_prueba: data.suspension_condicional_proceso_prueba || false,
        plazo_suspension: data.plazo_suspension || null,
        fecha_suspension: data.fecha_suspension || null,
        fecha_terminacion_suspension: data.fecha_terminacion_suspension || null,
        audiencia_intermedia: data.audiencia_intermedia || false,
        fecha_audiencia_intermedia: data.fecha_audiencia_intermedia || null,
        estatus_carpeta_preliminar: data.estatus_carpeta_preliminar || null,
        reincidente: data.reincidente || false,
        sustraido: data.sustraido || false,
        fecha_sustraccion: data.fecha_sustraccion || null,
        medidas_proteccion: data.medidas_proteccion || null,
        numero_toca_apelacion: data.numero_toca_apelacion || null,
        numero_total_audiencias: data.numero_total_audiencias || 0,
        corporacion_ejecutora: data.corporacion_ejecutora || null,
        representante_pp_nnya: data.representante_pp_nnya || null,
        tipo_representacion_pp_nnya: data.tipo_representacion_pp_nnya || null,
        observaciones: data.observaciones_cj || null,
        observaciones_adicionales: data.observaciones_adicionales || null,
      };

      // Si hay domicilio de hechos, agregarlo
      if (data.domicilio_hechos_municipio || data.domicilio_hechos_calle || data.domicilio_hechos_colonia) {
        cjData.domicilio_hechos = {
          municipio: data.domicilio_hechos_municipio || null,
          calle_numero: data.domicilio_hechos_calle || null,
          colonia: data.domicilio_hechos_colonia || null,
        };
      }

      await cjService.update(cj_id, cjData);

      // PASO 3: Agregar conductas
      if (data.conductas && data.conductas.length > 0) {
        for (const conducta of data.conductas) {
          const conductaData = {
            cj_id: cj_id,
            conducta_id: conducta.conducta_id,
            calificativa_id: conducta.calificativa_id,
            especificacion_adicional: conducta.especificacion_adicional || null,
            fecha_conducta: conducta.fecha_conducta || null,
          };

          await cjConductaService.create(conductaData);
        }
      }

      toast.success('Proceso y CJ creados exitosamente');
      // Redirect a asignar actores
      navigate(`/carpetas/cj/${cj_id}/asignar-actores`, {
        state: {
          proceso_id: proceso_id,
          cj_id: cj_id,
          numero_cj: data.numero_cj
        }
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear proceso y CJ');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 0, name: 'Adolescente' },
    { id: 1, name: 'Proceso y CJ' },
    { id: 2, name: 'Conductas' },
    { id: 3, name: 'Detalles CJ' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/procesos')}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Proceso y Carpeta CJ</h1>
          <p className="text-gray-600">Crear proceso completo con carpeta de investigación</p>
        </div>
      </div>

      {/* Mensaje informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Campos Requeridos</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Obligatorios para guardar:</strong> Adolescente, Número CJ (formato: CJ-001/2025), Fecha de Ingreso, Tipo de Fuero, Status, Al menos 1 Conducta</p>
              <p><strong>Opcionales:</strong> Todos los campos del Tab "Detalles CJ" pueden llenarse después editando la carpeta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          // Manejador de errores de validación
          console.log('Errores de validación:', errors);

          // Mostrar primer error encontrado
          if (errors.adolescente_id) {
            toast.error(errors.adolescente_id.message);
            setCurrentTab(0);
          } else if (errors.numero_cj || errors.fecha_ingreso || errors.tipo_fuero || errors.status_id) {
            const errorMsg = errors.numero_cj?.message || errors.fecha_ingreso?.message ||
              errors.tipo_fuero?.message || errors.status_id?.message;
            toast.error(errorMsg);
            setCurrentTab(1);
          } else if (errors.conductas) {
            toast.error('Revise los datos de las conductas');
            setCurrentTab(2);
          } else {
            toast.error('Por favor complete todos los campos requeridos');
          }
        })}
        className="space-y-6"
      >

        {/* TAB 1: ADOLESCENTE */}
        {currentTab === 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Adolescente</h2>

            <Select
              label="Adolescente"
              error={errors.adolescente_id?.message}
              required
              options={[
                { value: '', label: 'Seleccione un adolescente' },
                ...adolescentes.map(ado => ({
                  value: ado.id_adolescente,
                  label: ado.nombre
                }))
              ]}
              {...register('adolescente_id')}
            />

            <div className="mt-4 flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/adolescentes/nuevo')}
              >
                + Crear Nuevo Adolescente
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentTab(1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: PROCESO Y CJ */}
        {currentTab === 1 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Información del Proceso y CJ</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número CJ"
                placeholder="EJ: CJ-002/2025"
                error={errors.numero_cj?.message}
                required
                {...register('numero_cj')}
              />

              <Input
                label="Fecha de Ingreso"
                type="date"
                error={errors.fecha_ingreso?.message}
                required
                {...register('fecha_ingreso')}
              />

              <Select
                label="Tipo de Fuero"
                error={errors.tipo_fuero?.message}
                required
                options={[
                  { value: 'COMUN', label: 'COMÚN' },
                  { value: 'FEDERAL', label: 'FEDERAL' }
                ]}
                {...register('tipo_fuero')}
              />

              <Select
                label="Status"
                error={errors.status_id?.message}
                required
                options={[
                  { value: '', label: 'Seleccione un status' },
                  ...statusList.map(status => ({
                    value: status.id_status,
                    label: status.nombre
                  }))
                ]}
                {...register('status_id')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones del Proceso
              </label>
              <textarea
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="Observaciones generales..."
                {...register('observaciones')}
              />
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentTab(0)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentTab(2)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: CONDUCTAS */}
        {currentTab === 2 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Conductas del Adolescente</h2>
              <Button
                type="button"
                size="sm"
                icon={Plus}
                onClick={() => append({ conducta_id: '', calificativa_id: '', especificacion_adicional: '', fecha_conducta: '' })}
              >
                Agregar Conducta
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay conductas agregadas. Click en "Agregar Conducta" para comenzar.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const conductaSeleccionada = watch(`conductas.${index}.conducta_id`);
                  // Verificar si el delito seleccionado es "OTRO"
                  const conductaObj = conductas.find(c => c.id_conducta === parseInt(conductaSeleccionada));
                  const esOtro = conductaObj && conductaObj.nombre.toUpperCase().includes('OTRO');

                  return (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-900">Conducta #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Delito"
                          error={errors.conductas?.[index]?.conducta_id?.message}
                          required
                          options={[
                            { value: '', label: 'Seleccione un delito' },
                            ...conductas.map(cond => ({
                              value: cond.id_conducta,
                              label: cond.nombre
                            }))
                          ]}
                          {...register(`conductas.${index}.conducta_id`, {
                            onChange: (e) => {
                              // Si selecciona OTRO en delito, auto-seleccionar OTRO en calificativa
                              const selectedConducta = conductas.find(c => c.id_conducta === parseInt(e.target.value));
                              if (selectedConducta && selectedConducta.nombre.toUpperCase().includes('OTRO')) {
                                const otraCalificativa = calificativas.find(cal => cal.nombre.toUpperCase().includes('OTRO'));
                                if (otraCalificativa) {
                                  setValue(`conductas.${index}.calificativa_id`, otraCalificativa.id_calificativa);
                                }
                              }
                            }
                          })}
                        />

                        <Select
                          label="Calificativa"
                          error={errors.conductas?.[index]?.calificativa_id?.message}
                          required
                          options={[
                            { value: '', label: 'Seleccione una calificativa' },
                            ...calificativas.map(calif => ({
                              value: calif.id_calificativa,
                              label: calif.nombre
                            }))
                          ]}
                          {...register(`conductas.${index}.calificativa_id`)}
                        />

                        {esOtro && (
                          <div className="md:col-span-2">
                            <Input
                              label="Especificar Delito"
                              placeholder="Escriba el nombre del delito..."
                              error={errors.conductas?.[index]?.especificacion_adicional?.message}
                              required
                              {...register(`conductas.${index}.especificacion_adicional`)}
                            />
                            <p className="mt-1 text-xs text-blue-600">
                              💡 Al seleccionar "OTRO" en delito, la calificativa se auto-selecciona como "OTRO" también
                            </p>
                          </div>
                        )}

                        <Input
                          label="Fecha de la Conducta"
                          type="date"
                          error={errors.conductas?.[index]?.fecha_conducta?.message}
                          {...register(`conductas.${index}.fecha_conducta`)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentTab(1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentTab(3)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: DETALLES CJ - Continuará en siguiente mensaje... */}

        {/* TAB 4: DETALLES CJ */}
        {currentTab === 3 && (
          <div className="space-y-4">
            {/* Sección: Narcóticos */}
            <AccordionSection title="Narcóticos" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número AMPEA"
                  placeholder="EJ: CT-UCD-29-2025"
                  {...register('numero_ampea')}
                />

                <Input
                  label="Tipo Narcótico Asegurado"
                  placeholder="EJ: METANFETAMINA"
                  {...register('tipo_narcotico_asegurado')}
                />

                <Input
                  label="Peso en Gramos"
                  type="number"
                  step="0.01"
                  placeholder="2.47"
                  {...register('peso_narcotico_gramos')}
                />
              </div>
            </AccordionSection>

            {/* Sección: Control y Formulación */}
            <AccordionSection title="Control y Formulación" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="control"
                    className="w-4 h-4 text-blue-600 rounded"
                    {...register('control')}
                  />
                  <label htmlFor="control" className="text-sm font-medium text-gray-700">
                    Control
                  </label>
                </div>

                {controlChecked && (
                  <div className="ml-7">
                    <Input
                      label="Fecha Control"
                      type="date"
                      {...register('fecha_control')}
                    />
                  </div>
                )}

                <Input
                  label="Fecha Formulación"
                  type="date"
                  {...register('fecha_formulacion')}
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="lesiones"
                    className="w-4 h-4 text-blue-600 rounded"
                    {...register('lesiones')}
                  />
                  <label htmlFor="lesiones" className="text-sm font-medium text-gray-700">
                    Lesiones
                  </label>
                </div>
              </div>
            </AccordionSection>

            {/* Sección: Vinculación */}
            <AccordionSection title="Vinculación" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="vinculacion"
                    className="w-4 h-4 text-blue-600 rounded"
                    {...register('vinculacion')}
                  />
                  <label htmlFor="vinculacion" className="text-sm font-medium text-gray-700">
                    Vinculación
                  </label>
                </div>

                {vinculacionChecked && (
                  <div className="space-y-4 ml-7">
                    <Input
                      label="Fecha Vinculación"
                      type="date"
                      {...register('fecha_vinculacion')}
                    />
                    <Input
                      label="Conducta Vinculación"
                      placeholder="EJ: MISMAS"
                      {...register('conducta_vinculacion')}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="declaro"
                        className="w-4 h-4 text-blue-600 rounded"
                        {...register('declaro')}
                      />
                      <label htmlFor="declaro" className="text-sm font-medium text-gray-700">
                        Declaró
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Sección: Suspensión Condicional */}
            <AccordionSection title="Suspensión Condicional del Proceso" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="suspension"
                    className="w-4 h-4 text-blue-600 rounded"
                    {...register('suspension_condicional_proceso_prueba')}
                  />
                  <label htmlFor="suspension" className="text-sm font-medium text-gray-700">
                    Suspensión Condicional Proceso Prueba
                  </label>
                </div>

                {suspensionChecked && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <Input
                      label="Plazo Suspensión"
                      placeholder="EJ: 6 MESES"
                      {...register('plazo_suspension')}
                    />
                    <Input
                      label="Fecha Suspensión"
                      type="date"
                      {...register('fecha_suspension')}
                    />
                    <Input
                      label="Fecha Terminación Suspensión"
                      type="date"
                      {...register('fecha_terminacion_suspension')}
                    />
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Sección: Audiencia Intermedia */}
            <AccordionSection title="Audiencia Intermedia" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="audiencia_intermedia"
                    className="w-4 h-4 text-blue-600 rounded"
                    {...register('audiencia_intermedia')}
                  />
                  <label htmlFor="audiencia_intermedia" className="text-sm font-medium text-gray-700">
                    Audiencia Intermedia
                  </label>
                </div>

                {audienciaIntermedCheck && (
                  <div className="ml-7">
                    <Input
                      label="Fecha Audiencia Intermedia"
                      type="date"
                      {...register('fecha_audiencia_intermedia')}
                    />
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Sección: Otras Características */}
            <AccordionSection title="Otras Características" defaultOpen={false}>
              <div className="space-y-4">
                <Input
                  label="Estatus Carpeta Preliminar"
                  placeholder="EJ: CONCLUIDA, EN PROCESO"
                  {...register('estatus_carpeta_preliminar')}
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="reincidente"
                    className="w-4 h-4 text-blue-600 rounded"
                    {...register('reincidente')}
                  />
                  <label htmlFor="reincidente" className="text-sm font-medium text-gray-700">
                    Reincidente
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sustraido"
                      className="w-4 h-4 text-blue-600 rounded"
                      {...register('sustraido')}
                    />
                    <label htmlFor="sustraido" className="text-sm font-medium text-gray-700">
                      Sustraído
                    </label>
                  </div>

                  {sustraidoChecked && (
                    <div className="ml-7">
                      <Input
                        label="Fecha Sustracción"
                        type="date"
                        {...register('fecha_sustraccion')}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Medidas de Protección"
                    {...register('medidas_proteccion')}
                  />

                  <Input
                    label="Número Toca Apelación"
                    {...register('numero_toca_apelacion')}
                  />

                  <Input
                    label="Número Total de Audiencias"
                    type="number"
                    {...register('numero_total_audiencias')}
                  />

                  <Input
                    label="Corporación Ejecutora"
                    placeholder="EJ: COMISIÓN DE SEGURIDAD..."
                    {...register('corporacion_ejecutora')}
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Sección: Representante PP NNyA */}
            <AccordionSection title="Representante PP NNyA" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Representante PP NNyA"
                  placeholder="NOMBRE DEL REPRESENTANTE"
                  {...register('representante_pp_nnya')}
                />

                <Input
                  label="Tipo Representación"
                  placeholder="TIPO DE REPRESENTACIÓN"
                  {...register('tipo_representacion_pp_nnya')}
                />

              </div>
            </AccordionSection>

            {/* Sección: Domicilio de los Hechos */}
            <AccordionSection title="Domicilio de los Hechos" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Municipio"
                  placeholder="EJ: YAUTEPEC"
                  {...register('domicilio_hechos_municipio')}
                />

                <Input
                  label="Colonia"
                  placeholder="EJ: BARRIO DE IXTLAHUACAN"
                  {...register('domicilio_hechos_colonia')}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Calle y Número"
                    placeholder="EJ: ESPERANZA"
                    {...register('domicilio_hechos_calle')}
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Sección: Observaciones */}
            <AccordionSection title="Observaciones" defaultOpen={false}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones CJ
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Observaciones de la carpeta..."
                    {...register('observaciones_cj')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones Adicionales
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Observaciones adicionales..."
                    {...register('observaciones_adicionales')}
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Botones finales */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentTab(2)}
                >
                  Anterior
                </Button>
                <Button
                  type="submit"
                  icon={Save}
                  isLoading={isLoading}
                >
                  Guardar Proceso y CJ
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// Componente de Sección Colapsable (Acordeón)
const AccordionSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default CrearProcesoCJ;
