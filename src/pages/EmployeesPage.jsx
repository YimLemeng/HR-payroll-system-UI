import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import axiosClient from '../api/axiosClient';
import Button from '../components/common/Button';
import ModalPortal from '../components/common/ModalPortal';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Eye,
  CheckCircle2,
  X,
  Building2,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', labelEn: 'Active', labelKm: 'កំពុងបម្រើការ', color: 'emerald' },
  { value: 'ON_LEAVE', labelEn: 'On Leave', labelKm: 'សុំច្បាប់', color: 'amber' },
  { value: 'INACTIVE', labelEn: 'Inactive', labelKm: 'អសកម្ម', color: 'slate' },
  { value: 'TERMINATED', labelEn: 'Terminated', labelKm: 'បញ្ចប់ការងារ', color: 'rose' }
];

const GENDER_OPTIONS = [
  { value: 'MALE', labelEn: 'Male', labelKm: 'ប្រុស' },
  { value: 'FEMALE', labelEn: 'Female', labelKm: 'ស្រី' }
];

const initialFormState = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  gender: 'MALE',
  dateOfBirth: '1995-01-01',
  email: '',
  phone: '',
  address: '',
  hireDate: new Date().toISOString().split('T')[0],
  jobTitle: '',
  departmentId: '',
  basicSalary: '',
  employmentStatus: 'ACTIVE'
};

const EmployeesPage = () => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Load Departments for select dropdown & filter
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axiosClient.get('/departments');
      if (Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  }, []);

  // Fetch Employees from Backend
  const fetchEmployees = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      let endpoint = '/employees';
      const params = new URLSearchParams();

      if (searchKeyword.trim()) {
        endpoint = '/employees/search';
        params.append('keyword', searchKeyword.trim());
      } else {
        if (selectedDept) params.append('departmentId', selectedDept);
        if (selectedStatus) params.append('status', selectedStatus);
      }

      params.append('size', '50');
      const url = `${endpoint}?${params.toString()}`;
      const res = await axiosClient.get(url);

      const items = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setEmployees(items);
      setTotalCount(res.data?.totalElements ?? items.length);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchKeyword, selectedDept, selectedStatus]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [fetchDepartments, fetchEmployees]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleOpenCreateModal = () => {
    // Generate sample employee code
    const nextCode = `EMP${String(totalCount + 1).padStart(3, '0')}`;
    setFormData({
      ...initialFormState,
      employeeCode: nextCode,
      departmentId: ''
    });
    setFormErrors({});
    setModalMode('create');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setFormData({
      employeeCode: emp.employeeCode || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      gender: emp.gender || 'MALE',
      dateOfBirth: emp.dateOfBirth || '1995-01-01',
      email: emp.email || '',
      phone: emp.phone || '',
      address: emp.address || '',
      hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
      jobTitle: emp.jobTitle || '',
      departmentId: emp.departmentId ? String(emp.departmentId) : '',
      basicSalary: emp.basicSalary !== undefined ? String(emp.basicSalary) : '',
      employmentStatus: emp.employmentStatus || 'ACTIVE'
    });
    setFormErrors({});
    setModalMode('edit');
    setEditingId(emp.id);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employeeCode.trim()) errors.employeeCode = 'Employee Code is required';
    if (!formData.firstName.trim()) errors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last Name is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.hireDate) errors.hireDate = 'Hire date is required';
    if (!formData.jobTitle.trim()) errors.jobTitle = 'Job title is required';
    if (!formData.departmentId) {
      errors.departmentId = lang === 'km' ? 'សូមជ្រើសរើសដេប៉ាតឺម៉ង់' : 'Please select a department';
    }
    if (formData.basicSalary === '' || isNaN(Number(formData.basicSalary)) || Number(formData.basicSalary) < 0) {
      errors.basicSalary = 'Valid positive salary is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email format is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      employeeCode: formData.employeeCode.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      hireDate: formData.hireDate,
      jobTitle: formData.jobTitle.trim(),
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      basicSalary: Number(formData.basicSalary),
      employmentStatus: formData.employmentStatus
    };

    const loadingText = modalMode === 'create'
      ? (lang === 'km' ? 'កំពុងបង្កើតបុគ្គលិកថ្មី...' : 'Creating employee record...')
      : (lang === 'km' ? 'កំពុងរក្សាទុកព័ត៌មានបុគ្គលិក...' : 'Updating employee details...');

    await withLoading(loadingText, async () => {
      try {
        if (modalMode === 'create') {
          await axiosClient.post('/employees', payload);
        } else {
          await axiosClient.put(`/employees/${editingId}`, payload);
        }

        setIsModalOpen(false);
        setFeedbackMessage(
          lang === 'km'
            ? 'បានរក្សាទុកព័ត៌មានបុគ្គលិកដោយជោគជ័យ!'
            : 'Employee record saved successfully!'
        );
        fetchEmployees(true);
        setTimeout(() => setFeedbackMessage(null), 4000);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          (err.response?.data?.validationErrors
            ? Object.values(err.response.data.validationErrors).join(', ')
            : 'Failed to save employee. Please check inputs.');
        alert(`Error: ${errorMsg}`);
      }
    }, 600);
  };

  const handleQuickStatusChange = async (emp, newStatus) => {
    if (emp.employmentStatus === newStatus) return;

    await withLoading(
      lang === 'km' ? `កំពុងកែប្រែស្ថានភាពទៅជា ${newStatus}...` : `Updating status to ${newStatus}...`,
      async () => {
        try {
          await axiosClient.patch(`/employees/${emp.id}/status`, {
            employmentStatus: newStatus
          });
          fetchEmployees(true);
          setFeedbackMessage(
            lang === 'km'
              ? `បានកែប្រែស្ថានភាព ${emp.fullName || emp.firstName} ដោយជោគជ័យ!`
              : `Status updated successfully for ${emp.fullName || emp.firstName}!`
          );
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to update status');
        }
      },
      500
    );
  };

  const getStatusBadge = (status) => {
    const config = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    const label = lang === 'km' ? config.labelKm : config.labelEn;

    const styles = {
      emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[config.color] || styles.slate}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-md shadow-blue-500/10">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {t('employeesTitle')}
              </h1>
              <p className="text-xs text-slate-400">
                {t('employeesSubtitle')} ({totalCount} {lang === 'km' ? 'នាក់' : 'records'})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchEmployees()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            {t('addEmployee')}
          </Button>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 shadow-md">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={t('searchEmployeesPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-[#080d1a] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Department Filter */}
        <div className="sm:col-span-4">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700/70 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">{t('filterDepartment')}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700/70 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">{t('filterStatus')}</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {lang === 'km' ? st.labelKm : st.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / Empty State Card */}
      <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">{t('loading')}</p>
          </div>
        ) : employees.length === 0 ? (
          /* Rich Empty State */
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/70 text-slate-400 flex items-center justify-center shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">
                {t('noEmployeesFound')}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t('noEmployeesSubtitle')}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreateModal}
            >
              {t('addFirstEmployee')}
            </Button>
          </div>
        ) : (
          /* Real Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#080d1a] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">{t('employeeCode')}</th>
                  <th className="py-3.5 px-4">{t('fullName')}</th>
                  <th className="py-3.5 px-4">{t('department')}</th>
                  <th className="py-3.5 px-4">{t('jobTitle')}</th>
                  <th className="py-3.5 px-4">{t('basicSalary')}</th>
                  <th className="py-3.5 px-4">{t('employmentStatus')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp) => {
                  const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase() || 'EM';
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-400">
                        {emp.employeeCode}
                      </td>

                      {/* Employee Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                            </div>
                            <div className="text-xs text-slate-400">
                              {emp.email || emp.phone || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {emp.departmentName || 'General'}
                        </span>
                      </td>

                      {/* Job Title */}
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {emp.jobTitle}
                      </td>

                      {/* Basic Salary */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ${Number(emp.basicSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(emp.employmentStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            title={t('view')}
                            onClick={() => setViewingEmployee(emp)}
                            className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title={t('edit')}
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-7 sm:p-9 space-y-6 my-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {modalMode === 'create' ? t('addEmployee') : t('editEmployee')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {modalMode === 'create'
                        ? (lang === 'km' ? 'បញ្ចូលបុគ្គលិកថ្មីទៅក្នុងប្រព័ន្ធ' : 'Add a new employee to the system')
                        : (lang === 'km' ? `កែប្រែព័ត៌មានបុគ្គលិក ${formData.employeeCode}` : `Update employee record for ${formData.employeeCode}`)}
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

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Employee Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('employeeCode')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. EMP001"
                  />
                  {formErrors.employeeCode && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.employeeCode}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('firstName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Sok"
                  />
                  {formErrors.firstName && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('lastName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Dara"
                  />
                  {formErrors.lastName && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('gender')} *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {lang === 'km' ? g.labelKm : g.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('dateOfBirth')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('hireDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.hireDate && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.hireDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="dara.sok@company.com"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="012 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Job Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('jobTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Senior Software Engineer"
                  />
                  {formErrors.jobTitle && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.jobTitle}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('department')} *
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => {
                      setFormData({ ...formData, departmentId: e.target.value });
                      if (formErrors.departmentId) {
                        setFormErrors({ ...formErrors, departmentId: undefined });
                      }
                    }}
                    className={`w-full px-3 py-2 bg-[#080d1a] border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                      formErrors.departmentId
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-700 focus:border-blue-500'
                    }`}
                  >
                    <option value="" disabled hidden>
                      {t('selectDepartment')}
                    </option>
                    <option value="">
                      {t('selectDepartment')}
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                  {formErrors.departmentId && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.departmentId}</p>
                  )}
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('basicSalary')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="1200.00"
                  />
                  {formErrors.basicSalary && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.basicSalary}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('employmentStatus')} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((st) => {
                    const isSelected = formData.employmentStatus === st.value;
                    return (
                      <button
                        type="button"
                        key={st.value}
                        onClick={() => setFormData({ ...formData, employmentStatus: st.value })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-[#080d1a] text-slate-400 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        {lang === 'km' ? st.labelKm : st.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Phnom Penh, Cambodia"
                />
              </div>

              {/* Actions Footer */}
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

      {/* VIEW DETAILS MODAL */}
      {viewingEmployee && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {viewingEmployee.firstName?.[0]}
                  {viewingEmployee.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {viewingEmployee.fullName || `${viewingEmployee.firstName} ${viewingEmployee.lastName}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-blue-400">
                      {viewingEmployee.employeeCode}
                    </span>
                    <span className="text-slate-500">•</span>
                    {getStatusBadge(viewingEmployee.employmentStatus)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">{t('jobTitle')}</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  {viewingEmployee.jobTitle}
                </span>
              </div>

              <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">{t('department')}</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  {viewingEmployee.departmentName || 'General'}
                </span>
              </div>

              <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">{t('basicSalary')}</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  ${Number(viewingEmployee.basicSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">{t('hireDate')}</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {viewingEmployee.hireDate}
                </span>
              </div>

              <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800/80 col-span-2">
                <span className="text-slate-400 block mb-1">{t('email')}</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {viewingEmployee.email || '—'}
                </span>
              </div>

              <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800/80 col-span-2">
                <span className="text-slate-400 block mb-1">{t('phone')} & {t('address')}</span>
                <div className="text-white font-medium space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingEmployee.phone || '—'}</span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    {viewingEmployee.address || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Update in View Modal */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                {t('updateStatus')}:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st.value}
                    disabled={viewingEmployee.employmentStatus === st.value}
                    onClick={() => {
                      handleQuickStatusChange(viewingEmployee, st.value);
                      setViewingEmployee({ ...viewingEmployee, employmentStatus: st.value });
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                      viewingEmployee.employmentStatus === st.value
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500 cursor-default'
                        : 'bg-[#080d1a] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {lang === 'km' ? st.labelKm : st.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default EmployeesPage;
