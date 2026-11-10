import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import axiosClient from '../api/axiosClient';
import Button from '../components/common/Button';
import ModalPortal from '../components/common/ModalPortal';
import {
  Building2,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  X,
  Clock,
  Search,
  AlertTriangle
} from 'lucide-react';

const DepartmentsPage = () => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ departmentName: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deletingDept, setDeletingDept] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchDepartments = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await axiosClient.get('/departments');
      if (Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenCreateModal = () => {
    setFormData({ departmentName: '', description: '' });
    setFormErrors({});
    setModalMode('create');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setFormData({
      departmentName: dept.departmentName || '',
      description: dept.description || ''
    });
    setFormErrors({});
    setModalMode('edit');
    setEditingId(dept.id);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.departmentName.trim()) {
      errors.departmentName = 'Department name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      departmentName: formData.departmentName.trim(),
      description: formData.description.trim() || null
    };

    const loadingText = modalMode === 'create'
      ? (lang === 'km' ? 'កំពុងបង្កើតដេប៉ាតឺម៉ង់ថ្មី...' : 'Creating new department...')
      : (lang === 'km' ? 'កំពុងកែប្រែដេប៉ាតឺម៉ង់...' : 'Updating department details...');

    await withLoading(loadingText, async () => {
      try {
        if (modalMode === 'create') {
          await axiosClient.post('/departments', payload);
        } else {
          await axiosClient.put(`/departments/${editingId}`, payload);
        }

        setIsModalOpen(false);
        setFeedbackMessage(
          lang === 'km'
            ? 'បានរក្សាទុកដេប៉ាតឺម៉ង់ដោយជោគជ័យ!'
            : 'Department saved successfully!'
        );
        fetchDepartments(true);
        setTimeout(() => setFeedbackMessage(null), 4000);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || 'Failed to save department. Name might be duplicate.';
        alert(`Error: ${errorMsg}`);
      }
    }, 500);
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDept) return;

    await withLoading(
      lang === 'km' ? 'កំពុងលុបដេប៉ាតឺម៉ង់...' : 'Deleting department...',
      async () => {
        try {
          await axiosClient.delete(`/departments/${deletingDept.id}`);
          setDeletingDept(null);
          setFeedbackMessage(
            lang === 'km'
              ? 'បានលុបដេប៉ាតឺម៉ង់ដោយជោគជ័យ!'
              : 'Department deleted successfully!'
          );
          fetchDepartments(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Cannot delete department. Employees are still assigned.');
        }
      },
      500
    );
  };

  const filteredDepartments = departments.filter((dept) => {
    const q = searchKeyword.toLowerCase();
    return (
      (dept.departmentName || '').toLowerCase().includes(q) ||
      (dept.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-md shadow-purple-500/10">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t('departmentsTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('departmentsSubtitle')} ({departments.length} {lang === 'km' ? 'ផ្នែក' : 'divisions'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchDepartments()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            {t('addDepartment')}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search department by name or description..."
          className="w-full pl-10 pr-4 py-2 bg-[#0d1527] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
        />
      </div>

      {/* Departments Grid Cards */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3 bg-[#0d1527] rounded-2xl border border-slate-800/80">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">{t('loading')}</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4 bg-[#0d1527] rounded-2xl border border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/70 text-slate-400 flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white">
              {t('noDepartmentsFound')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add your first organizational department to group your staff members.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            {t('addFirstDepartment')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 font-bold text-sm">
                    {dept.departmentName?.slice(0, 2).toUpperCase() || 'DP'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(dept)}
                      title={t('edit')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingDept(dept)}
                      title={t('deleteDepartment')}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {dept.departmentName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {dept.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    {dept.employeeCount ?? 0} {lang === 'km' ? 'បុគ្គលិក' : 'Staff Members'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>ID #{dept.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT DEPARTMENT MODAL */}
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-2xl sm:max-w-3xl shadow-2xl p-7 sm:p-9 space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {modalMode === 'create' ? t('addDepartment') : t('editDepartment')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {modalMode === 'create'
                        ? (lang === 'km' ? 'បង្កើតនាយកដ្ឋាន ឬក្រុមការងារថ្មី' : 'Create a new organizational team')
                        : (lang === 'km' ? `កែប្រែនាយកដ្ឋាន ${formData.departmentName}` : `Modify ${formData.departmentName}`)}
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
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    {t('departmentName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    placeholder="e.g. Human Resources, Engineering"
                    className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  {formErrors.departmentName && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.departmentName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    {t('departmentDesc')}
                  </label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe the responsibilities of this department..."
                    className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
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

      {/* CONFIRM DELETE MODAL */}
      {deletingDept && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {t('deleteDepartment')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('deleteDepartmentConfirm')} ({deletingDept.departmentName})
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingDept(null)}
                >
                  {t('cancel')}
                </Button>
                <button
                  onClick={handleDeleteDepartment}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-600/20"
                >
                  {t('deleteDepartment')}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default DepartmentsPage;
