'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { TripRouteMap } from '@/components/trips/TripRouteMap';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  Send,
  Truck,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Check,
  FileText,
  Printer,
} from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useFleet();
  const tripId = params.id as string;

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [actualDistance, setActualDistance] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const trip = state.trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trip Not Found</h2>
        <p className="text-xs text-slate-500">
          Trip identifier ({tripId}) was not found in the operations database.
        </p>
        <Link href="/trips">
          <Button variant="primary" size="sm">
            Return to Trips Central
          </Button>
        </Link>
      </div>
    );
  }

  const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
  const driver = state.drivers.find((d) => d.id === trip.driverId);
  const telemetry = vehicle ? state.telemetry[vehicle.telemetryId] : null;

  // Checklist toggle
  const handleToggleChecklist = (itemId: string, currentVal: boolean) => {
    dispatch({
      type: 'UPDATE_CHECKLIST',
      payload: { tripId: trip.id, itemId, completed: !currentVal },
    });
  };

  // Start Trip
  const handleStartTrip = () => {
    setTransitionError(null);
    const uncompleted = trip.checklist.filter((c) => c.required && !c.completed);
    if (uncompleted.length > 0) {
      setTransitionError(
        `Pre-trip safety checklist incomplete: Please verify all required items before departure.`
      );
      return;
    }

    dispatch({
      type: 'TRANSITION_TRIP',
      payload: {
        tripId: trip.id,
        newStatus: 'inProgress',
        actor: `${state.session.userName} (${state.session.role})`,
      },
    });
  };

  // Complete Trip
  const handleCompleteTrip = () => {
    dispatch({
      type: 'TRANSITION_TRIP',
      payload: {
        tripId: trip.id,
        newStatus: 'completed',
        actor: `${state.session.userName} (${state.session.role})`,
        actualDistanceKm: actualDistance || trip.distanceKm,
        completionNotes,
      },
    });
    setCompleteModalOpen(false);
  };

  // Cancel Trip
  const handleCancelTrip = () => {
    dispatch({
      type: 'TRANSITION_TRIP',
      payload: {
        tripId: trip.id,
        newStatus: 'cancelled',
        actor: `${state.session.userName} (${state.session.role})`,
        cancellationReason,
      },
    });
    setCancelModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/trips">
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {trip.tripNumber}
              </h1>
              <Badge variant={trip.status as any} size="sm">
                {trip.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {trip.origin.name} → {trip.destination.name} • {trip.cargoDescription}
            </p>
          </div>
        </div>

        {/* Action Controls based on status */}
        <div className="flex items-center gap-2">
          <Link href={`/trips/${trip.id}/waybill`}>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Waybill / POD
            </Button>
          </Link>

          {trip.status === 'scheduled' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartTrip}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Depart & Start Trip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                Cancel Trip
              </Button>
            </>
          )}

          {trip.status === 'inProgress' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActualDistance(trip.distanceKm);
                setCompleteModalOpen(true);
              }}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Sign Off & Complete Trip
            </Button>
          )}
        </div>
      </div>

      {transitionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-fleet text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{transitionError}</span>
        </div>
      )}

      {/* Schematic Transit Map */}
      <TripRouteMap
        origin={trip.origin}
        destination={trip.destination}
        routePoints={trip.routePoints}
        currentCoordinates={telemetry?.coordinates}
        status={trip.status}
      />

      {/* Grid: Trip Dossier + Asset Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Allocated Vehicle & Driver */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-fleet-primary" /> Allocated Vehicle
            </h3>
            {vehicle ? (
              <div className="text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="font-mono font-bold text-slate-900 dark:text-white hover:underline"
                  >
                    {vehicle.registration}
                  </Link>
                  <Badge variant={vehicle.status as any} size="sm">
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{vehicle.name}</div>
                <div className="text-slate-400 text-[11px] pt-1">
                  Capacity: {vehicle.capacityKg.toLocaleString()} kg • Odometer:{' '}
                  {vehicle.odometerKm.toLocaleString()} km
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No vehicle data available.</p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-fleet-cobalt" /> Rostered Driver
            </h3>
            {driver ? (
              <div className="text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{driver.name}</span>
                  <Badge variant={driver.status as any} size="sm">
                    {driver.status}
                  </Badge>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{driver.licenseCategory}</div>
                <div className="text-slate-400 text-[11px] pt-1">
                  Contact: {driver.contactNumber} • Rating: {driver.rating}★
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No driver assigned.</p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Consignment Payload
            </h3>
            <div className="text-xs space-y-1">
              <div className="font-medium text-slate-900 dark:text-white">
                {trip.cargoDescription}
              </div>
              <div className="text-slate-500 font-mono">
                Weight: {trip.cargoWeightKg.toLocaleString()} kg
              </div>
              <div className="text-slate-500 font-mono">Distance: {trip.distanceKm} km</div>
            </div>
          </Card>
        </div>

        {/* Right Column: Pre-Trip Safety Checklist & Status Timeline */}
        <div className="md:col-span-2 space-y-4">
          {/* Pre-Trip Safety Checklist */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Pre-Trip Safety Inspection Checklist
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {trip.checklist.filter((c) => c.completed).length} / {trip.checklist.length} verified
              </span>
            </div>

            <div className="space-y-2">
              {trip.checklist.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-2.5 rounded-fleet border transition-colors ${
                    trip.status === 'scheduled'
                      ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-fleet-navy-800'
                      : 'cursor-default'
                  } ${
                    item.completed
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-fleet-navy-800/40 border-slate-200 dark:border-fleet-border-dark'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    disabled={trip.status !== 'scheduled'}
                    onChange={() => handleToggleChecklist(item.id, item.completed)}
                    className="mt-0.5 w-4 h-4 text-fleet-primary rounded focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-xs">
                    <span
                      className={`font-medium ${
                        item.completed
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.required && (
                      <span className="ml-2 text-[10px] text-amber-500 font-mono uppercase">
                        (Required)
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Status History & Audit Log Timeline */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-fleet-primary" />
              Operational Lifecycle Timeline
            </h3>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-fleet-navy-800">
              {trip.statusHistory.map((hist, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pl-8 text-xs">
                  <div className="absolute left-2.5 -translate-x-1/2 top-1 w-2.5 h-2.5 rounded-full bg-fleet-primary ring-4 ring-white dark:ring-fleet-panel-dark" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">
                        {hist.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(hist.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Actor: {hist.actor}</div>
                    {hist.note && (
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 italic">
                        &quot;{hist.note}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Scheduled Consignment"
        description="Cancelling will release vehicle and driver reservations back to the available pool."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Consignor shipment hold, mechanical pre-check defect, or severe weather warning."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!cancellationReason.trim()}
              onClick={handleCancelTrip}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Trip Delivery Sign-Off"
        description="Record final odometer distance and close out consignment delivery."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Final Recorded Transit Distance (km) *
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
              Delivery Notes / Consignee Sign-off
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Delivered on schedule at cargo bay 4. Goods receipt acknowledged."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCompleteTrip}>
              Complete Delivery & Release Assets
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
