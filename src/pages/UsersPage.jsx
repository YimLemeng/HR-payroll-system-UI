import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import Button from '../components/common/Button';
import ModalPortal from '../components/common/ModalPortal';
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Edit3,
  Power,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  AlertCircle,
  Calendar,
  Shield,
  KeyRound
} from 'lucide-react';

const UsersPage = () => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();
  const { user: currentAuthUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Create HR Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: '',
    role: 'HR',
    active: true,
  });

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await axiosClient.get('/admin/users?size=50');
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = () => {
    setCreateForm({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setCreateErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsCreateModalOpen(true);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.username.trim() || createForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (!createForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errors.email = 'Valid email is required';
    }
    if (!createForm.password || createForm.password.length < 8) {
      errors.password = t('passwordMinLength') || 'Password must be at least 8 characters';
    }
    if (!createForm.confirmPassword) {
      errors.confirmPassword = lang === 'km' ? 'សូមបញ្ចូលបញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm password is required';
    } else if (createForm.password !== createForm.confirmPassword) {
      errors.confirmPassword = lang === 'km' ? 'ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ' : 'Passwords do not match';
    }
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateHrSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    await withLoading(
      lang === 'km' ? 'កំពុងបង្កើតគណនី HR ថ្មី...' : 'Creating new HR specialist account...',
      async () => {
        try {
          await axiosClient.post('/admin/users/hr', {
            username: createForm.username.trim(),
            email: createForm.email.trim(),
            password: createForm.password,
            confirmPassword: createForm.confirmPassword,
          });

          setIsCreateModalOpen(false);
          setFeedbackMessage(
            lang === 'km'
              ? 'បានបង្កើតគណនី HR ថ្មីដោយជោគជ័យ!'
              : 'HR account created successfully!'
          );
          fetchUsers(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          const msg =
            err.response?.data?.message ||
            (err.response?.data?.validationErrors
              ? Object.values(err.response.data.validationErrors).join(', ')
              : 'Failed to create HR account. Username or email may already exist.');
          alert(`Error: ${msg}`);
        }
      },
      600
    );
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setEditForm({
      email: u.email || '',
      role: u.role || 'HR',
      active: u.active ?? true,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    await withLoading(
      lang === 'km' ? 'កំពុងរក្សាទុកការកែប្រែ...' : 'Updating user account...',
      async () => {
        try {
          await axiosClient.put(`/admin/users/${editingUser.id}`, {
            email: editForm.email.trim(),
            role: editForm.role,
            active: editForm.active,
          });

          setEditingUser(null);
          setFeedbackMessage(
            lang === 'km'
              ? 'បានកែប្រែព័ត៌មានគណនីដោយជោគជ័យ!'
              : 'User account updated successfully!'
          );
          fetchUsers(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to update user account');
        }
      },
      500
    );
  };

  const handleToggleStatus = async (u) => {
    const isCurrentAdmin =
      currentAuthUser?.username === u.username ||
      currentAuthUser?.userName === u.username;

    if (isCurrentAdmin && u.active) {
      alert(lang === 'km' ? 'មិនអាចបិទគណនីផ្ទាល់ខ្លួនបានទេ!' : 'Cannot deactivate your own logged-in account!');
      return;
    }

    const nextStatus = !u.active;
    const actionText = nextStatus
      ? (lang === 'km' ? 'បើកដំណើរការគណនី' : 'activate account')
      : (lang === 'km' ? 'បិទដំណើរការគណនី' : 'deactivate account');

    await withLoading(
      lang === 'km' ? `កំពុង${actionText}...` : `Updating status for ${u.username}...`,
      async () => {
        try {
          await axiosClient.put(`/admin/users/${u.id}/status`, {
            active: nextStatus,
          });
          setFeedbackMessage(
            lang === 'km'
              ? `បានកែប្រែស្ថានភាព ${u.username} ទៅជា ${nextStatus ? 'សកម្ម' : 'អសកម្ម'}!`
              : `Account for ${u.username} set to ${nextStatus ? 'Active' : 'Disabled'}!`
          );
          fetchUsers(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to update account status');
        }
      },
      400
    );
  };

  const hrCount = users.filter((u) => u.role === 'HR').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-md shadow-blue-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t('usersTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('usersSubtitle')} ({users.length} {lang === 'km' ? 'គណនី' : 'accounts'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchUsers()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={handleOpenCreateModal}
          >
            {t('createHrUser')}
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

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Total System Accounts</span>
            <span className="text-2xl font-bold text-white">{users.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">HR Specialists</span>
            <span className="text-2xl font-bold text-blue-400">{hrCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/30">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Administrators</span>
            <span className="text-2xl font-bold text-purple-400">{adminCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 border border-purple-500/30">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">{t('loading')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/70 text-slate-400 flex items-center justify-center">
              <UserPlus className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">
                No user accounts found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Create your first HR account so your team can log in and manage staff.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenCreateModal}
            >
              {t('createHrUser')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#080d1a] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">{t('colEmployee')} (Account)</th>
                  <th className="py-3.5 px-4">{t('email')}</th>
                  <th className="py-3.5 px-4">{t('userRole')}</th>
                  <th className="py-3.5 px-4">{t('userStatus')}</th>
                  <th className="py-3.5 px-4">{t('colDate')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isCurrent =
                    currentAuthUser?.username === u.username ||
                    currentAuthUser?.userName === u.username;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Username & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                              u.role === 'ADMIN'
                                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                                : 'bg-gradient-to-tr from-blue-600 to-cyan-600 text-white'
                            }`}
                          >
                            {u.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              User ID #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            <Shield className="w-3 h-3" />
                            {t('roleAdmin')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            <User className="w-3 h-3" />
                            {t('roleHr')}
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        {u.active ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {t('activeAccount')}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                            {t('inactiveAccount')}
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            title={u.active ? 'Deactivate User' : 'Activate User'}
                            disabled={isCurrent && u.active}
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isCurrent && u.active
                                ? 'opacity-30 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500'
                                : u.active
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            title={t('edit')}
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 transition-colors"
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

      {/* CREATE HR USER MODAL */}
      {isCreateModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-2xl sm:max-w-3xl shadow-2xl p-7 sm:p-9 space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {t('createHrUser')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {lang === 'km' ? 'បង្កើតគណនីបុគ្គលិកផ្នែកធនធានមនុស្ស (HR Specialist)' : 'Create HR specialist login credentials'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHrSubmit} className="space-y-5">
                {/* Role Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-blue-300">
                  <Shield className="w-5 h-5 shrink-0 text-blue-400" />
                  <span>
                    Role will be created as <strong>HR Specialist</strong> with permissions to manage workforce records.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Username */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('usernameLabel')} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={createForm.username}
                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                        placeholder="e.g. sok_hr"
                        className="w-full pl-10 pr-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {createErrors.username && (
                      <p className="text-xs text-rose-400 mt-1">{createErrors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('email')} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="hr.officer@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {createErrors.email && (
                      <p className="text-xs text-rose-400 mt-1">{createErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('passwordLabel')} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="Min 8 characters (e.g. HrPass@123)"
                        className="w-full pl-10 pr-10 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {createErrors.password && (
                      <p className="text-xs text-rose-400 mt-1">{createErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {lang === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={createForm.confirmPassword}
                        onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full pl-10 pr-10 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {createErrors.confirmPassword && (
                      <p className="text-xs text-rose-400 mt-1">{createErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsCreateModalOpen(false)}
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

      {/* EDIT USER MODAL */}
      {editingUser && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t('editUser')} ({editingUser.username})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Modify email, role, or active status
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    {t('userRole')} *
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="HR">{t('roleHr')}</option>
                    <option value="ADMIN">{t('roleAdmin')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    {t('userStatus')}
                  </label>
                  <select
                    value={String(editForm.active)}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="true">{t('activeAccount')}</option>
                    <option value="false">{t('inactiveAccount')}</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(null)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
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

export default UsersPage;
