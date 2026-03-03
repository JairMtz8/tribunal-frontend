// src/pages/ejecucion/DetalleInternamiento.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

import internamientoService from '../../services/internamientoService';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const DetalleInternamiento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [internamiento, setInternamiento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInternamiento();
  }, [id]);

  const loadInternamiento = async () => {
    try {
      const response = await internamientoService.getById(id);
      const data = response.data || response;
      setInternamiento(data);
    } catch (error) {
      toast.error('Error al cargar internamiento');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este internamiento?')) return;

    try {
      await internamientoService.delete(id);
      toast.success('Internamiento eliminado correctamente');
      navigate('/ejecucion');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!internamiento) {
    return <div className="text-center p-12">No se encontró el internamiento</div>;
  }

  const cumplido = internamiento.fecha_cumplimiento && new Date(internamiento.fecha_cumplimiento) <= new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/ejecucion')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Internamiento</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Edit}
            onClick={() => navigate(`/ejecucion/internamiento/${id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Estado */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Estado</h2>
          {cumplido ? (
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
              Cumplido
            </span>
          ) : (
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              Activo
            </span>
          )}
        </div>
      </div>

      {/* Información */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
              <User className="w-4 h-4" />
              Adolescente
            </label>
            <p className="text-gray-900">
              {internamiento.adolescente_nombre || internamiento.adolescente_iniciales || 'N/A'}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              Fecha de Cumplimiento
            </label>
            <p className="text-gray-900">
              {internamiento.fecha_cumplimiento ? formatDate(internamiento.fecha_cumplimiento) : 'Sin fecha definida'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalleInternamiento;
