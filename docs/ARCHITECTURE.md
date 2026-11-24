# Architecture & Technical Design Specification
## FleetPulse Logistics Operating System
**Jeevix Technologies** — Enterprise Frontend Engineering  
**Author:** Chandan Mayur A | Presidency University  

---

### 1. System Architecture Overview
FleetPulse is constructed using Next.js 14 App Router, TypeScript (strict mode), Tailwind CSS, and a canonical reactive state engine backed by versioned browser storage. All domain operations are decoupled from presentation components through isolated business logic modules.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 14 App Router                      │
│   /dashboard   /vehicles   /tracking   /trips   /driver   ...   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│               FleetProvider (React Context + Reducer)           │
│  - State Hydration & Versioned Persistence (localStorage)       │
│  - Real-Time Telemetry Simulation Ticker (4000ms loop)          │
│  - Client-Side Role Demo Authorization (Dispatcher/Driver/Admin)│
└───────────────┬────────────────────────────────┬────────────────┘
                │                                │
┌───────────────▼───────────────┐┌───────────────▼────────────────┐
│      Domain Logic Engines     ││       Validation & Storage     │
│ - conflicts.ts (Overlap/Slots)││ - schemas.ts (Zod Forms)       │
│ - lifecycle.ts (State Machine)││ - storage.ts (Safe Hydration)  │
│ - metrics.ts (Derived KPIs)   ││ - csv.ts (Injection Defense)   │
│ - mockClient.ts (REST Envelop)││ - seedData.ts (Fixtures)       │
└───────────────────────────────┘└────────────────────────────────┘
```

---

### 2. Entity-Relationship Model (Mermaid)

```mermaid
erDiagram
    VEHICLE ||--o{ TRIP : "assigned to"
    DRIVER ||--o{ TRIP : "operates"
    VEHICLE ||--o{ TELEMETRY : "emits"
    VEHICLE ||--o{ MAINTENANCE_JOB : "undergoes"
    VEHICLE ||--o{ INSPECTION_DEFECT : "flagged with"
    TRIP ||--o{ INSPECTION_DEFECT : "generates"
    USER_SESSION ||--o{ AUDIT_ACTIVITY : "triggers"

    VEHICLE {
        string id PK
        string registration
        string name
        string category
        string status
        number odometerKm
        number capacityKg
        string fuelType
        number fuelLevelPct
        string serviceDueDate
        string assignedDriverId FK
        string telemetryId FK
        number healthScore
    }

    DRIVER {
        string id PK
        string name
        string contactNumber
        string licenseNumber
        string licenseCategory
        string status
        string currentVehicleId FK
        number rating
        number totalTripsCompleted
    }

    TRIP {
        string id PK
        string tripNumber
        object origin
        object destination
        string scheduledStart
        string scheduledEnd
        string driverId FK
        string vehicleId FK
        number distanceKm
        string status
        array checklist
    }

    MAINTENANCE_JOB {
        string id PK
        string jobCode
        string vehicleId FK
        string type
        string priority
        string scheduledDate
        string status
        number costEstimate
        number actualCost
    }

    INSPECTION_DEFECT {
        string id PK
        string defectCode
        string vehicleId FK
        string reporterDriverId FK
        string severity
        string description
        string status
    }
```

---

### 3. Trip Lifecycle State Machine (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> Scheduled : Dispatched by Dispatcher
    Scheduled --> InProgress : Pre-Trip Checklist Verified & Started
    Scheduled --> Cancelled : Cancelled (Releases Vehicle & Driver)
    InProgress --> Completed : Consignee Sign-Off & Odometer Updated Once
    Completed --> [*]
    Cancelled --> [*]

    note right of Scheduled
        Validates vehicle & driver availability
        Checks maintenance window conflicts
        Checks open critical defects
    end note

    note right of InProgress
        All 5 pre-trip checks mandatory
        Vehicle status = inTransit
        Driver status = onTrip
    end note

    note right of Completed
        Increments vehicle odometer idempotently
        Releases vehicle & driver to available
        Logs immutable audit record
    end note
```

---

### 4. Overlap & Scheduling Algorithm
The conflict detection engine verifies two closed intervals $[startA, endA)$ and $[startB, endB)$:
$$\text{Overlap} \iff startA < endB \land endA > startB$$
Crucially, adjacent contiguous slots where $startA = endB$ or $endA = startB$ are **strictly allowed**, enabling sequential back-to-back dispatch without artificial gaps.
