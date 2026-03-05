// src/pages/reportes/components/PanelGeneral.jsx
import { useEffect, useState } from 'react';
import {
  Users, Calendar, Lock, ShieldCheck, RefreshCw, AlertTriangle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import estadisticasService from '../../../services/estadisticasService';

const COLORES_SEXO = ['#0ea5e9', '#ec4899'];
const COLORES_BAR  = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      {label && <p className="font-medium text-gray-900 mb-1">{label}</p>}
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color || e.fill }}>
          {e.name}: <span className="font-semibold">{e.value}</span>
        </p>
      ))}
    </div>
  );
};

const PanelGeneral = () => {
  const [loading, setLoading]               = useState(true);
  const [adolescentes, setAdolescentes]     = useState(null);
  const [sinProceso, setSinProceso]         = useState(null);
  const [internamiento, setInternamiento]   = useState(null);
  const [libertad, setLibertad]             = useState(null);
  const [cjStats, setCjStats]               = useState(null);
  const [audienciasTipo, setAudienciasTipo] = useState(null);
  const [proximas, setProximas]             = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        estadisticasService.getAdolescentesStats(),
        estadisticasService.getAdolescentesSinProceso(),
        estadisticasService.getInternamientoStats(),
        estadisticasService.getLibertadStats(),
        estadisticasService.getCJStats(),
        estadisticasService.getAudienciasTipoStats(),
        estadisticasService.getAudienciasProximas(30),
      ]);
      if (results[0].status === 'fulfilled') setAdolescentes(results[0].value);
      if (results[1].status === 'fulfilled') setSinProceso(results[1].value);
      if (results[2].status === 'fulfilled') setInternamiento(results[2].value);
      if (results[3].status === 'fulfilled') setLibertad(results[3].value);
      if (results[4].status === 'fulfilled') setCjStats(results[4].value);
      if (results[5].status === 'fulfilled') setAudienciasTipo(results[5].value);
      if (results[6].status === 'fulfilled') setProximas(results[6].value);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const tasaReincidencia = cjStats
    ? ((cjStats.reincidentes / cjStats.total) * 100).toFixed(1)
    : null;

  const sexoData = adolescentes
    ? [
        { name: 'Hombres', value: adolescentes.por_sexo?.hombres ?? 0 },
        { name: 'Mujeres', value: adolescentes.por_sexo?.mujeres ?? 0 },
      ]
    : [];

  const edadData = adolescentes
    ? [
        { rango: '12–13 años', total: adolescentes.por_edad?.['12-13'] ?? 0 },
        { rango: '14–15 años', total: adolescentes.por_edad?.['14-15'] ?? 0 },
        { rango: '16–17 años', total: adolescentes.por_edad?.['16-17'] ?? 0 },
      ]
    : [];

  const fueroData = cjStats
    ? [
        { name: 'Fuero Común',   value: cjStats.por_fuero?.comun   ?? 0 },
        { name: 'Fuero Federal', value: cjStats.por_fuero?.federal  ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Adolescentes"
          value={adolescentes?.total}
          subtitle="Registrados en el sistema"
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Sin proceso activo"
          value={Array.isArray(sinProceso) ? sinProceso.length : sinProceso}
          subtitle="Registros sin carpeta"
          icon={AlertTriangle}
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Internamiento activo"
          value={internamiento?.activos}
          subtitle={`${internamiento?.cumplidos ?? '—'} cumplidos`}
          icon={Lock}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Libertad asistida"
          value={libertad?.activas}
          subtitle={`${libertad?.vencidas ?? '—'} vencidas sin cerrar`}
          icon={ShieldCheck}
          color={libertad?.vencidas > 0 ? 'orange' : 'green'}
          loading={loading}
        />
        <StatCard
          title="Próximas audiencias"
          value={Array.isArray(proximas) ? proximas.length : proximas}
          subtitle="En los próximos 30 días"
          icon={Calendar}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Tasa reincidencia"
          value={tasaReincidencia != null ? `${tasaReincidencia}%` : null}
          subtitle={`${cjStats?.reincidentes ?? '—'} de ${cjStats?.total ?? '—'} CJ`}
          icon={RefreshCw}
          color={parseFloat(tasaReincidencia) > 20 ? 'red' : 'teal'}
          loading={loading}
        />
      </div>

      {/* Fila 1 de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Adolescentes por sexo"
          subtitle="Distribución general del sistema"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sexoData}
                cx="50%" cy="50%"
                innerRadius={70} outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {sexoData.map((_, i) => (
                  <Cell key={i} fill={COLORES_SEXO[i]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Audiencias por tipo"
          subtitle="Distribución histórica de diligencias"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={audienciasTipo ?? []} barSize={38}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                {(audienciasTipo ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORES_BAR[i % COLORES_BAR.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fila 2 de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Carpetas por fuero"
          subtitle="Común vs Federal"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={fueroData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                <Cell fill="#0ea5e9" />
                <Cell fill="#6366f1" />
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard
            title="Adolescentes por rango de edad"
            subtitle="Grupos etarios registrados"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={edadData} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="rango" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" name="Adolescentes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

    </div>
  );
};

export default PanelGeneral;
