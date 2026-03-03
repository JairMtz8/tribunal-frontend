// src/pages/procesos/DetalleProceso.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Users, AlertCircle, Shield, Gavel, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import procesoService from '../../services/procesoService';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

// Normaliza cualquier formato de respuesta a array
const toArr = (r) => {
  if (Array.isArray(r)) return r;
  if (r === null || r === undefined) return [];
  const inner = r.data ?? r;
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === 'object' && Object.keys(inner).length > 0) return [inner];
  return [];
};

// Llama a fn y devuelve [] si falla (ej. 404 cuando no hay datos)
const safe = async (fn) => { try { return await fn(); } catch { return null; } };

const DetalleProceso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceso, setProceso] = useState(null);
  const [medidasCautelares, setMedidasCautelares] = useState([]);
  const [medidasSancionadoras, setMedidasSancionadoras] = useState([]);
  const [internamiento, setInternamiento] = useState(null);
  const [libertad, setLibertad] = useState(null);
  const [condena, setCondena] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const cfg = { _silent: true };
      const [
        procesoResponse,
        mcRaw,
        msRaw,
        intRaw,
        libRaw,
        condRaw,
      ] = await Promise.all([
        procesoService.getById(id),
        safe(() => api.get(`/medidas-cautelares/proceso/${id}`, cfg)),
        safe(() => api.get(`/medidas-sancionadoras/proceso/${id}`, cfg)),
        safe(() => api.get(`/internamiento/proceso/${id}`, cfg)),
        safe(() => api.get(`/libertad/proceso/${id}`, cfg)),
        safe(() => api.get(`/condena/proceso/${id}`, cfg)),
      ]);

      // Proceso + carpetas
      const { proceso: procesoData, carpetas } = procesoResponse.data || procesoResponse;
      setProceso({
        ...procesoData,
        cj:    carpetas?.cj    || null,
        cjo:   carpetas?.cjo   || null,
        cemci: carpetas?.cemci || null,
        cems:  carpetas?.cems  || null,
      });

      // Medidas y ejecución
      setMedidasCautelares(toArr(mcRaw));
      setMedidasSancionadoras(toArr(msRaw));

      const intArr  = toArr(intRaw);
      const libArr  = toArr(libRaw);
      const condArr = toArr(condRaw);
      setInternamiento(intArr[0] || null);
      setLibertad(libArr[0] || null);
      setCondena(condArr[0] || null);
    } catch (error) {
      toast.error('Error al cargar el proceso');
      console.error(error);
      navigate('/procesos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando proceso...</p>
        </div>
      </div>
    );
  }

  if (!proceso) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Proceso no encontrado</p>
        </div>
      </div>
    );
  }

  const tieneMedidasOEjecucion =
    medidasCautelares.length > 0 ||
    medidasSancionadoras.length > 0 ||
    internamiento || libertad || condena;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/procesos')}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proceso #{proceso.id_proceso}</h1>
            <p className="text-gray-600">Vista completa del caso</p>
          </div>
        </div>
        <Button icon={Edit} onClick={() => navigate(`/procesos/${id}/editar`)}>
          Editar Proceso
        </Button>
      </div>

      {/* Información del Adolescente */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Información del Adolescente</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.nombre || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Iniciales</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.iniciales || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha Nacimiento</p>
            <p className="font-medium text-gray-900">{formatDate(proceso.adolescente?.fecha_nacimiento)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sexo</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.sexo || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nacionalidad</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.nacionalidad || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Escolaridad</p>
            <p className="font-medium text-gray-900">{proceso.adolescente?.escolaridad || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button size="sm" variant="outline" onClick={() => navigate(`/adolescentes/${proceso.adolescente_id}`)}>
            Ver Perfil Completo
          </Button>
        </div>
      </div>

      {/* Información del Proceso */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Proceso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {proceso.status_nombre || 'N/A'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Creación</p>
            <p className="font-medium text-gray-900">{formatDate(proceso.created_at)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Observaciones</p>
            <p className="font-medium text-gray-900">{proceso.observaciones || 'Sin observaciones'}</p>
          </div>
        </div>
      </div>

      {/* Carpetas Asociadas */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Carpetas del Proceso</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {proceso.cj && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CJ</span>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Investigación</span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cj.numero_cj}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/carpetas/cj/${proceso.cj.id_cj}`)}>
                Ver CJ
              </Button>
            </div>
          )}

          {proceso.cjo && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CJO</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Juicio Oral</span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cjo.numero_cjo}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/carpetas/cjo/${proceso.cjo.id_cjo}`)}>
                Ver CJO
              </Button>
            </div>
          )}

          {proceso.cemci && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CEMCI</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Medida Cautelar</span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cemci.numero_cemci}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/carpetas/cemci/${proceso.cemci.id_cemci}`)}>
                Ver CEMCI
              </Button>
            </div>
          )}

          {proceso.cems && (
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CEMS</span>
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Ejecución Sanción</span>
              </div>
              <p className="font-semibold text-gray-900 mb-3">{proceso.cems.numero_cems}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/carpetas/cems/${proceso.cems.id_cems}`)}>
                Ver CEMS
              </Button>
            </div>
          )}
        </div>

        {!proceso.cj && !proceso.cjo && !proceso.cemci && !proceso.cems && (
          <p className="text-gray-500 text-center py-8">No hay carpetas asociadas a este proceso</p>
        )}
      </div>

      {/* Medidas y Ejecución */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Medidas y Ejecución</h2>
        </div>

        {!tieneMedidasOEjecucion ? (
          <p className="text-gray-500 text-center py-8">
            No hay medidas ni registros de ejecución asociados a este proceso
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Medidas Cautelares */}
            {medidasCautelares.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Medidas Cautelares</span>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {medidasCautelares.length} registro{medidasCautelares.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">
                  {medidasCautelares[0].tipo_medida_nombre || medidasCautelares[0].tipo_medida || 'Ver detalle'}
                </p>
                {medidasCautelares[0].estado && (
                  <p className="text-xs text-gray-500 mb-3">Estado: {medidasCautelares[0].estado}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/medidas-cautelares/${id}/ver`)}
                >
                  Ver Medidas Cautelares
                </Button>
              </div>
            )}

            {/* Medidas Sancionadoras */}
            {medidasSancionadoras.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Medidas Sancionadoras</span>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    {medidasSancionadoras.length} registro{medidasSancionadoras.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">
                  {medidasSancionadoras[0].tipo_medida_nombre || medidasSancionadoras[0].tipo_medida || 'Ver detalle'}
                </p>
                {medidasSancionadoras[0].tipo && (
                  <p className="text-xs text-gray-500 mb-3">Tipo: {medidasSancionadoras[0].tipo}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/medidas-sancionadoras/proceso/${id}`)}
                >
                  Ver Medidas Sancionadoras
                </Button>
              </div>
            )}

            {/* Internamiento */}
            {internamiento && (
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Internamiento</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    internamiento.fecha_cumplimiento && new Date(internamiento.fecha_cumplimiento) <= new Date()
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {internamiento.fecha_cumplimiento && new Date(internamiento.fecha_cumplimiento) <= new Date()
                      ? 'Cumplido'
                      : 'Activo'}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">Ejecución de Internamiento</p>
                {internamiento.fecha_cumplimiento && (
                  <p className="text-xs text-gray-500 mb-3">
                    Cumplimiento: {formatDate(internamiento.fecha_cumplimiento)}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/ejecucion/internamiento/${internamiento.id_internamiento}`)}
                >
                  Ver Internamiento
                </Button>
              </div>
            )}

            {/* Libertad */}
            {libertad && (
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Libertad</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    libertad.cumplida
                      ? 'bg-gray-100 text-gray-800'
                      : libertad.termino_obligaciones && new Date(libertad.termino_obligaciones) < new Date()
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {libertad.cumplida
                      ? 'Cumplida'
                      : libertad.termino_obligaciones && new Date(libertad.termino_obligaciones) < new Date()
                        ? 'Vencida'
                        : 'Activa'}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">Ejecución de Libertad</p>
                {libertad.termino_obligaciones && (
                  <p className="text-xs text-gray-500 mb-3">
                    Término: {formatDate(libertad.termino_obligaciones)}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/ejecucion/libertad/${libertad.id_libertad}`)}
                >
                  Ver Libertad
                </Button>
              </div>
            )}

            {/* Condena */}
            {condena && (
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Condena</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    condena.cumplida ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {condena.cumplida ? 'Cumplida' : 'Activa'}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">
                  {condena.tipo_reparacion_nombre || 'Ejecución de Condena'}
                </p>
                {condena.compurga && (
                  <p className="text-xs text-gray-500 mb-3">
                    Compurga: {formatDate(condena.compurga)}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/ejecucion/condena/${condena.id_condena}`)}
                >
                  Ver Condena
                </Button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleProceso;
