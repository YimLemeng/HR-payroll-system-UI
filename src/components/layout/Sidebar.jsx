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
      title: lang === 'km' ? 'ទិដ្ឋភាពទូទៅ' : 'OVERVIEW',
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
      className={`bg-[#222d32] text-[#b8c7ce] flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 z-30 ${
        isCollapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Classic AdminLTE Top Brand Block (#367fa9) */}
      <button
        type="button"
        onClick={() => handleItemClick('dashboard')}
        className={`h-14 w-full bg-[#367fa9] hover:bg-[#317399] transition-colors flex items-center shrink-0 cursor-pointer ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-2.5'}`}
      >
        <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center text-white shrink-0">
          <Users className="w-4 h-4" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-[15px] tracking-wide text-white truncate">
            HR &amp; PAYROLL
          </span>
        )}
      </button>

      {/* Classic Grouped Navigation */}
      <nav className="py-2 overflow-y-auto overflow-x-hidden flex-1">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-1">
            {!isCollapsed && (
              <div className="px-4 py-2 bg-[#1a2226] text-[10px] font-semibold tracking-wider text-[#4b646f] uppercase">
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
                  className={`w-full flex items-center text-[13.5px] transition-colors group relative border-l-[3px] ${
                    isCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-4 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#1e282c] text-white font-semibold border-[#3c8dbc]'
                      : 'border-transparent text-[#b8c7ce] hover:text-white hover:bg-[#1e282c]'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'gap-3 min-w-0'}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#3c8dbc]' : 'text-[#8aa4af] group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#8aa4af] shrink-0" />
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1a2226] text-white text-xs font-medium rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Classic Logout Footer */}
      <div className="border-t border-[#1a2226] bg-[#1a2226]">
        <button
          onClick={onRequestLogout}
          title={isCollapsed ? t('navLogout') : undefined}
          className={`w-full flex items-center text-[13.5px] font-medium text-rose-400 hover:text-rose-300 hover:bg-[#1e282c] transition-colors group relative ${
            isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{t('navLogout')}</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-rose-900 text-rose-100 text-xs font-medium rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {t('navLogout')}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
