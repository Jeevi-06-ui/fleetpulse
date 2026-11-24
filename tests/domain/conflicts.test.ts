import { describe, it, expect } from 'vitest';
import { doIntervalsOverlap, checkTripConflicts } from '@/lib/domain/conflicts';
import { Trip, MaintenanceJob, InspectionDefect } from '@/types';

describe('Domain: Conflict Checking Engine', () => {
  describe('doIntervalsOverlap', () => {
    it('detects strictly overlapping intervals', () => {
      // A: 10:00 - 14:00, B: 12:00 - 16:00 (Overlap 12:00-14:00)
      const overlap = doIntervalsOverlap(
        '2026-11-25T10:00:00Z',
        '2026-11-25T14:00:00Z',
        '2026-11-25T12:00:00Z',
        '2026-11-25T16:00:00Z'
      );
      expect(overlap).toBe(true);
    });

    it('allows adjacent non-overlapping intervals (boundary condition startA === endB)', () => {
      // A: 08:00 - 12:00, B: 12:00 - 16:00 -> Strictly allowed!
      const overlap = doIntervalsOverlap(
        '2026-11-25T08:00:00Z',
        '2026-11-25T12:00:00Z',
        '2026-11-25T12:00:00Z',
        '2026-11-25T16:00:00Z'
      );
      expect(overlap).toBe(false);
    });

    it('returns false for disjoint time intervals', () => {
      const overlap = doIntervalsOverlap(
        '2026-11-25T08:00:00Z',
        '2026-11-25T10:00:00Z',
        '2026-11-25T14:00:00Z',
        '2026-11-25T16:00:00Z'
      );
      expect(overlap).toBe(false);
    });

    it('throws error when interval start >= end', () => {
      expect(() =>
        doIntervalsOverlap(
          '2026-11-25T14:00:00Z',
          '2026-11-25T10:00:00Z',
          '2026-11-25T11:00:00Z',
          '2026-11-25T15:00:00Z'
        )
      ).toThrow();
    });
  });

  describe('checkTripConflicts', () => {
    const mockTrip: Trip = {
      id: 'trip-existing',
      tripNumber: 'FP-TEST-1',
      origin: { name: 'Origin', address: 'A', coordinates: [10, 10] },
      destination: { name: 'Destination', address: 'B', coordinates: [20, 20] },
      routePoints: [[10, 10], [20, 20]],
      scheduledStart: '2026-11-25T10:00:00Z',
      scheduledEnd: '2026-11-25T16:00:00Z',
      driverId: 'drv-01',
      vehicleId: 'veh-01',
      distanceKm: 200,
      cargoDescription: 'Test Cargo',
      cargoWeightKg: 5000,
      status: 'scheduled',
      checklist: [],
      statusHistory: [],
      createdAt: '2026-11-24T00:00:00Z',
      updatedAt: '2026-11-24T00:00:00Z',
    };

    it('rejects vehicle overlap when another trip is scheduled in that window', () => {
      const res = checkTripConflicts({
        vehicleId: 'veh-01',
        driverId: 'drv-02', // different driver
        scheduledStart: '2026-11-25T12:00:00Z',
        scheduledEnd: '2026-11-25T18:00:00Z',
        trips: [mockTrip],
        maintenanceJobs: [],
        defects: [],
      });
      expect(res.hasConflict).toBe(true);
      expect(res.conflictType).toBe('vehicle_overlap');
    });

    it('rejects driver overlap when driver is already committed to a trip', () => {
      const res = checkTripConflicts({
        vehicleId: 'veh-02', // different vehicle
        driverId: 'drv-01', // same driver
        scheduledStart: '2026-11-25T12:00:00Z',
        scheduledEnd: '2026-11-25T18:00:00Z',
        trips: [mockTrip],
        maintenanceJobs: [],
        defects: [],
      });
      expect(res.hasConflict).toBe(true);
      expect(res.conflictType).toBe('driver_overlap');
    });

    it('rejects dispatch if vehicle has open critical defect', () => {
      const criticalDefect: InspectionDefect = {
        id: 'def-crit',
        defectCode: 'DEF-TEST',
        vehicleId: 'veh-03',
        reporterDriverId: 'drv-05',
        checklistResults: [],
        severity: 'critical',
        description: 'Brake booster failure',
        status: 'reported',
        reportedAt: '2026-11-24T00:00:00Z',
      };

      const res = checkTripConflicts({
        vehicleId: 'veh-03',
        driverId: 'drv-05',
        scheduledStart: '2026-11-26T10:00:00Z',
        scheduledEnd: '2026-11-26T14:00:00Z',
        trips: [],
        maintenanceJobs: [],
        defects: [criticalDefect],
      });
      expect(res.hasConflict).toBe(true);
      expect(res.conflictType).toBe('critical_defect');
    });

    it('allows trip scheduling when slots are completely free', () => {
      const res = checkTripConflicts({
        vehicleId: 'veh-free',
        driverId: 'drv-free',
        scheduledStart: '2026-11-26T10:00:00Z',
        scheduledEnd: '2026-11-26T14:00:00Z',
        trips: [mockTrip],
        maintenanceJobs: [],
        defects: [],
      });
      expect(res.hasConflict).toBe(false);
    });
  });
});
