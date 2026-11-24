export type VehicleStatus = 'available' | 'assigned' | 'inTransit' | 'maintenance' | 'inactive';

export type VehicleCategory = 
  | 'Heavy Duty Truck'
  | 'Medium Freight'
  | 'Light Commercial'
  | 'Electric Cargo Van'
  | 'Refrigerated Carrier';

export interface Vehicle {
  id: string;
  registration: string;
  name: string;
  category: VehicleCategory;
  status: VehicleStatus;
  odometerKm: number;
  capacityKg: number;
  fuelType: 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
  fuelLevelPct: number;
  serviceDueDate: string; // ISO date string
  assignedDriverId?: string;
  telemetryId: string;
  modelYear: number;
  make: string;
  healthScore: number; // 0 - 100
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DriverStatus = 'available' | 'onTrip' | 'offDuty' | 'suspended';

export interface Driver {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  licenseNumber: string;
  licenseCategory: 'Heavy Vehicle' | 'Commercial Transport' | 'Hazardous Goods';
  licenseExpiry: string; // ISO date
  status: DriverStatus;
  currentVehicleId?: string;
  rating: number; // 1.0 - 5.0
  totalTripsCompleted: number;
  experienceYears: number;
  emergencyContact: string;
  joinedDate: string;
}

export type TripStatus = 'scheduled' | 'inProgress' | 'completed' | 'cancelled';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface StatusHistoryEntry {
  status: TripStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface RouteLocation {
  name: string;
  address: string;
  coordinates: [number, number]; // [x, y] in 0-100 schematic coordinate grid
}

export interface Trip {
  id: string;
  tripNumber: string;
  origin: RouteLocation;
  destination: RouteLocation;
  routePoints: [number, number][]; // Array of schematic points
  scheduledStart: string; // ISO string
  scheduledEnd: string;   // ISO string
  actualStart?: string;
  actualEnd?: string;
  driverId: string;
  vehicleId: string;
  distanceKm: number;
  actualDistanceKm?: number;
  cargoDescription: string;
  cargoWeightKg: number;
  status: TripStatus;
  checklist: ChecklistItem[];
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Telemetry {
  vehicleId: string;
  coordinates: [number, number]; // [x, y] in 0-100 schematic coordinate grid
  speedKmh: number;
  heading: number; // 0 - 359 degrees
  lastUpdated: string;
  connectivity: 'online' | 'degraded' | 'offline';
  fuelLevelPct: number;
  engineTempC: number;
  batteryPct?: number;
}

export type MaintenanceType = 
  | 'Preventive Service'
  | 'Brake Inspection'
  | 'Tire Replacement'
  | 'Engine Diagnostic'
  | 'Transmission Overhaul'
  | 'Electrical & Battery'
  | 'Safety Recertification';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'scheduled' | 'inProgress' | 'completed' | 'cancelled';

export interface MaintenanceJob {
  id: string;
  jobCode: string;
  vehicleId: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  scheduledDate: string; // ISO string
  completedDate?: string;
  status: MaintenanceStatus;
  costEstimate: number; // in INR
  actualCost?: number;  // in INR
  odometerKm: number;
  technician: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DefectStatus = 'reported' | 'investigating' | 'scheduled_repair' | 'resolved';

export interface InspectionDefect {
  id: string;
  defectCode: string;
  vehicleId: string;
  tripId?: string;
  reporterDriverId: string;
  checklistResults: { item: string; passed: boolean }[];
  severity: DefectSeverity;
  description: string;
  status: DefectStatus;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  attachmentName?: string;
  attachmentDataUrl?: string; // Local preview only
}

export type NotificationType = 
  | 'trip_assigned'
  | 'trip_started'
  | 'trip_completed'
  | 'trip_cancelled'
  | 'maintenance_due'
  | 'defect_reported'
  | 'speeding_alert'
  | 'system';

export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  linkedRecord?: {
    type: 'vehicle' | 'trip' | 'maintenance' | 'defect';
    id: string;
  };
  createdAt: string;
  read: boolean;
}

export interface AuditActivity {
  id: string;
  action: string;
  recordType: 'vehicle' | 'trip' | 'maintenance' | 'driver' | 'defect' | 'system';
  recordId: string;
  demoActor: string;
  timestamp: string;
  description: string;
}

export type UserRole = 'dispatcher' | 'driver' | 'admin';

export interface DemoSession {
  role: UserRole;
  driverId?: string; // Set when role === 'driver'
  userName: string;
  userEmail: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    timestamp: string;
    version: string;
  };
}

export interface FleetMetrics {
  totalFleet: number;
  activeFleet: number;
  availableVehicles: number;
  assignedVehicles: number;
  inTransitVehicles: number;
  maintenanceVehicles: number;
  inactiveVehicles: number;
  fleetUtilizationPct: number;
  totalTrips: number;
  completedTrips: number;
  inProgressTrips: number;
  scheduledTrips: number;
  cancelledTrips: number;
  tripCompletionRatePct: number;
  overdueMaintenanceCount: number;
  totalMaintenanceCostYTD: number;
  activeDefectsCount: number;
  criticalDefectsCount: number;
}
