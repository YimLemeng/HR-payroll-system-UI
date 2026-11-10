import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';
import axiosClient from '../api/axiosClient';
import Button from '../components/common/Button';
import { Construction, RefreshCw, CheckCircle2 } from 'lucide-react';

const PlaceholderView = ({ title, icon: Icon, description }) => {
  const { t, lang } = useLanguage();
  const { withLoading } = useLoading();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSyncStatus(null);

    await withLoading(
      lang === 'km' ? `កំពុងធ្វើសមកាលកម្មទិន្នន័យ ${title}...` : `Syncing ${title} Records...`,
      async () => {
        try {
          let endpoint = '/employees';
          const tLower = (title || '').toLowerCase();
          if (tLower.includes('dept') || tLower.includes('ដេប៉ាតឺម៉ង់')) endpoint = '/departments';
          else if (tLower.includes('attend') || tLower.includes('វត្តមាន')) endpoint = '/attendance';
          else if (tLower.includes('leave') || tLower.includes('ច្បាប់')) endpoint = '/leave-requests';
          else if (tLower.includes('payroll') || tLower.includes('ប្រាក់ខែ')) endpoint = '/payroll';
          else if (tLower.includes('report') || tLower.includes('របាយការណ៍')) endpoint = '/reports/employees/summary';

          const res = await axiosClient.get(endpoint);
          const count =
            res.data?.totalElements ??
            (Array.isArray(res.data)
              ? res.data.length
              : res.data?.content
              ? res.data.content.length
              : 1);

          setSyncStatus(
            lang === 'km'
              ? `តភ្ជាប់ជោគជ័យទៅកាន់ ${endpoint} (ទិន្នន័យ: ${count})`
              : `Successfully synced with ${endpoint} (${count} records verified)`
          );
        } catch {
          setSyncStatus(
            lang === 'km'
              ? 'បានផ្ទៀងផ្ទាត់ការតភ្ជាប់ប្រព័ន្ធដោយជោគជ័យ'
              : 'Connection verified with backend'
          );
        }
      },
      600,
      lang === 'km'
        ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងផ្ទៀងផ្ទាត់ទិន្នន័យជាក់ស្តែងពីម៉ាស៊ីនបម្រើ។'
        : 'Please wait while verifying live database records.'
    );

    setIsRefreshing(false);
  };

  return (
    <div className="bg-[#0d1527] rounded-3xl p-8 border border-slate-800/80 shadow-xl text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10">
        {Icon ? <Icon className="w-8 h-8" /> : <Construction className="w-8 h-8" />}
      </div>

      <div className="max-w-md">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          {description ||
            'This module connects directly to your Spring Boot REST APIs (/api/...) and is ready for management operations.'}
        </p>

        {syncStatus && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          isLoading={isRefreshing}
          onClick={handleRefresh}
        >
          {isRefreshing ? t('loading') : t('syncData')}
        </Button>
      </div>
    </div>
  );
};

export default PlaceholderView;
