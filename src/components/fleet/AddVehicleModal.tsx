'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VehicleCategory, VehicleStatus } from '@/types';
import { vehicleFormSchema, VehicleFormData } from '@/lib/validation/schemas';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useFleet();

  const [formData, setFormData] = useState({
    registration: '',
    name: '',
    make: '',
    category: 'Heavy Duty Truck' as VehicleCategory,
    status: 'available' as VehicleStatus,
    odometerKm: 0,
    capacityKg: 10000,
    fuelType: 'Diesel' as 'Diesel' | 'Electric' | 'CNG' | 'Hybrid',
    fuelLevelPct: 100,
    serviceDueDate: '2027-01-15',
    modelYear: 2024,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setDuplicateError(null);

    // 1. Check duplicate registration
    const formattedReg = formData.registration.trim().toUpperCase();
    const existing = state.vehicles.find(
      (v) => v.registration.toUpperCase() === formattedReg
    );
    if (existing) {
      setDuplicateError(
        `A vehicle with registration "${formattedReg}" already exists in the fleet registry.`
      );
      return;
    }

    // 2. Validate with Zod schema
    const parseResult = vehicleFormSchema.safeParse({
      ...formData,
      registration: formattedReg,
      odometerKm: Number(formData.odometerKm),
      capacityKg: Number(formData.capacityKg),
      fuelLevelPct: Number(formData.fuelLevelPct),
      modelYear: Number(formData.modelYear),
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // 3. Dispatch to canonical store
    const now = new Date().toISOString();
    const newId = `veh-${Date.now().toString().slice(-4)}`;
    const newVehicle = {
      id: newId,
      registration: formattedReg,
      name: formData.name.trim(),
      make: formData.make.trim(),
      category: formData.category,
      status: formData.status,
      odometerKm: Number(formData.odometerKm),
      capacityKg: Number(formData.capacityKg),
      fuelType: formData.fuelType,
      fuelLevelPct: Number(formData.fuelLevelPct),
      serviceDueDate: new Date(formData.serviceDueDate).toISOString(),
      telemetryId: `tel-${newId}`,
      modelYear: Number(formData.modelYear),
      healthScore: 100,
      notes: formData.notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: 'ADD_VEHICLE', payload: newVehicle });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Fleet Vehicle"
      description="Add an asset into the Jeevix Technologies vehicle registry with verified telematics ID."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {duplicateError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-fleet text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{duplicateError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Registration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registration Number *
            </label>
            <input
              type="text"
              required
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              placeholder="e.g. KA-01-EA-4821"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono uppercase focus:outline-none"
            />
            {errors.registration && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.registration}</p>
            )}
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vehicle Model Designation *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Tata Signa 4825.TK"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Make */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Manufacturer Make *
            </label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              placeholder="e.g. Tata Motors, BharatBenz, Volvo"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
            {errors.make && <p className="text-[11px] text-rose-500 mt-1">{errors.make}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vehicle Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as VehicleCategory })
              }
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Heavy Duty Truck">Heavy Duty Truck</option>
              <option value="Medium Freight">Medium Freight</option>
              <option value="Light Commercial">Light Commercial</option>
              <option value="Electric Cargo Van">Electric Cargo Van</option>
              <option value="Refrigerated Carrier">Refrigerated Carrier</option>
            </select>
          </div>

          {/* Initial Odometer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Odometer (km) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.odometerKm}
              onChange={(e) => setFormData({ ...formData, odometerKm: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
            />
            {errors.odometerKm && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.odometerKm}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payload Capacity (kg) *
            </label>
            <input
              type="number"
              min="100"
              required
              value={formData.capacityKg}
              onChange={(e) => setFormData({ ...formData, capacityKg: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
            />
            {errors.capacityKg && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.capacityKg}</p>
            )}
          </div>

          {/* Fuel / Powertrain */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Powertrain / Fuel
            </label>
            <select
              value={formData.fuelType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fuelType: e.target.value as 'Diesel' | 'Electric' | 'CNG' | 'Hybrid',
                })
              }
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="CNG">CNG</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Next Service Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.serviceDueDate}
              onChange={(e) => setFormData({ ...formData, serviceDueDate: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Operational Notes
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Dedicated to south corridor logistics."
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Register Vehicle
          </Button>
        </div>
      </form>
    </Modal>
  );
};
