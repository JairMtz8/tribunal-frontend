// src/pages/reportes/components/SeguimientoJudicial.jsx
import { useEffect, useState } from 'react';
import { Scale, Clock, Lock, DollarSign } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import estadisticasService from '../../../services/estadisticasService';

const COLORES_SENTENCIA  = ['#ef4444', '#10b981', '#f59e0b', '#94a3b8'];
const COLORES_PRIVATIVAS = ['#ef4444', '#10b981'];
const COLORES_MC         = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

const SeguimientoJudicial = () => {
  const [loading, setLoading]                   = useState(true);
  const [cjoStats, setCjoStats]                 = useState(null);
  const [medidasCautelares, setMedidasCautelares] = useState(null);
  const [medidasGenerales, setMedidasGenerales] = useState(null);
  const [condena, setCondena]                   = useState(null);
  const [tiempoPromedio, setTiempoPromedio]     = useState(null);
  const [medidasPorConducta, setMedidasPorConducta] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        estadisticasService.getCJOStats(),
        estadisticasService.getMedidasCautelaresStats(),
        estadisticasService.getMedidasSancionadorasGenerales(),
        estadisticasService.getCondenaStats(),
        estadisticasService.getTiempoPromedioProceso(),
        estadisticasService.getMedidasSancionadorasPorConducta(),
      ]);
      if (results[0].status === 'fulfilled') setCjoStats(results[0].value);
      if (results[1].status === 'fulfilled') setMedidasCautelares(results[1].value);
      if (results[2].status === 'fulfilled') setMedidasGenerales(results[2].value);
      if (results[3].status === 'fulfilled') setCondena(results[3].value);
      if (results[4].status === 'fulfilled') setTiempoPromedio(results[4].value);
      if (results[5].status === 'fulfilled') setMedidasPorConducta(results[5].value);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const tasaCondena = cjoStats
    ? ((cjoStats.condenatorias / cjoStats.total) * 100).toFixed(1)
    : null;

  const porcentajeReparacion = condena
    ? ((condena.con_reparacion / condena.total) * 100).toFixed(1)
    : null;

  const sentenciasData = cjoStats
    ? [
        { name: 'Condenatorias', value: cjoStats.condenatorias ?? 0 },
        { name: 'Absolutorias',  value: cjoStats.absolutorias  ?? 0 },
        { name: 'Mixtas',        value: cjoStats.mixtas         ?? 0 },
        { name: 'Sin sentencia', value: cjoStats.sin_sentencia  ?? 0 },
      ].filter((d) => d.value > 0)
    : [];

  const privativasData = medidasGenerales
    ? [
        { name: 'Privativas',     value: medidasGenerales.privativas     ?? 0 },
        { name: 'No privativas',  value: medidasGenerales.no_privativas  ?? 0 },
      ]
    : [];

  const mcData = Array.isArray(medidasCautelares)
    ? medidasCautelares.map((m) => ({
        tipo:     m.tipo,
        activas:  m.activas,
        revocadas: m.revocadas,
      }))
    : [];

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Condenas activas"
          value={condena?.activas}
          subtitle={`${condena?.cumplidas ?? '—'} cumplidas`}
          icon={Scale}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Tasa de condena"
          value={tasaCondena != null ? `${tasaCondena}%` : null}
          subtitle={`${cjoStats?.condenatorias ?? '—'} de ${cjoStats?.total ?? '—'} juicios`}
          icon={Scale}
          color={parseFloat(tasaCondena) > 60 ? 'red' : 'green'}
          loading={loading}
        />
        <StatCard
          title="Tiempo promedio"
          value={tiempoPromedio?.promedio_dias_general != null
            ? `${tiempoPromedio.promedio_dias_general} días`
            : null}
          subtitle="De CJ a sentencia"
          icon={Clock}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Con reparación del daño"
          value={porcentajeReparacion != null ? `${porcentajeReparacion}%` : null}
          subtitle={`${condena?.con_reparacion ?? '—'} de ${condena?.total ?? '—'} condenas`}
          icon={DollarSign}
          color="teal"
          loading={loading}
        />
      </div>

      {/* Sentencias + Privativas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Tipos de sentencia"
          subtitle="Distribución de resoluciones en juicios orales"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sentenciasData}
                cx="50%" cy="50%"
                innerRadius={68} outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {sentenciasData.map((_, i) => (
                  <Cell key={i} fill={COLORES_SENTENCIA[i % COLORES_SENTENCIA.length]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Medidas sancionadoras"
          subtitle="Privativas vs No privativas de libertad"
          loading={loading}
        >
          <div className="flex flex-col h-full">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={privativasData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {privativasData.map((_, i) => (
                    <Cell key={i} fill={COLORES_PRIVATIVAS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipCustom />} />
                <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            {medidasGenerales && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Total medidas</p>
                  <p className="text-xl font-bold text-gray-900">{medidasGenerales.total}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Promedio duración</p>
                  <p className="text-xl font-bold text-gray-900">
                    {medidasGenerales.promedio_dias_total != null
                      ? `${Math.round(medidasGenerales.promedio_dias_total)} días`
                      : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Medidas cautelares */}
      <ChartCard
        title="Medidas cautelares por tipo"
        subtitle="Activas vs Revocadas según el tipo de medida"
        loading={loading}
        minHeight={260}
      >
        {mcData.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mcData} barSize={24} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
              <Bar dataKey="activas"   name="Activas"   fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="revocadas" name="Revocadas" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Tiempo promedio por sentencia (nuevo) */}
      <ChartCard
        title="Tiempo promedio de proceso por tipo de sentencia"
        subtitle="Días desde apertura de CJ hasta dictado de sentencia"
        badge="Nuevo endpoint"
        loading={loading}
        pendiente={!loading && tiempoPromedio === null}
        minHeight={220}
      >
        {tiempoPromedio?.por_sentencia && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tiempoPromedio.por_sentencia} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit=" días" />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="promedio_dias" name="Días promedio" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Medidas por conducta (nuevo) */}
      <ChartCard
        title="Medidas sancionadoras por conducta"
        subtitle="Tipo de sanción aplicada según el delito cometido"
        badge="Nuevo endpoint"
        loading={loading}
        pendiente={!loading && medidasPorConducta === null}
        minHeight={200}
      >
        {medidasPorConducta && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Conducta</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Medida principal</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Casos</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Otras medidas</th>
                </tr>
              </thead>
              <tbody>
                {medidasPorConducta.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{row.conducta}</td>
                    <td className="py-2.5 px-3 text-gray-700">
                      {row.medidas?.[0]?.tipo ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">
                      {row.medidas?.[0]?.total ?? '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {row.medidas?.slice(1).map((m, j) => (
                          <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {m.tipo} ({m.total})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

    </div>
  );
};

export default SeguimientoJudicial;
