// src/pages/ejecucion/FormularioEjecucion.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import internamientoService from '../../services/internamientoService';
import libertadService from '../../services/libertadService';
import condenaService from '../../services/condenaService';
import procesoService from '../../services/procesoService';
import cemsService from '../../services/cemsService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Convierte cualquier fecha ISO o YYYY-MM-DD a YYYY-MM-DD (requerido por <input type="date">)
const toDateInput = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const FormularioEjecucion = () => {
  const navigate = useNavigate();
  const { tipo, id } = useParams();
  const [searchParams] = useSearchParams();
  const tipoInicial = tipo || searchParams.get('tipo') || 'internamiento';
  const isEdit = !!id;

  const [tipoSeleccionado, setTipoSeleccionado] = useState(tipoInicial);
  const [procesos, setProcesos] = useState([]);
  const [procesosCemIds, setProcesosCemIds] = useState(new Set());
  const [procesosConInternamiento, setProcesosConInternamiento] = useState(new Set());
  const [procesosConLibertad, setProcesosConLibertad] = useState(new Set());
  const [procesosConCondena, setProcesosConCondena] = useState(new Set());
  const [tiposReparacion, setTiposReparacion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    proceso_id: '',
    // Internamiento
    fecha_cumplimiento: '',
    // Libertad
    obligaciones: '',
    fecha_inicial_ejecucion: '',
    termino_obligaciones: '',
    // Condena
    tipo_reparacion_id: '',
    inicio_computo_sancion: '',
    compurga: ''
  });

  useEffect(() => {
    loadProcesos();
    loadTiposReparacion();
    if (isEdit) {
      loadData();
    }
  }, []);

  const loadProcesos = async () => {
    try {
      const [procesosResponse, cemsResponse, interResponse, libResponse, condResponse] = await Promise.all([
        procesoService.getAll(),
        cemsService.getAll({ limit: 500 }),
        internamientoService.getAll(),
        libertadService.getAll(),
        condenaService.getAll(),
      ]);

      const toArr = (r) => {
        const raw = Array.isArray(r) ? r : (r.data ?? r);
        return Array.isArray(raw) ? raw : [];
      };

      const data      = toArr(procesosResponse);
      const cemsData  = toArr(cemsResponse);
      const interData = toArr(interResponse);
      const libData   = toArr(libResponse);
      const condData  = toArr(condResponse);

      setProcesos(data);
      setProcesosCemIds(new Set(cemsData.map(c => c.proceso_id)));
      setProcesosConInternamiento(new Set(interData.map(i => i.proceso_id)));
      setProcesosConLibertad(new Set(libData.map(l => l.proceso_id)));
      setProcesosConCondena(new Set(condData.map(c => c.proceso_id)));
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    }
  };

  const loadTiposReparacion = async () => {
    try {
      const response = await catalogoService.getAll('tipos-reparacion');
      const data = Array.isArray(response) ? response : (response.data || []);
      setTiposReparacion(data);
    } catch (error) {
      console.error('Error al cargar tipos de reparación:', error);
    }
  };

  const loadData = async () => {
    try {
      let response;
      switch (tipoSeleccionado) {
        case 'internamiento':
          response = await internamientoService.getById(id);
          break;
        case 'libertad':
          response = await libertadService.getById(id);
          break;
        case 'condena':
          response = await condenaService.getById(id);
          break;
      }
      const data = response.data || response;

      // Normalizar todas las fechas a YYYY-MM-DD para que funcionen en <input type="date">
      setFormData({
        ...data,
        fecha_cumplimiento:      toDateInput(data.fecha_cumplimiento),
        fecha_inicial_ejecucion: toDateInput(data.fecha_inicial_ejecucion),
        termino_obligaciones:    toDateInput(data.termino_obligaciones),
        inicio_computo_sancion:  toDateInput(data.inicio_computo_sancion),
        compurga:                toDateInput(data.compurga),
      });
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      const dataToSend = { ...formData };

      // Limpiar campos no usados según tipo
      if (tipoSeleccionado === 'internamiento') {
        delete dataToSend.obligaciones;
        delete dataToSend.fecha_inicial_ejecucion;
        delete dataToSend.termino_obligaciones;
        delete dataToSend.tipo_reparacion_id;
        delete dataToSend.inicio_computo_sancion;
        delete dataToSend.compurga;
      } else if (tipoSeleccionado === 'libertad') {
        delete dataToSend.fecha_cumplimiento;
        delete dataToSend.tipo_reparacion_id;
        delete dataToSend.inicio_computo_sancion;
        delete dataToSend.compurga;
      } else if (tipoSeleccionado === 'condena') {
        delete dataToSend.obligaciones;
        delete dataToSend.fecha_inicial_ejecucion;
        delete dataToSend.termino_obligaciones;
        delete dataToSend.fecha_cumplimiento;
      }

      if (isEdit) {
        switch (tipoSeleccionado) {
          case 'internamiento':
            response = await internamientoService.update(id, dataToSend);
            break;
          case 'libertad':
            response = await libertadService.update(id, dataToSend);
            break;
          case 'condena':
            response = await condenaService.update(id, dataToSend);
            break;
        }
        toast.success('Actualizado correctamente');
      } else {
        switch (tipoSeleccionado) {
          case 'internamiento':
            response = await internamientoService.create(dataToSend);
            break;
          case 'libertad':
            response = await libertadService.create(dataToSend);
            break;
          case 'condena':
            response = await condenaService.create(dataToSend);
            break;
        }
        toast.success('Creado correctamente');
      }

      navigate('/ejecucion');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate('/ejecucion')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar' : 'Nuevo'} {tipoSeleccionado.charAt(0).toUpperCase() + tipoSeleccionado.slice(1)}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Modifica' : 'Registra'} la información de ejecución
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Select de Tipo (solo si es nuevo) */}
        {!isEdit && (
          <Select
            label="Tipo de Ejecución"
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            required
            options={[
              { value: 'internamiento', label: 'Internamiento' },
              { value: 'libertad', label: 'Libertad' },
              { value: 'condena', label: 'Condena' }
            ]}
          />
        )}

        {/* Select de Proceso */}
        <div>
          <Select
            label="Proceso (con sentencia condenatoria)"
            name="proceso_id"
            value={formData.proceso_id}
            onChange={handleChange}
            required
            disabled={isEdit}
            options={[
              { value: '', label: 'Selecciona un proceso' },
              ...procesos
                .filter(p => {
                  if (!procesosCemIds.has(p.id_proceso)) return false;
                  if (tipoSeleccionado === 'internamiento') return !procesosConInternamiento.has(p.id_proceso);
                  if (tipoSeleccionado === 'libertad')     return !procesosConLibertad.has(p.id_proceso);
                  if (tipoSeleccionado === 'condena')      return !procesosConCondena.has(p.id_proceso);
                  return true;
                })
                .map(p => ({
                  value: p.id_proceso,
                  label: `${p.adolescente_nombre || p.adolescente_iniciales} - CEMS`
                }))
            ]}
          />
          {!isEdit && procesosCemIds.size === 0 && (
            <p className="mt-1 text-sm text-amber-600">
              No hay procesos con sentencia condenatoria registrados aún.
            </p>
          )}
        </div>

        {/* Campos según tipo */}
        {tipoSeleccionado === 'internamiento' && (
          <Input
            type="date"
            label="Fecha de Cumplimiento"
            name="fecha_cumplimiento"
            value={formData.fecha_cumplimiento || ''}
            onChange={handleChange}
          />
        )}

        {tipoSeleccionado === 'libertad' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obligaciones
              </label>
              <textarea
                name="obligaciones"
                value={formData.obligaciones || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe las obligaciones de la libertad..."
              />
            </div>

            <Input
              type="date"
              label="Fecha Inicial de Ejecución"
              name="fecha_inicial_ejecucion"
              value={formData.fecha_inicial_ejecucion || ''}
              onChange={handleChange}
              required
            />

            <Input
              type="date"
              label="Término de Obligaciones"
              name="termino_obligaciones"
              value={formData.termino_obligaciones || ''}
              onChange={handleChange}
            />
          </>
        )}

        {tipoSeleccionado === 'condena' && (
          <>
            <Select
              label="Tipo de Reparación"
              name="tipo_reparacion_id"
              value={formData.tipo_reparacion_id || ''}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sin tipo de reparación' },
                ...tiposReparacion.map(tr => ({
                  value: tr.id_tipo_reparacion,
                  label: tr.nombre
                }))
              ]}
            />

            <Input
              type="date"
              label="Inicio Cómputo Sanción"
              name="inicio_computo_sancion"
              value={formData.inicio_computo_sancion || ''}
              onChange={handleChange}
            />

            <Input
              type="date"
              label="Compurga"
              name="compurga"
              value={formData.compurga || ''}
              onChange={handleChange}
            />
          </>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/ejecucion')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEjecucion;
