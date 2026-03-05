// src/pages/reportes/Reportes.jsx
import { useState } from 'react';
import {
  LayoutDashboard, AlertTriangle, Users, Scale, TrendingUp
} from 'lucide-react';
import PanelGeneral         from './components/PanelGeneral';
import IncidenciaDelictiva  from './components/IncidenciaDelictiva';
import PerfilImputado       from './components/PerfilImputado';
import SeguimientoJudicial  from './components/SeguimientoJudicial';
import TendenciaTemporal    from './components/TendenciaTemporal';

const TABS = [
  {
    id: 'general',
    label: 'Panel General',
    icon: LayoutDashboard,
    descripcion: 'Indicadores clave del sistema',
    componente: PanelGeneral,
  },
  {
    id: 'incidencia',
    label: 'Incidencia Delictiva',
    icon: AlertTriangle,
    descripcion: 'Delitos por tipo, municipio y edad',
    componente: IncidenciaDelictiva,
  },
  {
    id: 'perfil',
    label: 'Perfil del Imputado',
    icon: Users,
    descripcion: 'Características demográficas y reincidencia',
    componente: PerfilImputado,
  },
  {
    id: 'judicial',
    label: 'Seguimiento Judicial',
    icon: Scale,
    descripcion: 'Sentencias, medidas y eficiencia procesal',
    componente: SeguimientoJudicial,
  },
  {
    id: 'tendencia',
    label: 'Tendencia Temporal',
    icon: TrendingUp,
    descripcion: 'Evolución histórica de casos',
    componente: TendenciaTemporal,
  },
];

const Reportes = () => {
  const [tabActiva, setTabActiva] = useState('general');

  const tabActual = TABS.find((t) => t.id === tabActiva);
  const Componente = tabActual?.componente;

  return (
    <div className="space-y-0">

      {/* Header de página */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              Reportes y Estadísticas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Análisis del sistema judicial para adolescentes — {tabActual?.descripcion}
            </p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap pt-1">
            {new Date().toLocaleDateString('es-MX', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Barra de pestañas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const activa = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors flex-shrink-0
                  ${activa
                    ? 'border-sky-500 text-sky-600 bg-sky-50/40'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <tab.icon className={`w-4 h-4 ${activa ? 'text-sky-500' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido del tab activo */}
      {Componente && <Componente />}

    </div>
  );
};

export default Reportes;
