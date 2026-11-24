'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { GeofenceZone } from '@/types';
import { SchematicMap } from '@/components/tracking/SchematicMap';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Clock,
  Layers,
} from 'lucide-react';

export default function GeofencingPage() {
  const { state, dispatch } = useFleet();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Zone Form state
  const [newZone, setNewZone] = useState({
    name: '',
    type: 'Depot' as GeofenceZone['type'],
    x: 50,
    y: 50,
    radius: 8,
    speedLimitKmh: 40,
    description: '',
  });

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name.trim()) return;

    const zone: GeofenceZone = {
      id: `zone-${Date.now()}`,
      name: newZone.name.trim(),
      type: newZone.type,
      coordinates: [Number(newZone.x), Number(newZone.y)],
      radius: Number(newZone.radius),
      speedLimitKmh: Number(newZone.speedLimitKmh),
      description: newZone.description.trim() || 'Logistics perimeter boundary.',
    };

    dispatch({
      type: 'ADD_GEOFENCE_ZONE',
      payload: zone,
    });

    setIsAddModalOpen(false);
    setNewZone({
      name: '',
      type: 'Depot',
      x: 50,
      y: 50,
      radius: 8,
      speedLimitKmh: 40,
      description: '',
    });
  };

  const recentEvents = [...state.geofenceEvents].reverse().slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Page Title & Add Zone Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-fleet-primary" />
            Depot Geofencing & Security Boundaries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time perimeter monitoring, yard speed governors, and automated terminal breach detection.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Geofence Boundary
        </Button>
      </div>

      {/* Top Map + Event Ledger Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Schematic Map with Geofences */}
        <div className="lg:col-span-2 space-y-2">
          <SchematicMap
            vehicles={state.vehicles}
            telemetry={state.telemetry}
            selectedVehicleId={null}
            onSelectVehicle={() => {}}
            statusFilter="all"
            geofenceZones={state.geofenceZones}
          />
        </div>

        {/* Real-time Breach & Activity Ledger */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 h-[600px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-fleet-border-dark">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Live Geofence Telemetry Ledger
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {state.geofenceEvents.length} Events Logged
                </span>
              </div>

              {/* Event Stream */}
              <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
                {recentEvents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No boundary violations or events recorded yet. Turn on simulation to track movements.
                  </div>
                ) : (
                  recentEvents.map((evt) => {
                    const zone = state.geofenceZones.find((z) => z.id === evt.zoneId);

                    return (
                      <div
                        key={evt.id}
                        className={`p-2.5 rounded-fleet border text-xs space-y-1 transition-all ${
                          evt.eventType === 'SPEED_BREACH'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : evt.eventType === 'ENTER'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">
                            {evt.registration || evt.vehicleId}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
                            {evt.eventType.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex items-center justify-between">
                          <span>Zone: {zone?.name || evt.zoneName}</span>
                          <span className="font-mono text-slate-400">
                            {evt.speedKmh} km/h (Limit: {zone?.speedLimitKmh} km/h)
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evt.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark text-[10px] text-slate-400 flex items-center justify-between">
              <span>Automatic telemetry surveillance</span>
              <span className="text-fleet-primary font-mono font-semibold">Active</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Geofence Zone Management Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-fleet-primary" />
          Active Perimeter Zones & Speed Limits ({state.geofenceZones.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.geofenceZones.map((zone) => (
            <Card key={zone.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {zone.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Type: {zone.type}
                  </span>
                </div>
                <Badge variant="available" size="sm">
                  Enforced
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-fleet-border-dark">
                <div className="flex items-center justify-between">
                  <span>Coordinates (X, Y):</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    [{zone.coordinates[0]}, {zone.coordinates[1]}]
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Radius Boundary:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {zone.radius} Grid Units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Speed Limit:</span>
                  <span className="font-mono font-bold text-fleet-primary">
                    {zone.speedLimitKmh} km/h
                  </span>
                </div>
                {zone.description && (
                  <p className="text-[11px] italic text-slate-400 pt-1">
                    {zone.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Geofence Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Geofence Perimeter"
      >
        <form onSubmit={handleCreateZone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Zone Identifier / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hyderabad Central Distribution Terminal"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Zone Type
              </label>
              <select
                value={newZone.type}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    type: e.target.value as GeofenceZone['type'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Depot">Depot</option>
                <option value="Port Terminal">Port Terminal</option>
                <option value="Industrial Park">Industrial Park</option>
                <option value="Restricted Zone">Restricted Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Speed Limit (km/h)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={newZone.speedLimitKmh}
                onChange={(e) =>
                  setNewZone({ ...newZone, speedLimitKmh: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                X Coordinate (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newZone.x}
                onChange={(e) => setNewZone({ ...newZone, x: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Y Coordinate (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newZone.y}
                onChange={(e) => setNewZone({ ...newZone, y: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Radius (Grid Units)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={newZone.radius}
                onChange={(e) =>
                  setNewZone({ ...newZone, radius: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Loading dock boundary with strict pedestrian safety regulations."
              value={newZone.description}
              onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-fleet-border-dark">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Geofence
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
