// src/pages/reportes/components/IncidenciaDelictiva.jsx
import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import estadisticasService from '../../../services/estadisticasService';

const COLORES_PIE  = ['#ef4444', '#f59e0b', '#0ea5e9', '#6366f1', '#10b981'];
const COLORES_EDAD = ['#0ea5e9', '#6366f1', '#10b981'];

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

// Transforma datos de /por-edad al formato de recharts grouped bar
const transformarEdadData = (datos) => {
  const mapa = {};
  datos.forEach(({ rango_edad, conductas }) => {
    conductas.forEach(({ nombre, total }) => {
      if (!mapa[nombre]) mapa[nombre] = { nombre };
      mapa[nombre][rango_edad] = total;
    });
  });
  return Object.values(mapa).map((c) => ({
    nombre: c.nombre,
    '12-13': c['12-13'] || 0,
    '14-15': c['14-15'] || 0,
    '16-17': c['16-17'] || 0,
  }));
};

const IncidenciaDelictiva = () => {
  const [loading, setLoading]           = useState(true);
  const [masFrecuentes, setMasFrecuentes] = useState([]);
  const [calificativas, setCalificativas] = useState([]);
  const [porMunicipio, setPorMunicipio] = useState(null);
  const [porEdad, setPorEdad]           = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        estadisticasService.getCJConductasMasFrecuentes(10),
        estadisticasService.getCJConductasStats(),
        estadisticasService.getConductasPorMunicipio({ limit: 10 }),
        estadisticasService.getConductasPorEdad({ limit: 5 }),
      ]);
      if (results[0].status === 'fulfilled') setMasFrecuentes(results[0].value ?? []);
      if (results[1].status === 'fulfilled') setCalificativas(results[1].value ?? []);
      if (results[2].status === 'fulfilled') setPorMunicipio(results[2].value);
      if (results[3].status === 'fulfilled') setPorEdad(results[3].value);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const edadTransformada = porEdad ? transformarEdadData(porEdad) : null;
  const delitoPrincipal  = masFrecuentes[0]?.nombre ?? '—';
  const municipioPrincipal = porMunicipio?.[0]?.municipio ?? null;

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tipos de conductas"
          value={masFrecuentes.length > 0 ? `${masFrecuentes.length}+` : null}
          subtitle="Conductas distintas registradas"
          icon={AlertTriangle}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Delito más frecuente"
          value={delitoPrincipal}
          subtitle={masFrecuentes[0] ? `${masFrecuentes[0].total_casos} casos registrados` : undefined}
          icon={TrendingUp}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Municipio más incidente"
          value={municipioPrincipal ?? (loading ? null : 'Pendiente')}
          subtitle={porMunicipio?.[0] ? `${porMunicipio[0].total_conductas} conductas` : 'Endpoint en desarrollo'}
          icon={MapPin}
          color={municipioPrincipal ? 'purple' : 'yellow'}
          loading={loading}
        />
      </div>

      {/* Top 10 delitos — barra horizontal, ancho completo */}
      <ChartCard
        title="Top 10 conductas más frecuentes"
        subtitle="Delitos con mayor número de casos registrados"
        badge="Todos los periodos"
        loading={loading}
        minHeight={340}
      >
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            layout="vertical"
            data={masFrecuentes}
            margin={{ left: 16, right: 24, top: 4, bottom: 4 }}
            barSize={18}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="nombre"
              type="category"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<TooltipCustom />} />
            <Bar dataKey="total_casos" name="Casos" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Calificativa + Municipio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Conductas por calificativa"
          subtitle="Distribución entre delitos dolosos y culposos"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={calificativas.map((c) => ({ name: c.calificativa, value: c.total }))}
                cx="50%" cy="50%"
                innerRadius={68} outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {calificativas.map((_, i) => (
                  <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Conductas por municipio"
          subtitle="Top 10 municipios con mayor incidencia"
          badge="Nuevo endpoint"
          loading={loading}
          pendiente={!loading && porMunicipio === null}
          minHeight={280}
        >
          {porMunicipio && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={porMunicipio}
                margin={{ left: 8, right: 20, top: 4, bottom: 4 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="municipio"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total_conductas" name="Conductas" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Conductas por edad — ancho completo */}
      <ChartCard
        title="Conductas por rango de edad del imputado"
        subtitle="Top 5 delitos cometidos según la edad del adolescente al momento del hecho"
        badge="Nuevo endpoint"
        loading={loading}
        pendiente={!loading && porEdad === null}
        minHeight={300}
      >
        {edadTransformada && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={edadTransformada} barSize={22} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipCustom />} />
              <Legend formatter={(v) => <span className="text-sm text-gray-700">{v}</span>} />
              <Bar dataKey="12-13" name="12–13 años" fill={COLORES_EDAD[0]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="14-15" name="14–15 años" fill={COLORES_EDAD[1]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="16-17" name="16–17 años" fill={COLORES_EDAD[2]} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
};

export default IncidenciaDelictiva;
