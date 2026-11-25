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
    <div className="h-screen max-h-screen bg-[#f4f7fa] text-slate-800 flex font-sans overflow-hidden relative">
      {/* 1. Full-Height Left Dark Slate Sidebar (Admindek Style) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onCollapse={() => setIsCollapsed(true)}
        onRequestLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Right Column: Clean White Header + Light Gray Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="admindek-light flex-1 p-4 sm:p-6 lg:p-7 min-w-0 overflow-y-auto h-full w-full bg-[#f4f7fa]">
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
