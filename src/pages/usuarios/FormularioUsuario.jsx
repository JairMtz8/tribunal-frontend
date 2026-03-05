// src/pages/usuarios/FormularioUsuario.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import usuariosService from '../../services/usuariosService';
import catalogoService from '../../services/catalogoService';
import Button from '../../components/common/Button';

const schemaCrear = yup.object({
  nombre: yup.string().min(2, 'Mínimo 2 caracteres').required('Campo requerido'),
  usuario: yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo')
    .min(3, 'Mínimo 3 caracteres')
    .required('Campo requerido'),
  correo: yup.string().email('Correo inválido').nullable().transform((v) => v || null),
  contrasena: yup.string().min(6, 'Mínimo 6 caracteres').required('Campo requerido'),
  rol_id: yup.number().typeError('Selecciona un rol').required('Campo requerido'),
});

const schemaEditar = yup.object({
  nombre: yup.string().min(2, 'Mínimo 2 caracteres').required('Campo requerido'),
  correo: yup.string().email('Correo inválido').nullable().transform((v) => v || null),
  activo: yup.boolean(),
});

const FormularioUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const correoOriginal = useRef('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isEditing ? schemaEditar : schemaCrear),
    defaultValues: { activo: true },
  });

  // Cargar roles
  useEffect(() => {
    catalogoService.getAll('roles').then((res) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      setRoles(data);
    }).catch(() => toast.error('Error al cargar roles'));
  }, []);

  // Cargar datos del usuario al editar
  useEffect(() => {
    if (!isEditing) return;
    setIsFetching(true);
    usuariosService.getById(id)
      .then((res) => {
        const u = res?.data ?? res;
        correoOriginal.current = u.correo ?? '';
        reset({
          nombre: u.nombre ?? '',
          correo: u.correo ?? '',
          activo: u.activo ?? true,
        });
      })
      .catch(() => {
        toast.error('Error al cargar el usuario');
        navigate('/usuarios');
      })
      .finally(() => setIsFetching(false));
  }, [id, isEditing]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const payload = { nombre: data.nombre, activo: data.activo };
        // Solo enviar correo si el usuario lo modificó
        if ((data.correo || '') !== correoOriginal.current) {
          payload.correo = data.correo || null;
        }
        await usuariosService.update(id, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuariosService.create({
          nombre: data.nombre,
          usuario: data.usuario,
          correo: data.correo || undefined,
          contrasena: data.contrasena,
          rol_id: Number(data.rol_id),
        });
        toast.success('Usuario creado correctamente');
      }
      navigate('/usuarios');
    } catch {
      // El interceptor de axios maneja el toast de error
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/usuarios')}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Modifica los datos del usuario' : 'Completa los datos para crear la cuenta'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              {...register('nombre')}
              type="text"
              placeholder="Ej. Juan Pérez"
              className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
          </div>
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
        </div>

        {/* Solo en creación: usuario + contraseña + rol */}
        {!isEditing && (
          <>
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">@</span>
                <input
                  {...register('usuario')}
                  type="text"
                  placeholder="juan_perez"
                  className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.usuario ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              {errors.usuario && <p className="mt-1 text-xs text-red-600">{errors.usuario.message}</p>}
              <p className="mt-1 text-xs text-gray-400">Solo letras, números y guión bajo (_)</p>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('contrasena')}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contrasena ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              {errors.contrasena && <p className="mt-1 text-xs text-red-600">{errors.contrasena.message}</p>}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rol <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  {...register('rol_id')}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${errors.rol_id ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                >
                  <option value="">Selecciona un rol...</option>
                  {roles.map((r) => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              {errors.rol_id && <p className="mt-1 text-xs text-red-600">{errors.rol_id.message}</p>}
            </div>
          </>
        )}

        {/* Correo (siempre visible) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electrónico <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              {...register('correo')}
              type="email"
              placeholder="correo@ejemplo.com"
              className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
          </div>
          {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo.message}</p>}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/usuarios')}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario;
