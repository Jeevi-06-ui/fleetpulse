import { Vehicle, Trip, MaintenanceJob, InspectionDefect, FleetMetrics } from '@/types';

/**
 * Computes exact deterministic fleet metrics derived from actual records.
 * 
 * Formulas:
 * - Active Fleet = Total Vehicles - Inactive Vehicles
 * - Current Fleet Utilization = (In-Transit Vehicles / Active Fleet) * 100
 * - Trip Completion Rate = (Completed Trips / (Total Trips - Cancelled Trips)) * 100
 * - Overdue Maintenance = Unresolved Maintenance Jobs where scheduledDate < referenceDate
 */
export function calculateFleetMetrics(
  vehicles: Vehicle[],
  trips: Trip[],
  maintenanceJobs: MaintenanceJob[],
  defects: InspectionDefect[],
  referenceDate: string = new Date().toISOString()
): FleetMetrics {
  const totalFleet = vehicles.length;
  const inactiveVehicles = vehicles.filter((v) => v.status === 'inactive').length;
  const activeFleet = Math.max(0, totalFleet - inactiveVehicles);

  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
  const assignedVehicles = vehicles.filter((v) => v.status === 'assigned').length;
  const inTransitVehicles = vehicles.filter((v) => v.status === 'inTransit').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;

  // Utilization denominator is active fleet
  const fleetUtilizationPct = activeFleet > 0 
    ? Math.round((inTransitVehicles / activeFleet) * 1000) / 10 
    : 0;

  const totalTrips = trips.length;
  const completedTrips = trips.filter((t) => t.status === 'completed').length;
  const inProgressTrips = trips.filter((t) => t.status === 'inProgress').length;
  const scheduledTrips = trips.filter((t) => t.status === 'scheduled').length;
  const cancelledTrips = trips.filter((t) => t.status === 'cancelled').length;

  const eligibleTrips = totalTrips - cancelledTrips;
  const tripCompletionRatePct = eligibleTrips > 0
    ? Math.round((completedTrips / eligibleTrips) * 1000) / 10
    : 0;

  const refTime = new Date(referenceDate).getTime();
  const overdueMaintenanceCount = maintenanceJobs.filter(
    (job) => (job.status === 'scheduled' || job.status === 'inProgress') &&
             new Date(job.scheduledDate).getTime() < refTime
  ).length;

  const totalMaintenanceCostYTD = maintenanceJobs.reduce((acc, job) => {
    return acc + (job.actualCost || (job.status === 'completed' ? job.costEstimate : 0));
  }, 0);

  const activeDefects = defects.filter((d) => d.status !== 'resolved');
  const activeDefectsCount = activeDefects.length;
  const criticalDefectsCount = activeDefects.filter((d) => d.severity === 'critical').length;

  return {
    totalFleet,
    activeFleet,
    availableVehicles,
    assignedVehicles,
    inTransitVehicles,
    maintenanceVehicles,
    inactiveVehicles,
    fleetUtilizationPct,
    totalTrips,
    completedTrips,
    inProgressTrips,
    scheduledTrips,
    cancelledTrips,
    tripCompletionRatePct,
    overdueMaintenanceCount,
    totalMaintenanceCostYTD,
    activeDefectsCount,
    criticalDefectsCount,
  };
}
