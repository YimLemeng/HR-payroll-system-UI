import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LoadingOverlay({
  show = false,
  title = '',
  message = '',
}) {
  const { lang } = useLanguage();

  if (!show) return null;

  const defaultTitle =
    lang === 'km' ? 'កំពុងដំណើរការទិន្នន័យ...' : 'Processing Request...';

  const defaultMessage =
    lang === 'km'
      ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងដំណើរការសំណើរបស់អ្នក។'
      : 'Please wait while the system processes your request.';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200/90 p-7 shadow-2xl shadow-slate-900/15 text-center relative overflow-hidden">
        {/* Subtle Top Blue Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500" />

        {/* Clean Modern Dual-Ring Spinner */}
        <div className="relative w-14 h-14 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
          <div className="w-14 h-14 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-500/40 animate-spin" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {title || defaultTitle}
        </h3>

        {/* Subtitle / Message */}
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
          {message || defaultMessage}
        </p>

        {/* Subtle Progress Shimmer Bar */}
        <div className="mt-5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
