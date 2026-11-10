import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarClock,
  CircleDollarSign,
  FileBarChart2,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onCollapse, onRequestLogout }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.replace('/', '') || 'dashboard';

  const handleItemClick = (tabId) => {
    navigate('/' + tabId);
    if (window.innerWidth < 768 && onCollapse) {
      onCollapse();
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'employees', label: t('navEmployees'), icon: Users },
    { id: 'departments', label: t('navDepartments'), icon: Building2 },
    { id: 'attendance', label: t('navAttendance'), icon: CalendarCheck },
    { id: 'leaves', label: t('navLeaves'), icon: CalendarClock },
    { id: 'payroll', label: t('navPayroll'), icon: CircleDollarSign },
    { id: 'reports', label: t('navReports'), icon: FileBarChart2 },
    { id: 'users', label: t('navUsers'), icon: ShieldCheck, adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <aside
      className={`border-r border-slate-800/80 bg-[#080d1a] text-slate-300 flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <nav className="pt-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden flex-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all group relative ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/60 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />

              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip on Collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer Button */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onRequestLogout}
          title={isCollapsed ? t('navLogout') : undefined}
          className={`w-full flex items-center rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors group relative ${
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-400" />
          {!isCollapsed && <span>{t('navLogout')}</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-rose-900 text-rose-100 text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {t('navLogout')}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
