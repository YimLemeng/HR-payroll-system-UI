import React from 'react';

const BOX_COLORS = {
  blue: 'bg-[#00c0ef] text-white',
  sky: 'bg-[#00a65a] text-white',
  emerald: 'bg-[#f39c12] text-white',
  amber: 'bg-[#3c8dbc] text-white',
  indigo: 'bg-[#605ca8] text-white',
};

const StatCard = ({
  title,
  value,
  trend,
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  const iconBlockClass = BOX_COLORS[colorScheme] || BOX_COLORS.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded border border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow transition-shadow flex items-stretch overflow-hidden min-h-[90px] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Classic AdminLTE Solid Left Icon Block */}
      <div className={`w-20 flex items-center justify-center shrink-0 ${iconBlockClass}`}>
        <Icon className="w-8 h-8" />
      </div>

      {/* Right Content */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-slate-800 mt-0.5 tracking-tight truncate">
          {value}
        </h4>
        {trend && (
          <span className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
