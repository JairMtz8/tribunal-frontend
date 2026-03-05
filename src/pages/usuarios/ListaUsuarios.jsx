// src/pages/usuarios/ListaUsuarios.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2, UserCheck, UserX, Users, X
} from 'lucide-react';
import toast from 'react-hot-toast';

import usuariosService from '../../services/usuariosService';
import catalogoService from '../../services/catalogoService';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';

const BADGE_ROL = {
  Administrador: 'bg-purple-100 text-purple-800',
  Juzgado: 'bg-blue-100 text-blue-800',
  CEMCI: 'bg-amber-100 text-amber-800',
  CEMS: 'bg-green-100 text-green-800',
  'Juzgado Ejecución': 'bg-sky-100 text-sky-800',
};

const ListaUsuarios = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    catalogoService.getAll('roles').then((res) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      setRoles(data);
    }).catch(() => {});
  }, []);

  const loadUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search.trim()) params.search = search.trim();
      if (filtroRol) params.rol_id = filtroRol;
      if (filtroActivo !== '') params.activo = filtroActivo;

      const res = await usuariosService.getAll(params);
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const total = res?.pagination?.total ?? res?.total ?? data.length;
      setUsuarios(data);
      setPagination(prev => ({ ...prev, total }));
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filtroRol, filtroActivo]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsuarios();
  };

  const clearFiltros = () => {
    setSearch('');
    setFiltroRol('');
    setFiltroActivo('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleToggleActivo = async (usuario) => {
    if (usuario.id_usuario === currentUser?.id_usuario) {
      toast.error('No puedes desactivarte a ti mismo');
      return;
    }
    try {
      if (usuario.activo) {
        await usuariosService.deactivate(usuario.id_usuario);
        toast.success(`${usuario.nombre} desactivado`);
      } else {
        await usuariosService.activate(usuario.id_usuario);
        toast.success(`${usuario.nombre} activado`);
      }
      loadUsuarios();
    } catch {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const handleDelete = async (usuario) => {
    if (usuario.id_usuario === currentUser?.id_usuario) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }
    if (!confirm(`¿Eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await usuariosService.delete(usuario.id_usuario);
      toast.success('Usuario eliminado');
      loadUsuarios();
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  const hayFiltros = search || filtroRol || filtroActivo !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-500 text-sm">Administra las cuentas del sistema</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => navigate('/usuarios/nuevo')}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro rol */}
          <select
            value={filtroRol}
            onChange={(e) => { setFiltroRol(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            {roles.map((r) => (
              <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
            ))}
          </select>

          {/* Filtro activo */}
          <select
            value={filtroActivo}
            onChange={(e) => { setFiltroActivo(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <Button type="submit">Buscar</Button>
          {hayFiltros && (
            <button
              type="button"
              onClick={clearFiltros}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" /> Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron usuarios</p>
            {hayFiltros && (
              <button onClick={clearFiltros} className="mt-2 text-blue-600 hover:underline text-sm">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Nombre', 'Usuario', 'Correo', 'Rol', 'Estado', 'Acciones'].map((col) => (
                    <th
                      key={col}
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col === 'Acciones' ? 'text-right' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((u) => {
                  const esMismo = u.id_usuario === currentUser?.id_usuario;
                  return (
                    <tr key={u.id_usuario} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                            {u.nombre?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.nombre}</p>
                            {esMismo && (
                              <span className="text-xs text-blue-500">(tú)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {u.usuario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.correo || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${BADGE_ROL[u.rol_nombre] ?? 'bg-gray-100 text-gray-700'}`}>
                          {u.rol_nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/usuarios/${u.id_usuario}/editar`)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActivo(u)}
                            disabled={esMismo}
                            className={`p-1.5 rounded ${esMismo ? 'text-gray-300 cursor-not-allowed' : u.activo ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
                            title={u.activo ? 'Desactivar' : 'Activar'}
                          >
                            {u.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={esMismo}
                            className={`p-1.5 rounded ${esMismo ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            {pagination.total > pagination.limit && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListaUsuarios;
