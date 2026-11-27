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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-sm rounded bg-white border border-slate-300 border-t-[3px] border-t-[#3c8dbc] p-7 shadow-xl text-center relative overflow-hidden">
        {/* Classic Spinner */}
        <div className="relative w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-slate-200 border-t-[#3c8dbc] animate-spin" />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">
          {title || defaultTitle}
        </h3>

        {/* Subtitle / Message */}
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
          {message || defaultMessage}
        </p>
      </div>
    </div>
  );
}
