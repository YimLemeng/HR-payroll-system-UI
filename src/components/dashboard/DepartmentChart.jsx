import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import { Loader2, Layers } from 'lucide-react';

const DONUT_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

const DepartmentChart = () => {
  const { t, lang } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get('/reports/departments/headcount');
        if (isMounted) {
          const data = Array.isArray(response.data) ? response.data : [];
          setDepartments(data);
        }
      } catch (err) {
        console.warn('Reports headcount API unavailable, fallback to /departments:', err);
        try {
          const fallbackRes = await axiosClient.get('/departments');
          if (isMounted) {
            const data = (fallbackRes.data || []).map((d) => ({
              departmentId: d.id,
              departmentName: d.departmentName,
              headcount: d.employeeCount || 0,
            }));
            setDepartments(data);
          }
        } catch (fallbackErr) {
          console.error('Failed to load departments:', fallbackErr);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalHeadcount = departments.reduce(
    (acc, curr) => acc + (Number(curr.headcount) || 0),
    0
  );

  // Build SVG donut arc segments
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  const segments = departments
    .filter((d) => (Number(d.headcount) || 0) > 0)
    .map((dept, index) => {
      const count = Number(dept.headcount) || 0;
      const percent = totalHeadcount > 0 ? (count / totalHeadcount) * 100 : 0;
      const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercent / 100) * circumference);

      // Mid-angle for percentage label inside the donut ring
      const midPercent = cumulativePercent + percent / 2;
      const angleRad = ((midPercent / 100) * 360 - 90) * (Math.PI / 180);
      const labelX = 100 + radius * Math.cos(angleRad);
      const labelY = 100 + radius * Math.sin(angleRad);

      cumulativePercent += percent;

      return {
        id: dept.departmentId || index,
        name: dept.departmentName || 'General',
        count,
        percent: Math.round(percent * 10) / 10,
        color: DONUT_COLORS[index % DONUT_COLORS.length],
        strokeDasharray,
        strokeDashoffset,
        labelX,
        labelY,
      };
    });

  return (
    <div className="bg-white rounded border border-slate-300 border-t-[3px] border-t-[#3c8dbc] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full min-h-[340px]">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          {t('deptDistributionTitle')}
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded">
          {totalHeadcount} {t('staffCount')}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center">

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>{t('loading')}</span>
        </div>
      ) : segments.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <Layers className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          <p>
            {lang === 'km'
              ? 'មិនទាន់មានដេប៉ាតឺម៉ង់នៅក្នុងប្រព័ន្ធនៅឡើយទេ'
              : 'No departments recorded in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-auto py-2">
          {/* Donut Chart SVG */}
          <div className="relative w-52 h-52">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {segments.map((seg) => (
                <circle
                  key={seg.id}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="38"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-500 hover:opacity-90"
                />
              ))}

              {/* Subtle white separator ring & labels */}
              {segments.map((seg) =>
                seg.percent >= 7 ? (
                  <text
                    key={`lbl-${seg.id}`}
                    x={seg.labelX}
                    y={seg.labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white text-[9.5px] font-bold pointer-events-none"
                  >
                    {seg.percent.toFixed(1)}%
                  </text>
                ) : null
              )}
            </svg>
          </div>

          {/* Horizontal Dot Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4">
            {segments.map((seg) => (
              <div key={`leg-${seg.id}`} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-medium truncate max-w-[110px]" title={`${seg.name}: ${seg.count}`}>
                  {seg.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DepartmentChart;
