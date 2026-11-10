import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import { Clock, CheckCircle2, AlertCircle, Calendar, Loader2 } from 'lucide-react';

const RecentActivities = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const res = await axiosClient.get('/attendance?page=0&size=5');
        if (isMounted) {
          const content = res.data?.content || (Array.isArray(res.data) ? res.data : []);
          setRecords(content);
        }
      } catch (err) {
        console.warn('Attendance API not loaded, trying fallback to /employees:', err);
        try {
          const empRes = await axiosClient.get('/employees?page=0&size=5');
          if (isMounted) {
            const empContent = empRes.data?.content || [];
            // Map real registered employees if no attendance has been clocked yet
            const mapped = empContent.map((emp) => ({
              id: emp.id,
              employeeCode: emp.employeeCode,
              employeeName: emp.fullName || `${emp.firstName} ${emp.lastName}`,
              department: emp.departmentName || 'General',
              attendanceDate: emp.hireDate || 'Active',
              checkIn: null,
              status: emp.employmentStatus || 'ACTIVE',
              salary: emp.basicSalary ? `$${Number(emp.basicSalary).toLocaleString()}` : '$0',
            }));
            setRecords(mapped);
          }
        } catch (empErr) {
          console.error('Failed to load employee/attendance records:', empErr);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAttendance();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatTime = (checkIn) => {
    if (!checkIn) return '--:--';
    try {
      const d = new Date(checkIn);
      return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {t('statusPresent')}
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            {t('statusLate')}
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Calendar className="w-3 h-3" />
            {t('statusOnLeave')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0d1527] rounded-2xl p-5 border border-slate-800/80 shadow-lg flex flex-col justify-between min-h-[340px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('recentActivityTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('recentActivitySubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/attendance')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
          >
            {t('viewAll')}
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span>{t('loading')}</span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Calendar className="w-8 h-8 text-slate-600 stroke-[1.5]" />
            <p>
              {lang === 'km'
                ? 'មិនទាន់មានកំណត់ត្រាវត្តមាននៅឡើយទេ'
                : 'No attendance records logged yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">{t('colEmployee')}</th>
                  <th className="py-2.5 px-3">{t('colDepartment')}</th>
                  <th className="py-2.5 px-3">{t('colTime')}</th>
                  <th className="py-2.5 px-3">{t('colStatus')}</th>
                  <th className="py-2.5 px-3 text-right">{t('colSalary')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {records.map((rec, idx) => (
                  <tr
                    key={rec.id || idx}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 font-semibold flex items-center justify-center text-[10px] shrink-0 border border-slate-700">
                          {(rec.employeeName || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {rec.employeeName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {rec.employeeCode || `EMP-${rec.id || idx + 1}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {rec.department || '--'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {formatTime(rec.checkIn)}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(rec.status)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">
                      {rec.salary || (rec.overtimeHours ? `${rec.overtimeHours}h OT` : '$0')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
