'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';
import {
  Vehicle,
  Driver,
  Trip,
  Telemetry,
  MaintenanceJob,
  InspectionDefect,
  Notification,
  AuditActivity,
  DemoSession,
  UserRole,
  FleetMetrics,
  TripStatus,
} from '@/types';
import {
  loadPersistentState,
  savePersistentState,
  resetPersistentState,
  PersistentFleetState,
} from '@/lib/storage';
import { calculateFleetMetrics } from '@/lib/domain/metrics';
import { checkTripConflicts } from '@/lib/domain/conflicts';
import { transitionTripStatus } from '@/lib/domain/lifecycle';

interface FleetState extends PersistentFleetState {
  session: DemoSession;
  theme: 'dark' | 'light';
  simulationActive: boolean;
  simulatedErrorMode: boolean;
  metrics: FleetMetrics;
  isHydrated: boolean;
}

type FleetAction =
  | { type: 'HYDRATE_STATE'; payload: PersistentFleetState }
  | { type: 'SET_ROLE'; payload: { role: UserRole; driverId?: string } }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'TOGGLE_SIMULATION'; payload?: boolean }
  | { type: 'TOGGLE_ERROR_MODE'; payload?: boolean }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'ARCHIVE_VEHICLE'; payload: string }
  | { type: 'CREATE_TRIP'; payload: Trip }
  | {
      type: 'TRANSITION_TRIP';
      payload: {
        tripId: string;
        newStatus: TripStatus;
        actor: string;
        actualDistanceKm?: number;
        completionNotes?: string;
        cancellationReason?: string;
      };
    }
  | { type: 'UPDATE_CHECKLIST'; payload: { tripId: string; itemId: string; completed: boolean } }
  | { type: 'REPORT_DEFECT'; payload: InspectionDefect }
  | { type: 'RESOLVE_DEFECT'; payload: { defectId: string; resolutionNotes: string } }
  | { type: 'SCHEDULE_MAINTENANCE'; payload: MaintenanceJob }
  | { type: 'UPDATE_MAINTENANCE'; payload: MaintenanceJob }
  | { type: 'RESOLVE_MAINTENANCE'; payload: { jobId: string; actualCost: number } }
  | { type: 'UPDATE_TELEMETRY'; payload: Record<string, Telemetry> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'RESET_DATA' };

const initialSession: DemoSession = {
  role: 'dispatcher',
  userName: 'Sunita Rao',
  userEmail: 'sunita.rao@jeevixfleet.demo',
};

function fleetReducer(state: FleetState, action: FleetAction): FleetState {
  switch (action.type) {
    case 'HYDRATE_STATE': {
      const p = action.payload;
      const metrics = calculateFleetMetrics(p.vehicles, p.trips, p.maintenanceJobs, p.defects);
      return {
        ...state,
        ...p,
        metrics,
        isHydrated: true,
      };
    }

    case 'SET_ROLE': {
      const { role, driverId } = action.payload;
      let userName = 'Sunita Rao';
      let userEmail = 'sunita.rao@jeevixfleet.demo';

      if (role === 'admin') {
        userName = 'Vikramaditya Hegde (Fleet Operations Lead)';
        userEmail = 'admin.ops@jeevixfleet.demo';
      } else if (role === 'driver') {
        const d = state.drivers.find((drv) => drv.id === driverId) || state.drivers[0];
        userName = `${d.name} (Driver)`;
        userEmail = d.email;
      }

      return {
        ...state,
        session: {
          role,
          driverId: role === 'driver' ? driverId || state.drivers[0]?.id : undefined,
          userName,
          userEmail,
        },
      };
    }

    case 'SET_THEME': {
      return { ...state, theme: action.payload };
    }

    case 'TOGGLE_SIMULATION': {
      const next = action.payload !== undefined ? action.payload : !state.simulationActive;
      return { ...state, simulationActive: next };
    }

    case 'TOGGLE_ERROR_MODE': {
      const next = action.payload !== undefined ? action.payload : !state.simulatedErrorMode;
      return { ...state, simulatedErrorMode: next };
    }

    case 'ADD_VEHICLE': {
      const newVehicles = [action.payload, ...state.vehicles];
      const audit: AuditActivity = {
        id: `act-${Date.now()}`,
        action: 'VEHICLE_REGISTERED',
        recordType: 'vehicle',
        recordId: action.payload.id,
        demoActor: state.session.userName,
        timestamp: new Date().toISOString(),
        description: `Registered vehicle ${action.payload.registration} (${action.payload.name}).`,
      };
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'system',
        severity: 'info',
        title: 'New Vehicle Registered',
        message: `${action.payload.registration} added to fleet registry.`,
        linkedRecord: { type: 'vehicle', id: action.payload.id },
        createdAt: new Date().toISOString(),
        read: false,
      };
      const metrics = calculateFleetMetrics(newVehicles, state.trips, state.maintenanceJobs, state.defects);
      return {
        ...state,
        vehicles: newVehicles,
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
        metrics,
      };
    }

    case 'UPDATE_VEHICLE': {
      const newVehicles = state.vehicles.map((v) =>
        v.id === action.payload.id ? action.payload : v
      );
      const metrics = calculateFleetMetrics(newVehicles, state.trips, state.maintenanceJobs, state.defects);
      return {
        ...state,
        vehicles: newVehicles,
        metrics,
      };
    }

    case 'ARCHIVE_VEHICLE': {
      const newVehicles = state.vehicles.map((v) =>
        v.id === action.payload ? { ...v, status: 'inactive' as const } : v
      );
      const metrics = calculateFleetMetrics(newVehicles, state.trips, state.maintenanceJobs, state.defects);
      return {
        ...state,
        vehicles: newVehicles,
        metrics,
      };
    }

    case 'CREATE_TRIP': {
      const newTrip = action.payload;
      const newTrips = [newTrip, ...state.trips];

      // Update vehicle status to assigned
      const newVehicles = state.vehicles.map((v) =>
        v.id === newTrip.vehicleId && v.status === 'available'
          ? { ...v, status: 'assigned' as const, assignedDriverId: newTrip.driverId }
          : v
      );

      // Update driver currentVehicleId
      const newDrivers = state.drivers.map((d) =>
        d.id === newTrip.driverId ? { ...d, currentVehicleId: newTrip.vehicleId } : d
      );

      const audit: AuditActivity = {
        id: `act-${Date.now()}`,
        action: 'TRIP_DISPATCHED',
        recordType: 'trip',
        recordId: newTrip.id,
        demoActor: state.session.userName,
        timestamp: new Date().toISOString(),
        description: `Dispatched Trip ${newTrip.tripNumber} (${newTrip.origin.name} → ${newTrip.destination.name}).`,
      };

      const notif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'trip_assigned',
        severity: 'info',
        title: 'New Trip Assigned',
        message: `Trip ${newTrip.tripNumber} scheduled from ${newTrip.origin.name}.`,
        linkedRecord: { type: 'trip', id: newTrip.id },
        createdAt: new Date().toISOString(),
        read: false,
      };

      const metrics = calculateFleetMetrics(newVehicles, newTrips, state.maintenanceJobs, state.defects);

      return {
        ...state,
        trips: newTrips,
        vehicles: newVehicles,
        drivers: newDrivers,
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
        metrics,
      };
    }

    case 'TRANSITION_TRIP': {
      const { tripId, newStatus, actor, actualDistanceKm, completionNotes, cancellationReason } =
        action.payload;
      const trip = state.trips.find((t) => t.id === tripId);
      if (!trip) return state;

      const result = transitionTripStatus(trip, newStatus, actor, {
        actualDistanceKm,
        completionNotes,
        cancellationReason,
      });

      if (!result.valid || !result.nextTrip) {
        return state;
      }

      const updatedTrip = result.nextTrip;
      const newTrips = state.trips.map((t) => (t.id === tripId ? updatedTrip : t));

      let newVehicles = [...state.vehicles];
      let newDrivers = [...state.drivers];

      // Handle Vehicle & Driver state updates based on trip transition
      if (newStatus === 'inProgress') {
        newVehicles = newVehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: 'inTransit' as const } : v
        );
        newDrivers = newDrivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: 'onTrip' as const } : d
        );
      } else if (newStatus === 'completed') {
        newVehicles = newVehicles.map((v) =>
          v.id === trip.vehicleId
            ? {
                ...v,
                status: 'available' as const,
                assignedDriverId: undefined,
                odometerKm: v.odometerKm + (result.odometerDeltaKm || 0), // Incremented ONCE idempotently
              }
            : v
        );
        newDrivers = newDrivers.map((d) =>
          d.id === trip.driverId
            ? {
                ...d,
                status: 'available' as const,
                currentVehicleId: undefined,
                totalTripsCompleted: d.totalTripsCompleted + 1,
              }
            : d
        );
      } else if (newStatus === 'cancelled') {
        newVehicles = newVehicles.map((v) =>
          v.id === trip.vehicleId && v.status === 'assigned'
            ? { ...v, status: 'available' as const, assignedDriverId: undefined }
            : v
        );
        newDrivers = newDrivers.map((d) =>
          d.id === trip.driverId && d.status !== 'onTrip'
            ? { ...d, status: 'available' as const, currentVehicleId: undefined }
            : d
        );
      }

      const notifType =
        newStatus === 'inProgress'
          ? 'trip_started'
          : newStatus === 'completed'
          ? 'trip_completed'
          : 'trip_cancelled';

      const notif: Notification = {
        id: `notif-${Date.now()}`,
        type: notifType,
        severity: newStatus === 'cancelled' ? 'warning' : 'info',
        title: `Trip ${newStatus === 'inProgress' ? 'Departed' : newStatus === 'completed' ? 'Delivered' : 'Cancelled'}`,
        message: `Trip ${trip.tripNumber} status is now ${newStatus}.`,
        linkedRecord: { type: 'trip', id: trip.id },
        createdAt: new Date().toISOString(),
        read: false,
      };

      const audit: AuditActivity = {
        id: `act-${Date.now()}`,
        action: `TRIP_${newStatus.toUpperCase()}`,
        recordType: 'trip',
        recordId: trip.id,
        demoActor: actor,
        timestamp: new Date().toISOString(),
        description: `Trip ${trip.tripNumber} changed to ${newStatus}.`,
      };

      const metrics = calculateFleetMetrics(newVehicles, newTrips, state.maintenanceJobs, state.defects);

      return {
        ...state,
        trips: newTrips,
        vehicles: newVehicles,
        drivers: newDrivers,
        notifications: [notif, ...state.notifications],
        auditLogs: [audit, ...state.auditLogs],
        metrics,
      };
    }

    case 'UPDATE_CHECKLIST': {
      const { tripId, itemId, completed } = action.payload;
      const newTrips = state.trips.map((t) => {
        if (t.id !== tripId) return t;
        const newChecklist = t.checklist.map((chk) =>
          chk.id === itemId ? { ...chk, completed } : chk
        );
        return { ...t, checklist: newChecklist };
      });
      return { ...state, trips: newTrips };
    }

    case 'REPORT_DEFECT': {
      const defect = action.payload;
      const newDefects = [defect, ...state.defects];

      // If critical severity, mark vehicle unavailable (maintenance) immediately
      let newVehicles = [...state.vehicles];
      if (defect.severity === 'critical') {
        newVehicles = newVehicles.map((v) =>
          v.id === defect.vehicleId ? { ...v, status: 'maintenance' as const } : v
        );
      }

      const notif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'defect_reported',
        severity: defect.severity === 'critical' ? 'critical' : 'warning',
        title: `Defect Reported (${defect.defectCode})`,
        message: `${defect.severity.toUpperCase()} defect on vehicle: ${defect.description}`,
        linkedRecord: { type: 'defect', id: defect.id },
        createdAt: new Date().toISOString(),
        read: false,
      };

      const audit: AuditActivity = {
        id: `act-${Date.now()}`,
        action: 'DEFECT_FILED',
        recordType: 'defect',
        recordId: defect.id,
        demoActor: state.session.userName,
        timestamp: new Date().toISOString(),
        description: `Filed ${defect.severity} defect for vehicle ${defect.vehicleId}.`,
      };

      const metrics = calculateFleetMetrics(newVehicles, state.trips, state.maintenanceJobs, newDefects);

      return {
        ...state,
        defects: newDefects,
        vehicles: newVehicles,
        notifications: [notif, ...state.notifications],
        auditLogs: [audit, ...state.auditLogs],
        metrics,
      };
    }

    case 'RESOLVE_DEFECT': {
      const { defectId, resolutionNotes } = action.payload;
      const targetDefect = state.defects.find((d) => d.id === defectId);
      const newDefects = state.defects.map((d) =>
        d.id === defectId
          ? {
              ...d,
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              resolutionNotes,
            }
          : d
      );

      // Check if vehicle can be returned to available
      let newVehicles = [...state.vehicles];
      if (targetDefect) {
        const remainingCritical = newDefects.filter(
          (d) => d.vehicleId === targetDefect.vehicleId && d.severity === 'critical' && d.status !== 'resolved'
        );
        const hasActiveMaint = state.maintenanceJobs.some(
          (m) => m.vehicleId === targetDefect.vehicleId && (m.status === 'scheduled' || m.status === 'inProgress')
        );
        if (remainingCritical.length === 0 && !hasActiveMaint) {
          newVehicles = newVehicles.map((v) =>
            v.id === targetDefect.vehicleId && v.status === 'maintenance'
              ? { ...v, status: 'available' as const }
              : v
          );
        }
      }

      const metrics = calculateFleetMetrics(newVehicles, state.trips, state.maintenanceJobs, newDefects);
      return {
        ...state,
        defects: newDefects,
        vehicles: newVehicles,
        metrics,
      };
    }

    case 'SCHEDULE_MAINTENANCE': {
      const job = action.payload;
      const newJobs = [job, ...state.maintenanceJobs];

      // Mark vehicle maintenance
      const newVehicles = state.vehicles.map((v) =>
        v.id === job.vehicleId && (job.status === 'inProgress' || job.status === 'scheduled')
          ? { ...v, status: 'maintenance' as const }
          : v
      );

      const notif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'maintenance_due',
        severity: job.priority === 'critical' ? 'critical' : 'warning',
        title: `Maintenance Job Scheduled (${job.jobCode})`,
        message: `${job.type} scheduled for vehicle ${job.vehicleId}.`,
        linkedRecord: { type: 'maintenance', id: job.id },
        createdAt: new Date().toISOString(),
        read: false,
      };

      const metrics = calculateFleetMetrics(newVehicles, state.trips, newJobs, state.defects);
      return {
        ...state,
        maintenanceJobs: newJobs,
        vehicles: newVehicles,
        notifications: [notif, ...state.notifications],
        metrics,
      };
    }

    case 'UPDATE_MAINTENANCE': {
      const updated = action.payload;
      const newJobs = state.maintenanceJobs.map((j) => (j.id === updated.id ? updated : j));
      const metrics = calculateFleetMetrics(state.vehicles, state.trips, newJobs, state.defects);
      return { ...state, maintenanceJobs: newJobs, metrics };
    }

    case 'RESOLVE_MAINTENANCE': {
      const { jobId, actualCost } = action.payload;
      const job = state.maintenanceJobs.find((j) => j.id === jobId);
      if (!job) return state;

      const now = new Date().toISOString();
      const newJobs = state.maintenanceJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'completed' as const,
              actualCost,
              completedDate: now,
              updatedAt: now,
            }
          : j
      );

      // Return vehicle to available if no other active maintenance or critical defect
      const remainingJobs = newJobs.filter(
        (j) => j.vehicleId === job.vehicleId && (j.status === 'scheduled' || j.status === 'inProgress')
      );
      const openCriticalDefects = state.defects.filter(
        (d) => d.vehicleId === job.vehicleId && d.severity === 'critical' && d.status !== 'resolved'
      );

      let newVehicles = [...state.vehicles];
      if (remainingJobs.length === 0 && openCriticalDefects.length === 0) {
        newVehicles = newVehicles.map((v) =>
          v.id === job.vehicleId && v.status === 'maintenance'
            ? { ...v, status: 'available' as const }
            : v
        );
      }

      const metrics = calculateFleetMetrics(newVehicles, state.trips, newJobs, state.defects);
      return {
        ...state,
        maintenanceJobs: newJobs,
        vehicles: newVehicles,
        metrics,
      };
    }

    case 'UPDATE_TELEMETRY': {
      return {
        ...state,
        telemetry: {
          ...state.telemetry,
          ...action.payload,
        },
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const newNotifs = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return { ...state, notifications: newNotifs };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const newNotifs = state.notifications.map((n) => ({ ...n, read: true }));
      return { ...state, notifications: newNotifs };
    }

    case 'RESET_DATA': {
      const fresh = resetPersistentState();
      const metrics = calculateFleetMetrics(
        fresh.vehicles,
        fresh.trips,
        fresh.maintenanceJobs,
        fresh.defects
      );
      return {
        ...state,
        ...fresh,
        metrics,
      };
    }

    default:
      return state;
  }
}

interface FleetContextValue {
  state: FleetState;
  dispatch: React.Dispatch<FleetAction>;
  checkTripConflicts: (params: {
    tripIdToExclude?: string;
    vehicleId: string;
    driverId: string;
    scheduledStart: string;
    scheduledEnd: string;
  }) => ReturnType<typeof checkTripConflicts>;
  resetToSeedData: () => void;
  switchRole: (role: UserRole, driverId?: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSimulation: () => void;
  toggleErrorMode: () => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => {
    const seed = loadPersistentState();
    const metrics = calculateFleetMetrics(
      seed.vehicles,
      seed.trips,
      seed.maintenanceJobs,
      seed.defects
    );
    return {
      ...seed,
      session: initialSession,
      theme: 'dark' as const,
      simulationActive: true,
      simulatedErrorMode: false,
      metrics,
      isHydrated: false,
    };
  }, []);

  const [state, dispatch] = useReducer(fleetReducer, initial);

  // Safe client-side hydration
  useEffect(() => {
    const loaded = loadPersistentState();
    dispatch({ type: 'HYDRATE_STATE', payload: loaded });

    // Check stored theme preference
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = localStorage.getItem('fleetpulse_theme') as 'dark' | 'light' | null;
      if (storedTheme) {
        dispatch({ type: 'SET_THEME', payload: storedTheme });
      }
    }
  }, []);

  // Sync state to versioned local storage whenever core records change
  useEffect(() => {
    if (state.isHydrated) {
      savePersistentState({
        version: state.version,
        vehicles: state.vehicles,
        drivers: state.drivers,
        trips: state.trips,
        telemetry: state.telemetry,
        maintenanceJobs: state.maintenanceJobs,
        defects: state.defects,
        notifications: state.notifications,
        auditLogs: state.auditLogs,
        lastSaved: state.lastSaved,
      });
    }
  }, [
    state.isHydrated,
    state.vehicles,
    state.drivers,
    state.trips,
    state.telemetry,
    state.maintenanceJobs,
    state.defects,
    state.notifications,
    state.auditLogs,
    state.lastSaved,
    state.version,
  ]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (state.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('fleetpulse_theme', state.theme);
    }
  }, [state.theme]);

  // Simulated GPS Telemetry Ticker (stops when simulationActive is false)
  useEffect(() => {
    if (!state.simulationActive) return;

    const interval = setInterval(() => {
      // Find vehicles in transit and nudge synthetic coordinates along their route
      const inTransitVehicles = state.vehicles.filter((v) => v.status === 'inTransit');
      if (inTransitVehicles.length === 0) return;

      const updatedTelemetry: Record<string, Telemetry> = {};
      const now = new Date().toISOString();

      inTransitVehicles.forEach((v) => {
        const cur = state.telemetry[v.telemetryId];
        if (!cur) return;

        // Small deterministic delta
        const deltaX = (Math.random() - 0.48) * 0.4;
        const deltaY = (Math.random() - 0.48) * 0.4;
        const newX = Math.min(95, Math.max(5, cur.coordinates[0] + deltaX));
        const newY = Math.min(95, Math.max(5, cur.coordinates[1] + deltaY));
        const newSpeed = Math.floor(55 + Math.random() * 18);

        updatedTelemetry[v.telemetryId] = {
          ...cur,
          coordinates: [Math.round(newX * 10) / 10, Math.round(newY * 10) / 10],
          speedKmh: newSpeed,
          heading: (cur.heading + Math.floor((Math.random() - 0.5) * 6) + 360) % 360,
          lastUpdated: now,
        };
      });

      dispatch({ type: 'UPDATE_TELEMETRY', payload: updatedTelemetry });
    }, 4000);

    return () => clearInterval(interval);
  }, [state.simulationActive, state.vehicles, state.telemetry]);

  const contextValue: FleetContextValue = {
    state,
    dispatch,
    checkTripConflicts: (params) =>
      checkTripConflicts({
        ...params,
        trips: state.trips,
        maintenanceJobs: state.maintenanceJobs,
        defects: state.defects,
      }),
    resetToSeedData: () => {
      dispatch({ type: 'RESET_DATA' });
    },
    switchRole: (role: UserRole, driverId?: string) => {
      dispatch({ type: 'SET_ROLE', payload: { role, driverId } });
    },
    setTheme: (theme: 'dark' | 'light') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    toggleSimulation: () => {
      dispatch({ type: 'TOGGLE_SIMULATION' });
    },
    toggleErrorMode: () => {
      dispatch({ type: 'TOGGLE_ERROR_MODE' });
    },
  };

  return <FleetContext.Provider value={contextValue}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const ctx = useContext(FleetContext);
  if (!ctx) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return ctx;
}
