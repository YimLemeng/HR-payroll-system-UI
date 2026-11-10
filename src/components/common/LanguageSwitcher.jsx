import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '', variant = 'pill' }) => {
  const { lang, setLanguage } = useLanguage();

  if (variant === 'simple') {
    return (
      <button
        onClick={() => setLanguage(lang === 'km' ? 'en' : 'km')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all shadow-sm ${className}`}
        title="Switch Language / ប្តូរភាសា"
      >
        <Globe className="w-3.5 h-3.5 text-blue-400" />
        <span>{lang === 'km' ? '🇰🇭 ភាសាខ្មែរ' : '🇬🇧 English'}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-700/80 text-xs font-medium ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('km')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          lang === 'km'
            ? 'bg-blue-600 text-white font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
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
            ? 'bg-blue-600 text-white font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
