'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Settings, ShieldCheck, RotateCcw, AlertTriangle, Bug, History } from 'lucide-react';

export default function SettingsPage() {
  const { state, dispatch, setTheme, resetToSeedData, toggleErrorMode } = useFleet();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-fleet-primary" />
          System Settings & Audit Controls
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Demo environment configuration, QA simulated error controls, versioned local storage, and audit logs.
        </p>
      </div>

      {/* QA & Testing Resilience Controls */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Bug className="w-4 h-4 text-fleet-primary" />
          QA Test Suite & Mock Failure Controls
        </h3>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark text-xs">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Simulate 500 Telematics Server Failure
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Forces mock API endpoints to throw controlled 500 error envelopes to test error and retry states.
            </div>
          </div>
          <Button
            variant={state.simulatedErrorMode ? 'danger' : 'outline'}
            size="sm"
            onClick={toggleErrorMode}
          >
            {state.simulatedErrorMode ? 'Error Mode ACTIVE' : 'Error Mode Inactive'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark text-xs">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Storage Version & Reset to Seed Fixtures
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Active Storage: <strong>FLEETPULSE_STATE_V1.0</strong> • Restores all records to default seed data.
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setResetConfirmOpen(true)}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset All State
          </Button>
        </div>
      </Card>

      {/* System Audit Log Activity */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-fleet-cobalt" />
            Immutable Audit Trail Activity ({state.auditLogs.length})
          </h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Real-Time Ledger</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-fleet-navy-800">
          {state.auditLogs.map((log) => (
            <div key={log.id} className="pt-2 text-xs flex items-start justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-fleet-primary text-[11px]">
                  [{log.action}]
                </span>
                <span className="text-slate-700 dark:text-slate-300 ml-2">
                  {log.description}
                </span>
                <div className="text-[10px] text-slate-500 mt-0.5">Actor: {log.demoActor}</div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset FleetPulse Demo Database"
        description="Are you sure you want to restore initial seed fixtures?"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-fleet text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This operation resets all vehicle mutations, newly created trips, checklist toggles, and reported defects back to standard deterministic seeds.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetToSeedData();
                setResetConfirmOpen(false);
              }}
            >
              Confirm Full Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
