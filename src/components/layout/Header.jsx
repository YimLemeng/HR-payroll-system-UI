import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import {
  Menu,
  Search,
  X,
  ArrowRight,
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarClock,
  CircleDollarSign,
  FileBarChart2,
  ShieldCheck,
} from 'lucide-react';

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  const displayName = user?.username || user?.userName || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickRoutes = [
    { path: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { path: '/employees', label: t('navEmployees'), icon: Users },
    { path: '/departments', label: t('navDepartments'), icon: Building2 },
    { path: '/attendance', label: t('navAttendance'), icon: CalendarCheck },
    { path: '/leaves', label: t('navLeaves'), icon: CalendarClock },
    { path: '/payroll', label: t('navPayroll'), icon: CircleDollarSign },
    { path: '/reports', label: t('navReports'), icon: FileBarChart2 },
    ...(isAdmin ? [{ path: '/users', label: t('navUsers'), icon: ShieldCheck }] : []),
  ].filter((r) => r.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      {/* Classic AdminLTE Steel Blue Top Navbar (#3c8dbc) */}
      <header className="h-14 bg-[#3c8dbc] text-white px-4 flex items-center justify-between gap-4 z-20 shrink-0 select-none shadow-xs">
        {/* Left: Sidebar Toggle + Quick Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? (lang === 'km' ? 'បើក Sidebar' : 'Expand Sidebar') : (lang === 'km' ? 'បិទ Sidebar' : 'Collapse Sidebar')}
            className="w-9 h-9 rounded hover:bg-[#367fa9] text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:inline-flex items-center gap-2.5 px-3 py-1.5 rounded bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-white/80" />
            <span>{lang === 'km' ? 'ស្វែងរកមុខងារ...' : 'Search...'}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-black/15 rounded text-white/90">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Language Switcher & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSwitcher variant="navbar" />

          <div className="h-5 w-px bg-white/25 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/20 border border-white/30 text-white font-bold flex items-center justify-center text-xs">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-white/80 font-medium">
                {isAdmin ? t('adminRole') : t('hrRole')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Command Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded border border-slate-300 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'km' ? 'វាយឈ្មោះទំព័រដើម្បីបើករហ័ស...' : 'Jump to module...'}
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {quickRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <button
                    key={route.path}
                    onClick={() => {
                      navigate(route.path);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded text-sm text-slate-700 hover:bg-[#eff6ff] hover:text-[#3c8dbc] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{route.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
