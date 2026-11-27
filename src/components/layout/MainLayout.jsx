import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="h-screen max-h-screen bg-[#ecf0f5] text-slate-800 flex font-sans overflow-hidden relative">
      {/* 1. Full-Height Classic AdminLTE Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onCollapse={() => setIsCollapsed(true)}
        onRequestLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Right Column: Classic Steel Blue Header + #ecf0f5 Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="admindek-light flex-1 p-4 sm:p-5 lg:p-6 min-w-0 overflow-y-auto h-full w-full bg-[#ecf0f5]">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Yes or No Logout Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
