import { Trip, MaintenanceJob, InspectionDefect } from '@/types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: 'vehicle_overlap' | 'driver_overlap' | 'maintenance_window' | 'critical_defect' | 'vehicle_inactive';
  message?: string;
  conflictingRecordId?: string;
}

/**
 * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
 * Adjacent boundary slots (e.g. endA === startB or endB === startA) are strictly ALLOWED.
 */
export function doIntervalsOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const tStartA = new Date(startA).getTime();
  const tEndA = new Date(endA).getTime();
  const tStartB = new Date(startB).getTime();
  const tEndB = new Date(endB).getTime();

  if (isNaN(tStartA) || isNaN(tEndA) || isNaN(tStartB) || isNaN(tEndB)) {
    throw new Error('Invalid ISO date string provided for interval check');
  }

  if (tStartA >= tEndA) {
    throw new Error('Interval A start must be strictly before end');
  }
  if (tStartB >= tEndB) {
    throw new Error('Interval B start must be strictly before end');
  }

  // Strictly overlapping if startA < endB AND endA > startB
  return tStartA < tEndB && tEndA > tStartB;
}

/**
 * Validates whether a trip can be scheduled without conflicting with:
 * 1. Existing trips for the same vehicle
 * 2. Existing trips for the same driver
 * 3. Scheduled/in-progress maintenance windows for the vehicle
 * 4. Open critical defects on the vehicle
 */
export function checkTripConflicts(params: {
  tripIdToExclude?: string;
  vehicleId: string;
  driverId: string;
  scheduledStart: string;
  scheduledEnd: string;
  trips: Trip[];
  maintenanceJobs: MaintenanceJob[];
  defects: InspectionDefect[];
}): ConflictCheckResult {
  const {
    tripIdToExclude,
    vehicleId,
    driverId,
    scheduledStart,
    scheduledEnd,
    trips,
    maintenanceJobs,
    defects,
  } = params;

  // 1. Check for unresolved critical defects
  const criticalDefect = defects.find(
    (d) => d.vehicleId === vehicleId && d.severity === 'critical' && d.status !== 'resolved'
  );
  if (criticalDefect) {
    return {
      hasConflict: true,
      conflictType: 'critical_defect',
      message: `Vehicle has an open critical defect (${criticalDefect.defectCode}): ${criticalDefect.description}. It cannot be dispatched until resolved.`,
      conflictingRecordId: criticalDefect.id,
    };
  }

  // 2. Check maintenance windows
  // Maintenance window estimated: scheduledDate to scheduledDate + 24 hours (or completedDate if in progress)
  for (const job of maintenanceJobs) {
    if (job.vehicleId === vehicleId && (job.status === 'scheduled' || job.status === 'inProgress')) {
      const jobStart = new Date(job.scheduledDate);
      // Give maintenance job a realistic window: 24h duration if completedDate not specified
      const jobEnd = job.completedDate ? new Date(job.completedDate) : new Date(jobStart.getTime() + 24 * 60 * 60 * 1000);
      
      if (doIntervalsOverlap(scheduledStart, scheduledEnd, jobStart, jobEnd)) {
        return {
          hasConflict: true,
          conflictType: 'maintenance_window',
          message: `Vehicle is scheduled for ${job.type} (${job.jobCode}) during this timeframe. Maintenance windows take dispatch precedence.`,
          conflictingRecordId: job.id,
        };
      }
    }
  }

  // 3. Check active/scheduled trip conflicts for the vehicle
  for (const trip of trips) {
    if (trip.id === tripIdToExclude) continue;
    if (trip.status === 'cancelled' || trip.status === 'completed') continue;

    if (trip.vehicleId === vehicleId) {
      if (doIntervalsOverlap(scheduledStart, scheduledEnd, trip.scheduledStart, trip.scheduledEnd)) {
        return {
          hasConflict: true,
          conflictType: 'vehicle_overlap',
          message: `Vehicle is already assigned to Trip ${trip.tripNumber} (${trip.origin.name} → ${trip.destination.name}) during this period.`,
          conflictingRecordId: trip.id,
        };
      }
    }
  }

  // 4. Check active/scheduled trip conflicts for the driver
  for (const trip of trips) {
    if (trip.id === tripIdToExclude) continue;
    if (trip.status === 'cancelled' || trip.status === 'completed') continue;

    if (trip.driverId === driverId) {
      if (doIntervalsOverlap(scheduledStart, scheduledEnd, trip.scheduledStart, trip.scheduledEnd)) {
        return {
          hasConflict: true,
          conflictType: 'driver_overlap',
          message: `Driver is already rostered for Trip ${trip.tripNumber} during this schedule window.`,
          conflictingRecordId: trip.id,
        };
      }
    }
  }

  return { hasConflict: false };
}
