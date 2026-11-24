import { describe, it, expect } from 'vitest';
import { transitionTripStatus } from '@/lib/domain/lifecycle';
import { Trip } from '@/types';

describe('Domain: Trip Lifecycle State Machine', () => {
  const baseTrip: Trip = {
    id: 'trip-test-life',
    tripNumber: 'FP-LIFE-1',
    origin: { name: 'Origin Depot', address: 'A', coordinates: [10, 10] },
    destination: { name: 'Dest Terminal', address: 'B', coordinates: [50, 50] },
    routePoints: [[10, 10], [50, 50]],
    scheduledStart: '2026-11-25T08:00:00Z',
    scheduledEnd: '2026-11-25T14:00:00Z',
    driverId: 'drv-01',
    vehicleId: 'veh-01',
    distanceKm: 250,
    cargoDescription: 'Heavy Machinery Components',
    cargoWeightKg: 8000,
    status: 'scheduled',
    checklist: [
      { id: 'c1', label: 'Tires verified', completed: false, required: true },
      { id: 'c2', label: 'Brakes tested', completed: false, required: true },
    ],
    statusHistory: [
      { status: 'scheduled', timestamp: '2026-11-24T00:00:00Z', actor: 'Dispatcher' },
    ],
    createdAt: '2026-11-24T00:00:00Z',
    updatedAt: '2026-11-24T00:00:00Z',
  };

  it('rejects starting trip when mandatory checklist items are incomplete', () => {
    const res = transitionTripStatus(baseTrip, 'inProgress', 'Driver');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Mandatory safety checklist');
  });

  it('allows starting trip when all mandatory checklist items are verified', () => {
    const tripWithCheckedList: Trip = {
      ...baseTrip,
      checklist: baseTrip.checklist.map((c) => ({ ...c, completed: true })),
    };

    const res = transitionTripStatus(tripWithCheckedList, 'inProgress', 'Driver');
    expect(res.valid).toBe(true);
    expect(res.nextTrip?.status).toBe('inProgress');
    expect(res.nextTrip?.actualStart).toBeDefined();
  });

  it('completes an in-progress trip and returns distance delta for odometer increment', () => {
    const inProgressTrip: Trip = {
      ...baseTrip,
      status: 'inProgress',
      actualStart: '2026-11-25T08:15:00Z',
    };

    const res = transitionTripStatus(inProgressTrip, 'completed', 'Driver', {
      actualDistanceKm: 255,
      completionNotes: 'Delivered at bay 2.',
    });

    expect(res.valid).toBe(true);
    expect(res.nextTrip?.status).toBe('completed');
    expect(res.nextTrip?.actualEnd).toBeDefined();
    expect(res.nextTrip?.actualDistanceKm).toBe(255);
    // Verified: odometer delta is returned ONCE for idempotent update
    expect(res.odometerDeltaKm).toBe(255);
  });

  it('cancels a scheduled trip with reason and releases reservations', () => {
    const res = transitionTripStatus(baseTrip, 'cancelled', 'Dispatcher', {
      cancellationReason: 'Adverse weather warning.',
    });

    expect(res.valid).toBe(true);
    expect(res.nextTrip?.status).toBe('cancelled');
    expect(res.nextTrip?.cancellationReason).toBe('Adverse weather warning.');
  });

  it('rejects transition from already completed trip', () => {
    const completedTrip: Trip = {
      ...baseTrip,
      status: 'completed',
    };

    const res = transitionTripStatus(completedTrip, 'inProgress', 'Driver');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('already been completed');
  });
});
