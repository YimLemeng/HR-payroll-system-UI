import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import axiosClient from '../api/axiosClient';
import Button from '../components/common/Button';
import ModalPortal from '../components/common/ModalPortal';
import {
  CalendarClock,
  Plus,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  MessageSquare,
  Ban,
  Clock,
  XCircle
} from 'lucide-react';

const LEAVE_TYPES = [
  { value: 'ANNUAL', labelEn: 'Annual Leave', labelKm: 'ច្បាប់ប្រចាំឆ្នាំ' },
  { value: 'SICK', labelEn: 'Sick Leave', labelKm: 'ច្បាប់ឈឺ' },
  { value: 'UNPAID', labelEn: 'Unpaid Leave', labelKm: 'ច្បាប់ឥតប្រាក់ខែ' },
  { value: 'PERSONAL', labelEn: 'Personal Leave', labelKm: 'ច្បាប់ផ្ទាល់ខ្លួន' },
  { value: 'MATERNITY', labelEn: 'Maternity Leave', labelKm: 'ច្បាប់សម្រាលកូន' },
  { value: 'PATERNITY', labelEn: 'Paternity Leave', labelKm: 'ច្បាប់មើលថែភរិយា' }
];

const LEAVE_STATUSES = [
  { value: 'PENDING', labelEn: 'Pending', labelKm: 'រង់ចាំអនុម័ត', color: 'amber' },
  { value: 'APPROVED', labelEn: 'Approved', labelKm: 'បានអនុម័ត', color: 'emerald' },
  { value: 'REJECTED', labelEn: 'Rejected', labelKm: 'បានបដិសេធ', color: 'rose' },
  { value: 'CANCELLED', labelEn: 'Cancelled', labelKm: 'បានបោះបង់', color: 'slate' }
];

const LeavesPage = () => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null); // { id, action: 'approve' | 'reject' }
  const [cancelModalLeave, setCancelModalLeave] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'ANNUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axiosClient.get('/employees?size=100');
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setEmployees(list);
    } catch (err) {
      console.error('Failed to load employees for leave request:', err);
    }
  }, []);

  // Fetch leave requests
  const fetchLeaves = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const url = selectedStatus
        ? `/leaves?status=${selectedStatus}&size=50`
        : `/leaves?size=50`;
      const res = await axiosClient.get(url);
      const items = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setLeaves(items);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, [fetchEmployees, fetchLeaves]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Please select an employee');
      return;
    }
    if (!formData.leaveType) {
      alert(lang === 'km' ? 'សូមជ្រើសរើសប្រភេទច្បាប់' : 'Please select a leave type');
      return;
    }
    if (!formData.reason.trim()) {
      alert('Please enter a reason for the leave');
      return;
    }

    const payload = {
      employeeId: Number(formData.employeeId),
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason.trim()
    };

    await withLoading(
      lang === 'km' ? 'កំពុងដាក់ពាក្យស្នើសុំច្បាប់...' : 'Submitting leave request...',
      async () => {
        try {
          await axiosClient.post('/leaves', payload);
          setIsSubmitModalOpen(false);
          setFormData({
            employeeId: employees[0]?.id ? String(employees[0].id) : '',
            leaveType: 'ANNUAL',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            reason: ''
          });
          setFeedbackMessage(
            lang === 'km'
              ? 'បានដាក់ពាក្យស្នើសុំច្បាប់ដោយជោគជ័យ!'
              : 'Leave request submitted successfully!'
          );
          fetchLeaves(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to submit leave request');
        }
      },
      500
    );
  };

  const handleReviewAction = async () => {
    if (!reviewModalData) return;
    const { id, action } = reviewModalData;
    const endpoint = `/leaves/${id}/${action}`;

    const loadingText = action === 'approve'
      ? (lang === 'km' ? 'កំពុងអនុម័តច្បាប់...' : 'Approving leave request...')
      : (lang === 'km' ? 'កំពុងបដិសេធច្បាប់...' : 'Rejecting leave request...');

    await withLoading(loadingText, async () => {
      try {
        await axiosClient.patch(endpoint, {
          reviewComment: reviewComment.trim() || null
        });

        setReviewModalData(null);
        setReviewComment('');
        setFeedbackMessage(
          lang === 'km'
            ? `បាន${action === 'approve' ? 'អនុម័ត' : 'បដិសេធ'}ច្បាប់ដោយជោគជ័យ!`
            : `Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
        );
        fetchLeaves(true);
        setTimeout(() => setFeedbackMessage(null), 4000);
      } catch (err) {
        alert(err.response?.data?.message || `Failed to ${action} leave request`);
      }
    }, 500);
  };

  const handleCancelLeave = async (leaveId) => {
    await withLoading(
      lang === 'km' ? 'កំពុងបោះបង់ច្បាប់...' : 'Cancelling leave...',
      async () => {
        try {
          await axiosClient.patch(`/leaves/${leaveId}/cancel`);
          setFeedbackMessage(
            lang === 'km'
              ? 'បានបោះបង់ពាក្យសុំច្បាប់ដោយជោគជ័យ!'
              : 'Leave request cancelled successfully!'
          );
          fetchLeaves(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to cancel leave');
        }
      },
      500
    );
  };

  const getStatusBadge = (status) => {
    const config = LEAVE_STATUSES.find((s) => s.value === status) || LEAVE_STATUSES[0];
    const label = lang === 'km' ? config.labelKm : config.labelEn;

    const styles = {
      amber: {
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: Clock
      },
      emerald: {
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: CheckCircle2
      },
      rose: {
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: XCircle
      },
      slate: {
        badge: 'bg-slate-800 text-slate-300 border-slate-700/80 shadow-sm',
        icon: Ban
      }
    };

    const style = styles[config.color] || styles.slate;
    const IconComponent = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
        <IconComponent className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>
    );
  };

  const getLeaveTypeLabel = (type) => {
    const found = LEAVE_TYPES.find((t) => t.value === type);
    return lang === 'km' ? (found?.labelKm || type) : (found?.labelEn || type);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md shadow-amber-500/10">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t('leavesTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('leavesSubtitle')} ({leaves.length} {lang === 'km' ? 'ពាក្យស្នើសុំ' : 'requests'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchLeaves()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setFormData({
                employeeId: '',
                leaveType: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                reason: ''
              });
              setIsSubmitModalOpen(true);
            }}
          >
            {t('submitLeave')}
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

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStatus('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            selectedStatus === ''
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
              : 'bg-[#0d1527] text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          {lang === 'km' ? 'ទាំងអស់' : 'All Requests'}
        </button>
        {LEAVE_STATUSES.map((st) => (
          <button
            key={st.value}
            onClick={() => setSelectedStatus(st.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedStatus === st.value
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-[#0d1527] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {lang === 'km' ? st.labelKm : st.labelEn}
          </button>
        ))}
      </div>

      {/* Leaves Records Table */}
      <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">{t('loading')}</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/70 text-slate-400 flex items-center justify-center">
              <CalendarClock className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">
                {t('noLeavesFound')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Employee leave submissions and approvals will appear here.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsSubmitModalOpen(true)}
            >
              {t('submitLeave')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#080d1a] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">{t('colEmployee')}</th>
                  <th className="py-3.5 px-4">{t('leaveType')}</th>
                  <th className="py-3.5 px-4">{t('startDate')}</th>
                  <th className="py-3.5 px-4">{t('endDate')}</th>
                  <th className="py-3.5 px-4">{t('reason')}</th>
                  <th className="py-3.5 px-4">{t('colStatus')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {leave.employeeName || `Employee #${leave.employeeId}`}
                      </div>
                      <div className="text-xs font-mono text-blue-400">
                        {leave.employeeCode || `ID: ${leave.employeeId}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                        {getLeaveTypeLabel(leave.leaveType)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {leave.startDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {leave.endDate}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'PENDING' ? (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            title={t('approve')}
                            onClick={() => setReviewModalData({ id: leave.id, action: 'approve' })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('approve')}</span>
                          </button>
                          <button
                            title={t('reject')}
                            onClick={() => setReviewModalData({ id: leave.id, action: 'reject' })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all shadow-sm active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{t('reject')}</span>
                          </button>
                        </div>
                      ) : leave.status === 'APPROVED' ? (
                        <button
                          onClick={() => setCancelModalLeave(leave)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm shadow-rose-500/10 active:scale-95 group"
                          title={lang === 'km' ? 'បោះបង់ច្បាប់ឈប់សម្រាកនេះ' : 'Cancel this leave request'}
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
                          <span>{lang === 'km' ? 'បោះបង់' : 'Cancel'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUBMIT LEAVE MODAL */}
      {isSubmitModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-2xl sm:max-w-3xl shadow-2xl p-7 sm:p-9 space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <CalendarClock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {t('submitLeave')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {lang === 'km' ? 'ដាក់ពាក្យស្នើសុំច្បាប់ឈប់សម្រាករបស់បុគ្គលិក' : 'Submit employee absence request'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitLeave} className="space-y-5">
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
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employeeCode} - {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Leave Type */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('leaveType')} *
                    </label>
                    <select
                      required
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="" disabled hidden>
                        {lang === 'km' ? '-- ជ្រើសរើសប្រភេទច្បាប់ --' : '-- Select Leave Type --'}
                      </option>
                      <option value="">
                        {lang === 'km' ? '-- ជ្រើសរើសប្រភេទច្បាប់ --' : '-- Select Leave Type --'}
                      </option>
                      {LEAVE_TYPES.map((lt) => (
                        <option key={lt.value} value={lt.value}>
                          {lang === 'km' ? lt.labelKm : lt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('startDate')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('endDate')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    {t('reason')} *
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for requesting time off..."
                    className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsSubmitModalOpen(false)}
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

      {/* REVIEW (APPROVE / REJECT) MODAL */}
      {reviewModalData && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 my-auto">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  reviewModalData.action === 'approve'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {reviewModalData.action === 'approve' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white capitalize">
                    {reviewModalData.action === 'approve' ? t('approve') : t('reject')} {t('navLeaves')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Provide optional review comments
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('reviewerComment')}
                </label>
                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Approved. Have a good break."
                  className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalData(null)}
                >
                  {t('cancel')}
                </Button>
                <button
                  onClick={handleReviewAction}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors shadow-md ${
                    reviewModalData.action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  {reviewModalData.action === 'approve' ? t('approve') : t('reject')}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* CANCEL LEAVE CONFIRMATION MODAL */}
      {cancelModalLeave && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 space-y-5 my-auto">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0 shadow-lg shadow-rose-500/10">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === 'km' ? 'បោះបង់ពាក្យសុំច្បាប់' : 'Cancel Leave Request'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'km' ? 'តើអ្នកប្រាកដថាចង់បោះបង់ច្បាប់ដែលបានអនុម័តនេះមែនទេ?' : 'Are you sure you want to cancel this approved leave?'}
                  </p>
                </div>
              </div>

              {/* Leave details card */}
              <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('colEmployee')}:</span>
                  <span className="font-semibold text-white">
                    {cancelModalLeave.employeeName} ({cancelModalLeave.employeeCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('leaveType')}:</span>
                  <span className="font-semibold text-amber-300">
                    {getLeaveTypeLabel(cancelModalLeave.leaveType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('startDate')} - {t('endDate')}:</span>
                  <span className="font-mono text-slate-200">
                    {cancelModalLeave.startDate} → {cancelModalLeave.endDate}
                  </span>
                </div>
                {cancelModalLeave.reason && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 block mb-1">{t('reason')}:</span>
                    <p className="text-slate-300 italic bg-[#0d1527] p-2 rounded-lg border border-slate-800">
                      "{cancelModalLeave.reason}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCancelModalLeave(null)}
                >
                  {lang === 'km' ? 'ទេ, រក្សាទុក' : 'Keep Leave'}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  icon={Ban}
                  onClick={async () => {
                    const id = cancelModalLeave.id;
                    setCancelModalLeave(null);
                    await handleCancelLeave(id);
                  }}
                >
                  {lang === 'km' ? 'បញ្ជាក់ការបោះបង់' : 'Confirm Cancel'}
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default LeavesPage;
