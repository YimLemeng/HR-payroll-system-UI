import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/dashboard/StatCard';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import {
  Users,
  UserCheck,
  CalendarOff,
  CircleDollarSign,
  ShieldAlert,
} from 'lucide-react';

const toIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getCurrentWeekDates = (refDate = new Date()) => {
  const dayOfWeek = refDate.getDay(); // 0=Sun..6=Sat
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() + diffToMon);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return dayNames.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return { day: label, iso: toIsoDate(d) };
  });
};

const DashboardPage = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [accessDeniedNotice, setAccessDeniedNotice] = useState(Boolean(location.state?.accessDenied));
  const [trendRange, setTrendRange] = useState('30d');

  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    attendanceRate: '0%',
    attendancePercent: 0,
    onLeave: 0,
    monthlyPayroll: '$0.00',
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [weekAttendance, setWeekAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardMetrics = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const weekDates = getCurrentWeekDates(now);

        const [
          empSummaryRes,
          attendanceSummaryRes,
          payrollSummaryRes,
          headcountRes,
          pendingLeavesRes,
          employeesRes,
          weekAttRes,
          approvedLeavesRes,
        ] = await Promise.allSettled([
          axiosClient.get('/reports/employees/summary'),
          axiosClient.get(`/attendance/summary?month=${month}&year=${year}`),
          axiosClient.get(`/reports/payroll/summary?month=${month}&year=${year}`),
          axiosClient.get('/reports/departments/headcount'),
          axiosClient.get('/leaves?status=PENDING&size=5'),
          axiosClient.get('/employees?size=1000'),
          axiosClient.get(`/attendance?from=${weekDates[0].iso}&to=${weekDates[4].iso}&size=1000`),
          axiosClient.get('/leaves?status=APPROVED&size=1000'),
        ]);

        if (!isMounted) return;

        const extractList = (res) =>
          res.status === 'fulfilled'
            ? res.value?.data?.content || (Array.isArray(res.value?.data) ? res.value.data : [])
            : [];

        const empData =
          empSummaryRes.status === 'fulfilled' ? empSummaryRes.value?.data : null;
        const attData =
          attendanceSummaryRes.status === 'fulfilled'
            ? attendanceSummaryRes.value?.data
            : null;
        const payData =
          payrollSummaryRes.status === 'fulfilled'
            ? payrollSummaryRes.value?.data
            : null;
        const deptHeadcounts =
          headcountRes.status === 'fulfilled' && Array.isArray(headcountRes.value?.data)
            ? headcountRes.value.data
            : [];
        const leaveList = extractList(pendingLeavesRes);
        const allEmployees = extractList(employeesRes);
        const weekAttRecords = extractList(weekAttRes);
        const allApprovedLeaves = extractList(approvedLeavesRes);

        const totalEmp = Number(empData?.totalEmployees ?? 0);
        const activeEmp = Number(empData?.activeEmployees ?? 0);
        const onLeaveEmp = Number(
          empData?.onLeaveEmployees ?? attData?.onLeaveCount ?? 0
        );

        const presentCount = Number(
          attData?.presentCount ?? (totalEmp > 0 ? Math.max(0, activeEmp - onLeaveEmp) : 0)
        );
        const pct = totalEmp > 0 ? Math.min(100, Math.round((presentCount / totalEmp) * 100)) : 0;

        let payrollAmount = Number(
          payData?.totalNetSalary || payData?.totalGrossSalary || 0
        );
        if (payrollAmount === 0 && deptHeadcounts.length > 0) {
          payrollAmount = deptHeadcounts.reduce(
            (sum, d) => sum + (Number(d.totalBasicSalary) || 0),
            0
          );
        }

        setMetrics({
          totalEmployees: totalEmp,
          activeEmployees: activeEmp,
          presentToday: presentCount,
          attendanceRate: `${pct}%`,
          attendancePercent: pct,
          onLeave: onLeaveEmp,
          monthlyPayroll: `$${payrollAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        });
        setPendingLeaves(leaveList);
        setEmployeesList(allEmployees);
        setWeekAttendance(weekAttRecords);
        setApprovedLeaves(allApprovedLeaves);
      } catch (err) {
        console.error('Error loading dashboard metrics from backend APIs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real Trend chart data computed from employee hireDate & approved leaves
  const buildTrendSeries = (daysStep, count) => {
    const today = new Date();
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    const headcount = [];
    const leaves = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i * daysStep);
      const iso = toIsoDate(d);

      if (daysStep === 1) {
        labels.push(i === 0 ? 'Now' : shortDays[d.getDay()]);
      } else {
        labels.push(i === 0 ? 'Now' : `${d.getDate()}/${d.getMonth() + 1}`);
      }

      const hc =
        employeesList.length > 0
          ? employeesList.filter((emp) => {
              const joined = emp.hireDate || emp.createdAt?.slice(0, 10) || '1970-01-01';
              return joined <= iso;
            }).length
          : metrics.totalEmployees;

      const lvCount = approvedLeaves.filter((lv) => {
        if (!lv.startDate || !lv.endDate) return false;
        return lv.startDate <= iso && lv.endDate >= iso;
      }).length;

      headcount.push(hc);
      leaves.push(i === 0 ? Math.max(lvCount, metrics.onLeave) : lvCount);
    }

    return { labels, headcount, leaves };
  };

  const trendConfigs = {
    '7d': buildTrendSeries(1, 7),
    '30d': buildTrendSeries(4, 8),
    '90d': buildTrendSeries(15, 7),
  };

  const activeTrend = trendConfigs[trendRange];
  const maxTrendY = Math.max(...activeTrend.headcount, 10) * 1.15;

  const buildPolylinePoints = (values) => {
    const width = 540;
    const height = 160;
    const padX = 20;
    const padY = 14;
    return values
      .map((val, idx) => {
        const x = padX + (idx / Math.max(values.length - 1, 1)) * (width - padX * 2);
        const y = height - padY - (val / maxTrendY) * (height - padY * 2);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Concentric Ring Status Distribution
  const activeRatio = metrics.totalEmployees > 0 ? (metrics.activeEmployees / metrics.totalEmployees) : 0.75;
  const leaveRatio = metrics.totalEmployees > 0 ? (metrics.onLeave / metrics.totalEmployees) : 0.15;
  const outerCirc = 2 * Math.PI * 66;
  const innerCirc = 2 * Math.PI * 48;

  // Real Attendance This Week bar values from /attendance?from=...&to=...
  const PRESENT_STATUSES = new Set(['PRESENT', 'LATE', 'HALF_DAY']);
  const weekDays = getCurrentWeekDates().map(({ day, iso }) => {
    const presentEmpIds = new Set(
      weekAttendance
        .filter((rec) => rec.attendanceDate === iso && PRESENT_STATUSES.has(rec.status))
        .map((rec) => rec.employeeId)
    );
    const count = presentEmpIds.size;
    const val =
      metrics.totalEmployees > 0
        ? Math.min(100, Math.round((count / metrics.totalEmployees) * 100))
        : 0;
    return { day, iso, count, val };
  });

  // Upcoming Events / Pending Leaves list (always top-aligned, 5 items)
  const leaveEvents = pendingLeaves.slice(0, 5).map((lv, idx) => ({
    id: lv.id || idx,
    dot: ['bg-blue-500', 'bg-amber-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'][idx % 5],
    title: `${lv.employeeName || 'Employee'} — ${lv.leaveType || 'Leave Request'}`,
    subtitle: `${lv.startDate || 'Pending'} (${lv.status || 'PENDING'})`,
    path: '/leaves',
  }));

  const hrMilestones = [
    {
      id: 'ev-1',
      dot: 'bg-amber-500',
      title: lang === 'km' ? 'ត្រួតពិនិត្យវត្តមានប្រចាំថ្ងៃ' : 'Daily Attendance Review',
      subtitle: `${metrics.presentToday} ${lang === 'km' ? 'នាក់មានវត្តមាន' : 'present recorded'}`,
      path: '/attendance',
    },
    {
      id: 'ev-2',
      dot: 'bg-cyan-500',
      title: lang === 'km' ? 'គណនាប្រាក់បៀវត្សប្រចាំខែ' : 'Monthly Payroll Run',
      subtitle: `${metrics.monthlyPayroll} • ${lang === 'km' ? 'ប្រាក់ខែ & ពន្ធ' : 'Salary & Tax'}`,
      path: '/payroll',
    },
    {
      id: 'ev-3',
      dot: 'bg-emerald-500',
      title: lang === 'km' ? 'បោះពុម្ពរបាយការណ៍ផ្លូវការ A4' : 'Official A4 Audit Reports',
      subtitle: lang === 'km' ? 'របាយការណ៍ប្រចាំខែ' : 'Monthly Summary Export',
      path: '/reports',
    },
    {
      id: 'ev-4',
      dot: 'bg-rose-500',
      title: lang === 'km' ? 'គ្រប់គ្រងដេប៉ាតឺម៉ង់ & បុគ្គលិក' : 'Department & Staff Sync',
      subtitle: `${metrics.totalEmployees} ${t('staffCount')}`,
      path: '/employees',
    },
    {
      id: 'ev-5',
      dot: 'bg-blue-500',
      title: lang === 'km' ? 'អនុម័តសំណើច្បាប់ឈប់សម្រាក' : 'Leave Requests Approval',
      subtitle: `${metrics.onLeave} ${lang === 'km' ? 'កំពុងឈប់សម្រាក' : 'currently on leave'}`,
      path: '/leaves',
    },
  ];

  const eventItems = [...leaveEvents, ...hrMilestones].slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Access Denied RBAC Warning */}
      {accessDeniedNotice && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <span>
              {lang === 'km'
                ? 'លោកអ្នកមិនមានសិទ្ធិ (Role) គ្រប់គ្រាន់ក្នុងការចូលទៅកាន់ទំព័រនោះទេ (សម្រាប់តែ System Administrator)។'
                : 'Access Denied: You do not have administrator permissions to access that module.'}
            </span>
          </div>
          <button
            onClick={() => setAccessDeniedNotice(false)}
            className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Page Title & Breadcrumb */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {lang === 'km' ? 'ទិដ្ឋភាពទូទៅ HR & ប្រាក់បៀវត្ស' : 'HR & Payroll Overview'}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
          <span>{lang === 'km' ? 'HR & ប្រាក់បៀវត្ស' : 'HR & Payroll'}</span>
          <span>/</span>
          <span className="text-slate-700 font-medium">
            {lang === 'km' ? 'ទិដ្ឋភាពទូទៅ' : 'Overview'}
          </span>
        </div>
      </div>

      {/* ROW 1: 4 KPI Stat Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('statTotalEmployees')}
          value={isLoading ? '...' : String(metrics.totalEmployees)}
          trend={`${metrics.activeEmployees} ${t('statusActive')}`}
          trendType="up"
          icon={Users}
          colorScheme="blue"
          onClick={() => navigate('/employees')}
        />

        <StatCard
          title={t('statPresentToday')}
          value={isLoading ? '...' : String(metrics.presentToday)}
          trend={metrics.attendanceRate}
          trendType="up"
          icon={UserCheck}
          colorScheme="sky"
          onClick={() => navigate('/attendance')}
        />

        <StatCard
          title={t('statOnLeave')}
          value={isLoading ? '...' : String(metrics.onLeave)}
          trend={metrics.onLeave > 0 ? `${metrics.onLeave} ${t('approved')}` : `0 ${t('today')}`}
          trendType={metrics.onLeave > 0 ? 'down' : 'up'}
          icon={CalendarOff}
          colorScheme="emerald"
          onClick={() => navigate('/leaves')}
        />

        <StatCard
          title={t('statMonthlyPayroll')}
          value={isLoading ? '...' : metrics.monthlyPayroll}
          trend={t('statusActive')}
          trendType="up"
          icon={CircleDollarSign}
          colorScheme="amber"
          onClick={() => navigate('/payroll')}
        />
      </div>

      {/* ROW 2: Headcount Trend (8 cols) + Department Breakdown Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Headcount & Attendance Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded border border-slate-300 border-t-[3px] border-t-[#3c8dbc] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'km' ? 'និន្នាការបុគ្គលិក & ច្បាប់ឈប់សម្រាក' : 'Headcount Trend'}
            </h3>

            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded border border-slate-300">
              {['7d', '30d', '90d'].map((rng) => (
                <button
                  key={rng}
                  onClick={() => setTrendRange(rng)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                    trendRange === rng
                      ? 'bg-[#3c8dbc] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 text-xs text-slate-600 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>{lang === 'km' ? 'បុគ្គលិកសរុប' : 'Headcount'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>{lang === 'km' ? 'ឈប់សម្រាក' : 'On Leave'}</span>
            </div>
          </div>

          {/* Smooth SVG Line Chart */}
          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 540 190" className="w-full h-52 overflow-visible">
              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
                const y = 14 + step * (160 - 28);
                const val = Math.round(maxTrendY * (1 - step));
                return (
                  <g key={i}>
                    <line
                      x1="20"
                      y1={y}
                      x2="520"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text x="12" y={y + 3} textAnchor="end" className="fill-slate-400 text-[9px]">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Headcount Line (Blue) */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={buildPolylinePoints(activeTrend.headcount)}
              />

              {/* Leaves Line (Red) */}
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={buildPolylinePoints(activeTrend.leaves)}
              />

              {/* X-axis Labels */}
              {activeTrend.labels.map((lbl, idx) => {
                const x =
                  20 +
                  (idx / Math.max(activeTrend.labels.length - 1, 1)) * (540 - 40);
                return (
                  <text
                    key={`${lbl}-${idx}`}
                    x={x}
                    y="180"
                    textAnchor="middle"
                    className="fill-slate-400 text-[9.5px]"
                  >
                    {lbl}
                  </text>
                );
              })}
            </svg>
          </div>
          </div>
        </div>

        {/* Department Breakdown Donut Chart */}
        <div className="lg:col-span-4">
          <DepartmentChart />
        </div>
      </div>

      {/* ROW 3: 3 Cards (Status Ring, Attendance This Week Bar Chart, Upcoming Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Workforce Status Distribution (Concentric Radial Rings) */}
        <div className="bg-white rounded border border-slate-300 border-t-[3px] border-t-[#3c8dbc] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="px-5 py-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'km' ? 'ស្ថានភាពបុគ្គលិកសរុប' : 'Workforce Distribution'}
            </h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">

          <div className="relative w-52 h-52 mx-auto my-2 flex items-center justify-center">
            <svg viewBox="0 0 180 180" className="w-full h-full">
              {/* Outer Track */}
              <circle cx="90" cy="90" r="66" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              <circle
                cx="90"
                cy="90"
                r="66"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${activeRatio * outerCirc} ${outerCirc}`}
                transform="rotate(-90 90 90)"
              />

              {/* Inner Track */}
              <circle cx="90" cy="90" r="48" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {leaveRatio > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r="48"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0.06, leaveRatio) * innerCirc} ${innerCirc}`}
                  transform="rotate(-90 90 90)"
                />
              )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 leading-none">
                {metrics.totalEmployees}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {lang === 'km' ? 'សរុប' : 'Total'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 text-xs text-slate-600 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>{t('statusActive')} ({metrics.activeEmployees})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{t('statusOnLeave')} ({metrics.onLeave})</span>
            </div>
          </div>
          </div>
        </div>

        {/* Card 2: Attendance This Week (Emerald Vertical Bar Chart) */}
        <div className="bg-white rounded border border-slate-300 border-t-[3px] border-t-[#00a65a] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'km' ? 'វត្តមានប្រចាំសប្តាហ៍' : 'Attendance This Week'}
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {metrics.attendanceRate}
            </span>
          </div>
          <div className="p-5">

          <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-3 border-b border-slate-100 relative">
            {weekDays.map((item) => (
              <div
                key={item.day}
                title={`${item.iso}: ${item.count}/${metrics.totalEmployees} (${item.val}%)`}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <span className="text-[10px] font-semibold text-slate-400">
                  {item.val}%
                </span>
                <div className="w-full max-w-[34px] bg-slate-100 rounded-t-md h-36 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 hover:bg-emerald-600"
                    style={{ height: `${item.val}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Card 3: Upcoming Events & Pending Requests */}
        <div className="bg-white rounded border border-slate-300 border-t-[3px] border-t-[#f39c12] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'km' ? 'ព្រឹត្តិការណ៍ & សំណើបន្ទាប់' : 'Upcoming Events'}
            </h3>
          </div>

          <div className="p-4 divide-y divide-slate-200 flex-1 flex flex-col">
            {eventItems.map((ev) => (
              <button
                key={ev.id}
                onClick={() => navigate(ev.path)}
                className="w-full py-3 flex items-start gap-3 text-left hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.dot}`} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 truncate">
                    {ev.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {ev.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 4: Full-Width Recent Attendance / Employees Table (Admindek Screenshot 2) */}
      <RecentActivities />
    </div>
  );
};

export default DashboardPage;
