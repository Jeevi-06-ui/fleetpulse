import { Trip, TripStatus, Vehicle, Driver } from '@/types';

export interface TripTransitionResult {
  valid: boolean;
  error?: string;
  updatedTrip?: Trip;
  updatedVehicle?: Vehicle;
  updatedDriver?: Driver;
}

/**
 * Validates and executes trip lifecycle state transitions:
 * scheduled -> inProgress -> completed
 * scheduled -> cancelled
 */
export function transitionTripStatus(
  trip: Trip,
  newStatus: TripStatus,
  actor: string,
  extraParams?: {
    actualDistanceKm?: number;
    completionNotes?: string;
    cancellationReason?: string;
    timestamp?: string;
  }
): {
  valid: boolean;
  error?: string;
  nextTrip?: Trip;
  odometerDeltaKm?: number;
} {
  const currentStatus = trip.status;
  const now = extraParams?.timestamp || new Date().toISOString();

  // 1. Guard against invalid transitions
  if (currentStatus === 'completed') {
    return { valid: false, error: 'Cannot transition a trip that has already been completed.' };
  }
  if (currentStatus === 'cancelled') {
    return { valid: false, error: 'Cannot transition a trip that has been cancelled.' };
  }

  // 2. Scheduled -> In Progress
  if (newStatus === 'inProgress') {
    if (currentStatus !== 'scheduled') {
      return { valid: false, error: `Invalid transition from ${currentStatus} to inProgress.` };
    }

    // Verify all required checklist items are completed before starting
    const uncompletedRequiredChecklist = trip.checklist.filter((item) => item.required && !item.completed);
    if (uncompletedRequiredChecklist.length > 0) {
      const names = uncompletedRequiredChecklist.map((i) => i.label).join(', ');
      return {
        valid: false,
        error: `Cannot start trip: Mandatory safety checklist items pending (${names}).`,
      };
    }

    const updatedTrip: Trip = {
      ...trip,
      status: 'inProgress',
      actualStart: now,
      statusHistory: [
        ...trip.statusHistory,
        {
          status: 'inProgress',
          timestamp: now,
          actor,
          note: 'Trip initiated after pre-trip vehicle safety inspection.',
        },
      ],
      updatedAt: now,
    };

    return { valid: true, nextTrip: updatedTrip };
  }

  // 3. In Progress -> Completed
  if (newStatus === 'completed') {
    if (currentStatus !== 'inProgress') {
      return { valid: false, error: `Invalid transition from ${currentStatus} to completed. Trip must be in progress first.` };
    }

    const finalDistance = extraParams?.actualDistanceKm ?? trip.distanceKm;
    if (finalDistance <= 0) {
      return { valid: false, error: 'Actual trip distance must be greater than 0 km.' };
    }

    const updatedTrip: Trip = {
      ...trip,
      status: 'completed',
      actualEnd: now,
      actualDistanceKm: finalDistance,
      notes: extraParams?.completionNotes ? `${trip.notes ? trip.notes + '\n' : ''}${extraParams.completionNotes}` : trip.notes,
      statusHistory: [
        ...trip.statusHistory,
        {
          status: 'completed',
          timestamp: now,
          actor,
          note: `Trip completed. Distance recorded: ${finalDistance} km.`,
        },
      ],
      updatedAt: now,
    };

    return {
      valid: true,
      nextTrip: updatedTrip,
      odometerDeltaKm: finalDistance,
    };
  }

  // 4. Scheduled -> Cancelled
  if (newStatus === 'cancelled') {
    if (currentStatus !== 'scheduled') {
      return { valid: false, error: `Only scheduled trips can be cancelled. Current status is ${currentStatus}.` };
    }

    const reason = extraParams?.cancellationReason?.trim() || 'Trip cancelled by dispatcher.';

    const updatedTrip: Trip = {
      ...trip,
      status: 'cancelled',
      cancellationReason: reason,
      statusHistory: [
        ...trip.statusHistory,
        {
          status: 'cancelled',
          timestamp: now,
          actor,
          note: `Trip cancelled: ${reason}`,
        },
      ],
      updatedAt: now,
    };

    return { valid: true, nextTrip: updatedTrip };
  }

  return { valid: false, error: `Unsupported status transition from ${currentStatus} to ${newStatus}.` };
}
