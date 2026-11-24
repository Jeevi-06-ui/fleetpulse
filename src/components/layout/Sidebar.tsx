'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFleet } from '@/context/FleetContext';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Send,
  CalendarPlus,
  Wrench,
  BarChart3,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  Settings,
  ShieldCheck,
  Compass,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoleSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenRoleSwitcher }) => {
  const pathname = usePathname();
  const { state } = useFleet();
  const role = state.session.role;

  // Role-aware menu definitions
  const dispatcherNav = [
    { label: 'Fleet Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicle Registry', href: '/vehicles', icon: Truck },
    { label: 'Live Telemetry Map', href: '/tracking', icon: MapPin },
    { label: 'Trips & Dispatch', href: '/trips', icon: Send },
    { label: 'Schedule New Trip', href: '/trips/new', icon: CalendarPlus },
    { label: 'Maintenance Schedule', href: '/maintenance', icon: Wrench },
    { label: 'Fleet Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Export Reports', href: '/reports', icon: FileSpreadsheet },
  ];

  const driverNav = [
    { label: 'Driver Cockpit', href: '/driver', icon: Compass },
    { label: 'Report Defect / Issue', href: '/driver/issues', icon: AlertTriangle },
    { label: 'Live Route Tracking', href: '/tracking', icon: MapPin },
  ];

  const adminNav = [
    { label: 'Command Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicle Management', href: '/vehicles', icon: Truck },
    { label: 'Driver Directory', href: '/admin/drivers', icon: Users },
    { label: 'Live Telemetry Map', href: '/tracking', icon: MapPin },
    { label: 'Trips & Scheduling', href: '/trips', icon: Send },
    { label: 'Service & Maintenance', href: '/maintenance', icon: Wrench },
    { label: 'Inspections & Defects', href: '/inspections', icon: AlertTriangle },
    { label: 'Analytics & KPIs', href: '/analytics', icon: BarChart3 },
    { label: 'Reports & CSV Export', href: '/reports', icon: FileSpreadsheet },
    { label: 'Settings & Audit Logs', href: '/settings', icon: Settings },
  ];

  const navItems = role === 'driver' ? driverNav : role === 'admin' ? adminNav : dispatcherNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fleet-cobalt to-fleet-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-fleet-navy-900" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-wide">
                Fleet<span className="text-fleet-primary">Pulse</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Logistics OS
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Badge */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-fleet border border-slate-700/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Demo Role
            </span>
            <button
              onClick={onOpenRoleSwitcher}
              className="text-[11px] text-fleet-primary hover:underline font-semibold"
            >
              Switch
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <ShieldCheck className="w-4 h-4 text-fleet-primary" />
            <span className="text-sm font-semibold text-white capitalize">{role}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate" title={state.session.userName}>
            {state.session.userName}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-fleet transition-all ${
                  isActive
                    ? 'bg-fleet-primary/15 text-fleet-primary font-semibold border-l-2 border-fleet-primary pl-2.5 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-fleet-primary' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Brand Motto & Attribution */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/60">
          <div className="text-white font-medium text-xs">Jeevix Technologies</div>
          <div className="italic text-[10px] text-slate-400 mt-0.5">
            Engineering Tomorrow Into Reality
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2">
            Chandan Mayur A • FE Intern
          </div>
        </div>
      </aside>
    </>
  );
};
