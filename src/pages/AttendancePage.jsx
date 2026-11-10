import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import axiosClient from '../api/axiosClient';
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
  Users
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
  const { withLoading } = useLoading();

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

    const loadingText = modalMode === 'create'
      ? (lang === 'km' ? 'កំពុងកត់ត្រាវត្តមាន...' : 'Recording attendance...')
      : (lang === 'km' ? 'កំពុងកែសម្រួលកំណត់ត្រាវត្តមាន...' : 'Updating attendance record...');

    await withLoading(loadingText, async () => {
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
    }, 500);
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md shadow-emerald-500/10">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t('attendanceTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('attendanceSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchAttendanceData()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            {t('recordAttendance')}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Monthly Summary Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">{t('presentCount')}</span>
          <span className="text-xl font-bold text-emerald-400">{summary.presentCount || 0}</span>
        </div>
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">{t('lateCount')}</span>
          <span className="text-xl font-bold text-amber-400">{summary.lateCount || 0}</span>
        </div>
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">{t('absentCount')}</span>
          <span className="text-xl font-bold text-rose-400">{summary.absentCount || 0}</span>
        </div>
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">{t('halfDayCount')}</span>
          <span className="text-xl font-bold text-indigo-400">{summary.halfDayCount || 0}</span>
        </div>
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 block mb-1">{t('totalOvertime')}</span>
          <span className="text-xl font-bold text-blue-400">{summary.totalOvertimeHours || 0}h</span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t('filterDate')}:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3.5 py-2 bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-slate-400 hover:text-white underline ml-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-sm text-slate-200">
          <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">{t('month')}:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {lang === 'km' ? `ខែ ${m}` : `Month ${m}`}
              </option>
            ))}
          </select>
          <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">{t('year')}:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
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
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#080d1a] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">{t('colEmployee')}</th>
                  <th className="py-3.5 px-4">{t('colDate')}</th>
                  <th className="py-3.5 px-4">{t('checkInTime')}</th>
                  <th className="py-3.5 px-4">{t('checkOutTime')}</th>
                  <th className="py-3.5 px-4">{t('overtimeHours')}</th>
                  <th className="py-3.5 px-4">{t('colStatus')}</th>
                  <th className="py-3.5 px-4">{t('remarks')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {att.employeeName || `Employee #${att.employeeId}`}
                      </div>
                      <div className="text-xs font-mono text-blue-400">
                        {att.employeeCode || `ID: ${att.employeeId}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {att.attendanceDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">
                      {formatTimeOnly(att.checkIn)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-blue-400">
                      {formatTimeOnly(att.checkOut)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-400">
                      {att.overtimeHours ? `${att.overtimeHours}h` : '0h'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(att.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {att.remarks || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        title={t('edit')}
                        onClick={() => handleOpenEditModal(att)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
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
