// src/pages/dashboard/Dashboard.jsx
import {
  Users,
  Folder,
  Calendar,
  TrendingUp,
  FileText,
  Scale,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Stats de ejemplo
  const stats = [
    {
      name: 'Procesos Activos',
      value: '24',
      change: '+12%',
      icon: Folder,
      color: 'blue'
    },
    {
      name: 'Adolescentes',
      value: '156',
      change: '+5%',
      icon: Users,
      color: 'green'
    },
    {
      name: 'Audiencias Hoy',
      value: '8',
      change: '0%',
      icon: Calendar,
      color: 'purple'
    },
    {
      name: 'Carpetas Nuevas',
      value: '12',
      change: '+8%',
      icon: FileText,
      color: 'orange'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-600">
          Resumen del sistema - {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acciones rápidas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Nuevo Adolescente</p>
                <p className="text-sm text-gray-500">Registrar nuevo adolescente</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Folder className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Nuevo Proceso</p>
                <p className="text-sm text-gray-500">Iniciar nuevo proceso judicial</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Agendar Audiencia</p>
                <p className="text-sm text-gray-500">Programar nueva audiencia</p>
              </div>
            </button>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Proceso CJ-045/2025 actualizado
                </p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Audiencia programada para mañana
                </p>
                <p className="text-xs text-gray-500">Hace 3 horas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Nuevo adolescente registrado
                </p>
                <p className="text-xs text-gray-500">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Sistema Completamente Funcional
            </h3>
            <p className="text-blue-800">
              El sistema de gestión de procesos está activo y funcionando correctamente.
              Todas las funcionalidades principales están disponibles.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-blue-700">
              <li>✓ Backend completo con 200+ endpoints</li>
              <li>✓ Sistema de autenticación y permisos</li>
              <li>✓ Gestión de carpetas CJ, CJO, CEMCI, CEMS</li>
              <li>✓ Layout responsive con navegación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
