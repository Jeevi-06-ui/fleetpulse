import {
  Vehicle,
  Driver,
  Trip,
  Telemetry,
  MaintenanceJob,
  InspectionDefect,
  Notification,
  AuditActivity,
  GeofenceZone,
  GeofenceEvent,
  FuelLog,
} from '@/types';
import {
  SEED_VEHICLES,
  SEED_DRIVERS,
  SEED_TRIPS,
  SEED_TELEMETRY,
  SEED_MAINTENANCE_JOBS,
  SEED_INSPECTION_DEFECTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_GEOFENCE_ZONES,
  SEED_GEOFENCE_EVENTS,
  SEED_FUEL_LOGS,
} from '@/data/seedData';

export const STORAGE_KEY = 'FLEETPULSE_STATE_V1.1';

export interface PersistentFleetState {
  version: string;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  telemetry: Record<string, Telemetry>;
  maintenanceJobs: MaintenanceJob[];
  defects: InspectionDefect[];
  notifications: Notification[];
  auditLogs: AuditActivity[];
  geofenceZones: GeofenceZone[];
  geofenceEvents: GeofenceEvent[];
  fuelLogs: FuelLog[];
  lastSaved: string;
}

export function getInitialSeedState(): PersistentFleetState {
  return {
    version: '1.1',
    vehicles: JSON.parse(JSON.stringify(SEED_VEHICLES)),
    drivers: JSON.parse(JSON.stringify(SEED_DRIVERS)),
    trips: JSON.parse(JSON.stringify(SEED_TRIPS)),
    telemetry: JSON.parse(JSON.stringify(SEED_TELEMETRY)),
    maintenanceJobs: JSON.parse(JSON.stringify(SEED_MAINTENANCE_JOBS)),
    defects: JSON.parse(JSON.stringify(SEED_INSPECTION_DEFECTS)),
    notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
    auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
    geofenceZones: JSON.parse(JSON.stringify(SEED_GEOFENCE_ZONES)),
    geofenceEvents: JSON.parse(JSON.stringify(SEED_GEOFENCE_EVENTS)),
    fuelLogs: JSON.parse(JSON.stringify(SEED_FUEL_LOGS)),
    lastSaved: new Date().toISOString(),
  };
}

export function loadPersistentState(): PersistentFleetState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getInitialSeedState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedState();
      savePersistentState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.vehicles)) {
      console.warn('FleetPulse: Corrupted local storage. Restoring seed data.');
      const initial = getInitialSeedState();
      savePersistentState(initial);
      return initial;
    }

    // Graceful migration: ensure newly added entity arrays exist
    return {
      ...parsed,
      version: '1.1',
      geofenceZones: parsed.geofenceZones || JSON.parse(JSON.stringify(SEED_GEOFENCE_ZONES)),
      geofenceEvents: parsed.geofenceEvents || JSON.parse(JSON.stringify(SEED_GEOFENCE_EVENTS)),
      fuelLogs: parsed.fuelLogs || JSON.parse(JSON.stringify(SEED_FUEL_LOGS)),
    } as PersistentFleetState;
  } catch (err) {
    console.error('FleetPulse: Failed to read local storage. Falling back to default seed fixtures.', err);
    return getInitialSeedState();
  }
}

export function savePersistentState(state: PersistentFleetState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const stateToSave: PersistentFleetState = {
      ...state,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (err) {
    console.error('FleetPulse: Failed to persist state to local storage.', err);
  }
}

export function resetPersistentState(): PersistentFleetState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }
  const initial = getInitialSeedState();
  savePersistentState(initial);
  return initial;
}
