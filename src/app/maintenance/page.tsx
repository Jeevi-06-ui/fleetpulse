'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { MaintenanceJob, MaintenanceType, MaintenancePriority, MaintenanceStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  Clock,
  Plus,
  CheckCircle2,
  DollarSign,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function MaintenancePage() {
  const { state, dispatch } = useFleet();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [resolveModalJob, setResolveModalJob] = useState<MaintenanceJob | null>(null);
  const [actualCost, setActualCost] = useState<number>(0);

  // Form State for new job
  const [formData, setFormData] = useState({
    vehicleId: state.vehicles[0]?.id || '',
    type: 'Preventive Service' as MaintenanceType,
    priority: 'medium' as MaintenancePriority,
    scheduledDate: '2026-12-05',
    costEstimate: 15000,
    technician: 'Authorized Fleet Maintenance Hub',
    notes: '',
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const refTime = new Date('2026-11-24T10:00:00.000Z').getTime();

  const filteredJobs = state.maintenanceJobs.filter((job) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') {
      return (
        (job.status === 'scheduled' || job.status === 'inProgress') &&
        new Date(job.scheduledDate).getTime() < refTime
      );
    }
    return job.status === statusFilter;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `maint-${Date.now().toString().slice(-4)}`;
    const jobCode = `MNT-2026-${Date.now().toString().slice(-3)}`;
    const now = new Date().toISOString();

    const targetVehicle = state.vehicles.find((v) => v.id === formData.vehicleId);

    const newJob: MaintenanceJob = {
      id: newId,
      jobCode,
      vehicleId: formData.vehicleId,
      type: formData.type,
      priority: formData.priority,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      status: 'scheduled',
      costEstimate: Number(formData.costEstimate),
      odometerKm: targetVehicle?.odometerKm || 50000,
      technician: formData.technician.trim(),
      notes: formData.notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: 'SCHEDULE_MAINTENANCE', payload: newJob });
    setScheduleModalOpen(false);
  };

  const handleResolveJob = () => {
    if (!resolveModalJob) return;
    dispatch({
      type: 'RESOLVE_MAINTENANCE',
      payload: {
        jobId: resolveModalJob.id,
        actualCost: actualCost || resolveModalJob.costEstimate,
      },
    });
    setResolveModalJob(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" />
            Fleet Maintenance & Workshop Central
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preventive service scheduling, workshop work orders, and vehicle return-to-service protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Service Records ({state.maintenanceJobs.length})</option>
            <option value="overdue">Overdue Services ({state.metrics.overdueMaintenanceCount})</option>
            <option value="inProgress">In Workshop / In Progress</option>
            <option value="scheduled">Scheduled Ahead</option>
            <option value="completed">Completed History</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setScheduleModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Schedule Service
          </Button>
        </div>
      </div>

      {/* Overdue Alert Strip if exists */}
      {state.metrics.overdueMaintenanceCount > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-fleet flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              {state.metrics.overdueMaintenanceCount} vehicle(s) have passed their scheduled maintenance deadline without completion.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('overdue')}
            className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
          >
            View Overdue List →
          </button>
        </div>
      )}

      {/* Maintenance Work Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-fleet-navy-800/80 border-b border-slate-200 dark:border-fleet-border-dark text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Job Code</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Cost (₹ INR)</th>
                <th className="py-3 px-4">Technician / Bay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-fleet-navy-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No maintenance records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const vehicle = state.vehicles.find((v) => v.id === job.vehicleId);
                  const isOverdue =
                    (job.status === 'scheduled' || job.status === 'inProgress') &&
                    new Date(job.scheduledDate).getTime() < refTime;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50 dark:hover:bg-fleet-navy-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {job.jobCode}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-fleet-primary">
                        <Link href={`/vehicles/${vehicle?.id}`} className="hover:underline">
                          {vehicle?.registration}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{job.type}</td>
                      <td className="py-3 px-4">
                        <span className={isOverdue ? 'text-amber-500 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                          {new Date(job.scheduledDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {isOverdue && (
                          <span className="block text-[10px] text-rose-500 font-mono uppercase font-bold">
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                            job.priority === 'critical'
                              ? 'bg-rose-500/10 text-rose-500'
                              : job.priority === 'high'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {job.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-900 dark:text-white">
                        ₹{(job.actualCost || job.costEstimate).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {job.technician}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={job.status === 'completed' ? 'available' : 'maintenance'}
                          size="sm"
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {job.status !== 'completed' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => {
                              setActualCost(job.costEstimate);
                              setResolveModalJob(job);
                            }}
                          >
                            Resolve Job
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Signed Off</span>
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

      {/* Schedule Service Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Preventive Service or Repair"
        description="Creates a verified maintenance work order and reserves the vehicle bay."
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Fleet Vehicle *
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            >
              {state.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration} — {v.name} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Maintenance Category *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as MaintenanceType })
                }
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Preventive Service">Preventive Service</option>
                <option value="Brake Inspection">Brake Inspection</option>
                <option value="Tire Replacement">Tire Replacement</option>
                <option value="Engine Diagnostic">Engine Diagnostic</option>
                <option value="Transmission Overhaul">Transmission Overhaul</option>
                <option value="Electrical & Battery">Electrical & Battery</option>
                <option value="Safety Recertification">Safety Recertification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as MaintenancePriority })
                }
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="low">Low (Routine)</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Immediate Grounding)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Service Date *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost Estimate (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.costEstimate}
                onChange={(e) => setFormData({ ...formData, costEstimate: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Authorized Service Workshop / Technician *
            </label>
            <input
              type="text"
              required
              value={formData.technician}
              onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Scope Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. 50,000 km oil service, air filter replacement, wheel alignment."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Work Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Maintenance Modal */}
      <Modal
        isOpen={!!resolveModalJob}
        onClose={() => setResolveModalJob(null)}
        title="Resolve & Close Service Order"
        description="Verify workshop completion and return the vehicle to available status."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Completing job <strong>{resolveModalJob?.jobCode}</strong> for vehicle{' '}
            <strong>
              {state.vehicles.find((v) => v.id === resolveModalJob?.vehicleId)?.registration}
            </strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Final Invoiced Actual Cost (₹ INR) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={actualCost}
              onChange={(e) => setActualCost(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setResolveModalJob(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResolveJob}>
              Sign Off & Return Vehicle to Fleet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
