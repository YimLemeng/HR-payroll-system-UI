import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '', variant = 'pill' }) => {
  const { lang, setLanguage } = useLanguage();

  if (variant === 'simple') {
    return (
      <button
        onClick={() => setLanguage(lang === 'km' ? 'en' : 'km')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all ${className}`}
        title="Switch Language / ប្តូរភាសា"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span>{lang === 'km' ? '🇰🇭 ខ្មែរ' : '🇬🇧 EN'}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/90 text-xs font-medium ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('km')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          lang === 'km'
            ? 'bg-white text-slate-900 font-semibold shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span>🇰🇭</span>
        <span>ខ្មែរ</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          lang === 'en'
            ? 'bg-white text-slate-900 font-semibold shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
