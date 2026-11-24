'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { InspectionDefect, DefectStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, CheckCircle2, ShieldAlert, Truck, User, ArrowRight, Eye } from 'lucide-react';

export default function InspectionsPage() {
  const { state, dispatch } = useFleet();
  const [resolveModalDefect, setResolveModalDefect] = useState<InspectionDefect | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredDefects = state.defects.filter((d) => {
    if (severityFilter === 'all') return true;
    return d.severity === severityFilter;
  });

  const handleResolveDefect = () => {
    if (!resolveModalDefect) return;
    dispatch({
      type: 'RESOLVE_DEFECT',
      payload: {
        defectId: resolveModalDefect.id,
        resolutionNotes: resolutionNotes.trim() || 'Defect inspected and resolved by technician.',
      },
    });
    setResolveModalDefect(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Safety Defect Logs & Inspections
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Driver pre-trip exceptions, mechanical hazard reports, and engineering sign-off resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Severities ({state.defects.length})</option>
            <option value="critical">Critical (Grounding)</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium</option>
            <option value="low">Low Severity</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-fleet-navy-800/80 border-b border-slate-200 dark:border-fleet-border-dark text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Defect Code</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Reported At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-fleet-navy-800">
              {filteredDefects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No defects recorded for the selected severity level.
                  </td>
                </tr>
              ) : (
                filteredDefects.map((def) => {
                  const vehicle = state.vehicles.find((v) => v.id === def.vehicleId);
                  const driver = state.drivers.find((d) => d.id === def.reporterDriverId);

                  return (
                    <tr
                      key={def.id}
                      className="hover:bg-slate-50 dark:hover:bg-fleet-navy-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {def.defectCode}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-fleet-primary">
                        <Link href={`/vehicles/${vehicle?.id}`} className="hover:underline">
                          {vehicle?.registration}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {driver?.name || 'Driver'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                            def.severity === 'critical'
                              ? 'bg-rose-500/10 text-rose-500'
                              : def.severity === 'high'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {def.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {def.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(def.reportedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={def.status === 'resolved' ? 'available' : 'danger'}
                          size="sm"
                        >
                          {def.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {def.status !== 'resolved' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => {
                              setResolutionNotes('');
                              setResolveModalDefect(def);
                            }}
                          >
                            Resolve Defect
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono">Resolved</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Defect Resolution Modal */}
      <Modal
        isOpen={!!resolveModalDefect}
        onClose={() => setResolveModalDefect(null)}
        title="Resolve & Clear Defect"
        description="Record resolution findings to release grounding and clear vehicle status."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Resolving defect <strong>{resolveModalDefect?.defectCode}</strong> on vehicle{' '}
            <strong>
              {state.vehicles.find((v) => v.id === resolveModalDefect?.vehicleId)?.registration}
            </strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resolution & Repair Notes *
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Fitted new hydraulic hose clamp, topped up fluid, test-driven 5 km without pressure drops."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setResolveModalDefect(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!resolutionNotes.trim()}
              onClick={handleResolveDefect}
            >
              Sign Off Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
