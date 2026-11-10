import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import {
  Users,
  UserCheck,
  CalendarOff,
  CircleDollarSign,
  ShieldAlert,
} from 'lucide-react';

const DashboardPage = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [accessDeniedNotice, setAccessDeniedNotice] = useState(Boolean(location.state?.accessDenied));

  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    attendanceRate: '0%',
    onLeave: 0,
    monthlyPayroll: '$0.00',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardMetrics = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [empSummaryRes, attendanceSummaryRes, payrollSummaryRes, headcountRes] =
          await Promise.allSettled([
            axiosClient.get('/reports/employees/summary'),
            axiosClient.get(`/attendance/summary?month=${month}&year=${year}`),
            axiosClient.get(`/reports/payroll/summary?month=${month}&year=${year}`),
            axiosClient.get('/reports/departments/headcount'),
          ]);

        if (!isMounted) return;

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

        const totalEmp = Number(empData?.totalEmployees ?? 0);
        const activeEmp = Number(empData?.activeEmployees ?? 0);
        const onLeaveEmp = Number(
          empData?.onLeaveEmployees ?? attData?.onLeaveCount ?? 0
        );

        // Real attendance calculation
        const presentCount = Number(
          attData?.presentCount ?? (totalEmp > 0 ? activeEmp - onLeaveEmp : 0)
        );
        const rate =
          totalEmp > 0
            ? `${Math.min(100, Math.round((presentCount / totalEmp) * 100))}%`
            : '0%';

        // Real monthly salary
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
          attendanceRate: rate,
          onLeave: onLeaveEmp,
          monthlyPayroll: `$${payrollAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        });
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

  const formattedDate = new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Access Denied RBAC Warning */}
      {accessDeniedNotice && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              {lang === 'km'
                ? 'លោកអ្នកមិនមានសិទ្ធិ (Role) គ្រប់គ្រាន់ក្នុងការចូលទៅកាន់ទំព័រនោះទេ (សម្រាប់តែ System Administrator)។'
                : 'Access Denied: You do not have administrator permissions to access that module.'}
            </span>
          </div>
          <button
            onClick={() => setAccessDeniedNotice(false)}
            className="text-xs text-rose-400 hover:text-white px-2 py-1 rounded-lg hover:bg-rose-500/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-[#0b1325]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {lang === 'km' ? 'សូមស្វាគមន៍, ' : 'Welcome back, '}
            <span className="text-blue-400 font-bold">
              {user?.username ? (user.username === 'admin' ? 'System Administrator' : user.username) : 'System Administrator'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            {t('appSubtitle')} • {t('dashboardBannerSubtitle')}
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium bg-[#070a13] px-3.5 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {formattedDate}
        </div>
      </div>

      {/* 4 Real Metric Cards from Backend DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('statTotalEmployees')}
          value={isLoading ? '...' : String(metrics.totalEmployees)}
          trend={metrics.totalEmployees > 0 ? `${metrics.activeEmployees} ${t('statusActive')}` : undefined}
          trendType="up"
          subtitle={t('statTotalEmployees')}
          icon={Users}
          colorScheme="blue"
        />

        <StatCard
          title={t('statPresentToday')}
          value={isLoading ? '...' : String(metrics.presentToday)}
          trend={metrics.attendanceRate}
          trendType="up"
          subtitle={t('statAttendanceRate')}
          icon={UserCheck}
          colorScheme="emerald"
        />

        <StatCard
          title={t('statOnLeave')}
          value={isLoading ? '...' : String(metrics.onLeave)}
          trend={metrics.onLeave > 0 ? `${metrics.onLeave} ${t('approved')}` : undefined}
          trendType={metrics.onLeave > 0 ? 'down' : 'up'}
          subtitle={t('today')}
          icon={CalendarOff}
          colorScheme="amber"
        />

        <StatCard
          title={t('statMonthlyPayroll')}
          value={isLoading ? '...' : metrics.monthlyPayroll}
          trend={metrics.totalEmployees > 0 ? t('statusActive') : undefined}
          trendType="up"
          subtitle={t('statMonthlyPayroll')}
          icon={CircleDollarSign}
          colorScheme="indigo"
        />
      </div>

      {/* Quick Actions Bar with Button Loading Feedback */}
      <QuickActions />

      {/* Two Column Grid: Real Attendance Table & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        <div className="lg:col-span-1">
          <DepartmentChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
