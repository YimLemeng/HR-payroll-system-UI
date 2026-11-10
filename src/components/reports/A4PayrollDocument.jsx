import React from 'react';
import { CircleDollarSign, ShieldCheck } from 'lucide-react';

const A4PayrollDocument = ({
  payrolls = [],
  summary,
  selectedMonth,
  selectedYear,
  user,
  lang = 'km'
}) => {
  const currentDate = new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesKm = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const monthName = lang === 'km' 
    ? (monthNamesKm[selectedMonth - 1] || `ខែ ${selectedMonth}`)
    : (monthNames[selectedMonth - 1] || `Month ${selectedMonth}`);

  const totalBasic = payrolls.reduce((sum, p) => sum + (Number(p.basicSalary) || 0), 0);
  const totalAllowances = payrolls.reduce((sum, p) => sum + (Number(p.allowances) || 0), 0);
  const totalOvertime = payrolls.reduce((sum, p) => sum + (Number(p.overtimePay) || 0), 0);
  const totalBonus = payrolls.reduce((sum, p) => sum + (Number(p.bonus) || 0), 0);
  const totalGross = payrolls.reduce((sum, p) => sum + (Number(p.grossSalary) || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + (Number(p.deductions) || 0), 0);
  const totalTax = payrolls.reduce((sum, p) => sum + (Number(p.tax) || 0), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

  return (
    <div
      id="a4-payroll-printable-document"
      className="bg-white text-slate-900 font-sans p-8 sm:p-10 w-full max-w-[210mm] mx-auto shadow-2xl rounded-xl border border-slate-200 text-xs select-text"
      style={{ minHeight: '297mm' }}
    >
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 rounded-t-sm -mt-4 sm:-mt-6 mb-6" />

      {/* Header Letterhead */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <CircleDollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                HR & PAYROLL ENTERPRISE
              </h1>
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Human Capital & Automated Payroll Management System
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Phnom Penh, Kingdom of Cambodia • contact@hrpayroll.internal
            </p>
          </div>
        </div>

        {/* Official Reference Block */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:text-right shrink-0 min-w-[210px]">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            {lang === 'km' ? 'លេខយោងឯកសារ' : 'DOCUMENT REF'}:
          </div>
          <div className="text-xs font-mono font-bold text-blue-700">
            PAY-RPT-{selectedYear}{String(selectedMonth).padStart(2, '0')}-001
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-semibold">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}:</span> {currentDate}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold">{lang === 'km' ? 'វដ្តបើកប្រាក់បៀវត្ស' : 'Payroll Period'}:</span>{' '}
            {monthName} {selectedYear}
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="text-center my-6">
        <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
          {lang === 'km'
            ? `របាយការណ៍ទូទាត់ប្រាក់បៀវត្សប្រចាំខែ ${monthName} ឆ្នាំ ${selectedYear}`
            : `MONTHLY PAYROLL DISBURSEMENT REPORT - ${monthName.toUpperCase()} ${selectedYear}`}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
          {lang === 'km'
            ? 'ឯកសារកម្រិតគ្រប់គ្រងផ្លូវការស្តីពីការបើកប្រាក់បៀវត្ស ប្រាក់ឧបត្ថម្ភ ពន្ធកាត់ទុក និងប្រាក់សុទ្ធជូនបុគ្គលិក'
            : 'Official certified management payroll roster detailing gross wages, allowances, statutory deductions, tax withholdings, and net disbursements.'}
        </p>
      </div>

      {/* Executive Highlights Summary Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'បុគ្គលិកសរុប' : 'Total Employees'}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900">
            {payrolls.length} {lang === 'km' ? 'នាក់' : 'staff'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'ប្រាក់ខែសរុប (Gross)' : 'Total Gross'}
          </span>
          <span className="text-base sm:text-lg font-bold text-blue-700 font-mono">
            ${Number(summary?.totalGrossSalary || totalGross).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'ពន្ធ និងកាត់ទុក' : 'Tax & Deductions'}
          </span>
          <span className="text-base sm:text-lg font-bold text-rose-600 font-mono">
            ${Number((summary?.totalTax || totalTax) + (summary?.totalDeductions || totalDeductions)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'ប្រាក់ខែសុទ្ធបើកជូន' : 'Total Net Pay'}
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 font-mono">
            ${Number(summary?.totalNetSalary || totalNet).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Payroll Roster Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          {lang === 'km' ? 'តារាងបើកប្រាក់បៀវត្សលម្អិតតាមបុគ្គលិក' : 'Employee Payroll Disbursal Schedule'}
        </h3>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-100 font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-2 px-2 text-center">#</th>
                <th className="py-2 px-2.5">{lang === 'km' ? 'កូដ' : 'Code'}</th>
                <th className="py-2 px-3">{lang === 'km' ? 'ឈ្មោះបុគ្គលិក' : 'Employee Name'}</th>
                <th className="py-2 px-3">{lang === 'km' ? 'នាយកដ្ឋាន' : 'Department'}</th>
                <th className="py-2 px-2.5 text-right">{lang === 'km' ? 'ប្រាក់ខែគោល' : 'Basic'}</th>
                <th className="py-2 px-2 text-right">{lang === 'km' ? 'ឧបត្ថម្ភ' : 'Allow.'}</th>
                <th className="py-2 px-2 text-right">{lang === 'km' ? 'ថែមម៉ោង' : 'OT'}</th>
                <th className="py-2 px-2 text-right">{lang === 'km' ? 'កាត់ទុក' : 'Deduct'}</th>
                <th className="py-2 px-2 text-right">{lang === 'km' ? 'ពន្ធ' : 'Tax'}</th>
                <th className="py-2 px-2.5 text-right font-bold text-slate-900">{lang === 'km' ? 'ប្រាក់សុទ្ធ' : 'Net Pay'}</th>
                <th className="py-2 px-2 text-center">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-slate-400">
                    {lang === 'km' ? 'មិនមានទិន្នន័យប្រាក់បៀវត្សសម្រាប់ខែនេះឡើយ' : 'No payroll records for this period'}
                  </td>
                </tr>
              ) : (
                payrolls.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2.5 font-mono font-semibold text-blue-700">{p.employeeCode}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{p.employeeName}</td>
                    <td className="py-2 px-3 text-slate-600">{p.departmentName || '—'}</td>
                    <td className="py-2 px-2.5 text-right font-mono">${Number(p.basicSalary || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">${Number(p.allowances || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">${Number(p.overtimePay || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono text-rose-600">-${Number(p.deductions || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono text-rose-600">-${Number(p.tax || 0).toFixed(2)}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                      ${Number(p.netSalary || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        p.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'APPROVED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {payrolls.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 uppercase tracking-wider text-right">
                    {lang === 'km' ? 'សរុបរួម (Grand Total):' : 'Grand Total:'}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono">${totalBasic.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">${totalAllowances.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">${totalOvertime.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-rose-600">-${totalDeductions.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-rose-600">-${totalTax.toFixed(2)}</td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-emerald-800 bg-emerald-100/60 font-black">
                    ${totalNet.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Corporate Certification Footer Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 mb-8 leading-relaxed">
        <p>
          <strong>{lang === 'km' ? 'សេចក្តីបញ្ជាក់' : 'Audit Certification'}:</strong>{' '}
          {lang === 'km'
            ? 'ទិន្នន័យប្រាក់បៀវត្សក្នុងឯកសារនេះត្រូវបានទាញចេញពីប្រព័ន្ធស្វ័យប្រវត្ត HR & Payroll Management System និងផ្ទៀងផ្ទាត់ដោយនាយកដ្ឋានធនធានមនុស្សស្របតាមច្បាប់ការងារ និងបទប្បញ្ញត្តិពន្ធដារជាធរមាន។'
            : 'The payroll schedule above represents true and verified compensation records calculated in compliance with labor laws and statutory tax withholding regulations.'}
        </p>
      </div>

      {/* Three Formal Corporate Signatures Block */}
      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center">
        {/* Signer 1: Prepared By */}
        <div>
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
            {lang === 'km' ? 'រៀបចំដោយ' : 'Prepared By'}
          </div>
          <div className="text-[10px] text-slate-500">
            {lang === 'km' ? 'មន្ត្រីធនធានមនុស្ស' : 'HR Officer'}
          </div>
          <div className="h-20 flex items-end justify-center pb-1">
            <span className="text-[11px] text-slate-400 italic">
              {lang === 'km' ? '(ហត្ថលេខា & ឈ្មោះ)' : '(Signature & Name)'}
            </span>
          </div>
          <div className="border-t border-dashed border-slate-400 pt-1.5 text-[10px] text-slate-500">
            {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}: _____ / _____ / 2026
          </div>
        </div>

        {/* Signer 2: Verified By */}
        <div>
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
            {lang === 'km' ? 'ត្រួតពិនិត្យដោយ' : 'Verified By'}
          </div>
          <div className="text-[10px] text-slate-500">
            {lang === 'km' ? 'ប្រធានគណនេយ្យ និងហិរញ្ញវត្ថុ' : 'Finance & Accounting Lead'}
          </div>
          <div className="h-20 flex items-end justify-center pb-1">
            <span className="text-[11px] text-slate-400 italic">
              {lang === 'km' ? '(ហត្ថលេខា & ឈ្មោះ)' : '(Signature & Name)'}
            </span>
          </div>
          <div className="border-t border-dashed border-slate-400 pt-1.5 text-[10px] text-slate-500">
            {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}: _____ / _____ / 2026
          </div>
        </div>

        {/* Signer 3: Approved By */}
        <div>
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
            {lang === 'km' ? 'អនុម័តដោយ' : 'Approved By'}
          </div>
          <div className="text-[10px] text-slate-500">
            {lang === 'km' ? 'អគ្គនាយកប្រតិបត្តិ' : 'Managing Director'}
          </div>
          <div className="h-20 flex items-end justify-center pb-1">
            <span className="text-[11px] text-slate-400 italic">
              {lang === 'km' ? '(ហត្ថលេខា & ត្រាផ្លូវការ)' : '(Signature & Official Stamp)'}
            </span>
          </div>
          <div className="border-t border-dashed border-slate-400 pt-1.5 text-[10px] text-slate-500">
            {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}: _____ / _____ / 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default A4PayrollDocument;
