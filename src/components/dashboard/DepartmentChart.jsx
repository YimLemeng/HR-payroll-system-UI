import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import { Building2, Loader2, Layers } from 'lucide-react';

const BAR_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-rose-500',
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

  return (
    <div className="bg-[#0d1527] rounded-2xl p-5 border border-slate-800/80 shadow-lg flex flex-col justify-between min-h-[340px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('deptDistributionTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('deptDistributionSubtitle')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700/60">
            {totalHeadcount} {t('staffCount')}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span>{t('loading')}</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Layers className="w-8 h-8 text-slate-600 stroke-[1.5]" />
            <p>
              {lang === 'km'
                ? 'មិនទាន់មានដេប៉ាតឺម៉ង់នៅក្នុងប្រព័ន្ធនៅឡើយទេ'
                : 'No departments recorded in the system yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 mt-4">
            {departments.map((dept, index) => {
              const count = Number(dept.headcount) || 0;
              const percentage =
                totalHeadcount > 0 ? Math.round((count / totalHeadcount) * 100) : 0;
              const barColor = BAR_COLORS[index % BAR_COLORS.length];

              return (
                <div key={dept.departmentId || index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      {dept.departmentName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        {count} {t('members')}
                      </span>
                      <span className="font-semibold text-white">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentChart;
