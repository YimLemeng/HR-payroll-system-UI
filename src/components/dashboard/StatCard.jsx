import React from 'react';

const SPARKLINE_PATHS = {
  blue: {
    line: 'M 0 38 C 35 34, 65 28, 100 22 C 135 16, 165 11, 200 6',
    area: 'M 0 38 C 35 34, 65 28, 100 22 C 135 16, 165 11, 200 6 L 200 44 L 0 44 Z',
    stroke: '#3b82f6',
    fill: '#3b82f6',
    iconBg: 'bg-blue-50 text-blue-500 border-blue-100',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
  sky: {
    line: 'M 0 40 C 20 32, 30 12, 48 16 C 65 20, 75 34, 92 24 C 110 14, 120 26, 138 14 C 155 4, 175 18, 200 10',
    area: 'M 0 40 C 20 32, 30 12, 48 16 C 65 20, 75 34, 92 24 C 110 14, 120 26, 138 14 C 155 4, 175 18, 200 10 L 200 44 L 0 44 Z',
    stroke: '#0ea5e9',
    fill: '#0ea5e9',
    iconBg: 'bg-sky-50 text-sky-500 border-sky-100',
    badgeBg: 'bg-amber-50 text-amber-700',
  },
  emerald: {
    line: 'M 0 36 C 22 22, 38 40, 58 28 C 78 16, 95 28, 115 18 C 135 8, 152 24, 172 16 C 185 11, 192 14, 200 12',
    area: 'M 0 36 C 22 22, 38 40, 58 28 C 78 16, 95 28, 115 18 C 135 8, 152 24, 172 16 C 185 11, 192 14, 200 12 L 200 44 L 0 44 Z',
    stroke: '#10b981',
    fill: '#10b981',
    iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
  amber: {
    line: 'M 0 38 C 30 33, 60 27, 92 21 C 120 15, 145 14, 170 8 C 184 5, 192 7, 200 6',
    area: 'M 0 38 C 30 33, 60 27, 92 21 C 120 15, 145 14, 170 8 C 184 5, 192 7, 200 6 L 200 44 L 0 44 Z',
    stroke: '#f59e0b',
    fill: '#f59e0b',
    iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
    badgeBg: 'bg-blue-50 text-blue-700',
  },
  indigo: {
    line: 'M 0 38 C 30 33, 60 27, 92 21 C 120 15, 145 14, 170 8 C 184 5, 192 7, 200 6',
    area: 'M 0 38 C 30 33, 60 27, 92 21 C 120 15, 145 14, 170 8 C 184 5, 192 7, 200 6 L 200 44 L 0 44 Z',
    stroke: '#f59e0b',
    fill: '#f59e0b',
    iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
    badgeBg: 'bg-blue-50 text-blue-700',
  },
};

const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up',
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  const scheme = SPARKLINE_PATHS[colorScheme] || SPARKLINE_PATHS.blue;
  const gradId = `spark-grad-${colorScheme}-${title?.replace(/\s+/g, '') || 'card'}`;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between pt-5 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="px-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500 truncate">
            {title}
          </p>
          <h4 className="text-[26px] font-bold text-slate-900 mt-1 tracking-tight leading-tight">
            {value}
          </h4>

          {trend && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold mt-2 ${
                trendType === 'down'
                  ? 'bg-amber-50 text-amber-700'
                  : scheme.badgeBg
              }`}
            >
              {trend}
            </span>
          )}
        </div>

        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${scheme.iconBg}`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>

      {/* Smooth Area Sparkline along Bottom Edge */}
      <div className="w-full h-11 mt-2">
        <svg
          viewBox="0 0 200 44"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scheme.fill} stopOpacity="0.22" />
              <stop offset="100%" stopColor={scheme.fill} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={scheme.area} fill={`url(#${gradId})`} />
          <path
            d={scheme.line}
            fill="none"
            stroke={scheme.stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default StatCard;
