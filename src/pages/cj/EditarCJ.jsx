// src/pages/cj/EditarCJ.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2, User, X, Search } from 'lucide-react';

import cjService from '../../services/cjService';
import cjConductaService from '../../services/cjConductaService';
import conductaService from '../../services/conductaService';
import calificativaService from '../../services/calificativaService';
import actorService from '../../services/actorService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Schema de validación
const editarCJSchema = yup.object().shape({
  numero_cj: yup.string().required('El número de CJ es requerido'),
  fecha_ingreso: yup.date().required('La fecha de ingreso es requerida').typeError('Fecha inválida'),
  tipo_fuero: yup.string().required('El tipo de fuero es requerido'),
  conductas: yup.array().of(
    yup.object().shape({
      conducta_id: yup.number().required('Seleccione un delito').typeError('Seleccione un delito'),
      calificativa_id: yup.number().required('Seleccione una calificativa').typeError('Seleccione una calificativa'),
      especificacion_adicional: yup.string().nullable(),
      fecha_conducta: yup.date().nullable().typeError('Fecha inválida'),
    })
  ),
});

const EditarCJ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Catálogos
  const [conductas, setConductas] = useState([]);
  const [calificativas, setCalificativas] = useState([]);

  // Actores
  const [actoresAsignados, setActoresAsignados] = useState([]);
  const [searchActor, setSearchActor] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tipoNuevoActor, setTipoNuevoActor] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [procesoId, setProcesoId] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editarCJSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conductas'
  });

  const controlChecked = watch('control');
  const vinculacionChecked = watch('vinculacion');
  const sustraidoChecked = watch('sustraido');
  const suspensionChecked = watch('suspension_condicional_proceso_prueba');
  const audienciaIntermedCheck = watch('audiencia_intermedia');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCJ(),
        loadCatalogos(),
        loadConductas(),
      ]);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCJ = async () => {
    try {
      const response = await cjService.getById(id);
      const cjData = response.data || response;

      if (cjData.proceso_id) {
        setProcesoId(cjData.proceso_id);
        loadActores(cjData.proceso_id);
      }

      reset({
        numero_cj: cjData.numero_cj || '',
        fecha_ingreso: cjData.fecha_ingreso?.split('T')[0] || '',
        tipo_fuero: cjData.tipo_fuero || 'COMUN',
        observaciones: cjData.observaciones || '',
        numero_ampea: cjData.numero_ampea || '',
        tipo_narcotico_asegurado: cjData.tipo_narcotico_asegurado || '',
        peso_narcotico_gramos: cjData.peso_narcotico_gramos || '',
        control: cjData.control || false,
        lesiones: cjData.lesiones || false,
        fecha_control: cjData.fecha_control?.split('T')[0] || '',
        fecha_formulacion: cjData.fecha_formulacion?.split('T')[0] || '',
        vinculacion: cjData.vinculacion || false,
        fecha_vinculacion: cjData.fecha_vinculacion?.split('T')[0] || '',
        conducta_vinculacion: cjData.conducta_vinculacion || '',
        declaro: cjData.declaro || '',
        suspension_condicional_proceso_prueba: cjData.suspension_condicional_proceso_prueba || false,
        plazo_suspension: cjData.plazo_suspension || '',
        fecha_suspension: cjData.fecha_suspension?.split('T')[0] || '',
        fecha_terminacion_suspension: cjData.fecha_terminacion_suspension?.split('T')[0] || '',
        audiencia_intermedia: cjData.audiencia_intermedia || false,
        fecha_audiencia_intermedia: cjData.fecha_audiencia_intermedia?.split('T')[0] || '',
        estatus_carpeta_preliminar: cjData.estatus_carpeta_preliminar || '',
        reincidente: cjData.reincidente || false,
        sustraido: cjData.sustraido || false,
        fecha_sustraccion: cjData.fecha_sustraccion?.split('T')[0] || '',
        medidas_proteccion: cjData.medidas_proteccion || '',
        numero_toca_apelacion: cjData.numero_toca_apelacion || '',
        numero_total_audiencias: cjData.numero_total_audiencias || 0,
        corporacion_ejecutora: cjData.corporacion_ejecutora || '',
        representante_pp_nnya: cjData.representante_pp_nnya || '',
        tipo_representacion_pp_nnya: cjData.tipo_representacion_pp_nnya || '',
        observaciones_cj: cjData.observaciones || '',
        observaciones_adicionales: cjData.observaciones_adicionales || '',
        domicilio_hechos_municipio: cjData.domicilio_hechos?.municipio || '',
        domicilio_hechos_colonia: cjData.domicilio_hechos?.colonia || '',
        domicilio_hechos_calle: cjData.domicilio_hechos?.calle_numero || '',
        conductas: [],
      });
    } catch (error) {
      toast.error('Error al cargar CJ');
      console.error(error);
      navigate('/carpetas/cj');
    }
  };

  const loadCatalogos = async () => {
    try {
      const [condResponse, califResponse] = await Promise.all([
        conductaService.getActivas(),
        calificativaService.getActivas(),
      ]);

      const condData = Array.isArray(condResponse) ? condResponse : (condResponse.data || []);
      const califData = Array.isArray(califResponse) ? califResponse : (califResponse.data || []);

      setConductas(condData);
      setCalificativas(califData);
    } catch (error) {
      toast.error('Error al cargar catálogos');
      console.error(error);
    }
  };

  const loadConductas = async () => {
    try {
      const response = await cjConductaService.getByCJ(id);
      const data = response.data || [];

      const conductasForm = data.map(c => ({
        id_conducta: c.id_conducta,
        conducta_id: c.conducta_id,
        calificativa_id: c.calificativa_id,
        especificacion_adicional: c.especificacion_adicional || '',
        fecha_conducta: c.fecha_conducta?.split('T')[0] || '',
      }));

      setValue('conductas', conductasForm);
    } catch (error) {
      console.error('Error al cargar conductas:', error);
    }
  };

  const loadActores = async (pId) => {
    try {
      const response = await actorService.getByProceso(pId);
      const actores = response.data || [];
      const actoresCJ = actores.filter(a => a.tipo_carpeta === 'CJ');
      setActoresAsignados(actoresCJ);
    } catch (error) {
      console.error('Error al cargar actores:', error);
    }
  };

  const handleSearchActor = async (e) => {
    const valor = e.target.value.toUpperCase();
    setSearchActor(valor);
    setShowCreateForm(false);
    if (valor.length >= 3) {
      setIsSearching(true);
      try {
        const response = await actorService.search(valor);
        const resultados = response.data || [];
        setSearchResults(resultados);
        if (resultados.length === 0) {
          setShowCreateForm(true);
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setSearchResults([]);
        setShowCreateForm(true);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowCreateForm(false);
    }
  };

  const seleccionarActorExistente = async (actor) => {
    try {
      await actorService.asignar(procesoId, {
        actor_id: actor.id_actor,
        tipo_carpeta: 'CJ'
      });
      toast.success(`${actor.nombre} asignado a CJ`);
      loadActores(procesoId);
      setSearchActor('');
      setSearchResults([]);
    } catch (error) {
      toast.error('Error al asignar actor');
      console.error(error);
    }
  };

  const crearYAsignarActor = async () => {
    if (!tipoNuevoActor) {
      toast.error('Debe seleccionar el tipo de actor');
      return;
    }
    try {
      const nuevoActorResponse = await actorService.create({
        nombre: searchActor,
        tipo: tipoNuevoActor
      });
      const nuevoActor = nuevoActorResponse.data || nuevoActorResponse;
      const actorId = nuevoActor.id_actor || nuevoActor.insertId;
      await actorService.asignar(procesoId, {
        actor_id: actorId,
        tipo_carpeta: 'CJ'
      });
      toast.success(`Actor "${searchActor}" creado y asignado`);
      loadActores(procesoId);
      setSearchActor('');
      setTipoNuevoActor('');
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Error al crear actor');
      console.error(error);
    }
  };

  const desasignarActor = async (actorId) => {
    if (!window.confirm('¿Desea desasignar este actor de la carpeta CJ?')) {
      return;
    }
    try {
      await actorService.desasignar(procesoId, 'CJ', actorId);
      toast.success('Actor desasignado correctamente');
      loadActores(procesoId);
    } catch (error) {
      toast.error('Error al desasignar actor');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const cjData = {
        numero_cj: data.numero_cj,
        fecha_ingreso: data.fecha_ingreso,
        tipo_fuero: data.tipo_fuero,
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

      if (data.domicilio_hechos_municipio || data.domicilio_hechos_calle || data.domicilio_hechos_colonia) {
        cjData.domicilio_hechos = {
          municipio: data.domicilio_hechos_municipio || null,
          calle_numero: data.domicilio_hechos_calle || null,
          colonia: data.domicilio_hechos_colonia || null,
        };
      }

      await cjService.update(id, cjData);

      const conductasActuales = await cjConductaService.getByCJ(id);
      const conductasActualesData = conductasActuales.data || [];

      for (const conducta of conductasActualesData) {
        await cjConductaService.delete(conducta.id_conducta);
      }

      for (const conducta of data.conductas || []) {
        await cjConductaService.create({
          cj_id: id,
          conducta_id: conducta.conducta_id,
          calificativa_id: conducta.calificativa_id,
          especificacion_adicional: conducta.especificacion_adicional || null,
          fecha_conducta: conducta.fecha_conducta || null,
        });
      }

      toast.success('Carpeta CJ actualizada exitosamente');
      navigate(`/carpetas/cj/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la carpeta CJ');
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

  const tabs = [
    { id: 0, name: 'Información General' },
    { id: 1, name: 'Conductas' },
    { id: 2, name: 'Detalles CJ' },
    { id: 3, name: 'Actores Jurídicos' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(`/carpetas/cj/${id}`)}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Carpeta CJ</h1>
          <p className="text-gray-600">Modificar información de la carpeta</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* TAB 1: INFORMACIÓN GENERAL */}
        {currentTab === 0 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Número CJ" disabled {...register('numero_cj')} />
              <Input label="Fecha de Ingreso" type="date" required error={errors.fecha_ingreso?.message} {...register('fecha_ingreso')} />
              <Select label="Tipo de Fuero" required error={errors.tipo_fuero?.message} options={[
                { value: 'COMUN', label: 'COMÚN' },
                { value: 'FEDERAL', label: 'FEDERAL' }
              ]} {...register('tipo_fuero')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea rows={3} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase" {...register('observaciones')} />
            </div>
            <div className="flex justify-between">
              <div></div>
              <Button type="button" onClick={() => setCurrentTab(1)}>Siguiente</Button>
            </div>
          </div>
        )}

        {/* TAB 2: CONDUCTAS */}
        {currentTab === 1 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Conductas del Adolescente</h2>
              <Button type="button" size="sm" icon={Plus} onClick={() => append({ conducta_id: '', calificativa_id: '', especificacion_adicional: '', fecha_conducta: '' })}>
                Agregar Conducta
              </Button>
            </div>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay conductas. Click en "Agregar Conducta" para comenzar.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const conductaSeleccionada = watch(`conductas.${index}.conducta_id`);
                  const conductaObj = conductas.find(c => c.id_conducta === parseInt(conductaSeleccionada));
                  const esOtro = conductaObj && conductaObj.nombre.toUpperCase().includes('OTRO');

                  return (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-900">Conducta #{index + 1}</h3>
                        <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Delito" required error={errors.conductas?.[index]?.conducta_id?.message} options={[
                          { value: '', label: 'Seleccione un delito' },
                          ...conductas.map(cond => ({ value: cond.id_conducta, label: cond.nombre }))
                        ]} {...register(`conductas.${index}.conducta_id`, {
                          onChange: (e) => {
                            const selectedConducta = conductas.find(c => c.id_conducta === parseInt(e.target.value));
                            if (selectedConducta && selectedConducta.nombre.toUpperCase().includes('OTRO')) {
                              const otraCalificativa = calificativas.find(cal => cal.nombre.toUpperCase().includes('OTRO'));
                              if (otraCalificativa) {
                                setValue(`conductas.${index}.calificativa_id`, otraCalificativa.id_calificativa);
                              }
                            }
                          }
                        })} />
                        <Select label="Calificativa" required disabled={esOtro} error={errors.conductas?.[index]?.calificativa_id?.message} options={[
                          { value: '', label: 'Seleccione una calificativa' },
                          ...calificativas.map(calif => ({ value: calif.id_calificativa, label: calif.nombre }))
                        ]} {...register(`conductas.${index}.calificativa_id`)} />
                        {esOtro && (
                          <div className="md:col-span-2">
                            <Input label="Especificar Delito" required placeholder="Escriba el nombre del delito..." error={errors.conductas?.[index]?.especificacion_adicional?.message} {...register(`conductas.${index}.especificacion_adicional`)} />
                          </div>
                        )}
                        <Input label="Fecha de la Conducta" type="date" error={errors.conductas?.[index]?.fecha_conducta?.message} {...register(`conductas.${index}.fecha_conducta`)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="secondary" onClick={() => setCurrentTab(0)}>Anterior</Button>
              <Button type="button" onClick={() => setCurrentTab(2)}>Siguiente</Button>
            </div>
          </div>
        )}

        {/* TAB 3: DETALLES CJ */}
        {currentTab === 2 && (
          <div className="space-y-4">
            {/* Narcóticos */}
            <AccordionSection title="Narcóticos" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Número AMPEA" placeholder="EJ: CT-UCD-29-2025" {...register('numero_ampea')} />
                <Input label="Tipo Narcótico Asegurado" placeholder="EJ: METANFETAMINA" {...register('tipo_narcotico_asegurado')} />
                <Input label="Peso en Gramos" type="number" step="0.01" placeholder="2.47" {...register('peso_narcotico_gramos')} />
              </div>
            </AccordionSection>

            {/* Control y Formulación */}
            <AccordionSection title="Control y Formulación" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="control" className="w-4 h-4 text-blue-600 rounded" {...register('control')} />
                  <label htmlFor="control" className="text-sm font-medium text-gray-700">Control</label>
                </div>
                {controlChecked && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <Input label="Fecha Control" type="date" {...register('fecha_control')} />
                    <Input label="Fecha Formulación" type="date" {...register('fecha_formulacion')} />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="lesiones" className="w-4 h-4 text-blue-600 rounded" {...register('lesiones')} />
                  <label htmlFor="lesiones" className="text-sm font-medium text-gray-700">Lesiones</label>
                </div>
              </div>
            </AccordionSection>

            {/* Vinculación */}
            <AccordionSection title="Vinculación" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="vinculacion" className="w-4 h-4 text-blue-600 rounded" {...register('vinculacion')} />
                  <label htmlFor="vinculacion" className="text-sm font-medium text-gray-700">Vinculación</label>
                </div>
                {vinculacionChecked && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <Input label="Fecha Vinculación" type="date" {...register('fecha_vinculacion')} />
                    <Input label="Conducta Vinculación" placeholder="EJ: MISMAS" {...register('conducta_vinculacion')} />
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="declaro" className="w-4 h-4 text-blue-600 rounded" {...register('declaro')} />
                      <label htmlFor="declaro" className="text-sm font-medium text-gray-700">Declaró</label>
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Suspensión Condicional */}
            <AccordionSection title="Suspensión Condicional del Proceso" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="suspension" className="w-4 h-4 text-blue-600 rounded" {...register('suspension_condicional_proceso_prueba')} />
                  <label htmlFor="suspension" className="text-sm font-medium text-gray-700">Suspensión Condicional Proceso Prueba</label>
                </div>
                {suspensionChecked && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <Input label="Plazo Suspensión" placeholder="EJ: 6 MESES" {...register('plazo_suspension')} />
                    <Input label="Fecha Suspensión" type="date" {...register('fecha_suspension')} />
                    <Input label="Fecha Terminación Suspensión" type="date" {...register('fecha_terminacion_suspension')} />
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Audiencia Intermedia */}
            <AccordionSection title="Audiencia Intermedia" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="audiencia_intermedia" className="w-4 h-4 text-blue-600 rounded" {...register('audiencia_intermedia')} />
                  <label htmlFor="audiencia_intermedia" className="text-sm font-medium text-gray-700">Audiencia Intermedia</label>
                </div>
                {audienciaIntermedCheck && (
                  <div className="ml-7">
                    <Input label="Fecha Audiencia Intermedia" type="date" {...register('fecha_audiencia_intermedia')} />
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Otras Características */}
            <AccordionSection title="Otras Características" defaultOpen={false}>
              <div className="space-y-4">
                <Input label="Estatus Carpeta Preliminar" placeholder="EJ: CONCLUIDA, EN PROCESO" {...register('estatus_carpeta_preliminar')} />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="reincidente" className="w-4 h-4 text-blue-600 rounded" {...register('reincidente')} />
                  <label htmlFor="reincidente" className="text-sm font-medium text-gray-700">Reincidente</label>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="sustraido" className="w-4 h-4 text-blue-600 rounded" {...register('sustraido')} />
                    <label htmlFor="sustraido" className="text-sm font-medium text-gray-700">Sustraído</label>
                  </div>
                  {sustraidoChecked && (
                    <div className="ml-7">
                      <Input label="Fecha Sustracción" type="date" {...register('fecha_sustraccion')} />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Medidas de Protección" {...register('medidas_proteccion')} />
                  <Input label="Número Toca Apelación" {...register('numero_toca_apelacion')} />
                  <Input label="Número Total de Audiencias" type="number" {...register('numero_total_audiencias')} />
                  <Input label="Corporación Ejecutora" placeholder="EJ: COMISIÓN DE SEGURIDAD..." {...register('corporacion_ejecutora')} />
                </div>
              </div>
            </AccordionSection>

            {/* Representante PP NNyA */}
            <AccordionSection title="Representante PP NNyA" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Representante PP NNyA" placeholder="NOMBRE DEL REPRESENTANTE" {...register('representante_pp_nnya')} />
                <Select label="Tipo Representación" options={[
                  { value: '', label: 'Seleccione...' },
                  { value: 'TITULAR', label: 'TITULAR' },
                  { value: 'SUPLENCIA', label: 'SUPLENCIA' }
                ]} {...register('tipo_representacion_pp_nnya')} />
              </div>
            </AccordionSection>

            {/* Domicilio de los Hechos */}
            <AccordionSection title="Domicilio de los Hechos" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Municipio" placeholder="EJ: YAUTEPEC" {...register('domicilio_hechos_municipio')} />
                <Input label="Colonia" placeholder="EJ: BARRIO DE IXTLAHUACAN" {...register('domicilio_hechos_colonia')} />
                <div className="md:col-span-2">
                  <Input label="Calle y Número" placeholder="EJ: ESPERANZA" {...register('domicilio_hechos_calle')} />
                </div>
              </div>
            </AccordionSection>

            {/* Observaciones */}
            <AccordionSection title="Observaciones" defaultOpen={false}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones CJ</label>
                  <textarea rows={3} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Observaciones de la carpeta..." {...register('observaciones_cj')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones Adicionales</label>
                  <textarea rows={3} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Observaciones adicionales..." {...register('observaciones_adicionales')} />
                </div>
              </div>
            </AccordionSection>

            {/* Botones */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setCurrentTab(1)}>Anterior</Button>
                <Button type="button" onClick={() => setCurrentTab(3)}>Siguiente</Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACTORES JURÍDICOS */}
        {currentTab === 3 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Gestionar Actores Jurídicos</h2>
            </div>

            {/* Buscador / Agregar Actor */}
            <div className="mb-6">
              <div className="relative">
                <Input icon={Search} placeholder="Buscar actor por nombre (mín. 3 caracteres)..." value={searchActor} onChange={handleSearchActor} />

                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((actor) => (
                      <button key={actor.id_actor} type="button" onClick={() => seleccionarActorExistente(actor)} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{actor.nombre}</p>
                          <p className="text-sm text-gray-500 capitalize">{actor.tipo}</p>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                    ))}
                  </div>
                )}

                {isSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                    <p className="text-gray-600">Buscando...</p>
                  </div>
                )}
              </div>

              {showCreateForm && searchActor.length >= 3 && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>No se encontró el actor.</strong> ¿Desea crear "{searchActor}"?
                  </p>

                  <div className="space-y-3">
                    <Select label="Tipo de Actor" value={tipoNuevoActor} onChange={(e) => setTipoNuevoActor(e.target.value)} options={[
                      { value: '', label: 'Seleccione el tipo...' },
                      { value: 'defensa', label: 'Defensa' },
                      { value: 'fiscal', label: 'Fiscal' },
                      { value: 'juez', label: 'Juez' },
                      { value: 'perito', label: 'Perito' },
                      { value: 'otro', label: 'Otro' }
                    ]} />

                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={crearYAsignarActor} disabled={!tipoNuevoActor}>
                        Crear y Asignar
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => {
                        setShowCreateForm(false);
                        setSearchActor('');
                        setTipoNuevoActor('');
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de actores asignados */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Actores Asignados ({actoresAsignados.length})
              </h3>

              {actoresAsignados.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay actores asignados</p>
                  <p className="text-gray-400 text-xs mt-1">Use el buscador arriba para agregar actores</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actoresAsignados.map((actor) => (
                    <div key={actor.id_actor} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{actor.nombre}</p>
                          <p className="text-sm text-gray-500 capitalize">{actor.tipo}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => desasignarActor(actor.id_actor)} className="text-red-600 hover:text-red-800" title="Desasignar actor">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones finales */}
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="secondary" onClick={() => setCurrentTab(2)}>
                Anterior
              </Button>
              <Button type="submit" icon={Save} isLoading={isSaving}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// Componente AccordionSection
const AccordionSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

export default EditarCJ;
