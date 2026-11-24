import { describe, it, expect } from 'vitest';
import { calculateFleetEsgMetrics, checkFuelAnomaly, DIESEL_CO2_PER_LITER_KG, EV_CO2_SAVED_PER_KWH_KG } from '@/lib/domain/fuel';
import { Vehicle, FuelLog } from '@/types';

describe('Domain: Fuel Economy & ESG Carbon Emission Calculation', () => {
  const sampleVehicles: Vehicle[] = [
    {
      id: 'v-diesel-1',
      registration: 'KA-01-AA-1111',
      name: 'Tata Prima',
      make: 'Tata',
      category: 'Heavy Duty Truck',
      status: 'available',
      odometerKm: 60000,
      capacityKg: 20000,
      fuelType: 'Diesel',
      fuelLevelPct: 80,
      serviceDueDate: '2026-12-01T00:00:00.000Z',
      telemetryId: 'tel-1',
      modelYear: 2023,
      healthScore: 92,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'v-ev-1',
      registration: 'KA-01-EV-2222',
      name: 'Tata Ace EV',
      make: 'Tata',
      category: 'Electric Cargo Van',
      status: 'available',
      odometerKm: 15000,
      capacityKg: 1000,
      fuelType: 'Electric',
      fuelLevelPct: 95,
      serviceDueDate: '2027-01-01T00:00:00.000Z',
      telemetryId: 'tel-2',
      modelYear: 2024,
      healthScore: 99,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const sampleFuelLogs: FuelLog[] = [
    {
      id: 'f-1',
      vehicleId: 'v-diesel-1',
      date: '2026-11-20T10:00:00.000Z',
      quantityLiters: 100,
      costInr: 9000,
      stationName: 'IOCL Highway Yard',
      odometerKm: 59500,
      fuelType: 'Diesel',
    },
    {
      id: 'f-2',
      vehicleId: 'v-diesel-1',
      date: '2026-11-23T10:00:00.000Z',
      quantityLiters: 100,
      costInr: 9000,
      stationName: 'BPCL Depot',
      odometerKm: 60000,
      fuelType: 'Diesel',
    },
    {
      id: 'f-3',
      vehicleId: 'v-ev-1',
      date: '2026-11-23T12:00:00.000Z',
      quantityLiters: 50, // kWh
      costInr: 600,
      stationName: 'Tata Power EZ EV Hub',
      odometerKm: 15000,
      fuelType: 'Electric',
    },
  ];

  it('correctly aggregates total fuel spend across all energy types', () => {
    const metrics = calculateFleetEsgMetrics(sampleVehicles, sampleFuelLogs);
    expect(metrics.totalFuelSpentInr).toBe(18600); // 9000 + 9000 + 600
  });

  it('correctly calculates total diesel consumed and CO2 emissions', () => {
    const metrics = calculateFleetEsgMetrics(sampleVehicles, sampleFuelLogs);
    expect(metrics.totalDieselLitersConsumed).toBe(200);
    expect(metrics.totalCo2EmissionsKg).toBe(Math.round(200 * DIESEL_CO2_PER_LITER_KG));
  });

  it('correctly tallies electricity consumed and clean energy CO2 avoidance', () => {
    const metrics = calculateFleetEsgMetrics(sampleVehicles, sampleFuelLogs);
    expect(metrics.totalElectricityKwhConsumed).toBe(50);
    expect(metrics.activeEvVehiclesCount).toBe(1);
    expect(metrics.co2SavedByEvFleetKg).toBe(Math.round(50 * EV_CO2_SAVED_PER_KWH_KG + 2450));
  });

  it('detects stationary fuel siphon anomalies when velocity is 0 and drop >= 15%', () => {
    const anomaly = checkFuelAnomaly(80, 60, 0); // 20% drop while speed = 0
    expect(anomaly.isAnomaly).toBe(true);
    expect(anomaly.dropPct).toBe(20);
    expect(anomaly.reason).toContain('Stationary fuel siphon alert');
  });

  it('does not flag normal fuel drop while vehicle is actively moving', () => {
    const check = checkFuelAnomaly(80, 60, 65); // 20% drop while driving at 65 km/h
    expect(check.isAnomaly).toBe(false);
  });
});
