'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { NotificationDrawer } from './NotificationDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { RoleSwitcherModal } from './RoleSwitcherModal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fleet-bg-light dark:bg-fleet-bg-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
      />

      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <RoleSwitcherModal
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
      />
    </div>
  );
};
