'use client';

import React from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { DriverTripCockpit } from '@/components/driver/DriverTripCockpit';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  AlertTriangle,
  History,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';

export default function DriverDashboardPage() {
  const { state } = useFleet();

  // Find current driver profile based on session
  const activeDriver =
    state.drivers.find((d) => d.id === state.session.driverId) ||
    state.drivers.find((d) => d.id === 'drv-01') ||
    state.drivers[0];

  // Filter trips belonging to this driver persona
  const driverTrips = state.trips.filter((t) => t.driverId === activeDriver.id);
  const inProgressTrip = driverTrips.find((t) => t.status === 'inProgress');
  const scheduledTrip = driverTrips.find((t) => t.status === 'scheduled');
  const activeTrip = inProgressTrip || scheduledTrip;
  const completedTrips = driverTrips.filter((t) => t.status === 'completed');

  const activeVehicle = activeTrip
    ? state.vehicles.find((v) => v.id === activeTrip.vehicleId)
    : undefined;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Driver Persona Header */}
      <div className="p-4 bg-gradient-to-r from-fleet-navy-800 to-slate-900 border border-slate-800 rounded-fleet flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-fleet-primary/20 text-fleet-primary flex items-center justify-center font-bold text-lg border border-fleet-primary/40">
            {activeDriver.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold">{activeDriver.name}</h1>
              <Badge variant={activeDriver.status as any} size="sm">
                {activeDriver.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeDriver.licenseCategory} • Lic: {activeDriver.licenseNumber} • Rating:{' '}
              {activeDriver.rating}★
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/driver/issues">
            <Button
              variant="outline"
              size="sm"
              className="text-amber-400 border-amber-500/40 hover:bg-amber-500/10 text-xs"
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Trip Cockpit (Current mission) */}
      {activeTrip ? (
        <DriverTripCockpit trip={activeTrip} vehicle={activeVehicle} />
      ) : (
        <Card className="p-8 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Assigned Trips In Progress
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have an active departure. When a dispatcher assigns a consignment,
            it will appear here with its pre-trip safety checklist.
          </p>
        </Card>
      )}

      {/* Completed Trips History */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-fleet-primary" />
            Recent Completed Deliveries ({completedTrips.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {completedTrips.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No completed trips recorded for this driver persona yet.
            </p>
          ) : (
            completedTrips.slice(0, 5).map((trip) => {
              const veh = state.vehicles.find((v) => v.id === trip.vehicleId);
              return (
                <div
                  key={trip.id}
                  className="p-3 bg-slate-50 dark:bg-fleet-navy-800/60 border border-slate-200 dark:border-fleet-border-dark rounded-fleet flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {trip.tripNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {trip.origin.name} → {trip.destination.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Vehicle: {veh?.registration} • Distance: {trip.actualDistanceKm || trip.distanceKm} km
                    </div>
                  </div>
                  <Badge variant="available" size="sm">
                    Delivered
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
