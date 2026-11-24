'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { tripFormSchema, TripFormData } from '@/lib/validation/schemas';
import { ArrowLeft, Send, AlertTriangle, ShieldCheck, Clock, MapPin, Truck, User } from 'lucide-react';

const COMMON_HUBS = [
  { name: 'Bengaluru Central Logistics Hub', coords: [35, 75] as [number, number] },
  { name: 'Chennai Port Container Freight Station', coords: [85, 78] as [number, number] },
  { name: 'Hyderabad Shamshabad Cargo Terminal', coords: [55, 52] as [number, number] },
  { name: 'Pune Chakan Auto Cluster', coords: [25, 45] as [number, number] },
  { name: 'Mumbai JNPT Freight Village', coords: [20, 40] as [number, number] },
  { name: 'Hosur SIPCOT Industrial Park', coords: [42, 80] as [number, number] },
  { name: 'Coimbatore Industrial Cluster', coords: [40, 90] as [number, number] },
  { name: 'Salem Steel Logistics Hub', coords: [46, 88] as [number, number] },
];

function NewTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId') || '';

  const { state, dispatch, checkTripConflicts } = useFleet();

  const [formData, setFormData] = useState({
    originName: 'Bengaluru Central Logistics Hub',
    destinationName: 'Chennai Port Container Freight Station',
    driverId: state.drivers.find((d) => d.status === 'available')?.id || state.drivers[0]?.id || '',
    vehicleId: preselectedVehicleId || state.vehicles.find((v) => v.status === 'available')?.id || state.vehicles[0]?.id || '',
    scheduledStart: '2026-11-25T07:00',
    scheduledEnd: '2026-11-25T15:00',
    distanceKm: 345,
    cargoDescription: 'Industrial Machinery & Precision Tools',
    cargoWeightKg: 14000,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleOriginChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      originName: val,
      distanceKm: val === prev.destinationName ? 0 : 340,
    }));
  };

  const handleDestinationChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      destinationName: val,
      distanceKm: val === prev.originName ? 0 : 340,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setConflictError(null);

    // 1. Zod Validation
    const startIso = new Date(formData.scheduledStart).toISOString();
    const endIso = new Date(formData.scheduledEnd).toISOString();

    const parseResult = tripFormSchema.safeParse({
      ...formData,
      scheduledStart: startIso,
      scheduledEnd: endIso,
      distanceKm: Number(formData.distanceKm),
      cargoWeightKg: Number(formData.cargoWeightKg),
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

    // 2. Schedule Conflict Engine Check
    const conflictResult = checkTripConflicts({
      vehicleId: formData.vehicleId,
      driverId: formData.driverId,
      scheduledStart: startIso,
      scheduledEnd: endIso,
    });

    if (conflictResult.hasConflict) {
      setConflictError(conflictResult.message || 'Scheduling conflict detected.');
      return;
    }

    // 3. Assemble and Dispatch Trip
    const originHub = COMMON_HUBS.find((h) => h.name === formData.originName) || {
      name: formData.originName,
      coords: [35, 75] as [number, number],
    };
    const destHub = COMMON_HUBS.find((h) => h.name === formData.destinationName) || {
      name: formData.destinationName,
      coords: [85, 78] as [number, number],
    };

    const newTripId = `trip-${Date.now().toString().slice(-4)}`;
    const tripNum = `FP-2026-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newTrip = {
      id: newTripId,
      tripNumber: tripNum,
      origin: {
        name: originHub.name,
        address: `${originHub.name} Depot Area`,
        coordinates: originHub.coords,
      },
      destination: {
        name: destHub.name,
        address: `${destHub.name} Receiving Terminal`,
        coordinates: destHub.coords,
      },
      routePoints: [originHub.coords, destHub.coords],
      scheduledStart: startIso,
      scheduledEnd: endIso,
      driverId: formData.driverId,
      vehicleId: formData.vehicleId,
      distanceKm: Number(formData.distanceKm),
      cargoDescription: formData.cargoDescription.trim(),
      cargoWeightKg: Number(formData.cargoWeightKg),
      status: 'scheduled' as const,
      checklist: [
        { id: 'chk-1', label: 'Tire Pressure & Tread Depth verified', completed: false, required: true },
        { id: 'chk-2', label: 'Engine Oil & Coolant Levels inspected', completed: false, required: true },
        { id: 'chk-3', label: 'Brake Hydraulics & Air Pressure tested', completed: false, required: true },
        { id: 'chk-4', label: 'Headlamps, Indicators & Brake Lights functional', completed: false, required: true },
        { id: 'chk-5', label: 'Cargo Restraints & Door Seals verified', completed: false, required: true },
      ],
      notes: formData.notes.trim() || undefined,
      statusHistory: [
        {
          status: 'scheduled' as const,
          timestamp: now,
          actor: `${state.session.userName} (${state.session.role})`,
          note: 'Trip scheduled via Dispatch Management Console.',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: 'CREATE_TRIP', payload: newTrip });
    router.push(`/trips/${newTrip.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/trips">
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-fleet-primary" />
            Dispatch & Schedule New Freight Consignment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plan route schedule with automated driver & vehicle conflict detection.
          </p>
        </div>
      </div>

      {/* Main Trip Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Conflict Alert Banner */}
          {conflictError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-fleet text-xs text-rose-600 dark:text-rose-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Dispatch Scheduling Conflict</p>
                <p className="mt-1 leading-relaxed">{conflictError}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Tip: Select an alternate vehicle or driver, or adjust scheduled start/end times.
                </p>
              </div>
            </div>
          )}

          {/* Section: Route Origin & Destination */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-fleet-primary" /> Route Corridors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Origin Hub / Terminal *
                </label>
                <select
                  value={formData.originName}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                >
                  {COMMON_HUBS.map((h) => (
                    <option key={h.name} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                </select>
                {errors.originName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.originName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Terminal *
                </label>
                <select
                  value={formData.destinationName}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                >
                  {COMMON_HUBS.map((h) => (
                    <option key={h.name} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                </select>
                {errors.destinationName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.destinationName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Schedule Timing */}
          <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-fleet-cobalt" /> Schedule Window
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                />
                {errors.scheduledStart && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.scheduledStart}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledEnd}
                  onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                />
                {errors.scheduledEnd && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.scheduledEnd}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Asset Allocation (Vehicle & Driver) */}
          <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-teal-400" /> Asset Allocation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Transport Vehicle *
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                >
                  {state.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration} — {v.name} ({v.category} • {v.status})
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.vehicleId}</p>
                )}
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Driver Persona *
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                >
                  {state.drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseCategory} • {d.status})
                    </option>
                  ))}
                </select>
                {errors.driverId && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.driverId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Cargo Details & Distance */}
          <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Distance (km) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cargo Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cargoDescription}
                  onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                  placeholder="e.g. Precision Electronics"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cargo Payload (kg) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.cargoWeightKg}
                  onChange={(e) => setFormData({ ...formData, cargoWeightKg: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-fleet-border-dark flex items-center justify-end gap-3">
            <Link href="/trips">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={<Send className="w-4 h-4" />}
            >
              Verify & Authorize Dispatch
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewTripPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading dispatch form...</div>}>
      <NewTripContent />
    </Suspense>
  );
}
