// src/pages/reportes/components/StatCard.jsx

const colorMap = {
  blue:   { border: 'border-blue-500',   icon: 'bg-blue-50 text-blue-600'   },
  green:  { border: 'border-green-500',  icon: 'bg-green-50 text-green-600' },
  red:    { border: 'border-red-500',    icon: 'bg-red-50 text-red-600'     },
  yellow: { border: 'border-yellow-500', icon: 'bg-yellow-50 text-yellow-600'},
  purple: { border: 'border-purple-500', icon: 'bg-purple-50 text-purple-600'},
  orange: { border: 'border-orange-500', icon: 'bg-orange-50 text-orange-600'},
  sky:    { border: 'border-sky-500',    icon: 'bg-sky-50 text-sky-600'     },
  teal:   { border: 'border-teal-500',   icon: 'bg-teal-50 text-teal-600'   },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', loading = false }) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 ${c.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          )}
          {subtitle && !loading && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
