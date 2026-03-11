// src/pages/auth/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

import authService from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/tujpa-logo.png';

const loginSchema = yup.object().shape({
  usuario: yup
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .required('El usuario es requerido'),
  contrasena: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const REMEMBER_KEY = 'tujpa_remember_usuario';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showContrasena, setShowContrasena] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      usuario: localStorage.getItem(REMEMBER_KEY) || '',
    },
  });

  useEffect(() => {
    if (localStorage.getItem(REMEMBER_KEY)) {
      setRemember(true);
    }
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.usuario, data.contrasena);
      const { usuario, token } = response;

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, data.usuario);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      login(usuario, token);
      toast.success(`¡Bienvenido ${usuario.nombre}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-16 right-8 w-48 h-48 rounded-full bg-blue-500/30" />
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full bg-white/20" />

        <div className="relative z-10 flex items-center gap-4">
          <img src={logo} alt="TUJPA" className="w-16 h-16 object-contain drop-shadow-lg" />
          <div className="text-white">
            <h1 className="text-2xl font-bold leading-tight">Tribunal Unitario de Justicia Penal</h1>
            <p className="text-blue-200 text-sm">Para Adolescentes del Estado de Morelos</p>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Sistema de Gestión de Procesos
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Accede al sistema para gestionar carpetas judiciales,
            audiencias y seguimiento de procesos de adolescentes.
          </p>
        </div>

        <div className="relative z-10 text-blue-300 text-sm">
          <p>© 2026 Tribunal de Justicia para Adolescentes</p>
          <p>Estado de Morelos, México</p>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={logo} alt="TUJPA" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-blue-700">Tribunal de Justicia</h1>
              <p className="text-sm text-gray-500">Para Adolescentes</p>
            </div>
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Barra de acento */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500" />

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-500 text-sm">
                  Ingresa tus credenciales para acceder al sistema
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Usuario */}
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="usuario"
                      type="text"
                      autoComplete="username"
                      {...register('usuario')}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.usuario ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      placeholder="tu_usuario"
                    />
                  </div>
                  {errors.usuario && (
                    <p className="mt-1 text-sm text-red-600">{errors.usuario.message}</p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="contrasena"
                      type={showContrasena ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('contrasena')}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.contrasena ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowContrasena(!showContrasena)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showContrasena ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.contrasena && (
                    <p className="mt-1 text-sm text-red-600">{errors.contrasena.message}</p>
                  )}
                </div>

                {/* Recordar usuario */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                    Recordar usuario
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">
                      Acceso exclusivo para personal autorizado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
