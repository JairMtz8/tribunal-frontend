// src/pages/reportes/components/ChartCard.jsx
import { Clock } from 'lucide-react';

const ChartCard = ({ title, subtitle, children, loading = false, minHeight = 280, badge, pendiente = false }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-start justify-between mb-4 gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className="text-xs bg-sky-50 text-sky-600 font-medium px-2 py-0.5 rounded-full border border-sky-200 flex-shrink-0 whitespace-nowrap">
          {badge}
        </span>
      )}
    </div>

    {loading ? (
      <div className="rounded-lg bg-gray-100 animate-pulse" style={{ minHeight }} />
    ) : pendiente ? (
      <div className="flex flex-col items-center justify-center py-8" style={{ minHeight }}>
        <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center mb-3">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">Endpoint en desarrollo</p>
        <p className="text-xs text-gray-400 mt-1">Disponible cuando el servidor lo implemente</p>
      </div>
    ) : children}
  </div>
);

export default ChartCard;
