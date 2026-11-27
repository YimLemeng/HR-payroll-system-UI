import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axiosClient from '../api/axiosClient';
import { useTableSort } from '../utils/useTableSort';
import Button from '../components/common/Button';
import ModalPortal from '../components/common/ModalPortal';
import {
  CalendarCheck,
  Plus,
  RefreshCw,
  Edit3,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  X,
  CheckCircle2,
  Users,
  ArrowUpDown
} from 'lucide-react';

const ATTENDANCE_STATUSES = [
  { value: 'PRESENT', labelEn: 'Present', labelKm: 'មានវត្តមាន', color: 'emerald' },
  { value: 'LATE', labelEn: 'Late', labelKm: 'មកយឺត', color: 'amber' },
  { value: 'ABSENT', labelEn: 'Absent', labelKm: 'អវត្តមាន', color: 'rose' },
  { value: 'HALF_DAY', labelEn: 'Half Day', labelKm: 'កន្លះថ្ងៃ', color: 'indigo' },
  { value: 'ON_LEAVE', labelEn: 'On Leave', labelKm: 'សុំច្បាប់', color: 'slate' }
];

const AttendancePage = () => {
  const { t, lang } = useLanguage();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [filterDate, setFilterDate] = useState('');

  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    halfDayCount: 0,
    onLeaveCount: 0,
    totalOvertimeHours: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    attendanceDate: now.toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: '',
    overtimeHours: '0',
    remarks: ''
  });
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Load Employees for selector
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axiosClient.get('/employees?size=100');
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setEmployees(list);
    } catch (err) {
      console.error('Failed to load employees for attendance:', err);
    }
  }, []);

  // Fetch Attendance Records & Monthly Summary
  const fetchAttendanceData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [recordsRes, summaryRes] = await Promise.allSettled([
        filterDate
          ? axiosClient.get(`/attendance?date=${filterDate}&size=50`)
          : axiosClient.get(`/attendance?size=50`),
        axiosClient.get(`/attendance/summary?month=${selectedMonth}&year=${selectedYear}`)
      ]);

      if (recordsRes.status === 'fulfilled') {
        const data = recordsRes.value?.data;
        setAttendances(data?.content || (Array.isArray(data) ? data : []));
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      await new Promise((r) => setTimeout(r, 350));
      setIsLoading(false);
    }
  }, [filterDate, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceData();
  }, [fetchEmployees, fetchAttendanceData]);

  const handleOpenCreateModal = () => {
    setFormData({
      employeeId: '',
      attendanceDate: now.toISOString().split('T')[0],
      checkIn: '08:00',
      checkOut: '17:00',
      status: '',
      overtimeHours: '0',
      remarks: ''
    });
    setModalMode('create');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (att) => {
    const parseTime = (isoString) => {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        return d.toTimeString().slice(0, 5);
      } catch {
        return '';
      }
    };

    setFormData({
      employeeId: String(att.employeeId || ''),
      attendanceDate: att.attendanceDate || now.toISOString().split('T')[0],
      checkIn: parseTime(att.checkIn),
      checkOut: parseTime(att.checkOut),
      status: att.status || 'PRESENT',
      overtimeHours: String(att.overtimeHours ?? '0'),
      remarks: att.remarks || ''
    });
    setModalMode('edit');
    setEditingId(att.id);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert(lang === 'km' ? 'សូមជ្រើសរើសបុគ្គលិក' : 'Please select an employee');
      return;
    }
    if (!formData.status) {
      alert(lang === 'km' ? 'សូមជ្រើសរើសស្ថានភាព' : 'Please select a status');
      return;
    }

    const toIsoTime = (timeStr, dateStr) => {
      if (!timeStr) return null;
      return new Date(`${dateStr}T${timeStr}:00`).toISOString();
    };

    const payload = {
      employeeId: Number(formData.employeeId),
      attendanceDate: formData.attendanceDate,
      checkIn: toIsoTime(formData.checkIn, formData.attendanceDate),
      checkOut: toIsoTime(formData.checkOut, formData.attendanceDate),
      status: formData.status,
      overtimeHours: Number(formData.overtimeHours || 0),
      remarks: formData.remarks.trim() || null
    };

    try {
      if (modalMode === 'create') {
        await axiosClient.post('/attendance', payload);
      } else {
        await axiosClient.put(`/attendance/${editingId}`, payload);
      }

      setIsModalOpen(false);
      setFeedbackMessage(
        lang === 'km'
          ? 'បានកត់ត្រាវត្តមានដោយជោគជ័យ!'
          : 'Attendance recorded successfully!'
      );
      fetchAttendanceData(true);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record attendance. May be duplicate for this date.');
    }
  };

  const getStatusBadge = (status) => {
    const config = ATTENDANCE_STATUSES.find((s) => s.value === status) || ATTENDANCE_STATUSES[0];
    const label = lang === 'km' ? config.labelKm : config.labelEn;

    const styles = {
      emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[config.color]}`}>
        {label}
      </span>
    );
  };

  const formatTimeOnly = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  const { sortConfig, handleSort, sortedItems: sortedAttendances } = useTableSort(attendances, {
    employeeName: (a) => a.employeeName || '',
    attendanceDate: (a) => a.attendanceDate || '',
    checkIn: (a) => a.checkIn || '',
    checkOut: (a) => a.checkOut || '',
    overtimeHours: (a) => Number(a.overtimeHours || 0),
    status: (a) => a.status || '',
    remarks: (a) => a.remarks || '',
  });

  return (
    <div className="space-y-5">
      {/* Top Page Title, Breadcrumb & Actions (Admindek Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('attendanceTitle')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Link to="/dashboard" className="hover:text-[#3c8dbc] hover:underline transition-colors">{t('navDashboard')}</Link>
            <span>/</span>
            <span>{lang === 'km' ? 'ធនធានមនុស្ស' : 'Workforce'}</span>
            <span>/</span>
            <span className="text-slate-700 font-medium">{t('navAttendance')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchAttendanceData()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            {t('recordAttendance')}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Monthly Summary Metric Cards (Admindek Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: t('presentCount'), value: summary.presentCount || 0, icon: UserCheck, iconBg: 'bg-emerald-50 text-emerald-600' },
          { label: t('lateCount'), value: summary.lateCount || 0, icon: Clock, iconBg: 'bg-amber-50 text-amber-600' },
          { label: t('absentCount'), value: summary.absentCount || 0, icon: UserX, iconBg: 'bg-rose-50 text-rose-600' },
          { label: t('halfDayCount'), value: summary.halfDayCount || 0, icon: CalendarCheck, iconBg: 'bg-indigo-50 text-indigo-600' },
          { label: t('totalOvertime'), value: `${summary.totalOvertimeHours || 0}h`, icon: Clock, iconBg: 'bg-blue-50 text-blue-600', span: 'col-span-2 sm:col-span-1' },
        ].map((card) => {
          const CardIcon = card.icon;
          return (
            <div key={card.label} className={`bg-white border border-slate-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-start justify-between ${card.span || ''}`}>
              <div>
                <span className="text-xs font-medium text-slate-500 block">{card.label}</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">{card.value}</span>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <CardIcon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified White Table Card with Integrated Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">{t('filterDate')}:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {lang === 'km' ? `ខែ ${m}` : `Month ${m}`}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">{t('loading')}</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/70 text-slate-400 flex items-center justify-center">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">
                {t('noAttendanceRecords')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Log clock-in times or manual attendance corrections using the button below.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreateModal}
            >
              {t('recordAttendance')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-[13px] font-semibold text-slate-600 border-b border-slate-200/80">
                <tr>
                  {[
                    { key: 'employeeName', label: t('colEmployee') },
                    { key: 'attendanceDate', label: t('colDate') },
                    { key: 'checkIn', label: t('checkInTime') },
                    { key: 'checkOut', label: t('checkOutTime') },
                    { key: 'overtimeHours', label: t('overtimeHours') },
                    { key: 'status', label: t('colStatus') },
                    { key: 'remarks', label: t('remarks') },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="py-3.5 px-5 cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        <ArrowUpDown
                          className={`w-3.5 h-3.5 transition-colors ${
                            sortConfig.key === col.key ? 'text-blue-600' : 'text-slate-300'
                          }`}
                        />
                      </span>
                    </th>
                  ))}
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13.5px]">
                {sortedAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {att.employeeName || `Employee #${att.employeeId}`}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {att.employeeCode || `ID: ${att.employeeId}`}
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {att.attendanceDate}
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {formatTimeOnly(att.checkIn)}
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {formatTimeOnly(att.checkOut)}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-800 whitespace-nowrap">
                      {att.overtimeHours ? `${att.overtimeHours}h` : '0h'}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      {getStatusBadge(att.status)}
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-500 max-w-xs truncate">
                      {att.remarks || '—'}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <button
                        title={t('edit')}
                        onClick={() => handleOpenEditModal(att)}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD / EDIT ATTENDANCE MODAL */}
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-2xl sm:max-w-3xl shadow-2xl p-7 sm:p-9 space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {modalMode === 'create' ? t('recordAttendance') : t('editAttendance')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {lang === 'km' ? 'កត់ត្រាម៉ោងការងារប្រចាំថ្ងៃរបស់បុគ្គលិក' : 'Log employee daily working hours'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Employee Selector */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('colEmployee')} *
                    </label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employeeCode} - {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attendance Date */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('colDate')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.attendanceDate}
                      onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Check-In and Check-Out Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('checkInTime')}
                    </label>
                    <input
                      type="time"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('checkOutTime')}
                    </label>
                    <input
                      type="time"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Status and Overtime */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('colStatus')} *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="" disabled hidden>
                        {lang === 'km' ? '-- ជ្រើសរើសស្ថានភាព --' : '-- Select Status --'}
                      </option>
                      <option value="">
                        {lang === 'km' ? '-- ជ្រើសរើសស្ថានភាព --' : '-- Select Status --'}
                      </option>
                      {ATTENDANCE_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {lang === 'km' ? st.labelKm : st.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('overtimeHours')}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.overtimeHours}
                      onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    {t('remarks')}
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. Approved overtime for project release"
                    className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsModalOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={CheckCircle2}
                  >
                    {t('save')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default AttendancePage;
