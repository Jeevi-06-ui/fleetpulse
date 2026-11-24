import { describe, it, expect } from 'vitest';
import { calculateDriverScorecard } from '@/lib/domain/safety';
import { Driver, Trip } from '@/types';

describe('Domain: Driver Safety Scorecard & Compliance Calculation', () => {
  const veteranDriver: Driver = {
    id: 'drv-01',
    name: 'Rajesh Kumar',
    contactNumber: '+91 98450 12345',
    email: 'rajesh.k@jeevixfleet.demo',
    licenseNumber: 'KA-01-2012-0084921',
    licenseCategory: 'Heavy Vehicle',
    licenseExpiry: '2028-06-15T00:00:00.000Z',
    status: 'available',
    rating: 4.9,
    totalTripsCompleted: 240,
    experienceYears: 12,
    emergencyContact: '+91 98450 99999',
    joinedDate: '2022-01-10T00:00:00.000Z',
  };

  const sampleTrips: Trip[] = [
    {
      id: 'trip-1',
      tripNumber: 'TRIP-2026-001',
      origin: { name: 'Bengaluru Hub', address: 'Peenya', coordinates: [35, 75] },
      destination: { name: 'Chennai CFS', address: 'Port', coordinates: [85, 78] },
      routePoints: [[35, 75], [85, 78]],
      scheduledStart: '2026-11-20T06:00:00.000Z',
      scheduledEnd: '2026-11-20T14:00:00.000Z',
      driverId: 'drv-01',
      vehicleId: 'veh-01',
      distanceKm: 345,
      cargoDescription: 'Electronics & Hardware',
      cargoWeightKg: 12000,
      status: 'completed',
      checklist: [
        { id: 'chk-1', label: 'Brakes & Air Lines', completed: true, required: true },
        { id: 'chk-2', label: 'Tires & Wheels', completed: true, required: true },
        { id: 'chk-3', label: 'Emergency Kit', completed: true, required: true },
      ],
      statusHistory: [],
      createdAt: '2026-11-20T00:00:00.000Z',
      updatedAt: '2026-11-20T14:00:00.000Z',
    },
  ];

  it('computes high composite safety score and awards badges for veteran driver', () => {
    const scorecard = calculateDriverScorecard(veteranDriver, sampleTrips);

    expect(scorecard.driverId).toBe('drv-01');
    expect(scorecard.safetyScore).toBeGreaterThanOrEqual(90);
    expect(scorecard.checklistComplianceRate).toBe(100);
    expect(scorecard.badges).toContain('Master Driver');
    expect(scorecard.badges).toContain('200+ Consignments');
    expect(scorecard.badges).toContain('Veteran Long-Haul');
    expect(scorecard.fuelEfficiencyRank).toBe('Top 10%');
  });

  it('computes punctuality score based on rating performance', () => {
    const scorecard = calculateDriverScorecard(veteranDriver, sampleTrips);
    expect(scorecard.punctualityScore).toBeGreaterThanOrEqual(95);
  });
});
