// src/pages/adolescentes/EditarAdolescente.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import adolescenteService from '../../services/adolescenteService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Esquema de validación (igual que en crear)
const adolescenteSchema = yup.object().shape({
  nombre: yup.string().required('El nombre completo es requerido'),
  iniciales: yup.string().max(10, 'Máximo 10 caracteres'),
  sexo: yup.string().required('El sexo es requerido'),
  fecha_nacimiento: yup.date().required('La fecha de nacimiento es requerida'),
  nacionalidad: yup.string().default('MEXICANA'),
  idioma: yup.string().default('ESPAÑOL'),
  lugar_nacimiento_municipio: yup.string(),
  lugar_nacimiento_estado: yup.string(),
  escolaridad: yup.string(),
  ocupacion: yup.string(),
  estado_civil: yup.string(),
  telefono: yup.string().matches(/^[0-9]{10}$/, 'Debe ser un teléfono de 10 dígitos').nullable(),
  correo: yup.string().email('Correo inválido').nullable(),
  'domicilio.municipio': yup.string(),
  'domicilio.calle_numero': yup.string(),
  'domicilio.colonia': yup.string(),
});

const EditarAdolescente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [consumeDrogas, setConsumeDrogas] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(adolescenteSchema),
  });

  useEffect(() => {
    loadAdolescente();
  }, [id]);

  const loadAdolescente = async () => {
    setIsLoadingData(true);
    try {
      const response = await adolescenteService.getById(id);
      const data = response.data || response;

      // Formatear fecha para el input type="date"
      const fechaFormateada = data.fecha_nacimiento
        ? new Date(data.fecha_nacimiento).toISOString().split('T')[0]
        : '';

      // Normalizar sexo a mayúsculas (por si viene de BD antigua)
      const sexoNormalizado = data.sexo ? data.sexo.toUpperCase() : '';

      // Pre-llenar el formulario con los datos existentes
      reset({
        nombre: data.nombre || '',
        iniciales: data.iniciales || '',
        sexo: sexoNormalizado,  // ✅ Usar sexo normalizado
        fecha_nacimiento: fechaFormateada,
        nacionalidad: data.nacionalidad || 'MEXICANA',
        idioma: data.idioma || 'ESPAÑOL',
        otro_idioma_lengua: data.otro_idioma_lengua || '',
        escolaridad: data.escolaridad || '',
        ocupacion: data.ocupacion || '',
        estado_civil: data.estado_civil || '',
        lugar_nacimiento_municipio: data.lugar_nacimiento_municipio || '',
        lugar_nacimiento_estado: data.lugar_nacimiento_estado || '',
        fuma_cigarro: data.fuma_cigarro || false,
        consume_alcohol: data.consume_alcohol || false,
        consume_drogas: data.consume_drogas || false,
        tipo_droga: data.tipo_droga || '',
        telefono: data.telefono || '',
        correo: data.correo || '',
        'domicilio.municipio': data.domicilio?.municipio || '',
        'domicilio.calle_numero': data.domicilio?.calle_numero || '',
        'domicilio.colonia': data.domicilio?.colonia || '',
      });

      // Actualizar estado de consume_drogas para habilitar/deshabilitar campo
      setConsumeDrogas(data.consume_drogas || false);
    } catch (error) {
      toast.error('Error al cargar el adolescente');
      navigate('/adolescentes');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Helper: convertir strings vacíos a null
      const cleanValue = (value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '' || trimmed === '@') return null;
        }
        return value;
      };

      // Helper: convertir fecha de ISO a YYYY-MM-DD
      const formatDate = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Estructurar datos para el backend
      const adolescenteData = {
        nombre: data.nombre,
        iniciales: cleanValue(data.iniciales),
        sexo: data.sexo,
        fecha_nacimiento: formatDate(data.fecha_nacimiento),
        nacionalidad: cleanValue(data.nacionalidad) || 'MEXICANA',
        idioma: cleanValue(data.idioma) || 'ESPAÑOL',
        otro_idioma_lengua: cleanValue(data.otro_idioma_lengua),
        escolaridad: cleanValue(data.escolaridad),
        ocupacion: cleanValue(data.ocupacion),
        estado_civil: cleanValue(data.estado_civil),
        lugar_nacimiento_municipio: cleanValue(data.lugar_nacimiento_municipio),
        lugar_nacimiento_estado: cleanValue(data.lugar_nacimiento_estado),
        fuma_cigarro: data.fuma_cigarro || false,
        consume_alcohol: data.consume_alcohol || false,
        consume_drogas: data.consume_drogas || false,
        tipo_droga: cleanValue(data.tipo_droga),
        telefono: cleanValue(data.telefono),
        correo: cleanValue(data.correo),
      };

      // Agregar domicilio si se proporcionó
      if (data.domicilio?.municipio || data.domicilio?.calle_numero || data.domicilio?.colonia) {
        adolescenteData.domicilio = {
          municipio: cleanValue(data.domicilio.municipio),
          calle_numero: cleanValue(data.domicilio.calle_numero),
          colonia: cleanValue(data.domicilio.colonia),
        };
      }

      await adolescenteService.update(id, adolescenteData);

      toast.success('Adolescente actualizado exitosamente');
      navigate(`/adolescentes/${id}`);
    } catch (error) {
      console.error('Error al actualizar adolescente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando datos del adolescente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/adolescentes/${id}`)}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Adolescente</h1>
            <p className="text-gray-600">Modificar información del adolescente</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Personales */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Datos Personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nombre Completo"
                placeholder="Nombre completo del adolescente"
                error={errors.nombre?.message}
                required
                {...register('nombre')}
              />
            </div>

            <Input
              label="Iniciales"
              placeholder="EJ: JGPR"
              error={errors.iniciales?.message}
              {...register('iniciales')}
            />

            <Select
              label="Sexo"
              error={errors.sexo?.message}
              required
              options={[
                { value: 'HOMBRE', label: 'HOMBRE' },
                { value: 'MUJER', label: 'MUJER' },
                { value: 'OTRO', label: 'OTRO' },
              ]}
              {...register('sexo')}
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              error={errors.fecha_nacimiento?.message}
              required
              {...register('fecha_nacimiento')}
            />

            <Input
              label="Nacionalidad"
              placeholder="MEXICANA"
              error={errors.nacionalidad?.message}
              {...register('nacionalidad')}
            />

            <Input
              label="Idioma"
              placeholder="ESPAÑOL"
              error={errors.idioma?.message}
              {...register('idioma')}
            />

            <Input
              label="Otro Idioma/Lengua"
              placeholder="NÁHUATL, INGLÉS, ETC."
              error={errors.otro_idioma_lengua?.message}
              {...register('otro_idioma_lengua')}
            />
          </div>
        </div>

        {/* Lugar de Nacimiento */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lugar de Nacimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Municipio"
              placeholder="EJ: CUERNAVACA"
              error={errors.lugar_nacimiento_municipio?.message}
              {...register('lugar_nacimiento_municipio')}
            />

            <Input
              label="Estado"
              placeholder="EJ: MORELOS"
              error={errors.lugar_nacimiento_estado?.message}
              {...register('lugar_nacimiento_estado')}
            />
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información Adicional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Escolaridad"
              options={[
                { value: 'SIN ESTUDIOS', label: 'SIN ESTUDIOS' },
                { value: 'PRIMARIA INCOMPLETA', label: 'PRIMARIA INCOMPLETA' },
                { value: 'PRIMARIA TERMINADA', label: 'PRIMARIA TERMINADA' },
                { value: 'SECUNDARIA INCOMPLETA', label: 'SECUNDARIA INCOMPLETA' },
                { value: 'SECUNDARIA TERMINADA', label: 'SECUNDARIA TERMINADA' },
                { value: 'PREPARATORIA INCOMPLETA', label: 'PREPARATORIA INCOMPLETA' },
                { value: 'PREPARATORIA TERMINADA', label: 'PREPARATORIA TERMINADA' },
              ]}
              error={errors.escolaridad?.message}
              {...register('escolaridad')}
            />

            <Input
              label="Ocupación"
              placeholder="EJ: ESTUDIANTE, JORNALERO"
              error={errors.ocupacion?.message}
              {...register('ocupacion')}
            />

            <Select
              label="Estado Civil"
              options={[
                { value: 'SOLTERO', label: 'SOLTERO' },
                { value: 'CASADO', label: 'CASADO' },
                { value: 'UNIÓN LIBRE', label: 'UNIÓN LIBRE' },
                { value: 'DIVORCIADO', label: 'DIVORCIADO' },
                { value: 'VIUDO', label: 'VIUDO' },
              ]}
              error={errors.estado_civil?.message}
              {...register('estado_civil')}
            />
          </div>
        </div>

        {/* Hábitos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hábitos
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fuma_cigarro"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                {...register('fuma_cigarro')}
              />
              <label htmlFor="fuma_cigarro" className="text-sm font-medium text-gray-700">
                Fuma cigarro
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="consume_alcohol"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                {...register('consume_alcohol')}
              />
              <label htmlFor="consume_alcohol" className="text-sm font-medium text-gray-700">
                Consume alcohol
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="consume_drogas"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                {...register('consume_drogas')}
                onChange={(e) => setConsumeDrogas(e.target.checked)}
              />
              <label htmlFor="consume_drogas" className="text-sm font-medium text-gray-700">
                Consume drogas
              </label>
            </div>

            <Input
              label="Tipo de Droga (si aplica)"
              placeholder="EJ: MARIHUANA, COCAÍNA"
              error={errors.tipo_droga?.message}
              disabled={!consumeDrogas}
              {...register('tipo_droga')}
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              type="tel"
              placeholder="7771234567"
              error={errors.telefono?.message}
              {...register('telefono')}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              uppercase={false}
              placeholder="ejemplo@correo.com"
              error={errors.correo?.message}
              {...register('correo')}
            />
          </div>
        </div>

        {/* Domicilio */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Domicilio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Municipio"
              placeholder="EJ: CUERNAVACA"
              error={errors['domicilio.municipio']?.message}
              {...register('domicilio.municipio')}
            />

            <Input
              label="Colonia"
              placeholder="EJ: CENTRO"
              error={errors['domicilio.colonia']?.message}
              {...register('domicilio.colonia')}
            />

            <div className="md:col-span-2">
              <Input
                label="Calle y Número"
                placeholder="EJ: AV. MORELOS #123"
                error={errors['domicilio.calle_numero']?.message}
                {...register('domicilio.calle_numero')}
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/adolescentes/${id}`)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            icon={Save}
            isLoading={isLoading}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditarAdolescente;
