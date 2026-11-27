import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import { useTableSort } from '../../utils/useTableSort';
import { Search, Filter, Loader2, Calendar, ArrowUpDown } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-purple-500',
  'bg-cyan-500',
];

const RecentActivities = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const [attRes, empRes] = await Promise.allSettled([
          axiosClient.get('/attendance?page=0&size=20'),
          axiosClient.get('/employees?size=1000'),
        ]);

        if (!isMounted) return;

        const empList =
          empRes.status === 'fulfilled'
            ? empRes.value?.data?.content || (Array.isArray(empRes.value?.data) ? empRes.value.data : [])
            : [];

        const deptById = {};
        const deptByCode = {};
        empList.forEach((emp) => {
          if (emp.departmentName) {
            if (emp.id != null) deptById[emp.id] = emp.departmentName;
            if (emp.employeeCode) deptByCode[emp.employeeCode] = emp.departmentName;
          }
        });

        const attContent =
          attRes.status === 'fulfilled'
            ? attRes.value?.data?.content || (Array.isArray(attRes.value?.data) ? attRes.value.data : [])
            : [];

        if (attContent.length > 0) {
          const enriched = attContent.map((rec) => ({
            ...rec,
            department:
              rec.departmentName ||
              rec.department ||
              deptById[rec.employeeId] ||
              deptByCode[rec.employeeCode] ||
              '—',
          }));
          setRecords(enriched);
          return;
        }

        // Fallback to employees if no attendance records exist yet
        const mapped = empList.slice(0, 20).map((emp) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          department: emp.departmentName || emp.jobTitle || '—',
          attendanceDate: emp.hireDate || 'Active',
          checkIn: null,
          status: emp.employmentStatus || 'ACTIVE',
        }));
        setRecords(mapped);
      } catch (err) {
        console.error('Failed to load employee/attendance records:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAttendance();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusPill = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
            {s === 'ACTIVE' ? t('statusActive') : t('statusPresent')}
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
            {t('statusLate')}
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
            {t('statusOnLeave')}
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700">
            {t('statusAbsent')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  const getInitials = (name) => {
    const parts = (name || 'U').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0] || 'U').slice(0, 2).toUpperCase();
  };

  const filtered = records.filter((rec) => {
    const name = (rec.employeeName || '').toLowerCase();
    const dept = (rec.department || rec.departmentName || '').toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      dept.includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (rec.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { sortConfig, handleSort, sortedItems: sortedFiltered } = useTableSort(filtered, {
    employeeName: (r) => r.employeeName || '',
    department: (r) => r.department || r.departmentName || '',
    attendanceDate: (r) => r.attendanceDate || '',
    status: (r) => r.status || '',
  });

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * rowsPerPage;
  const displayed = sortedFiltered.slice(startIdx, startIdx + rowsPerPage);

  return (
    <div className="bg-white rounded border border-slate-300 border-t-[3px] border-t-[#3c8dbc] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <h3 className="text-sm font-bold text-slate-800">
          {t('recentActivityTitle')}
        </h3>
      </div>

      {/* Toolbar (Search & Status Filter matching Admindek Screenshot 2) */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'km' ? 'ស្វែងរកបុគ្គលិក...' : 'Search employees...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">{lang === 'km' ? 'ស្ថានភាពទាំងអស់' : 'Status: All'}</option>
              <option value="PRESENT">{t('statusPresent')}</option>
              <option value="LATE">{t('statusLate')}</option>
              <option value="ABSENT">{t('statusAbsent')}</option>
              <option value="ON_LEAVE">{t('statusOnLeave')}</option>
              <option value="ACTIVE">{t('statusActive')}</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => navigate('/attendance')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
        >
          {t('viewAll')}
        </button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>{t('loading')}</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <Calendar className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          <p>
            {lang === 'km'
              ? 'មិនមានទិន្នន័យបុគ្គលិក ឬវត្តមាននៅឡើយទេ'
              : 'No attendance or employee records found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[13px] font-semibold text-slate-600 bg-white">
                {[
                  { key: 'employeeName', label: t('colEmployee'), pad: 'px-6' },
                  { key: 'department', label: t('colDepartment'), pad: 'px-4' },
                  { key: 'attendanceDate', label: t('colDate'), pad: 'px-4' },
                  { key: 'status', label: t('colStatus'), pad: 'px-4' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`py-3.5 ${col.pad} cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap`}
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
                <th className="py-3.5 px-6 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {displayed.map((rec, idx) => {
                const name = rec.employeeName || 'Employee';
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <tr
                    key={rec.id || idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColor} text-white font-semibold text-xs flex items-center justify-center shrink-0`}>
                          {getInitials(name)}
                        </div>
                        <span className="font-medium text-slate-800">{name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {rec.department || rec.departmentName || 'General'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {rec.attendanceDate || 'Today'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusPill(rec.status)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => navigate('/attendance')}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        {lang === 'km' ? 'មើល' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Pagination Footer */}
      <div className="px-6 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-white">
        <span>
          {sortedFiltered.length === 0
            ? (lang === 'km' ? 'គ្មានទិន្នន័យ' : 'Showing 0 results')
            : lang === 'km'
            ? `បង្ហាញ ${startIdx + 1}-${startIdx + displayed.length} នៃ ${sortedFiltered.length} ទិន្នន័យ`
            : `Showing ${startIdx + 1}-${startIdx + displayed.length} of ${sortedFiltered.length} results`}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>{lang === 'km' ? 'ជួរ' : 'Rows'}</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lang === 'km' ? 'មុន' : 'Previous'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  pageNum === safePage
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lang === 'km' ? 'បន្ទាប់' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
