'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFleet } from '@/context/FleetContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Activity,
  UserCheck,
  RotateCcw,
  Menu,
  ShieldAlert,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenRoleSwitcher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onOpenNotifications,
  onOpenSearch,
  onOpenRoleSwitcher,
}) => {
  const pathname = usePathname();
  const { state, setTheme, toggleSimulation, resetToSeedData } = useFleet();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleResetConfirm = () => {
    resetToSeedData();
    setShowResetConfirm(false);
    setShowResetSuccess(true);
    setTimeout(() => setShowResetSuccess(false), 3000);
  };

  const roleDisplayNames = {
    dispatcher: 'Dispatcher',
    driver: 'Driver',
    admin: 'Administrator',
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200 dark:border-fleet-border-dark bg-white/90 dark:bg-fleet-navy-900/90 backdrop-blur-md transition-colors">
        {/* Top Demo Context Banner */}
        <div className="bg-slate-900 text-slate-300 dark:bg-fleet-navy-800 text-[11px] py-1 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-fleet-primary animate-pulse" />
            <span className="font-semibold text-fleet-primary">Jeevix Technologies</span>
            <span className="hidden sm:inline text-slate-400">| FleetPulse Command Center</span>
            <span className="hidden md:inline text-slate-500 font-mono">Ref: JT/INT/2026/FE/027</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Client-Side Demo Sandbox</span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1"
              title="Reset all mutated data to deterministic seed fixtures"
            >
              <RotateCcw className="w-3 h-3" />
              Reset State
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={onOpenSidebar}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-fleet-navy-800 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fleet-cobalt to-fleet-primary flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5 text-fleet-navy-900 stroke-[2.5]" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    Fleet<span className="text-fleet-primary">Pulse</span>
                  </span>
                </div>
              </Link>

              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {pathname === '/dashboard' || pathname === '/'
                  ? 'Overview'
                  : pathname.split('/')[1]?.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Global Search trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-fleet-navy-800/80 hover:bg-slate-200 dark:hover:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet transition-colors"
              title="Search vehicles, trips, drivers (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Quick Search...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-fleet-navy-700 rounded border border-slate-300 dark:border-slate-600">
                ⌘K
              </kbd>
            </button>

            {/* GPS Simulation Status Pill */}
            <button
              onClick={toggleSimulation}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                state.simulationActive
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              }`}
              title="Click to pause or resume simulated GPS telemetry ticker"
            >
              <Radio className={`w-3.5 h-3.5 ${state.simulationActive ? 'animate-pulse' : ''}`} />
              <span>{state.simulationActive ? 'Simulated GPS Active' : 'Simulation Paused'}</span>
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={onOpenRoleSwitcher}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-fleet-cobalt/10 hover:bg-fleet-cobalt/20 text-fleet-cobalt dark:text-blue-400 border border-fleet-cobalt/30 rounded-fleet transition-colors"
              title="Switch demo role (Dispatcher, Driver, Admin)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{roleDisplayNames[state.session.role]}</span>
              <span className="text-[10px] opacity-70 hidden md:inline">▾</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-fleet-navy-800 rounded-fleet transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-fleet-navy-900" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-fleet-navy-800 rounded-fleet transition-colors"
              aria-label="Toggle dark/light theme"
              title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {state.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Seed Reset */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Demo Fleet State"
        description="This will restore all vehicle, trip, telemetry, and maintenance records to initial seed fixtures."
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-fleet text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold">Confirmation Required</p>
              <p className="mt-1">
                Any trips you created, defects reported, or vehicles registered during this session will be cleared from browser storage.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>
              Keep My Changes
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetConfirm}>
              Confirm Reset to Seeds
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Alert for Successful Reset */}
      {showResetSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-semibold rounded-fleet shadow-lg animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>FleetPulse database successfully restored to default seed fixtures!</span>
        </div>
      )}
    </>
  );
};
