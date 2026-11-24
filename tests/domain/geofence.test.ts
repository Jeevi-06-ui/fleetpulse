import { describe, it, expect } from 'vitest';
import { isPointInsideGeofence, evaluateGeofenceStatus } from '@/lib/domain/geofence';
import { GeofenceZone } from '@/types';

describe('Domain: Geofencing & Depot Boundary Security Engine', () => {
  const centralHubZone: GeofenceZone = {
    id: 'zone-blr',
    name: 'Bengaluru Logistics Hub',
    type: 'Depot',
    coordinates: [35, 75],
    radius: 5,
    speedLimitKmh: 30,
    description: 'Central yard perimeter with speed governors',
  };

  it('accurately checks whether coordinates lie inside or outside circular boundary', () => {
    // Exact center
    expect(isPointInsideGeofence([35, 75], centralHubZone)).toBe(true);

    // 3 units away (radius is 5)
    expect(isPointInsideGeofence([38, 75], centralHubZone)).toBe(true);

    // Exact edge: distance = 5
    expect(isPointInsideGeofence([35, 80], centralHubZone)).toBe(true);

    // Outside boundary: distance = 10
    expect(isPointInsideGeofence([45, 75], centralHubZone)).toBe(false);
  });

  it('emits ENTER event when a vehicle crosses into a geofence zone', () => {
    const result = evaluateGeofenceStatus({
      vehicleId: 'veh-1',
      registration: 'KA-01-EA-4821',
      coordinates: [36, 76], // distance ~1.41 <= 5
      speedKmh: 20,
      zones: [centralHubZone],
      previouslyInsideZoneIds: [], // was not inside
    });

    expect(result.currentInsideZoneIds).toContain('zone-blr');
    expect(result.events.length).toBe(1);
    expect(result.events[0].eventType).toBe('ENTER');
    expect(result.events[0].zoneId).toBe('zone-blr');
    expect(result.events[0].speedKmh).toBe(20);
  });

  it('emits EXIT event when a vehicle leaves the geofence perimeter', () => {
    const result = evaluateGeofenceStatus({
      vehicleId: 'veh-1',
      registration: 'KA-01-EA-4821',
      coordinates: [50, 75], // distance = 15 > 5
      speedKmh: 45,
      zones: [centralHubZone],
      previouslyInsideZoneIds: ['zone-blr'], // was previously inside
    });

    expect(result.currentInsideZoneIds).not.toContain('zone-blr');
    expect(result.events.length).toBe(1);
    expect(result.events[0].eventType).toBe('EXIT');
    expect(result.events[0].zoneId).toBe('zone-blr');
  });

  it('emits SPEED_BREACH event when a vehicle exceeds zone speed limit while inside', () => {
    const result = evaluateGeofenceStatus({
      vehicleId: 'veh-2',
      registration: 'KA-04-MB-1904',
      coordinates: [35, 75], // center of zone
      speedKmh: 55, // Zone limit is 30 km/h!
      zones: [centralHubZone],
      previouslyInsideZoneIds: ['zone-blr'], // already inside
    });

    expect(result.currentInsideZoneIds).toContain('zone-blr');
    const speedBreachEvent = result.events.find((e) => e.eventType === 'SPEED_BREACH');
    expect(speedBreachEvent).toBeDefined();
    expect(speedBreachEvent?.speedKmh).toBe(55);
  });
});
