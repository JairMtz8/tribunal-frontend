// src/pages/reportes/components/TendenciaTemporal.jsx
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import estadisticasService from '../../../services/estadisticasService';

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: 5 }, (_, i) => ANIO_ACTUAL - i);

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.stroke || e.fill }}>
          {e.name}: <span className="font-semibold">{e.value}</span>
        </p>
      ))}
    </div>
  );
};

const TendenciaTemporal = () => {
  const [loading, setLoading]         = useState(true);
  const [periodo, setPeriodo]         = useState('mes');
  const [anioSeleccionado, setAnio]   = useState(ANIO_ACTUAL);
  const [tendenciaMes, setTendenciaMes]   = useState(null);
  const [tendenciaAnio, setTendenciaAnio] = useState(null);

  useEffect(() => {
    const fetchMes = async () => {
      setLoading(true);
      try {
        const data = await estadisticasService.getTendenciaCasos({
          periodo: 'mes',
          anio: anioSeleccionado,
        });
        setTendenciaMes(data);
      } catch {
        setTendenciaMes(null);
      }
      setLoading(false);
    };
    fetchMes();
  }, [anioSeleccionado]);

  useEffect(() => {
    const fetchAnio = async () => {
      try {
        const data = await estadisticasService.getTendenciaCasos({ periodo: 'año' });
        setTendenciaAnio(data);
      } catch {
        setTendenciaAnio(null);
      }
    };
    fetchAnio();
  }, []);

  // Formatea el periodo "2024-03" → "Mar"
  const formatearPeriodo = (p) => {
    if (!p) return '';
    const partes = p.split('-');
    if (partes.length === 2) {
      const mes = parseInt(partes[1], 10) - 1;
      return MESES[mes] ?? p;
    }
    return p;
  };

  const datosMes = tendenciaMes
    ? tendenciaMes.map((d) => ({ ...d, label: formatearPeriodo(d.periodo) }))
    : [];

  const totalAnioActual = Array.isArray(tendenciaAnio)
    ? tendenciaAnio.find((d) => d.periodo === String(ANIO_ACTUAL))?.total ?? null
    : null;

  const totalAnioAnterior = Array.isArray(tendenciaAnio)
    ? tendenciaAnio.find((d) => d.periodo === String(ANIO_ACTUAL - 1))?.total ?? null
    : null;

  const variacion = totalAnioActual != null && totalAnioAnterior != null && totalAnioAnterior > 0
    ? (((totalAnioActual - totalAnioAnterior) / totalAnioAnterior) * 100).toFixed(1)
    : null;

  const TendenciaIcon = variacion === null ? Minus : parseFloat(variacion) > 0 ? TrendingUp : TrendingDown;
  const tendenciaColor = variacion === null ? 'blue' : parseFloat(variacion) > 0 ? 'red' : 'green';

  return (
    <div className="space-y-6">

      {/* KPIs anuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={`Casos ${ANIO_ACTUAL}`}
          value={totalAnioActual}
          subtitle="Procesos abiertos este año"
          icon={TrendingUp}
          color="blue"
          loading={loading}
        />
        <StatCard
          title={`Casos ${ANIO_ACTUAL - 1}`}
          value={totalAnioAnterior}
          subtitle="Procesos del año anterior"
          icon={TrendingUp}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Variación interanual"
          value={variacion != null ? `${variacion > 0 ? '+' : ''}${variacion}%` : null}
          subtitle={`Comparando ${ANIO_ACTUAL - 1} → ${ANIO_ACTUAL}`}
          icon={TendenciaIcon}
          color={tendenciaColor}
          loading={loading}
        />
      </div>

      {/* Selector de periodo */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {['mes', 'año'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                periodo === p
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'mes' ? 'Mensual' : 'Anual'}
            </button>
          ))}
        </div>

        {periodo === 'mes' && (
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            {ANIOS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}
      </div>

      {/* Gráfica principal — área mensual o barras anuales */}
      <ChartCard
        title={periodo === 'mes'
          ? `Casos nuevos por mes — ${anioSeleccionado}`
          : 'Casos nuevos por año'}
        subtitle="Procesos judiciales abiertos según su fecha de ingreso"
        badge="Nuevo endpoint"
        loading={loading}
        pendiente={!loading && (periodo === 'mes' ? tendenciaMes === null : tendenciaAnio === null)}
        minHeight={340}
      >
        {periodo === 'mes' && datosMes.length > 0 && (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={datosMes} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientCasos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipCustom />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Casos"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fill="url(#gradientCasos)"
                dot={{ r: 4, fill: '#0ea5e9' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {periodo === 'año' && Array.isArray(tendenciaAnio) && (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={tendenciaAnio} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="total" name="Casos" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Tabla de detalle anual */}
      {Array.isArray(tendenciaAnio) && (
        <ChartCard
          title="Resumen por año"
          subtitle="Histórico de casos abiertos anualmente"
          loading={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Año</th>
                  <th className="text-right py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Casos</th>
                  <th className="text-right py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Variación</th>
                </tr>
              </thead>
              <tbody>
                {[...tendenciaAnio].reverse().map((row, i, arr) => {
                  const prev = arr[i + 1]?.total;
                  const var_ = prev ? (((row.total - prev) / prev) * 100).toFixed(1) : null;
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-gray-900">{row.periodo}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-gray-900">{row.total}</td>
                      <td className="py-2.5 px-4 text-right">
                        {var_ != null ? (
                          <span className={`text-xs font-medium ${parseFloat(var_) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {var_ > 0 ? '+' : ''}{var_}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

    </div>
  );
};

export default TendenciaTemporal;
