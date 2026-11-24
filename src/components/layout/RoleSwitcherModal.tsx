'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { ShieldCheck, Truck, Users, Compass, AlertCircle } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { state, switchRole } = useFleet();
  const [selectedRole, setSelectedRole] = useState<UserRole>(state.session.role);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    state.session.driverId || state.drivers[0]?.id || ''
  );

  const handleApply = () => {
    switchRole(selectedRole, selectedRole === 'driver' ? selectedDriverId : undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Demo Role & Persona"
      description="Experience FleetPulse through the distinct responsibilities of Dispatch, Driver, or Administration."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dispatcher */}
          <button
            type="button"
            onClick={() => setSelectedRole('dispatcher')}
            className={`p-3.5 rounded-fleet border text-left transition-all ${
              selectedRole === 'dispatcher'
                ? 'border-fleet-primary bg-fleet-primary/10 shadow-sm'
                : 'border-slate-200 dark:border-fleet-border-dark hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Dispatcher</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Vehicle fleet registration, trip creation, conflict resolution, live routing.
            </p>
          </button>

          {/* Driver */}
          <button
            type="button"
            onClick={() => setSelectedRole('driver')}
            className={`p-3.5 rounded-fleet border text-left transition-all ${
              selectedRole === 'driver'
                ? 'border-fleet-primary bg-fleet-primary/10 shadow-sm'
                : 'border-slate-200 dark:border-fleet-border-dark hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Driver</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Mobile cockpit, 5-point checklist, trip execution, reporting defects.
            </p>
          </button>

          {/* Administrator */}
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`p-3.5 rounded-fleet border text-left transition-all ${
              selectedRole === 'admin'
                ? 'border-fleet-primary bg-fleet-primary/10 shadow-sm'
                : 'border-slate-200 dark:border-fleet-border-dark hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Administrator</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Maintenance scheduling, driver records, KPI metrics, CSV reports & audit.
            </p>
          </button>
        </div>

        {/* Fictional Driver Selection (Shown when driver role is chosen) */}
        {selectedRole === 'driver' && (
          <div className="p-3 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark space-y-2">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Select Fictional Demo Driver Persona
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full text-xs p-2 bg-white dark:bg-fleet-navy-900 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            >
              {state.drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.name} ({drv.licenseCategory} • {drv.status})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Driver portal will filter assigned trips and issue reports to this persona.
            </p>
          </div>
        )}

        {/* Demo Security Notice */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-fleet text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
          <p className="text-[11px]">
            <strong>Note on authorization:</strong> This role switcher manages client-side demo permissions and UI view states for testing. It does not represent a production auth boundary.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Switch Persona
          </Button>
        </div>
      </div>
    </Modal>
  );
};
