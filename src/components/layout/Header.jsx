import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import BrandLogo from '../common/BrandLogo';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react';

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#080d1a] border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shrink-0 select-none">
      {/* Left: Sidebar Toggle Button + Fixed Logo + Brand Name */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button (Just like Banking) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? (lang === 'km' ? 'បើក Sidebar' : 'Expand Sidebar') : (lang === 'km' ? 'បិទ Sidebar' : 'Collapse Sidebar')}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 flex items-center justify-center transition-all shadow-sm group active:scale-95"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* HR & Payroll Brand Logo & Name - ALWAYS VISIBLE, NEVER DISAPPEARS */}
        <div className="flex items-center gap-2.5">
          <BrandLogo size="md" />

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-white whitespace-nowrap">
              HR & PAYROLL
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 lg:w-80 hidden md:block ml-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-1.5 bg-[#070a13] text-slate-200 placeholder:text-slate-500 text-xs rounded-xl border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Language Switcher, User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <LanguageSwitcher />

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* User Pill Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30 text-xs shadow-sm">
            {(user?.username || user?.userName || 'A').charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              {user?.username || user?.userName || 'Admin'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' ? t('adminRole') : t('hrRole')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
