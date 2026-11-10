import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useLoading } from '../../context/LoadingContext';
import Button from '../common/Button';
import {
  UserPlus,
  Calculator,
  CalendarCheck,
  FileSpreadsheet,
} from 'lucide-react';

const QuickActions = () => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAction = async (targetPath, loadingTitle, loadingMsg) => {
    setLoadingAction(targetPath);

    await withLoading(
      loadingTitle,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate(targetPath);
      },
      500,
      loadingMsg
    );

    setLoadingAction(null);
  };

  return (
    <div className="bg-[#0d1527] rounded-2xl p-5 border border-slate-800/80 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            {t('quickActionsTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('quickActionsSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Action 1: Add Employee */}
        <Button
          variant="outline"
          size="md"
          icon={UserPlus}
          isLoading={loadingAction === '/employees'}
          onClick={() =>
            handleAction(
              '/employees',
              lang === 'km'
                ? 'កំពុងបើកផ្ទាំងគ្រប់គ្រងបុគ្គលិក...'
                : 'Opening Employee Management...',
              lang === 'km'
                ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងរៀបចំបញ្ជីបុគ្គលិក។'
                : 'Please wait while loading employee workspace.'
            )
          }
          className="justify-start text-xs sm:text-sm"
        >
          {t('quickAddEmployee')}
        </Button>

        {/* Action 2: Run Payroll */}
        <Button
          variant="outline"
          size="md"
          icon={Calculator}
          isLoading={loadingAction === '/payroll'}
          onClick={() =>
            handleAction(
              '/payroll',
              lang === 'km'
                ? 'កំពុងបើកផ្ទាំងគណនាប្រាក់បៀវត្ស...'
                : 'Opening Payroll Module...',
              lang === 'km'
                ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងដំណើរការគណនាប្រាក់ខែ។'
                : 'Please wait while preparing payroll calculation sheets.'
            )
          }
          className="justify-start text-xs sm:text-sm"
        >
          {t('quickRunPayroll')}
        </Button>

        {/* Action 3: Mark Attendance */}
        <Button
          variant="outline"
          size="md"
          icon={CalendarCheck}
          isLoading={loadingAction === '/attendance'}
          onClick={() =>
            handleAction(
              '/attendance',
              lang === 'km'
                ? 'កំពុងបើកផ្ទាំងកត់ត្រាវត្តមាន...'
                : 'Opening Attendance Tracking...',
              lang === 'km'
                ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងផ្ទៀងផ្ទាត់ទិន្នន័យវត្តមាន។'
                : 'Please wait while loading real-time attendance streams.'
            )
          }
          className="justify-start text-xs sm:text-sm"
        >
          {t('quickMarkAttendance')}
        </Button>

        {/* Action 4: Export Reports */}
        <Button
          variant="outline"
          size="md"
          icon={FileSpreadsheet}
          isLoading={loadingAction === '/reports'}
          onClick={() =>
            handleAction(
              '/reports',
              lang === 'km'
                ? 'កំពុងបើកផ្ទាំងរបាយការណ៍សង្ខេប...'
                : 'Opening Managerial Reports...',
              lang === 'km'
                ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងទាញទិន្នន័យរបាយការណ៍។'
                : 'Please wait while loading analytical reports.'
            )
          }
          className="justify-start text-xs sm:text-sm"
        >
          {t('quickExportReport')}
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
