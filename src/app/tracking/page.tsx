'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { SchematicMap } from '@/components/tracking/SchematicMap';
import { TrackingVehicleSidebar } from '@/components/tracking/TrackingVehicleSidebar';
import { Button } from '@/components/ui/Button';
import { MapPin, Radio, FastForward, Gauge } from 'lucide-react';

export default function TrackingPage() {
  const { state, toggleSimulation, setSimulationSpeed } = useFleet();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    state.vehicles.find((v) => v.status === 'inTransit')?.id || state.vehicles[0]?.id || null
  );
  const [statusFilter, setStatusFilter] = useState('all');

  const selectedVehicle = state.vehicles.find((v) => v.id === selectedVehicleId) || null;
  const selectedTelemetry = selectedVehicle ? state.telemetry[selectedVehicle.telemetryId] : null;
  const selectedDriver = selectedVehicle?.assignedDriverId
    ? state.drivers.find((d) => d.id === selectedVehicle.assignedDriverId) || null
    : null;
  const activeTrip = selectedVehicle
    ? state.trips.find(
        (t) => t.vehicleId === selectedVehicle.id && t.status === 'inProgress'
      ) || null
    : null;

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-fleet-primary" />
            Live Simulated Fleet Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schematic real-time GPS tracking of active transit routes across major inter-city freight corridors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Vehicles ({state.vehicles.length})</option>
            <option value="inTransit">
              In Transit ({state.vehicles.filter((v) => v.status === 'inTransit').length})
            </option>
            <option value="available">
              Available ({state.vehicles.filter((v) => v.status === 'available').length})
            </option>
            <option value="assigned">
              Assigned ({state.vehicles.filter((v) => v.status === 'assigned').length})
            </option>
            <option value="maintenance">
              Maintenance ({state.vehicles.filter((v) => v.status === 'maintenance').length})
            </option>
          </select>

          {/* Simulation Speed Selector */}
          <div className="flex items-center bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet p-0.5 text-xs">
            <span className="px-2 py-1 text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <FastForward className="w-3 h-3" />
              Speed:
            </span>
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  state.simulationSpeed === spd
                    ? 'bg-fleet-primary text-fleet-navy-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Simulation Toggle */}
          <Button
            variant={state.simulationActive ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleSimulation}
            icon={<Radio className={`w-3.5 h-3.5 ${state.simulationActive ? 'animate-pulse' : ''}`} />}
          >
            {state.simulationActive ? 'Simulation Active' : 'Simulation Paused'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Schematic Map + Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <SchematicMap
            vehicles={state.vehicles}
            telemetry={state.telemetry}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            statusFilter={statusFilter}
            geofenceZones={state.geofenceZones}
          />
        </div>

        <div className="lg:col-span-1 h-[600px]">
          <TrackingVehicleSidebar
            vehicle={selectedVehicle}
            telemetry={selectedTelemetry}
            driver={selectedDriver}
            activeTrip={activeTrip}
            onClose={() => setSelectedVehicleId(null)}
          />
        </div>
      </div>
    </div>
  );
}
