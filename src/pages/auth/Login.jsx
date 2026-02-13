// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Lock, User, Eye, EyeOff, Scale } from 'lucide-react';

import authService from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';

// Esquema de validación
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

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showContrasena, setShowContrasena] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.usuario, data.contrasena);

      // authService ya retorna { usuario, token }
      const { usuario, token } = response;

      // Guardar en el store
      login(usuario, token);

      toast.success(`¡Bienvenido ${usuario.nombre}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
      // Los errores ya se manejan en el interceptor de axios
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Imagen/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3 text-white">
          <Scale className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Tribunal de Justicia</h1>
            <p className="text-blue-100">Para Adolescentes del Estado de Morelos</p>
          </div>
        </div>

        <div className="text-white">
          <h2 className="text-3xl font-bold mb-4">
            Sistema de Gestión de Procesos
          </h2>
          <p className="text-blue-100 text-lg">
            Accede al sistema para gestionar carpetas judiciales,
            audiencias y seguimiento de procesos de adolescentes.
          </p>
        </div>

        <div className="text-blue-100 text-sm">
          <p>© 2025 Tribunal de Justicia para Adolescentes</p>
          <p>Estado de Morelos, México</p>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8 text-blue-600">
            <Scale className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold">Tribunal de Justicia</h1>
              <p className="text-sm text-gray-600">Para Adolescentes</p>
            </div>
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo de usuario */}
              <div>
                <label
                  htmlFor="usuario"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.usuario ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    placeholder="tu_usuario"
                  />
                </div>
                {errors.usuario && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.usuario.message}
                  </p>
                )}
              </div>

              {/* Campo de contraseña */}
              <div>
                <label
                  htmlFor="contrasena"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                    className={`block w-full pl-10 pr-10 py-3 border ${errors.contrasena ? 'border-red-300' : 'border-gray-300'
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contrasena.message}
                  </p>
                )}
              </div>

              {/* Recordar sesión y olvidé contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Recordar sesión
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
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

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Acceso exclusivo para personal autorizado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ayuda */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>¿Problemas para acceder?</p>
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              Contacta al administrador del sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
