import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';

const A4ReportDocument = ({
  empSummary,
  deptHeadcounts = [],
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

  const totalDeptStaff = deptHeadcounts.reduce(
    (sum, d) => sum + (Number(d.headcount ?? d.employeeCount) || 0),
    0
  );

  const totalDeptBasicSalary = deptHeadcounts.reduce(
    (sum, d) => sum + (Number(d.totalBasicSalary) || 0),
    0
  );

  const avgDeptSalary = totalDeptStaff > 0 ? totalDeptBasicSalary / totalDeptStaff : 0;

  return (
    <div
      id="a4-printable-document"
      className="bg-white text-slate-900 font-sans p-8 sm:p-10 w-full max-w-[210mm] mx-auto shadow-2xl rounded-xl border border-slate-200 text-xs sm:text-sm select-text"
      style={{ minHeight: '297mm' }}
    >
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 rounded-t-sm -mt-4 sm:-mt-6 mb-6" />

      {/* Header Letterhead */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Users className="w-6 h-6 text-white" />
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:text-right shrink-0 min-w-[200px]">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            {lang === 'km' ? 'លេខយោងឯកសារ' : 'DOCUMENT REF'}:
          </div>
          <div className="text-xs font-mono font-bold text-blue-700">
            HR-RPT-{selectedYear}{String(selectedMonth).padStart(2, '0')}-001
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-semibold">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}:</span> {currentDate}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold">{lang === 'km' ? 'គ្រា' : 'Period'}:</span>{' '}
            {lang === 'km' ? `ខែ ${selectedMonth}` : `Month ${selectedMonth}`} / {selectedYear}
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="text-center my-6">
        <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
          {lang === 'km'
            ? 'របាយការណ៍សង្ខេបកម្លាំងពលកម្ម និងថវិកាប្រាក់បៀវត្សតាមផ្នែកប្រចាំខែ'
            : 'MONTHLY DEPARTMENTAL WORKFORCE & PAYROLL REPORT'}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
          {lang === 'km'
            ? 'ឯកសារកម្រិតគ្រប់គ្រងផ្លូវការស្តីពីស្ថិតិចំនួនបុគ្គលិក និងការបែងចែកថវិកាចំណាយលើប្រាក់បៀវត្សប្រចាំខែ'
            : 'Official certified management summary of departmental staffing and monthly salary allocations for corporate audit and governance.'}
        </p>
      </div>

      {/* Executive Highlights Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'បុគ្គលិកសរុប' : 'Total Workforce'}
          </span>
          <span className="text-base sm:text-lg font-bold text-blue-700">
            {totalDeptStaff || (empSummary?.totalEmployees ?? 0)} {lang === 'km' ? 'នាក់' : 'staff'}
          </span>
        </div>
        <div className="border-x border-slate-200">
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'ថវិកាប្រាក់ខែសរុប' : 'Total Basic Salary'}
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-emerald-700">
            ${totalDeptBasicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'km' ? 'ប្រាក់ខែមធ្យមក្នុងម្នាក់' : 'Average Salary / Staff'}
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-purple-700">
            ${avgDeptSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Department Headcount & Salary Expenditure Table */}
      <div className="space-y-3 mb-8">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-2">
          <span>{lang === 'km' ? 'តារាងថវិកា និងចំនួនបុគ្គលិកតាមដេប៉ាតឺម៉ង់ (Department Headcount & Budget Distribution)' : 'Department Headcount & Budget Distribution'}</span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-4">{lang === 'km' ? 'ឈ្មោះដេប៉ាតឺម៉ង់ (Department)' : 'Department'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'km' ? 'ចំនួនបុគ្គលិក' : 'Headcount'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'km' ? 'ប្រាក់ខែមូលដ្ឋានសរុប' : 'Total Basic Salary'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'km' ? 'ប្រាក់ខែមធ្យម' : 'Average Salary'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'km' ? 'សមាមាត្រ %' : 'Share %'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {deptHeadcounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    {lang === 'km' ? 'មិនទាន់មានទិន្នន័យផ្នែកនៅឡើយ' : 'No department records available'}
                  </td>
                </tr>
              ) : (
                deptHeadcounts.map((dept, idx) => {
                  const count = Number(dept.headcount ?? dept.employeeCount ?? 0);
                  const totalSal = Number(dept.totalBasicSalary || 0);
                  const avgSal = Number(dept.averageBasicSalary ?? dept.averageSalary ?? 0);
                  const sharePercent =
                    totalDeptBasicSalary > 0
                      ? ((totalSal / totalDeptBasicSalary) * 100).toFixed(1)
                      : '0.0';

                  return (
                    <tr key={dept.departmentId || idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{dept.departmentName}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-blue-700">
                        {count} {lang === 'km' ? 'នាក់' : 'staff'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900">
                        ${totalSal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-600">
                        ${avgSal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {sharePercent}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {deptHeadcounts.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">
                    {lang === 'km' ? 'សរុបរួម (Grand Total)' : 'Grand Total'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-blue-700">
                    {totalDeptStaff} {lang === 'km' ? 'នាក់' : 'staff'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">
                    ${totalDeptBasicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    ${avgDeptSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Formal Signatures & Sign-Offs */}
      <div className="pt-8 border-t border-slate-200 mt-10">
        <div className="grid grid-cols-3 gap-6 text-center">
          {/* Signature 1 */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {lang === 'km' ? 'រៀបចំដោយ' : 'PREPARED BY'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">HR Specialist / Admin</span>
            <div className="h-20 flex items-end justify-center pb-1">
              <span className="text-[11px] text-slate-400 italic">
                {lang === 'km' ? '(ហត្ថលេខា & ឈ្មោះ)' : '(Signature & Name)'}
              </span>
            </div>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
              {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}: _____ / _____ / 2026
            </div>
          </div>

          {/* Signature 2 */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {lang === 'km' ? 'ត្រួតពិនិត្យដោយ' : 'REVIEWED BY'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Head of Human Resources</span>
            <div className="h-20 flex items-end justify-center pb-1">
              <span className="text-[11px] text-slate-300 italic">(Signature & Stamp)</span>
            </div>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
              {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}: _____ / _____ / 2026
            </div>
          </div>

          {/* Signature 3 */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {lang === 'km' ? 'អនុម័តដោយ' : 'APPROVED BY'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Managing Director / CFO</span>
            <div className="h-20 flex items-end justify-center pb-1">
              <span className="text-[11px] text-slate-300 italic">(Official Corporate Seal)</span>
            </div>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
              {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}: _____ / _____ / 2026
            </div>
          </div>
        </div>
      </div>

      {/* Official Document Footer */}
      <div className="border-t border-slate-200 pt-4 mt-8 flex items-center justify-between text-[10px] text-slate-400">
        <div>
          CONFIDENTIAL • FOR INTERNAL MANAGEMENT & AUDIT USE ONLY
        </div>
        <div>
          Enterprise HR & Payroll Portal • Page 1 of 1
        </div>
      </div>
    </div>
  );
};

export default A4ReportDocument;