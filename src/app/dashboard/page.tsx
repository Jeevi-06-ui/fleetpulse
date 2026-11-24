'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { KpiStrip } from '@/components/fleet/KpiStrip';
import { VehicleStatusChart } from '@/components/fleet/VehicleStatusChart';
import { AddVehicleModal } from '@/components/fleet/AddVehicleModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Send,
  Truck,
  AlertTriangle,
  Wrench,
  ArrowRight,
  MapPin,
  Clock,
  Compass,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

export default function DashboardPage() {
  const { state } = useFleet();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  const inTransitTrips = state.trips.filter((t) => t.status === 'inProgress');
  const upcomingTrips = state.trips.filter((t) => t.status === 'scheduled').slice(0, 4);
  const criticalDefects = state.defects.filter((d) => d.severity === 'critical' && d.status !== 'resolved');
  const overdueJobs = state.maintenanceJobs.filter(
    (j) => (j.status === 'scheduled' || j.status === 'inProgress') &&
           new Date(j.scheduledDate).getTime() < new Date('2026-11-24T10:00:00.000Z').getTime()
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Fleet Operations Command Center
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telematics Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-depot fleet monitoring, dispatch routing, asset health, and maintenance workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/trips/new">
            <Button variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
              Dispatch Trip
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddVehicleOpen(true)}
            icon={<Truck className="w-3.5 h-3.5" />}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Computed KPI Strip */}
      <KpiStrip />

      {/* Actionable Alerts Banner (if any critical defect or overdue maintenance exists) */}
      {(criticalDefects.length > 0 || overdueJobs.length > 0) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-fleet flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                Action Required: {criticalDefects.length} Critical Defect(s) & {overdueJobs.length} Overdue Service(s)
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                Vehicles flagged with critical safety defects are automatically grounded from new trip assignments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalDefects.length > 0 && (
              <Link href="/inspections">
                <Button variant="outline" size="sm" className="text-xs">
                  Inspect Defects
                </Button>
              </Link>
            )}
            {overdueJobs.length > 0 && (
              <Link href="/maintenance">
                <Button variant="outline" size="sm" className="text-xs">
                  Review Service Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Interactive Charts: Status & Asset Distribution */}
      <VehicleStatusChart />

      {/* Split Section: In-Transit Live Trips vs Upcoming Scheduled Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active In-Transit Telemetry Strip */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Active Convoys & In-Transit Telemetry ({inTransitTrips.length})
                </h3>
              </div>
              <Link
                href="/tracking"
                className="text-xs font-semibold text-fleet-primary hover:underline flex items-center gap-1"
              >
                Open Map View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {inTransitTrips.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No vehicles currently in transit.
                </div>
              ) : (
                inTransitTrips.map((trip) => {
                  const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
                  const driver = state.drivers.find((d) => d.id === trip.driverId);
                  const tel = vehicle ? state.telemetry[vehicle.telemetryId] : null;

                  return (
                    <div
                      key={trip.id}
                      className="p-3.5 bg-slate-50 dark:bg-fleet-navy-800/60 border border-slate-200 dark:border-fleet-border-dark rounded-fleet flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-fleet-primary">
                            {trip.tripNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="font-mono text-xs text-slate-700 dark:text-slate-200">
                            {vehicle?.registration}
                          </span>
                          <Badge variant="inTransit" size="sm">
                            In Transit
                          </Badge>
                        </div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{trip.origin.name}</span>
                          <span className="text-slate-400">→</span>
                          <span>{trip.destination.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Driver: {driver?.name} • Cargo: {trip.cargoDescription}
                        </div>
                      </div>

                      {tel && (
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-fleet-border-dark">
                          <div className="text-xs font-mono font-bold text-teal-400">
                            {tel.speedKmh} km/h
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            HDG: {tel.heading}° | Fuel: {tel.fuelLevelPct}%
                          </div>
                          <Link
                            href={`/trips/${trip.id}`}
                            className="text-[11px] text-fleet-primary hover:underline mt-1 font-medium"
                          >
                            Details →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Upcoming Scheduled Trips */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Scheduled Dispatches in Queue
              </h3>
              <Link
                href="/trips"
                className="text-xs font-semibold text-fleet-primary hover:underline flex items-center gap-1"
              >
                All Trips <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingTrips.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No upcoming scheduled trips in the immediate queue.
                </div>
              ) : (
                upcomingTrips.map((trip) => {
                  const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
                  const driver = state.drivers.find((d) => d.id === trip.driverId);

                  return (
                    <div
                      key={trip.id}
                      className="p-3.5 bg-slate-50 dark:bg-fleet-navy-800/60 border border-slate-200 dark:border-fleet-border-dark rounded-fleet flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                            {trip.tripNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {vehicle?.registration}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {trip.origin.name} → {trip.destination.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(trip.scheduledStart).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>{driver?.name}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="assigned" size="sm">
                          Scheduled
                        </Badge>
                        <div className="mt-1">
                          <Link
                            href={`/trips/${trip.id}`}
                            className="text-[11px] text-fleet-primary hover:underline font-medium"
                          >
                            Inspect →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
      />
    </div>
  );
}
