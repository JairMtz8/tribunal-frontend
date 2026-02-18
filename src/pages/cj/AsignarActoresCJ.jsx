// src/pages/cj/AsignarActoresCJ.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, User, X, Plus, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import actorService from '../../services/actorService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const AsignarActoresCJ = () => {
  const { id: cj_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Datos del proceso (vienen del state del navigate)
  const proceso_id = location.state?.proceso_id;
  const numero_cj = location.state?.numero_cj;

  // Actores
  const [actoresAsignados, setActoresAsignados] = useState([]);
  const [searchActor, setSearchActor] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tipoNuevoActor, setTipoNuevoActor] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Si no hay proceso_id en el state, intentar obtenerlo
  useEffect(() => {
    if (!proceso_id) {
      // Podríamos hacer un GET a /api/cj/:id para obtener el proceso_id
      // Por ahora, mostramos error
      toast.error('No se encontró el proceso asociado');
      navigate(`/carpetas/cj/${cj_id}`);
    }
  }, [proceso_id, cj_id, navigate]);

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
      await actorService.asignar(proceso_id, {
        actor_id: actor.id_actor,
        tipo_carpeta: 'CJ'
      });

      toast.success(`${actor.nombre} asignado a CJ`);

      // Agregar a lista local
      setActoresAsignados([...actoresAsignados, {
        id_actor: actor.id_actor,
        nombre: actor.nombre,
        tipo: actor.tipo
      }]);

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
      await actorService.asignar(proceso_id, {
        actor_id: actorId,
        tipo_carpeta: 'CJ'
      });

      toast.success(`Actor "${searchActor}" creado y asignado`);

      // Agregar a lista local
      setActoresAsignados([...actoresAsignados, {
        id_actor: actorId,
        nombre: searchActor,
        tipo: tipoNuevoActor
      }]);

      setSearchActor('');
      setTipoNuevoActor('');
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Error al crear actor');
      console.error(error);
    }
  };

  const desasignarActor = async (actorId) => {
    try {
      await actorService.desasignar(proceso_id, 'CJ', actorId);
      toast.success('Actor desasignado');
      setActoresAsignados(actoresAsignados.filter(a => a.id_actor !== actorId));
    } catch (error) {
      toast.error('Error al desasignar actor');
      console.error(error);
    }
  };

  const finalizarYContinuar = () => {
    if (actoresAsignados.length === 0) {
      if (!window.confirm('No ha asignado ningún actor. ¿Desea continuar sin actores?')) {
        return;
      }
    }
    navigate(`/carpetas/cj/${cj_id}`);
  };

  const omitirYContinuar = () => {
    navigate(`/carpetas/cj/${cj_id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">¡Proceso Creado Exitosamente!</h1>
        <p className="text-gray-600 mt-2">
          {numero_cj} - Carpeta de Investigación Judicial
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Ahora puede asignar los actores jurídicos a esta carpeta
        </p>
      </div>

      {/* Card de Actores */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Asignar Actores Jurídicos</h2>
          <span className="ml-auto text-sm text-gray-500">Paso opcional</span>
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
                      <p className="text-sm text-gray-500 capitalize">{actor.tipo}</p>
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
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay actores asignados</p>
              <p className="text-gray-400 text-xs mt-1">Puede asignarlos ahora o después</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actoresAsignados.map((actor) => (
                <div
                  key={actor.id_actor}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
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

      {/* Botones de acción */}
      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={omitirYContinuar}
        >
          Omitir y Ver Carpeta
        </Button>

        <Button
          icon={ArrowRight}
          onClick={finalizarYContinuar}
        >
          {actoresAsignados.length > 0 ? 'Finalizar' : 'Continuar Sin Actores'}
        </Button>
      </div>

      {/* Mensaje informativo */}
      <div className="text-center text-sm text-gray-500">
        💡 Puede agregar o modificar actores en cualquier momento desde la vista de detalle
      </div>
    </div>
  );
};

export default AsignarActoresCJ;
