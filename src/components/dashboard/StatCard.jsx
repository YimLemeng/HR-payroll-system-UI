import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up',
  icon: Icon,
  colorScheme = 'blue',
  subtitle,
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-blue-500/10',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10',
    },
    amber: {
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-amber-500/10',
    },
    indigo: {
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-indigo-500/10',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div className="bg-[#0d1527] rounded-2xl p-5 border border-slate-800/80 shadow-lg hover:border-slate-700/80 transition-all relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-white mt-2 tracking-tight">
            {value}
          </h4>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {trend && (
            <div className={`flex items-center gap-1 font-semibold ${trendType === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendType === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          )}

          {subtitle && (
            <span className="text-slate-400 truncate ml-2">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
