# Software Requirements Specification (SRS)
## FleetPulse — Smart Fleet Operations & Maintenance Management System
**Organization:** Jeevix Technologies — *Engineering Tomorrow Into Reality*  
**Intern:** Chandan Mayur A | Presidency University  
**Role:** Frontend Development Intern  
**Reference:** JT/INT/2026/FE/027  
**System Version:** 1.0.0-PROD-STABLE  

---

### 1. Introduction and Scope
FleetPulse is a production-grade enterprise frontend application engineered for logistics carriers, freight forwarders, and commercial fleet operators. The system unifies real-time telematics visualization, dispatch scheduling with conflict prevention, driver safety compliance, workshop work orders, and analytics reporting into a cohesive command center.

#### 1.1 Purpose
The purpose of FleetPulse is to provide:
1. Dispatchers with an automated scheduling environment that actively prevents overlapping asset commitments and maintenance collisions.
2. Commercial drivers with a touch-first mobile cockpit featuring mandatory 5-point safety inspections and rapid mechanical defect escalation.
3. Fleet administrators with operational visibility, maintenance governance, KPI computation, and audit logs.

#### 1.2 User Personas
- **Sunita Rao (Lead Dispatcher):** Needs to register transport assets, schedule multi-stop inter-city freight trips, verify vehicle/driver availability, and monitor transit progress.
- **Rajesh Kumar (Commercial Heavy Haul Driver):** Needs an accessible mobile cockpit to complete pre-trip safety checks, review assigned consignments, log odometer distances, and report mechanical defects.
- **Vikramaditya Hegde (Fleet Operations Lead / Administrator):** Needs comprehensive oversight of asset health, service work orders, downtime metrics, CSV reports, and audit trails.

---

### 2. Functional Requirements Traceability Matrix

| Requirement ID | Module | Description | Implementation Artifact | Status |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-OPS-01** | Dashboard | Real-time computed KPI strip for fleet size, active utilization, available assets, maintenance, completion rate, and defects. | `src/components/fleet/KpiStrip.tsx` | **VERIFIED** |
| **REQ-OPS-02** | Dashboard | Asset status breakdown and classification charts using Recharts. | `src/components/fleet/VehicleStatusChart.tsx` | **VERIFIED** |
| **REQ-VEH-01** | Vehicles | Searchable, filterable, sortable, and paginated vehicle registry with status badges. | `src/components/fleet/VehicleTable.tsx` | **VERIFIED** |
| **REQ-VEH-02** | Vehicles | Validated vehicle registration modal preventing duplicate registrations and negative odometers. | `src/components/fleet/AddVehicleModal.tsx` | **VERIFIED** |
| **REQ-VEH-03** | Vehicles | Comprehensive vehicle dossier with specs, driver roster, odometer, telemetry, and trip history. | `src/app/vehicles/[id]/page.tsx` | **VERIFIED** |
| **REQ-VEH-04** | Vehicles | Safe decommission protocol preventing archiving of vehicles assigned to active trips. | `src/app/vehicles/[id]/page.tsx` | **VERIFIED** |
| **REQ-TRK-01** | Tracking | Interactive schematic SVG map with national highway corridors and regional freight nodes. | `src/components/tracking/SchematicMap.tsx` | **VERIFIED** |
| **REQ-TRK-02** | Tracking | Clear, permanent `SIMULATED GPS / DEMO DATA` badge and simulation pause/resume ticker. | `src/components/tracking/SchematicMap.tsx` | **VERIFIED** |
| **REQ-TRK-03** | Tracking | Selected vehicle inspection drawer showing velocity, heading, fuel level, and active consignment. | `src/components/tracking/TrackingVehicleSidebar.tsx` | **VERIFIED** |
| **REQ-DSP-01** | Dispatch | Consignment creation form with origin/destination validation and distance calculation. | `src/app/trips/new/page.tsx` | **VERIFIED** |
| **REQ-DSP-02** | Dispatch | Automated conflict engine rejecting overlapping vehicle/driver assignments and maintenance windows. | `src/lib/domain/conflicts.ts` | **VERIFIED** |
| **REQ-DSP-03** | Dispatch | Trip lifecycle state machine: scheduled → inProgress → completed; scheduled → cancelled. | `src/lib/domain/lifecycle.ts` | **VERIFIED** |
| **REQ-DSP-04** | Dispatch | Mandatory pre-trip safety checklist required before departure state transition. | `src/app/trips/[id]/page.tsx` | **VERIFIED** |
| **REQ-DRV-01** | Driver | Mobile-first driver cockpit with active convoy card, touch checklist, and trip history. | `src/components/driver/DriverTripCockpit.tsx` | **VERIFIED** |
| **REQ-DRV-02** | Driver | Defect reporting form with severity rating and client-side photo preview. | `src/app/driver/issues/page.tsx` | **VERIFIED** |
| **REQ-DRV-03** | Driver | Immediate grounding: Critical defects mark vehicle as maintenance and block dispatch. | `src/context/FleetContext.tsx` | **VERIFIED** |
| **REQ-MNT-01** | Maintenance | Workshop schedule tracking overdue and upcoming services with cost tracking in ₹ INR. | `src/app/maintenance/page.tsx` | **VERIFIED** |
| **REQ-MNT-02** | Maintenance | Work order sign-off returning vehicles to available fleet upon defect and repair clearance. | `src/app/maintenance/page.tsx` | **VERIFIED** |
| **REQ-REP-01** | Reports | Tabular consignment report with sorting and pagination. | `src/app/reports/page.tsx` | **VERIFIED** |
| **REQ-REP-02** | Reports | CSV export matching full filtered cohort with spreadsheet formula injection protection. | `src/lib/domain/csv.ts` | **VERIFIED** |
| **REQ-SYS-01** | System | Versioned local storage (`FLEETPULSE_STATE_V1.0`) with corrupted storage recovery. | `src/lib/storage/index.ts` | **VERIFIED** |
| **REQ-SYS-02** | System | Instant reset to deterministic seed fixtures with explicit confirmation modal. | `src/components/layout/Navbar.tsx` | **VERIFIED** |

---

### 3. Non-Functional Requirements (NFR)
1. **Performance:** Initial page load under 1.2s on standard broadband; Next.js route chunks under 130 kB first load JS.
2. **Accessibility:** WCAG 2.1 Level AA compliant contrast ratios across light and dark modes, semantic HTML, visible keyboard focus rings (`:focus-visible`), and `prefers-reduced-motion` compliance.
3. **Resilience:** Client-side mock error simulation mode allowing validation of network timeouts and 500 error boundaries.
4. **Security:** CSV formula sanitization prepending single quotes (`'`) to strings starting with `=`, `+`, `-`, `@`, `\t`, `\r` to block spreadsheet code execution (CWE-1236).
