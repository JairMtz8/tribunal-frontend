// src/pages/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  Users,
  Folder,
  FileText,
  Shield,
  Scale,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/tujpa-logo.png';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Stats cards según rol
  const statsCards = [
    {
      titulo: 'Sistema',
      valor: 'Activo',
      icono: TrendingUp,
      color: 'green',
      descripcion: 'Funcionando correctamente'
    },
    {
      titulo: 'Rol Actual',
      valor: user?.rol_nombre || 'Usuario',
      icono: Users,
      color: 'blue',
      descripcion: 'Permisos asignados'
    },
    {
      titulo: 'Sesión',
      valor: 'Conectado',
      icono: Clock,
      color: 'purple',
      descripcion: 'Usuario autenticado'
    }
  ];

  const modulosDisponibles = [
    {
      nombre: 'Adolescentes',
      descripcion: 'Gestión de expedientes de adolescentes',
      icono: Users,
      color: 'blue',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS']
    },
    {
      nombre: 'Procesos',
      descripcion: 'Seguimiento de procesos judiciales',
      icono: Folder,
      color: 'green',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS']
    },
    {
      nombre: 'Carpetas',
      descripcion: 'CJ, CJO, CEMCI y CEMS',
      icono: FileText,
      color: 'purple',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS']
    },
    {
      nombre: 'Medidas Cautelares',
      descripcion: 'Aplicación y seguimiento de medidas',
      icono: Shield,
      color: 'yellow',
      roles: ['Administrador', 'Juzgado', 'CEMCI']
    },
    {
      nombre: 'Medidas Sancionadoras',
      descripcion: 'Aplicación de sanciones',
      icono: Scale,
      color: 'orange',
      roles: ['Administrador', 'Juzgado', 'CEMS']
    },
    {
      nombre: 'Audiencias',
      descripcion: 'Programación y seguimiento',
      icono: Calendar,
      color: 'red',
      roles: ['Administrador', 'Juzgado']
    }
  ];

  const modulosAccesibles = modulosDisponibles.filter(modulo =>
    modulo.roles.includes(user?.rol_nombre)
  );

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    red: 'bg-red-100 text-red-600 border-red-200'
  };

  return (
    <div className="space-y-6">
      {/* Hero Section con Logo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={logo}
                  alt="TUJPA Logo"
                  className="h-16 w-auto bg-white rounded-lg p-2"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    TUJPA
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Sistema de Gestión Judicial
                  </p>
                </div>
              </div>
              <div className="mt-4 text-white">
                <p className="text-xl font-semibold">
                  ¡Bienvenido, {user?.nombre}!
                </p>
                <p className="text-blue-100 mt-1">
                  {formatDate(currentTime)}
                </p>
              </div>
            </div>
            <div className="hidden lg:block text-right text-white">
              <div className="text-5xl font-bold font-mono">
                {formatTime(currentTime)}
              </div>
              <p className="text-blue-100 mt-2">Hora actual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.titulo}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.valor}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.descripcion}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icono className="w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Módulos Disponibles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Módulos Disponibles para tu Rol
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulosAccesibles.map((modulo, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${colorClasses[modulo.color]}`}
            >
              <div className="flex items-start gap-3">
                <modulo.icono className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">{modulo.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">{modulo.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Utiliza el menú lateral para navegar rápidamente entre los diferentes módulos del sistema.
          </p>
        </div>
      </div>

      {/* Info del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Características */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Características del Sistema
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Gestión Integral</p>
                <p className="text-sm text-gray-600">Control completo de procesos judiciales</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Roles y Permisos</p>
                <p className="text-sm text-gray-600">Sistema de acceso basado en roles</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Trazabilidad Completa</p>
                <p className="text-sm text-gray-600">Seguimiento de todas las acciones</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Interfaz Intuitiva</p>
                <p className="text-sm text-gray-600">Diseño moderno y fácil de usar</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Soporte */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Soporte y Ayuda
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">¿Necesitas ayuda?</p>
              <p className="text-sm text-gray-600 mt-1">
                Consulta el menú lateral para acceder a todos los módulos disponibles según tu rol.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">Información del Usuario</p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-gray-600">
                  <strong>Usuario:</strong> {user?.usuario}
                </p>
                <p className="text-gray-600">
                  <strong>Rol:</strong> {user?.rol_nombre}
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong> {user?.correo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
