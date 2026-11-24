'use client';

import React from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { X, CheckCheck, Bell, AlertTriangle, Info, AlertOctagon, CheckCircle } from 'lucide-react';
import { NotificationSeverity } from '@/types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useFleet();

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRecordLink = (linkedRecord?: { type: string; id: string }) => {
    if (!linkedRecord) return null;
    switch (linkedRecord.type) {
      case 'vehicle':
        return `/vehicles/${linkedRecord.id}`;
      case 'trip':
        return `/trips/${linkedRecord.id}`;
      case 'maintenance':
        return `/maintenance`;
      case 'defect':
        return `/inspections`;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white dark:bg-fleet-navy-900 h-full border-l border-slate-200 dark:border-fleet-border-dark flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-fleet-border-dark">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-fleet-primary" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Fleet Alerts & Logs</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-fleet-primary/10 text-fleet-primary font-mono font-medium">
              {state.notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-fleet-primary flex items-center gap-1 font-medium"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              aria-label="Close notifications panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-fleet-navy-800">
          {state.notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No notifications or alerts recorded yet.
            </div>
          ) : (
            state.notifications.map((n) => {
              const link = getRecordLink(n.linkedRecord);
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`p-4 transition-colors ${
                    !n.read
                      ? 'bg-fleet-primary/5 dark:bg-fleet-primary/5'
                      : 'hover:bg-slate-50 dark:hover:bg-fleet-navy-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{getSeverityIcon(n.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-fleet-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {link && (
                          <Link
                            href={link}
                            onClick={onClose}
                            className="text-[11px] font-medium text-fleet-primary hover:underline"
                          >
                            View Record →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
