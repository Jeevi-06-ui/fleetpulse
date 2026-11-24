'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Trip, Vehicle } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Compass,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface DriverTripCockpitProps {
  trip: Trip;
  vehicle?: Vehicle;
}

export const DriverTripCockpit: React.FC<DriverTripCockpitProps> = ({ trip, vehicle }) => {
  const { state, dispatch } = useFleet();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [actualDistance, setActualDistance] = useState<number>(trip.distanceKm);
  const [notes, setNotes] = useState('');
  const [checklistError, setChecklistError] = useState<string | null>(null);

  const handleToggleCheck = (itemId: string, current: boolean) => {
    dispatch({
      type: 'UPDATE_CHECKLIST',
      payload: { tripId: trip.id, itemId, completed: !current },
    });
  };

  const handleStartTrip = () => {
    setChecklistError(null);
    const uncompleted = trip.checklist.filter((c) => c.required && !c.completed);
    if (uncompleted.length > 0) {
      setChecklistError(
        `Pre-trip safety inspection incomplete! Verify all ${uncompleted.length} required checks before departure.`
      );
      return;
    }

    dispatch({
      type: 'TRANSITION_TRIP',
      payload: {
        tripId: trip.id,
        newStatus: 'inProgress',
        actor: state.session.userName,
      },
    });
  };

  const handleCompleteTrip = () => {
    dispatch({
      type: 'TRANSITION_TRIP',
      payload: {
        tripId: trip.id,
        newStatus: 'completed',
        actor: state.session.userName,
        actualDistanceKm: actualDistance,
        completionNotes: notes,
      },
    });
    setCompleteModalOpen(false);
  };

  return (
    <Card className="p-5 border-2 border-fleet-primary/40 shadow-lg space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-fleet-border-dark">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
            {trip.status === 'inProgress' ? 'Active Transit Convoy' : 'Ready For Pre-Trip Inspection'}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="font-mono font-bold text-lg text-slate-900 dark:text-white">
              {trip.tripNumber}
            </h3>
            <Badge variant={trip.status as any} size="sm">
              {trip.status}
            </Badge>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {vehicle?.registration}
          </div>
          <div className="text-[10px] text-slate-400">{vehicle?.name}</div>
        </div>
      </div>

      {/* Route Summary */}
      <div className="p-3.5 bg-slate-50 dark:bg-fleet-navy-800/80 rounded-fleet border border-slate-200 dark:border-fleet-border-dark space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Origin Depot</span>
            <div className="font-semibold text-slate-900 dark:text-white">{trip.origin.name}</div>
          </div>
        </div>

        <div className="pl-6 border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-2 text-[11px] text-slate-400 font-mono">
          {trip.distanceKm} km transit corridor • Cargo: {trip.cargoDescription}
        </div>

        <div className="flex items-start gap-2 text-xs">
          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Destination</span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {trip.destination.name}
            </div>
          </div>
        </div>
      </div>

      {checklistError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-fleet text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{checklistError}</span>
        </div>
      )}

      {/* Safety Checklist (Interactive for scheduled status) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Mandatory Vehicle Safety Checklist
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {trip.checklist.filter((c) => c.completed).length} / {trip.checklist.length}
          </span>
        </div>

        <div className="space-y-1.5">
          {trip.checklist.map((item) => (
            <button
              type="button"
              key={item.id}
              disabled={trip.status !== 'scheduled'}
              onClick={() => handleToggleCheck(item.id, item.completed)}
              className={`w-full flex items-center justify-between p-2.5 rounded-fleet border text-left text-xs transition-colors ${
                item.completed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-50 dark:bg-fleet-navy-800/60 border-slate-200 dark:border-fleet-border-dark text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400'
                  }`}
                >
                  {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.required && (
                <span className="text-[10px] font-mono uppercase text-amber-500">Required</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        {trip.status === 'scheduled' && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartTrip}
            className="w-full"
            icon={<Play className="w-4 h-4" />}
          >
            Start Transit Convoy
          </Button>
        )}

        {trip.status === 'inProgress' && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setCompleteModalOpen(true)}
            className="w-full"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Delivery & Sign-Off
          </Button>
        )}

        <Link href={`/driver/issues?tripId=${trip.id}&vehicleId=${trip.vehicleId}`} className="w-full">
          <Button
            variant="outline"
            size="md"
            className="w-full text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
            icon={<AlertTriangle className="w-4 h-4" />}
          >
            Report Defect / Road Hazard
          </Button>
        </Link>
      </div>

      {/* Completion Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Delivery Confirmation"
        description="Verify delivery at destination terminal and update actual odometer distance."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Actual Distance Driven (km) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={actualDistance}
              onChange={(e) => setActualDistance(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Consignee Delivery Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivered on time. Seal intact."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCompleteTrip}>
              Complete Delivery
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
