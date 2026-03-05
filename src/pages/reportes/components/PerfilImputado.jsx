// src/pages/reportes/components/PerfilImputado.jsx
import { useEffect, useState } from 'react';
import { Users, RefreshCw, UserX, ShieldAlert } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import estadisticasService from '../../../services/estadisticasService';

const COLORES_SEXO  = ['#0ea5e9', '#ec4899'];
const COLORES_FUERO = ['#0ea5e9', '#6366f1'];

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

const BadgeReincidencia = ({ porcentaje }) => {
  if (porcentaje > 20) return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Alto</span>;
  if (porcentaje > 10) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Medio</span>;
  return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Bajo</span>;
};

const PerfilImputado = () => {
  const [loading, setLoading]           = useState(true);
  const [adolescentes, setAdolescentes] = useState(null);
  const [cjStats, setCjStats]           = useState(null);
  const [victimas, setVictimas]         = useState(null);
  const [reincidencia, setReincidencia] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        estadisticasService.getAdolescentesStats(),
        estadisticasService.getCJStats(),
        estadisticasService.getVictimasStats(),
        estadisticasService.getReincidenciaPorConducta(),
      ]);
      if (results[0].status === 'fulfilled') setAdolescentes(results[0].value);
      if (results[1].status === 'fulfilled') setCjStats(results[1].value);
      if (results[2].status === 'fulfilled') setVictimas(results[2].value);
      if (results[3].status === 'fulfilled') setReincidencia(results[3].value);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const porcentajeHombres = adolescentes
    ? ((adolescentes.por_sexo?.hombres / adolescentes.total) * 100).toFixed(1)
    : null;

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
        { rango: '12–13', total: adolescentes.por_edad?.['12-13'] ?? 0 },
        { rango: '14–15', total: adolescentes.por_edad?.['14-15'] ?? 0 },
        { rango: '16–17', total: adolescentes.por_edad?.['16-17'] ?? 0 },
      ]
    : [];

  const fueroData = cjStats
    ? [
        { name: 'Común',   value: cjStats.por_fuero?.comun   ?? 0 },
        { name: 'Federal', value: cjStats.por_fuero?.federal  ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total adolescentes"
          value={adolescentes?.total}
          subtitle="Registrados en el sistema"
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="% Masculino"
          value={porcentajeHombres != null ? `${porcentajeHombres}%` : null}
          subtitle={`${adolescentes?.por_sexo?.hombres ?? '—'} hombres registrados`}
          icon={Users}
          color="sky"
          loading={loading}
        />
        <StatCard
          title="Tasa de reincidencia"
          value={tasaReincidencia != null ? `${tasaReincidencia}%` : null}
          subtitle={`${cjStats?.reincidentes ?? '—'} de ${cjStats?.total ?? '—'} carpetas`}
          icon={RefreshCw}
          color={parseFloat(tasaReincidencia) > 20 ? 'red' : 'teal'}
          loading={loading}
        />
        <StatCard
          title="Total víctimas"
          value={victimas?.total}
          subtitle={`${victimas?.menores ?? '—'} menores de edad`}
          icon={UserX}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Gráficas de distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Distribución por sexo"
          subtitle="Hombres vs Mujeres"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sexoData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={88}
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
          title="Distribución por edad"
          subtitle="Rangos etarios al momento del registro"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={edadData} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="rango" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="total" name="Adolescentes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Fuero de las carpetas"
          subtitle="Común vs Federal"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={fueroData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={88}
                paddingAngle={3}
                dataKey="value"
              >
                {fueroData.map((_, i) => (
                  <Cell key={i} fill={COLORES_FUERO[i]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tabla de reincidencia por conducta */}
      <ChartCard
        title="Reincidencia por conducta"
        subtitle="Conductas ordenadas por tasa de reincidencia — mayor porcentaje primero"
        badge="Nuevo endpoint"
        loading={loading}
        pendiente={!loading && reincidencia === null}
        minHeight={200}
      >
        {reincidencia && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Conducta</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total casos</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reincidentes</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">%</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {reincidencia.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{row.conducta}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{row.total_casos}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{row.reincidentes}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{row.porcentaje}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <BadgeReincidencia porcentaje={row.porcentaje} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Víctimas */}
      <ChartCard
        title="Perfil de víctimas"
        subtitle="Distribución por sexo y edad"
        loading={loading}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
          {[
            { label: 'Hombres',  value: victimas?.hombres,  color: 'text-sky-600' },
            { label: 'Mujeres',  value: victimas?.mujeres,  color: 'text-pink-500' },
            { label: 'Menores',  value: victimas?.menores,  color: 'text-amber-600' },
            { label: 'Mayores',  value: victimas?.mayores,  color: 'text-gray-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className={`text-3xl font-bold ${color}`}>{value ?? '—'}</span>
              <span className="text-xs text-gray-500 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

    </div>
  );
};

export default PerfilImputado;
