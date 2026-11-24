import { GeofenceZone, GeofenceEvent } from '@/types';

/**
 * Checks if a vehicle coordinate [x, y] is inside a circular geofence zone.
 */
export function isPointInsideGeofence(
  coordinates: [number, number],
  zone: GeofenceZone
): boolean {
  const [x, y] = coordinates;
  const [zx, zy] = zone.coordinates;
  const distance = Math.sqrt(Math.pow(x - zx, 2) + Math.pow(y - zy, 2));
  return distance <= zone.radius;
}

/**
 * Evaluates telemetry against configured geofence zones to detect entrance, exit,
 * or terminal bay speed limit breaches.
 */
export function evaluateGeofenceStatus(params: {
  vehicleId: string;
  registration: string;
  coordinates: [number, number];
  speedKmh: number;
  zones: GeofenceZone[];
  previouslyInsideZoneIds: string[];
}): {
  currentInsideZoneIds: string[];
  events: GeofenceEvent[];
} {
  const {
    vehicleId,
    registration,
    coordinates,
    speedKmh,
    zones,
    previouslyInsideZoneIds,
  } = params;

  const currentInsideZoneIds: string[] = [];
  const events: GeofenceEvent[] = [];
  const now = new Date().toISOString();

  zones.forEach((zone) => {
    const isInside = isPointInsideGeofence(coordinates, zone);
    const wasInside = previouslyInsideZoneIds.includes(zone.id);

    if (isInside) {
      currentInsideZoneIds.push(zone.id);

      if (!wasInside) {
        // Just entered
        events.push({
          id: `geo-evt-${Date.now()}-${zone.id}`,
          vehicleId,
          registration,
          zoneId: zone.id,
          zoneName: zone.name,
          eventType: 'ENTER',
          timestamp: now,
          speedKmh,
        });
      }

      // Check speed breach inside terminal / zone
      if (speedKmh > zone.speedLimitKmh) {
        events.push({
          id: `geo-spd-${Date.now()}-${zone.id}`,
          vehicleId,
          registration,
          zoneId: zone.id,
          zoneName: zone.name,
          eventType: 'SPEED_BREACH',
          timestamp: now,
          speedKmh,
        });
      }
    } else if (wasInside) {
      // Just exited
      events.push({
        id: `geo-exit-${Date.now()}-${zone.id}`,
        vehicleId,
        registration,
        zoneId: zone.id,
        zoneName: zone.name,
        eventType: 'EXIT',
        timestamp: now,
        speedKmh,
      });
    }
  });

  return { currentInsideZoneIds, events };
}
