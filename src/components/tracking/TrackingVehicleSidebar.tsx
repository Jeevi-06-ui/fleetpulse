'use client';

import React from 'react';
import Link from 'next/link';
import { Vehicle, Telemetry, Driver, Trip } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Truck,
  Gauge,
  Navigation2,
  Fuel,
  Activity,
  Send,
  X,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface TrackingVehicleSidebarProps {
  vehicle: Vehicle | null;
  telemetry: Telemetry | null;
  driver: Driver | null;
  activeTrip: Trip | null;
  onClose: () => void;
}

export const TrackingVehicleSidebar: React.FC<TrackingVehicleSidebarProps> = ({
  vehicle,
  telemetry,
  driver,
  activeTrip,
  onClose,
}) => {
  if (!vehicle) {
    return (
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center text-slate-400">
        <Truck className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          No Vehicle Selected
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Click any vehicle marker on the schematic map to inspect simulated telemetry and active trip details.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 h-full flex flex-col justify-between overflow-y-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-fleet-border-dark">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                {vehicle.registration}
              </span>
              <Badge variant={vehicle.status as any} size="sm">
                {vehicle.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {vehicle.name} • {vehicle.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
            aria-label="Close vehicle dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Telemetry Sensor Metrics */}
        {telemetry && (
          <div className="mt-4 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Live Sensor Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-teal-400" /> Velocity
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {telemetry.speedKmh} km/h
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Navigation2 className="w-3 h-3 text-blue-400" /> Heading
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {telemetry.heading}°
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-emerald-400" /> Fuel / Battery
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {telemetry.fuelLevelPct}%
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-400" /> Engine Temp
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {telemetry.engineTempC}°C
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
              <span>Telemetry ID: {telemetry.vehicleId}</span>
              <span className="text-emerald-400 uppercase font-semibold">
                ● {telemetry.connectivity}
              </span>
            </div>
          </div>
        )}

        {/* Active Trip Dossier */}
        {activeTrip ? (
          <div className="mt-4 p-3 bg-fleet-primary/5 border border-fleet-primary/20 rounded-fleet space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-fleet-primary">{activeTrip.tripNumber}</span>
              <Badge variant="inTransit" size="sm">
                En Route
              </Badge>
            </div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {activeTrip.origin.name} → {activeTrip.destination.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Cargo: {activeTrip.cargoDescription} ({activeTrip.cargoWeightKg.toLocaleString()} kg)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                Est Arrival:{' '}
                {new Date(activeTrip.scheduledEnd).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="pt-1">
              <Link
                href={`/trips/${activeTrip.id}`}
                className="text-xs font-semibold text-fleet-primary hover:underline"
              >
                View Trip Details & Timeline →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-fleet-navy-800/50 rounded-fleet text-xs text-slate-400">
            No active trip currently assigned to this vehicle.
          </div>
        )}

        {/* Assigned Driver */}
        {driver && (
          <div className="mt-4 text-xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Rostered Driver
            </span>
            <div className="font-semibold text-slate-900 dark:text-white">{driver.name}</div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
              {driver.licenseCategory} • {driver.contactNumber}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-fleet-border-dark flex gap-2">
        <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Vehicle Dossier
          </Button>
        </Link>
        {vehicle.status === 'available' && (
          <Link href={`/trips/new?vehicleId=${vehicle.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Dispatch
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};
