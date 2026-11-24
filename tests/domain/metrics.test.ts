import { describe, it, expect } from 'vitest';
import { calculateFleetMetrics } from '@/lib/domain/metrics';
import { Vehicle, Trip, MaintenanceJob, InspectionDefect } from '@/types';

describe('Domain: Fleet Metrics Calculation Engine', () => {
  const vehicles: Vehicle[] = [
    {
      id: 'v1',
      registration: 'KA-01-AA-1111',
      name: 'Truck 1',
      make: 'Tata',
      category: 'Heavy Duty Truck',
      status: 'inTransit',
      odometerKm: 50000,
      capacityKg: 20000,
      fuelType: 'Diesel',
      fuelLevelPct: 80,
      serviceDueDate: '2026-12-01Z',
      telemetryId: 't1',
      modelYear: 2023,
      healthScore: 90,
      createdAt: '2026-01-01Z',
      updatedAt: '2026-01-01Z',
    },
    {
      id: 'v2',
      registration: 'KA-01-AA-2222',
      name: 'Truck 2',
      make: 'Tata',
      category: 'Heavy Duty Truck',
      status: 'available',
      odometerKm: 30000,
      capacityKg: 15000,
      fuelType: 'Diesel',
      fuelLevelPct: 90,
      serviceDueDate: '2026-12-01Z',
      telemetryId: 't2',
      modelYear: 2023,
      healthScore: 95,
      createdAt: '2026-01-01Z',
      updatedAt: '2026-01-01Z',
    },
    {
      id: 'v3',
      registration: 'KA-01-AA-3333',
      name: 'Truck 3',
      make: 'Tata',
      category: 'Heavy Duty Truck',
      status: 'inactive', // Decommissioned!
      odometerKm: 180000,
      capacityKg: 15000,
      fuelType: 'Diesel',
      fuelLevelPct: 10,
      serviceDueDate: '2026-09-01Z',
      telemetryId: 't3',
      modelYear: 2020,
      healthScore: 40,
      createdAt: '2026-01-01Z',
      updatedAt: '2026-01-01Z',
    },
  ];

  const trips: Trip[] = [
    {
      id: 't1',
      tripNumber: 'FP-1',
      origin: { name: 'A', address: 'A', coordinates: [0, 0] },
      destination: { name: 'B', address: 'B', coordinates: [1, 1] },
      routePoints: [[0, 0], [1, 1]],
      scheduledStart: '2026-11-20Z',
      scheduledEnd: '2026-11-21Z',
      driverId: 'd1',
      vehicleId: 'v1',
      distanceKm: 100,
      cargoDescription: 'Goods',
      cargoWeightKg: 2000,
      status: 'completed',
      checklist: [],
      statusHistory: [],
      createdAt: '2026-11-20Z',
      updatedAt: '2026-11-20Z',
    },
    {
      id: 't2',
      tripNumber: 'FP-2',
      origin: { name: 'A', address: 'A', coordinates: [0, 0] },
      destination: { name: 'B', address: 'B', coordinates: [1, 1] },
      routePoints: [[0, 0], [1, 1]],
      scheduledStart: '2026-11-24Z',
      scheduledEnd: '2026-11-25Z',
      driverId: 'd2',
      vehicleId: 'v1',
      distanceKm: 100,
      cargoDescription: 'Goods',
      cargoWeightKg: 2000,
      status: 'inProgress',
      checklist: [],
      statusHistory: [],
      createdAt: '2026-11-24Z',
      updatedAt: '2026-11-24Z',
    },
    {
      id: 't3',
      tripNumber: 'FP-3',
      origin: { name: 'A', address: 'A', coordinates: [0, 0] },
      destination: { name: 'B', address: 'B', coordinates: [1, 1] },
      routePoints: [[0, 0], [1, 1]],
      scheduledStart: '2026-11-18Z',
      scheduledEnd: '2026-11-19Z',
      driverId: 'd3',
      vehicleId: 'v2',
      distanceKm: 100,
      cargoDescription: 'Goods',
      cargoWeightKg: 2000,
      status: 'cancelled',
      checklist: [],
      statusHistory: [],
      createdAt: '2026-11-18Z',
      updatedAt: '2026-11-18Z',
    },
  ];

  const maintenanceJobs: MaintenanceJob[] = [
    {
      id: 'm1',
      jobCode: 'MNT-1',
      vehicleId: 'v1',
      type: 'Preventive Service',
      priority: 'medium',
      scheduledDate: '2026-11-15T00:00:00Z', // Overdue relative to Nov 24
      status: 'scheduled',
      costEstimate: 10000,
      odometerKm: 50000,
      technician: 'Workshop',
      createdAt: '2026-11-10Z',
      updatedAt: '2026-11-10Z',
    },
    {
      id: 'm2',
      jobCode: 'MNT-2',
      vehicleId: 'v2',
      type: 'Brake Inspection',
      priority: 'high',
      scheduledDate: '2026-11-10T00:00:00Z',
      completedDate: '2026-11-10T16:00:00Z',
      status: 'completed',
      costEstimate: 8000,
      actualCost: 8500,
      odometerKm: 30000,
      technician: 'Workshop',
      createdAt: '2026-11-08Z',
      updatedAt: '2026-11-10Z',
    },
  ];

  it('computes exact fleet utilization using active fleet denominator', () => {
    // Total = 3, Inactive = 1, Active = 2
    // In-Transit = 1
    // Utilization = (1 / 2) * 100 = 50.0%
    const metrics = calculateFleetMetrics(vehicles, trips, maintenanceJobs, [], '2026-11-24T10:00:00Z');
    expect(metrics.totalFleet).toBe(3);
    expect(metrics.activeFleet).toBe(2);
    expect(metrics.inTransitVehicles).toBe(1);
    expect(metrics.fleetUtilizationPct).toBe(50);
  });

  it('computes trip completion rate excluding cancelled trips', () => {
    // Total = 3, Cancelled = 1 => Eligible = 2
    // Completed = 1
    // Rate = (1 / 2) * 100 = 50.0%
    const metrics = calculateFleetMetrics(vehicles, trips, maintenanceJobs, [], '2026-11-24T10:00:00Z');
    expect(metrics.totalTrips).toBe(3);
    expect(metrics.completedTrips).toBe(1);
    expect(metrics.cancelledTrips).toBe(1);
    expect(metrics.tripCompletionRatePct).toBe(50);
  });

  it('accurately flags overdue maintenance jobs based on reference date', () => {
    const metrics = calculateFleetMetrics(vehicles, trips, maintenanceJobs, [], '2026-11-24T10:00:00Z');
    expect(metrics.overdueMaintenanceCount).toBe(1);
    expect(metrics.totalMaintenanceCostYTD).toBe(8500); // Only completed job cost
  });
});
