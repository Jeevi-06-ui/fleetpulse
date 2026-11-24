# Mock API Contracts and Specification
## FleetPulse REST Telematics & Dispatch Gateway
**Jeevix Technologies** — Service Layer Documentation  

---

### 1. Response Envelope Format
All local mock API endpoints return standardized JSON response envelopes with HTTP-aligned status codes:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;       // e.g. "CONFLICT", "BAD_REQUEST", "NOT_FOUND", "INTERNAL_SERVER_ERROR"
    message: string;    // Human-readable diagnostic message
    details?: any;      // Validation field errors or conflict record IDs
  };
  meta: {
    timestamp: string;  // ISO 8601 UTC timestamp
    version: string;    // "1.0.0-mock"
  };
}
```

---

### 2. Endpoint Catalog

#### 2.1 Vehicle Registry (`/vehicles`)
- `GET /vehicles`: Retrieve list of all vehicles with optional filters (`status`, `category`, `search`).
- `GET /vehicles/:id`: Fetch complete dossier for a single vehicle.
- `POST /vehicles`: Register new transport asset. Validates against duplicate registration (409 Conflict).
- `PUT /vehicles/:id`: Update vehicle specifications or assignment.
- `DELETE /vehicles/:id`: Decommission vehicle (blocks deletion if active trips exist with 400 Bad Request).

#### 2.2 Telematics Tracking (`/telemetry`)
- `GET /telemetry`: Retrieve latest simulated GPS coordinate pairs, velocity (km/h), and heading for all active vehicles.
- `GET /telemetry/:vehicleId`: Get live sensor readings for a specific vehicle.

#### 2.3 Trip Dispatch Management (`/trips`)
- `GET /trips`: List all dispatches with status filters (`scheduled`, `inProgress`, `completed`, `cancelled`).
- `POST /trips`: Schedule new consignment. Evaluates overlap conflicts (409 Conflict on overlap or maintenance collision).
- `GET /trips/:id`: Retrieve trip details, route points, and status history.
- `PATCH /trips/:id/status`: Transition lifecycle state (`inProgress`, `completed`, `cancelled`). Validates safety checklist completion.

#### 2.4 Maintenance & Workshop (`/maintenance`)
- `GET /maintenance`: Fetch all work orders and service schedules.
- `POST /maintenance`: Schedule preventive maintenance. Marks vehicle as maintenance status.
- `PATCH /maintenance/:id/resolve`: Sign off on workshop repairs with final invoiced cost in ₹ INR. Returns vehicle to available pool.

#### 2.5 Safety Defects & Inspections (`/inspections`)
- `GET /inspections`: Retrieve defect logbook.
- `POST /inspections`: File mechanical defect. If severity is `critical`, vehicle is immediately grounded from dispatch.
- `PATCH /inspections/:id/resolve`: Resolve defect with technician sign-off notes.

---

### 3. Controlled Error Simulation
A simulated failure toggle is provided in `/settings` to force any endpoint to respond with a controlled HTTP 500 Internal Server Error envelope for QA resilience verification.
