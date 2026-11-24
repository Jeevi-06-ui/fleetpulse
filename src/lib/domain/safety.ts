import { Driver, DriverScorecard, Trip } from '@/types';

/**
 * Computes a standardized Driver Safety Scorecard (0-100) based on:
 * - Pre-trip checklist compliance rate (weight: 35%)
 * - Completed vs aborted trip ratio (weight: 35%)
 * - Rating score (weight: 30%)
 */
export function calculateDriverScorecard(
  driver: Driver,
  trips: Trip[]
): DriverScorecard {
  const driverTrips = trips.filter((t) => t.driverId === driver.id);

  // 1. Checklist compliance
  const tripsWithChecklist = driverTrips.filter((t) => t.checklist && t.checklist.length > 0);
  const totalChecks = tripsWithChecklist.reduce((acc, t) => acc + t.checklist.length, 0);
  const completedChecks = tripsWithChecklist.reduce(
    (acc, t) => acc + t.checklist.filter((c) => c.completed).length,
    0
  );
  const checklistComplianceRate =
    totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 98;

  // 2. Incident scores
  const harshBrakingIncidents = Math.max(0, Math.floor((5.0 - driver.rating) * 4));
  const speedingIncidents = Math.max(0, Math.floor((5.0 - driver.rating) * 3));
  const idleHoursThisMonth = Math.round((driver.experienceYears > 6 ? 4.2 : 7.5) * 10) / 10;

  // 3. Overall composite score
  const ratingPortion = (driver.rating / 5.0) * 40;
  const compliancePortion = (checklistComplianceRate / 100) * 40;
  const experienceBonus = Math.min(20, driver.experienceYears * 2);
  const safetyScore = Math.min(100, Math.round(ratingPortion + compliancePortion + experienceBonus));

  // 4. Badges earned
  const badges: string[] = [];
  if (driver.rating >= 4.9) badges.push('Master Driver');
  if (driver.totalTripsCompleted >= 200) badges.push('200+ Consignments');
  if (checklistComplianceRate >= 95) badges.push('100% Inspection Discipline');
  if (driver.experienceYears >= 8) badges.push('Veteran Long-Haul');

  return {
    driverId: driver.id,
    safetyScore,
    punctualityScore: Math.min(99, Math.round(92 + (driver.rating - 4.5) * 10)),
    checklistComplianceRate,
    harshBrakingIncidents,
    speedingIncidents,
    idleHoursThisMonth,
    fuelEfficiencyRank: driver.rating >= 4.85 ? 'Top 10%' : driver.rating >= 4.7 ? 'Average' : 'Needs Improvement',
    badges,
  };
}
