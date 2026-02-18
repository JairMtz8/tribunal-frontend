// src/pages/cj/DetalleCJ.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, X, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import cjService from '../../services/cjService';
import actorService from '../../services/actorService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const DetalleCJ = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cj, setCJ] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Actores
  const [actoresAsignados, setActoresAsignados] = useState([]);
  const [searchActor, setSearchActor] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tipoNuevoActor, setTipoNuevoActor] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadCJ();
  }, [id]);

  const loadCJ = async () => {
    setIsLoading(true);
    try {
      const response = await cjService.getById(id);
      const cjData = response.data || response;
      setCJ(cjData);

      // Cargar actores si tenemos proceso_id
      if (cjData.proceso_id) {
        loadActoresAsignados(cjData.proceso_id);
      }
    } catch (error) {
      toast.error('Error al cargar CJ');
      console.error(error);
      navigate('/carpetas/cj');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActoresAsignados = async (procesoId) => {
    try {
      const response = await actorService.getByProceso(procesoId);
      const actores = response.data || [];
      // Filtrar solo actores de tipo CJ
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

        // Si no hay resultados, mostrar opción de crear
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
      await actorService.asignar(cj.proceso_id, {
        actor_id: actor.id_actor,
        tipo_carpeta: 'CJ'
      });

      toast.success(`${actor.nombre} asignado a CJ`);
      loadActoresAsignados(cj.proceso_id);
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
      // 1. Crear nuevo actor
      const nuevoActorResponse = await actorService.create({
        nombre: searchActor,
        tipo: tipoNuevoActor
      });

      const nuevoActor = nuevoActorResponse.data || nuevoActorResponse;
      const actorId = nuevoActor.id_actor || nuevoActor.insertId;

      // 2. Asignar a carpeta CJ
      await actorService.asignar(cj.proceso_id, {
        actor_id: actorId,
        tipo_carpeta: 'CJ'
      });

      toast.success(`Actor "${searchActor}" creado y asignado`);
      loadActoresAsignados(cj.proceso_id);
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
      await actorService.desasignar(cj.proceso_id, 'CJ', actorId);
      toast.success('Actor desasignado correctamente');
      loadActoresAsignados(cj.proceso_id);
    } catch (error) {
      toast.error('Error al desasignar actor');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando carpeta CJ...</p>
        </div>
      </div>
    );
  }

  if (!cj) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carpeta CJ no encontrada</p>
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
            onClick={() => navigate('/carpetas/cj')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {cj.numero_cj}
            </h1>
            <p className="text-gray-600">Carpeta de Investigación Judicial</p>
          </div>
        </div>
        <Button
          icon={Edit}
          onClick={() => navigate(`/carpetas/cj/${id}/editar`)}
        >
          Editar CJ
        </Button>
      </div>

      {/* Información General */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Número CJ</p>
            <p className="font-medium text-gray-900">{cj.numero_cj}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Ingreso</p>
            <p className="font-medium text-gray-900">{formatDate(cj.fecha_ingreso)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipo de Fuero</p>
            <p className="font-medium text-gray-900">{cj.tipo_fuero || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Actores Jurídicos */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Actores Jurídicos de la CJ</h2>
        </div>

        {/* Buscador / Agregar Actor */}
        <div className="mb-6">
          <div className="relative">
            <Input
              icon={Search}
              placeholder="Buscar actor por nombre (mín. 3 caracteres)..."
              value={searchActor}
              onChange={handleSearchActor}
            />

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((actor) => (
                  <button
                    key={actor.id_actor}
                    onClick={() => seleccionarActorExistente(actor)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{actor.nombre}</p>
                      <p className="text-sm text-gray-500">{actor.tipo}</p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Indicador de búsqueda */}
            {isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                <p className="text-gray-600">Buscando...</p>
              </div>
            )}
          </div>

          {/* Formulario para crear nuevo actor */}
          {showCreateForm && searchActor.length >= 3 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>No se encontró el actor.</strong> ¿Desea crear "{searchActor}"?
              </p>

              <div className="space-y-3">
                <Select
                  label="Tipo de Actor"
                  value={tipoNuevoActor}
                  onChange={(e) => setTipoNuevoActor(e.target.value)}
                  options={[
                    { value: '', label: 'Seleccione el tipo...' },
                    { value: 'defensa', label: 'Defensa' },
                    { value: 'fiscal', label: 'Fiscal' },
                    { value: 'juez', label: 'Juez' },
                    { value: 'perito', label: 'Perito' },
                    { value: 'otro', label: 'Otro' }
                  ]}
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={crearYAsignarActor}
                    disabled={!tipoNuevoActor}
                  >
                    Crear y Asignar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setSearchActor('');
                      setTipoNuevoActor('');
                    }}
                  >
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
            <p className="text-gray-500 text-sm">No hay actores asignados a esta carpeta</p>
          ) : (
            <div className="space-y-2">
              {actoresAsignados.map((actor) => (
                <div
                  key={actor.id_actor}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{actor.nombre}</p>
                      <p className="text-sm text-gray-500 capitalize">{actor.tipo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => desasignarActor(actor.id_actor)}
                    className="text-red-600 hover:text-red-800"
                    title="Desasignar actor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Más secciones de detalle... */}
      {/* TODO: Agregar secciones de Conductas, Narcóticos, Control, etc. */}
    </div>
  );
};

export default DetalleCJ;
