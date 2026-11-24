import { z } from 'zod';

export const vehicleFormSchema = z.object({
  registration: z
    .string()
    .min(5, 'Registration number must be at least 5 characters')
    .max(15, 'Registration number cannot exceed 15 characters')
    .regex(/^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i, 'Please enter a valid Indian vehicle registration (e.g. KA-01-EA-4821)'),
  name: z.string().min(2, 'Vehicle name or model designation is required'),
  make: z.string().min(2, 'Make is required'),
  category: z.enum([
    'Heavy Duty Truck',
    'Medium Freight',
    'Light Commercial',
    'Electric Cargo Van',
    'Refrigerated Carrier',
  ]),
  status: z.enum(['available', 'assigned', 'inTransit', 'maintenance', 'inactive']),
  odometerKm: z
    .number({ invalid_type_error: 'Odometer must be a valid number' })
    .min(0, 'Odometer cannot be negative'),
  capacityKg: z
    .number({ invalid_type_error: 'Payload capacity must be a valid number' })
    .positive('Capacity must be greater than 0 kg'),
  fuelType: z.enum(['Diesel', 'Electric', 'CNG', 'Hybrid']),
  fuelLevelPct: z.number().min(0).max(100),
  serviceDueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date is required'),
  modelYear: z
    .number()
    .min(2010, 'Model year must be 2010 or later')
    .max(new Date().getFullYear() + 1, 'Model year cannot be in the distant future'),
  notes: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export const tripFormSchema = z
  .object({
    originName: z.string().min(2, 'Origin location is required'),
    destinationName: z.string().min(2, 'Destination location is required'),
    driverId: z.string().min(1, 'Please select a driver'),
    vehicleId: z.string().min(1, 'Please select a vehicle'),
    scheduledStart: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid start date/time is required'),
    scheduledEnd: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid end date/time is required'),
    distanceKm: z.number().positive('Distance must be greater than 0 km'),
    cargoDescription: z.string().min(2, 'Cargo description is required'),
    cargoWeightKg: z.number().positive('Cargo weight must be greater than 0 kg'),
    notes: z.string().optional(),
  })
  .refine((data) => data.originName.toLowerCase().trim() !== data.destinationName.toLowerCase().trim(), {
    message: 'Origin and destination must be distinct locations',
    path: ['destinationName'],
  })
  .refine(
    (data) => new Date(data.scheduledStart).getTime() < new Date(data.scheduledEnd).getTime(),
    {
      message: 'Scheduled end time must be after scheduled start time',
      path: ['scheduledEnd'],
    }
  );

export type TripFormData = z.infer<typeof tripFormSchema>;

export const maintenanceJobSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  type: z.enum([
    'Preventive Service',
    'Brake Inspection',
    'Tire Replacement',
    'Engine Diagnostic',
    'Transmission Overhaul',
    'Electrical & Battery',
    'Safety Recertification',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid schedule date is required'),
  costEstimate: z.number().min(0, 'Estimated cost cannot be negative'),
  technician: z.string().min(2, 'Assigned technician or service center is required'),
  notes: z.string().optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceJobSchema>;

export const defectReportSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripId: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Please provide a clear description of the issue (at least 10 characters)'),
  notes: z.string().optional(),
});

export type DefectReportFormData = z.infer<typeof defectReportSchema>;

export const tripCompletionSchema = z.object({
  actualDistanceKm: z.number().positive('Actual distance must be greater than 0 km'),
  completionNotes: z.string().optional(),
});

export type TripCompletionFormData = z.infer<typeof tripCompletionSchema>;
