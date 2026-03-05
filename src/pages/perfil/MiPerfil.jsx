// src/pages/perfil/MiPerfil.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

import authService from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';

const schemaInfo = yup.object({
  nombre: yup.string().min(2, 'Mínimo 2 caracteres').required('Campo requerido'),
  correo: yup
    .string()
    .email('Correo inválido')
    .nullable()
    .transform((v) => v || null),
});

const schemaClave = yup.object({
  contrasena_actual: yup.string().required('Campo requerido'),
  contrasena_nueva: yup.string().min(6, 'Mínimo 6 caracteres').required('Campo requerido'),
  confirmar: yup
    .string()
    .oneOf([yup.ref('contrasena_nueva')], 'Las contraseñas no coinciden')
    .required('Campo requerido'),
});

const BADGE_ROL = {
  Administrador: 'bg-purple-100 text-purple-800',
  Juzgado: 'bg-blue-100 text-blue-800',
  Juzgados: 'bg-blue-100 text-blue-800',
  CEMCI: 'bg-amber-100 text-amber-800',
  CEMS: 'bg-green-100 text-green-800',
  'Juzgado Ejecución': 'bg-sky-100 text-sky-800',
};

const MiPerfil = () => {
  const { user, login } = useAuthStore();
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isLoadingClave, setIsLoadingClave] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: errorsInfo },
  } = useForm({
    resolver: yupResolver(schemaInfo),
    defaultValues: { nombre: user?.nombre ?? '', correo: user?.correo ?? '' },
  });

  const {
    register: registerClave,
    handleSubmit: handleSubmitClave,
    reset: resetClave,
    formState: { errors: errorsClave },
  } = useForm({ resolver: yupResolver(schemaClave) });

  const onSubmitInfo = async (data) => {
    setIsLoadingInfo(true);
    try {
      const payload = { nombre: data.nombre };
      if ((data.correo || '') !== (user?.correo || '')) payload.correo = data.correo || null;

      const res = await authService.updateProfile(payload);
      const updatedUser = res?.data ?? res;

      // Actualizar el store con los nuevos datos
      const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';
      login({ ...user, ...updatedUser }, token);

      toast.success('Perfil actualizado');
      setIsEditingInfo(false);
    } catch {
      // interceptor maneja el error
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const onSubmitClave = async (data) => {
    setIsLoadingClave(true);
    try {
      await authService.changePassword(data.contrasena_actual, data.contrasena_nueva);
      toast.success('Contraseña actualizada correctamente');
      resetClave();
    } catch {
      // interceptor maneja el error
    } finally {
      setIsLoadingClave(false);
    }
  };

  const cancelEdit = () => {
    resetInfo({ nombre: user?.nombre ?? '', correo: user?.correo ?? '' });
    setIsEditingInfo(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-sm text-gray-500">Administra tu información personal y contraseña</p>
      </div>

      {/* ── Card: Información personal ── */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500" />
        <div className="p-6">
          {/* Avatar + nombre + rol */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold select-none">
              {user?.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.nombre}</p>
              <span className={`mt-1 inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${BADGE_ROL[user?.rol_nombre] ?? 'bg-gray-100 text-gray-700'}`}>
                {user?.rol_nombre}
              </span>
            </div>
            {!isEditingInfo && (
              <button
                onClick={() => setIsEditingInfo(true)}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingInfo ? (
            <form onSubmit={handleSubmitInfo(onSubmitInfo)} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerInfo('nombre')}
                    type="text"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errorsInfo.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                {errorsInfo.nombre && <p className="mt-1 text-xs text-red-600">{errorsInfo.nombre.message}</p>}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerInfo('correo')}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errorsInfo.correo ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                {errorsInfo.correo && <p className="mt-1 text-xs text-red-600">{errorsInfo.correo.message}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>Cancelar</Button>
                <Button type="submit" size="sm" icon={Save} isLoading={isLoadingInfo}>Guardar</Button>
              </div>
            </form>
          ) : (
            /* Vista de solo lectura */
            <div className="space-y-3">
              <InfoRow icon={User} label="Usuario" value={`@${user?.usuario}`} mono />
              <InfoRow icon={Mail} label="Correo" value={user?.correo || '—'} />
              <InfoRow icon={ShieldCheck} label="Rol" value={user?.rol_nombre} />
            </div>
          )}
        </div>
      </div>

      {/* ── Card: Cambiar contraseña ── */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Cambiar contraseña</h2>
          </div>

          <form onSubmit={handleSubmitClave(onSubmitClave)} className="space-y-4">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña actual</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...registerClave('contrasena_actual')}
                  type={showActual ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errorsClave.contrasena_actual ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowActual(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorsClave.contrasena_actual && <p className="mt-1 text-xs text-red-600">{errorsClave.contrasena_actual.message}</p>}
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...registerClave('contrasena_nueva')}
                  type={showNueva ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errorsClave.contrasena_nueva ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowNueva(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorsClave.contrasena_nueva && <p className="mt-1 text-xs text-red-600">{errorsClave.contrasena_nueva.message}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar nueva contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...registerClave('confirmar')}
                  type={showConfirmar ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errorsClave.confirmar ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowConfirmar(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorsClave.confirmar && <p className="mt-1 text-xs text-red-600">{errorsClave.confirmar.message}</p>}
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" icon={Save} isLoading={isLoadingClave}>
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para filas de solo lectura
const InfoRow = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
    <span className="text-sm text-gray-500 w-24 shrink-0">{label}</span>
    <span className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

export default MiPerfil;
