import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';
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
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onCollapse, onRequestLogout }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.replace('/', '') || 'dashboard';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  const handleItemClick = (tabId) => {
    navigate('/' + tabId);
    if (window.innerWidth < 768 && onCollapse) {
      onCollapse();
    }
  };

  const navGroups = [
    {
      title: lang === 'km' ? 'ទំព័រដើម' : 'NAVIGATION',
      items: [
        { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
      ],
    },
    {
      title: lang === 'km' ? 'ធនធានមនុស្ស' : 'WORKFORCE',
      items: [
        { id: 'employees', label: t('navEmployees'), icon: Users },
        { id: 'departments', label: t('navDepartments'), icon: Building2 },
        { id: 'attendance', label: t('navAttendance'), icon: CalendarCheck },
        { id: 'leaves', label: t('navLeaves'), icon: CalendarClock },
      ],
    },
    {
      title: lang === 'km' ? 'ប្រាក់បៀវត្ស & របាយការណ៍' : 'PAYROLL & REPORTS',
      items: [
        { id: 'payroll', label: t('navPayroll'), icon: CircleDollarSign },
        { id: 'reports', label: t('navReports'), icon: FileBarChart2 },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: lang === 'km' ? 'ប្រព័ន្ធ' : 'SYSTEM',
            items: [
              { id: 'users', label: t('navUsers'), icon: ShieldCheck },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`bg-[#1c2434] text-slate-300 flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 z-30 border-r border-slate-800/40 ${
        isCollapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      {/* Top Brand Header inside Sidebar */}
      <div className={`h-16 flex items-center border-b border-white/[0.06] shrink-0 ${isCollapsed ? 'justify-center px-2' : 'px-5 gap-3'}`}>
        <BrandLogo size="sm" className="shadow-blue-500/25" />
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base tracking-tight text-white truncate">
              HR & Payroll
            </span>
          </div>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav className="py-4 px-3 space-y-5 overflow-y-auto overflow-x-hidden flex-1">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400/75 uppercase">
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg text-[13.5px] font-medium transition-all group relative ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-white/[0.1] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'gap-3 min-w-0'}`}>
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}

                  {/* Tooltip on Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700/60">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout Footer Button */}
      <div className="p-3 border-t border-white/[0.07] bg-[#171e2c]">
        <button
          onClick={onRequestLogout}
          title={isCollapsed ? t('navLogout') : undefined}
          className={`w-full flex items-center rounded-lg text-[13.5px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors group relative ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 text-rose-400" />
          {!isCollapsed && <span>{t('navLogout')}</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-rose-900 text-rose-100 text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {t('navLogout')}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
