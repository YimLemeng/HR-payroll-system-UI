import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axiosClient from '../api/axiosClient';
import { useTableSort } from '../utils/useTableSort';
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
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

const DepartmentsPage = () => {
  const { t, lang } = useLanguage();

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
      await new Promise((r) => setTimeout(r, 350));
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
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDept) return;

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
  };

  const filteredDepartments = departments.filter((dept) => {
    const q = searchKeyword.toLowerCase();
    return (
      (dept.departmentName || '').toLowerCase().includes(q) ||
      (dept.description || '').toLowerCase().includes(q)
    );
  });

  const { sortConfig, handleSort, sortedItems: sortedDepartments } = useTableSort(filteredDepartments, {
    id: (d) => Number(d.id || 0),
    departmentName: (d) => d.departmentName || '',
    description: (d) => d.description || '',
    employeeCount: (d) => Number(d.employeeCount ?? 0),
  });

  return (
    <div className="space-y-5">
      {/* Top Page Title, Breadcrumb & Actions (Admindek Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('departmentsTitle')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Link to="/dashboard" className="hover:text-[#3c8dbc] hover:underline transition-colors">{t('navDashboard')}</Link>
            <span>/</span>
            <span>{lang === 'km' ? 'ធនធានមនុស្ស' : 'Workforce'}</span>
            <span>/</span>
            <span className="text-slate-700 font-medium">
              {t('navDepartments')} ({departments.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchDepartments()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            {t('addDepartment')}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Unified White Table Card with Integrated Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-white">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={lang === 'km' ? 'ស្វែងរកដេប៉ាតឺម៉ង់...' : 'Search department by name or description...'}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500">{t('loading')}</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-900">
                {t('noDepartmentsFound')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-[13px] font-semibold text-slate-600 border-b border-slate-200/80">
                <tr>
                  {[
                    { key: 'id', label: 'ID' },
                    { key: 'departmentName', label: t('colDepartment') },
                    { key: 'description', label: lang === 'km' ? 'ការពិពណ៌នា' : 'Description' },
                    { key: 'employeeCount', label: t('headcount') },
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
                {sortedDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      #{dept.id}
                    </td>
                    <td className="py-3 px-5 font-medium text-slate-800 whitespace-nowrap">
                      {dept.departmentName}
                    </td>
                    <td className="py-3 px-5 text-slate-500 max-w-md truncate">
                      {dept.description || '—'}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-800 whitespace-nowrap">
                      {dept.employeeCount ?? 0} {lang === 'km' ? 'បុគ្គលិក' : 'Staff Members'}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(dept)}
                          title={t('edit')}
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingDept(dept)}
                          title={t('deleteDepartment')}
                          className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
