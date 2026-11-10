import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="h-screen max-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans overflow-hidden relative">
      {/* 1. Top Fixed Header: Full Width with Logo, Brand Name & Toggle Button (Like Banking) */}
      <Header
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* 2. Main Flex Row: Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        {/* Left Sidebar (collapses/expands under header) */}
        <Sidebar
          isCollapsed={isCollapsed}
          onCollapse={() => setIsCollapsed(true)}
          onRequestLogout={() => setIsLogoutModalOpen(true)}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto h-full w-full">
          <div className="w-full">
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
