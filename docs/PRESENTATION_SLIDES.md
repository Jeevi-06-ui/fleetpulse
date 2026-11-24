# Presentation Slides & Demo Walkthrough Script
## FleetPulse — Project Defense & Technical Demonstration
**Candidate:** Chandan Mayur A | Presidency University  
**Supervisor / Mentor:** Jeevix Technologies  

---

### Slide 1: Title & Overview
- **Title:** FleetPulse — Smart Fleet Operations & Maintenance Management System
- **Subtitle:** Enterprise Freight Telematics, Conflict-Free Scheduling & Driver Cockpit
- **Intern:** Chandan Mayur A (Presidency University) | Ref: JT/INT/2026/FE/027
- **Company:** Jeevix Technologies — *Engineering Tomorrow Into Reality*

### Slide 2: The Operational Problem
- Spreadsheets and legacy GPS screens create siloed operations.
- Double-booking of heavy vehicles and drivers leads to idle driver hours and demurrage fees.
- Critical mechanical defects reported verbally cause roadside breakdowns.

### Slide 3: The FleetPulse Solution
- Unified operations command center with real-time KPI metrics.
- Automated scheduling conflict engine detecting overlaps and maintenance collisions.
- Mobile-first driver interface requiring 5-point safety inspections before departure.
- Interactive schematic SVG tracking map without external API dependencies.

### Slide 4: Live Demo Walkthrough Script (5-Minute Demonstration)
1. **Scene 1 (Dispatcher Overview):**
   - Navigate to `/dashboard`. Highlight the computed KPI strip (Fleet Utilization, Active Fleet, Overdue Services).
   - Point out the active in-transit convoy alerts.
2. **Scene 2 (Asset Registration):**
   - Open `/vehicles`. Search for `KA-01`.
   - Click `+ Register Vehicle`. Demonstrate duplicate registration rejection when entering existing license plate `KA-01-EA-4821`.
3. **Scene 3 (Dispatch Scheduling with Conflict Prevention):**
   - Navigate to `/trips/new`.
   - Select an overlapping time slot for vehicle `veh-01`.
   - Show the real-time conflict alert rejecting double-booking and highlighting the conflicting trip ID.
   - Adjust schedule and authorize valid dispatch.
4. **Scene 4 (Driver Cockpit & Safety Checklist):**
   - Open role switcher (top right). Switch to **Driver (Rajesh Kumar)**.
   - Show the mobile-first cockpit at `/driver`.
   - Attempt to start trip without verifying checklist -> show error block.
   - Check all mandatory items -> click **Start Transit Convoy**.
   - Navigate to `/driver/issues`, submit a mechanical defect with photo preview simulation.
5. **Scene 5 (Maintenance & Analytics):**
   - Switch role to **Administrator**.
   - Inspect the critical defect in `/inspections` and review `/maintenance`.
   - Open `/reports`, apply a status filter, and click **Export CSV** to demonstrate sanitized formula injection protection.
6. **Scene 6 (QA & Reset):**
   - Click **Reset State** in the top navigation bar to demonstrate safe recovery to initial seed fixtures.

### Slide 5: Engineering Highlights & Metrics
- 23 Vitest automated test cases passing.
- 19 static Next.js production routes compiled.
- Zero external tracking API costs; zero secrets in client repository.
