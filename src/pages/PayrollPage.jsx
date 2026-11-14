import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import Button from '../components/common/Button';
import ModalPortal from '../components/common/ModalPortal';
import A4PayrollDocument from '../components/reports/A4PayrollDocument';
import {
  CircleDollarSign,
  Calculator,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Percent,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  X,
  Printer,
  Download
} from 'lucide-react';

const MONTH_NAMES = [
  { value: 1, labelEn: 'January (Month 1)', labelKm: 'មករា (ខែ ១)' },
  { value: 2, labelEn: 'February (Month 2)', labelKm: 'កុម្ភៈ (ខែ ២)' },
  { value: 3, labelEn: 'March (Month 3)', labelKm: 'មីនា (ខែ ៣)' },
  { value: 4, labelEn: 'April (Month 4)', labelKm: 'មេសា (ខែ ៤)' },
  { value: 5, labelEn: 'May (Month 5)', labelKm: 'ឧសភា (ខែ ៥)' },
  { value: 6, labelEn: 'June (Month 6)', labelKm: 'មិថុនា (ខែ ៦)' },
  { value: 7, labelEn: 'July (Month 7)', labelKm: 'កក្កដា (ខែ ៧)' },
  { value: 8, labelEn: 'August (Month 8)', labelKm: 'សីហា (ខែ ៨)' },
  { value: 9, labelEn: 'September (Month 9)', labelKm: 'កញ្ញា (ខែ ៩)' },
  { value: 10, labelEn: 'October (Month 10)', labelKm: 'តុលា (ខែ ១០)' },
  { value: 11, labelEn: 'November (Month 11)', labelKm: 'វិច្ឆិកា (ខែ ១១)' },
  { value: 12, labelEn: 'December (Month 12)', labelKm: 'ធ្នូ (ខែ ១២)' },
];

const PAYROLL_STATUSES = [
  { value: 'CALCULATED', labelEn: 'Calculated', labelKm: 'បានគណនា', color: 'blue' },
  { value: 'APPROVED', labelEn: 'Approved', labelKm: 'បានអនុម័ត', color: 'amber' },
  { value: 'PAID', labelEn: 'Paid', labelKm: 'បានបើករួច', color: 'emerald' }
];

const PayrollPage = () => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();
  const { user } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('');

  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Calculation Modal State
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [calcForm, setCalcForm] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    departmentId: ''
  });

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosClient.get('/departments');
        setDepartments(Array.isArray(res.data) ? res.data : (res.data?.content || []));
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch Payroll records and summary
  const fetchPayrollData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(selectedMonth),
        year: String(selectedYear),
        size: '50'
      });
      if (selectedStatus) params.append('status', selectedStatus);

      const [recordsRes, summaryRes] = await Promise.allSettled([
        axiosClient.get(`/payroll?${params.toString()}`),
        axiosClient.get(`/payroll/summary?month=${selectedMonth}&year=${selectedYear}`)
      ]);

      if (recordsRes.status === 'fulfilled') {
        const data = recordsRes.value?.data;
        setPayrolls(data?.content || (Array.isArray(data) ? data : []));
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedStatus]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const handleOpenCalcModal = () => {
    setCalcForm({
      month: selectedMonth,
      year: selectedYear,
      departmentId: ''
    });
    setIsCalcModalOpen(true);
  };

  const handleSubmitCalculate = async (e) => {
    e.preventDefault();
    await withLoading(
      lang === 'km'
        ? `កំពុងគណនាប្រាក់ខែស្វ័យប្រវត្តសម្រាប់ខែ ${calcForm.month}/${calcForm.year}...`
        : `Computing monthly payroll for ${calcForm.month}/${calcForm.year}...`,
      async () => {
        try {
          const queryParams = new URLSearchParams({
            month: String(calcForm.month),
            year: String(calcForm.year)
          });
          if (calcForm.departmentId) {
            queryParams.append('departmentId', calcForm.departmentId);
          }
          const res = await axiosClient.post(
            `/payroll/calculate?${queryParams.toString()}`
          );
          const count = Array.isArray(res.data) ? res.data.length : 0;
          setIsCalcModalOpen(false);
          setSelectedMonth(Number(calcForm.month));
          setSelectedYear(Number(calcForm.year));
          setFeedbackMessage(
            lang === 'km'
              ? `បានគណនាប្រាក់ខែចំនួន ${count} នាក់ដោយជោគជ័យ សម្រាប់ខែ ${calcForm.month}/${calcForm.year}!`
              : `Successfully calculated payroll for ${count} employees (${calcForm.month}/${calcForm.year})!`
          );
          fetchPayrollData(true);
          setTimeout(() => setFeedbackMessage(null), 5000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to calculate payroll');
        }
      },
      700
    );
  };

  const handleApprovePayroll = async (id, employeeName) => {
    await withLoading(
      lang === 'km' ? `កំពុងអនុម័តប្រាក់ខែ ${employeeName}...` : `Approving payroll for ${employeeName}...`,
      async () => {
        try {
          await axiosClient.patch(`/payroll/${id}/approve`);
          setFeedbackMessage(
            lang === 'km'
              ? `បានអនុម័តប្រាក់ខែ ${employeeName} ដោយជោគជ័យ!`
              : `Payroll approved for ${employeeName}!`
          );
          fetchPayrollData(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to approve payroll');
        }
      },
      500
    );
  };

  const handleMarkPaid = async (id, employeeName) => {
    await withLoading(
      lang === 'km' ? `កំពុងកត់ត្រាការបើកប្រាក់ ${employeeName}...` : `Marking payment as disbursed for ${employeeName}...`,
      async () => {
        try {
          await axiosClient.patch(`/payroll/${id}/mark-paid`);
          setFeedbackMessage(
            lang === 'km'
              ? `បានបើកប្រាក់បៀវត្សជូន ${employeeName} រួចរាល់!`
              : `Disbursement completed for ${employeeName}!`
          );
          fetchPayrollData(true);
          setTimeout(() => setFeedbackMessage(null), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to mark as paid');
        }
      },
      500
    );
  };

  const getStatusBadge = (status) => {
    const config = PAYROLL_STATUSES.find((s) => s.value === status) || PAYROLL_STATUSES[0];
    const label = lang === 'km' ? config.labelKm : config.labelEn;

    const styles = {
      blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[config.color]}`}>
        {label}
      </span>
    );
  };

  const handleExportCsv = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel / Khmer characters
    csvContent += `MONTHLY PAYROLL DISBURSEMENT REPORT - ${selectedMonth}/${selectedYear}\n`;
    csvContent += `Generated at,${new Date().toLocaleString()}\n`;
    csvContent += `Total Records,${payrolls.length}\n\n`;

    csvContent += `#,Employee Code,Employee Name,Department,Basic Salary,Allowances,Overtime Pay,Bonus,Deductions,Tax,Net Salary,Status\n`;

    payrolls.forEach((p, index) => {
      const empCode = p.employeeCode || `EMP${String(p.employeeId || '').padStart(3, '0')}`;
      const empName = p.employeeName || 'Staff Member';
      const dept = p.departmentName || 'General';
      const basic = Number(p.basicSalary || 0).toFixed(2);
      const allow = Number(p.allowances || 0).toFixed(2);
      const ot = Number(p.overtimePay || 0).toFixed(2);
      const bonus = Number(p.bonus || 0).toFixed(2);
      const ded = Number(p.deductions || 0).toFixed(2);
      const tax = Number(p.tax || 0).toFixed(2);
      const net = Number(p.netSalary || 0).toFixed(2);
      const status = p.status || 'CALCULATED';

      csvContent += `${index + 1},"${empCode}","${empName}","${dept}",$${basic},$${allow},$${ot},$${bonus},-$${ded},-$${tax},$${net},"${status}"\n`;
    });

    if (summary) {
      csvContent += `\nGRAND TOTALS\n`;
      csvContent += `Total Gross Salary,$${Number(summary.totalGrossSalary || 0).toFixed(2)}\n`;
      csvContent += `Total Net Disbursed,$${Number(summary.totalNetSalary || 0).toFixed(2)}\n`;
      csvContent += `Total Tax & Deductions,$${Number((summary.totalTax || 0) + (summary.totalDeductions || 0)).toFixed(2)}\n`;
      csvContent += `Total Allowances & Bonus,$${Number((summary.totalAllowances || 0) + (summary.totalBonus || 0)).toFixed(2)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monthly_payroll_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintA4 = () => {
    const docEl = document.getElementById('a4-payroll-printable-document');
    if (!docEl) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '1000px';
    iframe.style.height = '1400px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');

    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payroll_Report_${selectedMonth}_${selectedYear}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 6mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              width: 100%;
            }
            #a4-payroll-printable-document {
              padding: 0 !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            tfoot {
              display: table-row-group !important;
            }
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          </style>
          ${styles}
        </head>
        <body style="background: #ffffff; color: #0f172a; padding: 0; margin: 0;">
          <div style="width: 100%; max-width: 100%; margin: 0 auto; padding: 0;">
            ${docEl.outerHTML}
          </div>
        </body>
      </html>
    `);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-md shadow-blue-500/10">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t('payrollTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('payrollSubtitle')} ({selectedMonth}/{selectedYear})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={() => setIsExportModalOpen(true)}
          >
            {t('exportA4Report')}
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={() => fetchPayrollData()}
          >
            {t('syncData')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Calculator}
            onClick={handleOpenCalcModal}
          >
            {t('calculatePayroll')}
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

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">{t('grossSalary')}</span>
            <span className="text-xl font-mono font-bold text-white">
              ${Number(summary.totalGrossSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">{t('netSalary')}</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              ${Number(summary.totalNetSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">{t('tax')} & {t('deductions')}</span>
            <span className="text-xl font-mono font-bold text-rose-400">
              ${Number((summary.totalTax || 0) + (summary.totalDeductions || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">{t('allowances')} & {t('bonus')}</span>
            <span className="text-xl font-mono font-bold text-blue-400">
              ${Number((summary.totalAllowances || 0) + (summary.totalBonus || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Period & Status Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-sm text-slate-200">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">{t('payrollPeriod')}:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
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
            className="px-3.5 py-2 bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">{t('filterStatus')}</option>
            {PAYROLL_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {lang === 'km' ? st.labelKm : st.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">{t('loading')}</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/70 text-slate-400 flex items-center justify-center">
              <CircleDollarSign className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">
                {t('noPayrollRecords')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Click below to compute wages for all active employees for this period.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Calculator}
              onClick={handleOpenCalcModal}
            >
              {t('calculatePayroll')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#080d1a] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">{t('colEmployee')}</th>
                  <th className="py-3.5 px-4">{t('basicSalary')}</th>
                  <th className="py-3.5 px-4">{t('allowances')}</th>
                  <th className="py-3.5 px-4">{t('overtimePay')}</th>
                  <th className="py-3.5 px-4">{t('bonus')}</th>
                  <th className="py-3.5 px-4">{t('deductions')}</th>
                  <th className="py-3.5 px-4">{t('tax')}</th>
                  <th className="py-3.5 px-4">{t('netSalary')}</th>
                  <th className="py-3.5 px-4">{t('colStatus')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {p.employeeName || `Employee #${p.employeeId}`}
                      </div>
                      <div className="text-xs font-mono text-blue-400">
                        {p.employeeCode || `ID: ${p.employeeId}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      ${Number(p.basicSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      ${Number(p.allowances || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-400">
                      ${Number(p.overtimePay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-blue-400">
                      ${Number(p.bonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-rose-400">
                      -${Number(p.deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-rose-400">
                      -${Number(p.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ${Number(p.netSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'CALCULATED' ? (
                        <button
                          onClick={() => handleApprovePayroll(p.id, p.employeeName)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold transition-colors border border-amber-500/30"
                        >
                          {t('approve')}
                        </button>
                      ) : p.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleMarkPaid(p.id, p.employeeName)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors border border-emerald-500/30"
                        >
                          {t('markAsPaid')}
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CALCULATE PAYROLL MODAL */}
      {isCalcModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-2xl sm:max-w-3xl shadow-2xl p-7 sm:p-9 space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {t('calculatePayroll')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {lang === 'km' ? 'ដំណើរការគណនាប្រាក់បៀវត្សស្វ័យប្រវត្តសម្រាប់បុគ្គលិក' : 'Automated monthly salary computations and withholdings'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCalcModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCalculate} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Payroll Month */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('month')} *
                    </label>
                    <select
                      value={calcForm.month}
                      onChange={(e) => setCalcForm({ ...calcForm, month: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {MONTH_NAMES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {lang === 'km' ? m.labelKm : m.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payroll Year */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                      {t('year')} *
                    </label>
                    <input
                      type="number"
                      min="2020"
                      max="2035"
                      required
                      value={calcForm.year}
                      onChange={(e) => setCalcForm({ ...calcForm, year: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Target Department */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    {t('department')} ({lang === 'km' ? 'ស្រេចចិត្ត' : 'Optional'})
                  </label>
                  <select
                    value={calcForm.departmentId}
                    onChange={(e) => setCalcForm({ ...calcForm, departmentId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#080d1a] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">
                      {lang === 'km' ? '-- គ្រប់នាយកដ្ឋានទាំងអស់ --' : '-- All Departments (Company-wide) --'}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsCalcModalOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={Calculator}
                  >
                    {t('calculatePayroll')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* A4 Payroll Export / Print Preview Modal */}
      {isExportModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl bg-[#0d1527] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
              {/* Modal Top Control Bar */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800 bg-[#080d1a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {lang === 'km' ? 'ទិដ្ឋភាពឯកសារប្រាក់បៀវត្ស A4' : 'A4 Payroll Document Preview'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'km' ? `ការបើកប្រាក់បៀវត្សប្រចាំខែ ${selectedMonth}/${selectedYear}` : `Monthly Payroll Disbursement (${selectedMonth}/${selectedYear})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="md"
                    icon={Download}
                    onClick={handleExportCsv}
                  >
                    {t('exportCsv')}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Printer}
                    onClick={handlePrintA4}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/25"
                  >
                    {t('printPdfA4')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Body Content (Scrollable preview inside modal) */}
              <div className="overflow-y-auto p-4 sm:p-8 bg-slate-900/60 flex flex-col items-center">
                <A4PayrollDocument
                  payrolls={payrolls}
                  summary={summary}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  user={user}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default PayrollPage;
