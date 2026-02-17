// src/pages/adolescentes/DetalleAdolescente.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import adolescenteService from '../../services/adolescenteService';
import Button from '../../components/common/Button';
import { formatDate, calculateAge } from '../../utils/formatters';

const DetalleAdolescente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adolescente, setAdolescente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAdolescente();
  }, [id]);

  const loadAdolescente = async () => {
    setIsLoading(true);
    try {
      const response = await adolescenteService.getById(id);
      const data = response.data || response;

      setAdolescente(data);
    } catch (error) {
      toast.error('Error al cargar el adolescente');
      navigate('/adolescentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este adolescente? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await adolescenteService.delete(id);
      toast.success('Adolescente eliminado exitosamente');
      navigate('/adolescentes');
    } catch (error) {
      toast.error('Error al eliminar adolescente');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!adolescente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se encontró el adolescente</p>
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
            onClick={() => navigate('/adolescentes')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {adolescente.nombre}
            </h1>
            <p className="text-gray-600">
              {adolescente.iniciales && `Iniciales: ${adolescente.iniciales}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Edit}
            onClick={() => navigate(`/adolescentes/${id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Datos Personales */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Datos Personales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Nombre Completo" value={adolescente.nombre} />
          <InfoField label="Iniciales" value={adolescente.iniciales} />
          <InfoField label="Sexo" value={adolescente.sexo?.toUpperCase()} />
          <InfoField
            label="Fecha de Nacimiento"
            value={adolescente.fecha_nacimiento ?
              `${formatDate(adolescente.fecha_nacimiento)} (${calculateAge(adolescente.fecha_nacimiento)} años)`
              : 'No registrado'
            }
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
          />
          <InfoField label="Nacionalidad" value={adolescente.nacionalidad} />
          <InfoField label="Idioma" value={adolescente.idioma} />
          {adolescente.otro_idioma_lengua && (
            <InfoField label="Otro Idioma/Lengua" value={adolescente.otro_idioma_lengua} />
          )}
        </div>
      </div>

      {/* Lugar de Nacimiento */}
      {(adolescente.lugar_nacimiento_municipio || adolescente.lugar_nacimiento_estado) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Lugar de Nacimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Municipio" value={adolescente.lugar_nacimiento_municipio} />
            <InfoField label="Estado" value={adolescente.lugar_nacimiento_estado} />
          </div>
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información Adicional
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Escolaridad" value={adolescente.escolaridad} />
          <InfoField label="Ocupación" value={adolescente.ocupacion} />
          <InfoField label="Estado Civil" value={adolescente.estado_civil} />
        </div>
      </div>

      {/* Hábitos */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hábitos
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${adolescente.fuma_cigarro ? 'bg-red-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm text-gray-700">
              {adolescente.fuma_cigarro ? 'Fuma cigarro' : 'No fuma cigarro'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${adolescente.consume_alcohol ? 'bg-red-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm text-gray-700">
              {adolescente.consume_alcohol ? 'Consume alcohol' : 'No consume alcohol'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${adolescente.consume_drogas ? 'bg-red-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm text-gray-700">
              {adolescente.consume_drogas ? 'Consume drogas' : 'No consume drogas'}
            </span>
          </div>
          {adolescente.tipo_droga && (
            <InfoField label="Tipo de Droga" value={adolescente.tipo_droga} className="ml-5" />
          )}
        </div>
      </div>

      {/* Contacto */}
      {(adolescente.telefono || adolescente.correo) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adolescente.telefono && (
              <InfoField
                label="Teléfono"
                value={adolescente.telefono}
                icon={<Phone className="w-4 h-4 text-gray-400" />}
              />
            )}
            {adolescente.correo && (
              <InfoField
                label="Correo Electrónico"
                value={adolescente.correo}
                icon={<Mail className="w-4 h-4 text-gray-400" />}
              />
            )}
          </div>
        </div>
      )}

      {/* Domicilio */}
      {adolescente.domicilio && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Domicilio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Municipio"
              value={adolescente.domicilio?.municipio}
            />

            <InfoField
              label="Colonia"
              value={adolescente.domicilio?.colonia}
            />

            <div className="md:col-span-2">
              <InfoField
                label="Calle y Número"
                value={adolescente.domicilio?.calle_numero}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para mostrar campos
const InfoField = ({ label, value, icon, className = '' }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-gray-900">
          {value || 'No registrado'}
        </p>
      </div>
    </div>
  );
};

export default DetalleAdolescente;
