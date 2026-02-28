// src/pages/medidas-sancionadoras/DetalleMedidaSancionadora.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Scale, Shield, Calculator, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import medidaSancionadoraService from '../../services/medidaSancionadoraService';
import Button from '../../components/common/Button';
import InfoField from '../../components/common/InfoField';

const DetalleMedidaSancionadora = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medida, setMedida] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedida();
  }, [id]);

  const loadMedida = async () => {
    setIsLoading(true);
    try {
      const response = await medidaSancionadoraService.getById(id);
      const medidaData = response.data || response;
      setMedida(medidaData);
    } catch (error) {
      toast.error('Error al cargar medida');
      console.error(error);
      navigate('/medidas-sancionadoras');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularPlazoTotal = (anios, meses, dias) => {
    return (anios * 365) + (meses * 30) + dias;
  };

  const formatearPlazo = (anios, meses, dias) => {
    const partes = [];
    if (anios > 0) partes.push(`${anios} año${anios > 1 ? 's' : ''}`);
    if (meses > 0) partes.push(`${meses} mes${meses > 1 ? 'es' : ''}`);
    if (dias > 0) partes.push(`${dias} día${dias > 1 ? 's' : ''}`);
    return partes.length > 0 ? partes.join(', ') : 'Sin plazo definido';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando medida sancionadora...</p>
        </div>
      </div>
    );
  }

  if (!medida) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Medida sancionadora no encontrada</p>
        </div>
      </div>
    );
  }

  const plazoTotal = calcularPlazoTotal(medida.plazo_anios, medida.plazo_meses, medida.plazo_dias);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/medidas-sancionadoras')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medida Sancionadora</h1>
            <p className="text-gray-600">{medida.tipo_nombre}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button icon={Edit} onClick={() => navigate(`/medidas-sancionadoras/${id}/editar`)}>
            Editar Medida
          </Button>
        </div>
      </div>

      {/* Información de la Medida */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Información de la Medida
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InfoField label="Tipo de Medida" value={medida.tipo_nombre} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Clasificación</p>
            {medida.es_privativa ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                <Shield className="w-4 h-4" />
                Medida Privativa de Libertad
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                Medida No Privativa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Plazo */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Plazo de la Medida
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="Años" value={medida.plazo_anios || 0} />
            <InfoField label="Meses" value={medida.plazo_meses || 0} />
            <InfoField label="Días" value={medida.plazo_dias || 0} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Plazo Total</p>
                <p className="text-lg font-semibold text-blue-900 mt-1">
                  {formatearPlazo(medida.plazo_anios, medida.plazo_meses, medida.plazo_dias)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Equivalente</p>
                <p className="text-2xl font-bold text-blue-900">{plazoTotal}</p>
                <p className="text-sm text-blue-700">días totales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta informativa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Scale className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">Sobre las medidas sancionadoras</h3>
            <p className="text-sm text-gray-600">
              Las medidas sancionadoras se aplican cuando hay sentencia CONDENATORIA o MIXTA.
              El plazo total se calcula automáticamente: (años × 365) + (meses × 30) + días.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleMedidaSancionadora;
