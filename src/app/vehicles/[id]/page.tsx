'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Truck,
  ArrowLeft,
  Calendar,
  Gauge,
  Weight,
  Fuel,
  Wrench,
  Send,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Archive,
  History,
  Activity,
} from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useFleet();
  const vehicleId = params.id as string;

  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const vehicle = state.vehicles.find((v) => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested vehicle identifier ({vehicleId}) does not exist in the fleet registry.
        </p>
        <Link href="/vehicles">
          <Button variant="primary" size="sm">
            Return to Fleet Registry
          </Button>
        </Link>
      </div>
    );
  }

  // Related data
  const telemetry = state.telemetry[vehicle.telemetryId];
  const assignedDriver = state.drivers.find((d) => d.id === vehicle.assignedDriverId);
  const vehicleTrips = state.trips.filter((t) => t.vehicleId === vehicle.id);
  const vehicleMaintenance = state.maintenanceJobs.filter((m) => m.vehicleId === vehicle.id);
  const vehicleDefects = state.defects.filter((d) => d.vehicleId === vehicle.id);

  // Archive safety check
  const handleArchiveConfirm = () => {
    // Check if vehicle is currently on an active trip
    const activeTrip = state.trips.find(
      (t) => t.vehicleId === vehicle.id && (t.status === 'inProgress' || t.status === 'scheduled')
    );
    if (activeTrip) {
      setArchiveError(
        `Cannot archive vehicle: It is currently committed to active trip ${activeTrip.tripNumber}. Cancel or reassign the trip first.`
      );
      return;
    }

    dispatch({ type: 'ARCHIVE_VEHICLE', payload: vehicle.id });
    setArchiveModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/vehicles">
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {vehicle.registration}
              </h1>
              <Badge variant={vehicle.status as any} size="sm">
                {vehicle.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {vehicle.name} • {vehicle.make} ({vehicle.modelYear}) • {vehicle.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/trips/new?vehicleId=${vehicle.id}`}>
            <Button
              variant="primary"
              size="sm"
              disabled={vehicle.status === 'maintenance' || vehicle.status === 'inactive'}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Dispatch This Vehicle
            </Button>
          </Link>

          {vehicle.status !== 'inactive' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setArchiveError(null);
                setArchiveModalOpen(true);
              }}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              icon={<Archive className="w-3.5 h-3.5" />}
            >
              Decommission Asset
            </Button>
          )}
        </div>
      </div>

      {/* Specifications & Asset Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Odometer</span>
            <Gauge className="w-4 h-4 text-fleet-primary" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {vehicle.odometerKm.toLocaleString('en-IN')} km
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded vehicle distance</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Payload Capacity</span>
            <Weight className="w-4 h-4 text-fleet-cobalt" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {vehicle.capacityKg.toLocaleString('en-IN')} kg
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Certified gross limit</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Fuel / Powertrain</span>
            <Fuel className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {vehicle.fuelType} ({vehicle.fuelLevelPct}%)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tank / state of charge</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Inspection Health</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {vehicle.healthScore} / 100
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Service due: {new Date(vehicle.serviceDueDate).toLocaleDateString()}
          </div>
        </Card>
      </div>

      {/* Two Column Section: Telematics & Driver Assignment vs Recent Service & Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Simulated Telemetry & Current Assignment */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-fleet-primary" />
              Simulated Telemetry & Sensor Position
            </h3>

            {telemetry ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-fleet-navy-800/80 rounded-fleet border border-slate-200 dark:border-fleet-border-dark grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Current Velocity:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {telemetry.speedKmh} km/h
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Compass Heading:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {telemetry.heading}°
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Engine Temp:</span>
                    <div className="font-mono text-slate-900 dark:text-white">
                      {telemetry.engineTempC}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Connectivity:</span>
                    <div className="font-mono text-emerald-400 uppercase font-semibold">
                      {telemetry.connectivity}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Schematic Coordinates: [{telemetry.coordinates.join(', ')}]</span>
                  <Link
                    href="/tracking"
                    className="text-fleet-primary hover:underline font-semibold"
                  >
                    Open Schematic Map →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active telemetry feed available.</p>
            )}
          </Card>

          {/* Assigned Driver Profile */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-fleet-cobalt" />
              Active Driver Roster Assignment
            </h3>

            {assignedDriver ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-fleet-navy-800/80 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {assignedDriver.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {assignedDriver.licenseCategory} • Contact: {assignedDriver.contactNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Rating: {assignedDriver.rating}★ • {assignedDriver.totalTripsCompleted} trips completed
                  </div>
                </div>
                <Badge variant={assignedDriver.status as any} size="sm">
                  {assignedDriver.status}
                </Badge>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-fleet-navy-800/40 rounded-fleet text-xs text-slate-400 text-center">
                Vehicle is currently unassigned. Ready for driver dispatch.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Historical Trips & Maintenance Logs */}
        <div className="space-y-6">
          {/* Trip History for this Vehicle */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-fleet-primary" />
                Trip History ({vehicleTrips.length})
              </h3>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {vehicleTrips.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No trips recorded for this vehicle yet.
                </p>
              ) : (
                vehicleTrips.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-slate-50 dark:bg-fleet-navy-800/60 border border-slate-200 dark:border-fleet-border-dark rounded-fleet flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {t.tripNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.origin.name} → {t.destination.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={t.status as any} size="sm">
                        {t.status}
                      </Badge>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {t.distanceKm} km
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Maintenance & Service Records */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Service History & Work Orders ({vehicleMaintenance.length})
              </h3>
              <Link
                href="/maintenance"
                className="text-xs text-fleet-primary hover:underline font-semibold"
              >
                Schedule Service →
              </Link>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {vehicleMaintenance.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No maintenance work orders filed for this vehicle.
                </p>
              ) : (
                vehicleMaintenance.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-slate-50 dark:bg-fleet-navy-800/60 border border-slate-200 dark:border-fleet-border-dark rounded-fleet flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{m.type}</div>
                      <div className="text-[11px] text-slate-500">{m.technician}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Scheduled: {new Date(m.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={m.status === 'completed' ? 'available' : 'maintenance'} size="sm">
                        {m.status}
                      </Badge>
                      <div className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mt-1">
                        ₹{(m.actualCost || m.costEstimate).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title="Decommission Vehicle Asset"
        description="Are you sure you want to mark this vehicle as inactive?"
      >
        <div className="space-y-4">
          {archiveError ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-fleet text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{archiveError}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Decommissioning <strong>{vehicle.registration}</strong> will set its status to inactive.
              It will no longer be available for dispatch or scheduled trips.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!!archiveError}
              onClick={handleArchiveConfirm}
            >
              Confirm Decommission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
