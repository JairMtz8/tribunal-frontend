// src/pages/ejecucion/DetalleLibertad.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import libertadService from '../../services/libertadService';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const DetalleLibertad = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [libertad, setLibertad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLibertad();
  }, [id]);

  const loadLibertad = async () => {
    try {
      const response = await libertadService.getById(id);
      const data = response.data || response;
      setLibertad(data);
    } catch (error) {
      toast.error('Error al cargar libertad');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta libertad?')) return;

    try {
      await libertadService.delete(id);
      toast.success('Libertad eliminada correctamente');
      navigate('/ejecucion');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleMarcarCumplida = async () => {
    try {
      await libertadService.marcarCumplida(id);
      toast.success('Libertad marcada como cumplida');
      loadLibertad();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar como cumplida');
    }
  };

  const calcularDiasRestantes = () => {
    if (!libertad.termino_obligaciones || libertad.cumplida) return null;
    const hoy = new Date();
    const termino = new Date(libertad.termino_obligaciones);
    const diff = Math.ceil((termino - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!libertad) {
    return <div className="text-center p-12">No se encontró la libertad</div>;
  }

  const diasRestantes = calcularDiasRestantes();
  const vencida = libertad.termino_obligaciones && new Date(libertad.termino_obligaciones) < new Date() && !libertad.cumplida;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/ejecucion')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Libertad</h1>
          </div>
        </div>

        <div className="flex gap-2">
          {!libertad.cumplida && (
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleMarcarCumplida}
            >
              Marcar Cumplida
            </Button>
          )}
          <Button
            variant="secondary"
            icon={Edit}
            onClick={() => navigate(`/ejecucion/libertad/${id}/editar`)}
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

      {/* Alerta de vencimiento */}
      {vencida && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">Libertad Vencida</h3>
              <p className="text-sm text-red-700">
                El término de obligaciones ha vencido. Esta libertad requiere atención.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Estado</h2>
          {libertad.cumplida ? (
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
              Cumplida
            </span>
          ) : vencida ? (
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-red-100 text-red-800">
              Vencida
            </span>
          ) : (
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              Activa
            </span>
          )}
        </div>

        {diasRestantes !== null && diasRestantes > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Días restantes: <span className={`font-semibold ${diasRestantes <= 30 ? 'text-yellow-600' : 'text-blue-600'}`}>
                {diasRestantes} días
              </span>
            </p>
          </div>
        )}
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
              {libertad.adolescente_nombre || libertad.adolescente_iniciales || 'N/A'}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              Fecha Inicio Ejecución
            </label>
            <p className="text-gray-900">
              {libertad.fecha_inicial_ejecucion ? formatDate(libertad.fecha_inicial_ejecucion) : 'Sin fecha'}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              Término Obligaciones
            </label>
            <p className="text-gray-900">
              {libertad.termino_obligaciones ? formatDate(libertad.termino_obligaciones) : 'Sin fecha'}
            </p>
          </div>

          {libertad.cumplida && libertad.fecha_cumplimiento && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <CheckCircle className="w-4 h-4" />
                Fecha Cumplimiento
              </label>
              <p className="text-gray-900">{formatDate(libertad.fecha_cumplimiento)}</p>
            </div>
          )}
        </div>

        {libertad.obligaciones && (
          <div className="pt-4 border-t">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <FileText className="w-4 h-4" />
              Obligaciones
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">{libertad.obligaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleLibertad;
