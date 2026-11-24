# FleetPulse — Smart Fleet Operations & Maintenance Management System

> **Jeevix Technologies** — *Engineering Tomorrow Into Reality*  
> **Intern:** Chandan Mayur A | Presidency University  
> **Role:** Frontend Development Intern  
> **Project Reference:** JT/INT/2026/FE/027  
> **Internship Period:** 1 September – 1 October 2026  

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-23%20Passed-brightgreen)](https://vitest.dev/)
[![Status](https://img.shields.io/badge/Build-Production%20Ready-success)](#)

---

## 1. Project Overview
**FleetPulse** is an enterprise-grade, responsive frontend application built for commercial logistics carriers, multi-depot fleet operators, and transport authorities. 

The software empowers:
- **Dispatchers:** To register commercial vehicles, plan inter-city freight routes, and prevent overlapping schedules or maintenance collisions.
- **Drivers:** With a touch-optimized mobile cockpit to complete mandatory pre-trip safety checklists, navigate assigned routes, and report mechanical defects with photo preview.
- **Administrators:** With real-time computed fleet KPIs, workshop service work orders, downtime metrics, CSV reporting, and audit trails.

---

## 2. Core Functional Modules

### A. Operations Command Center & Registry (`/dashboard`, `/vehicles`)
- Computed KPI strip (Fleet Assets, Active Utilization, Ready Assets, Maintenance, Completion Rate, Grounding Defects).
- Real-time Recharts status donut and tonnage category distribution breakdown.
- Full vehicle registry with search, status filters, sorting, and pagination.
- Validated vehicle registration modal with duplicate plate detection and non-negative odometer enforcement.
- Complete vehicle dossier (`/vehicles/[id]`) with specification sheets, odometer, driver assignment, service history, and safe decommission safeguards.

### B. Simulated Fleet Tracking (`/tracking`)
- Interactive, zero-dependency schematic SVG map plotting national freight corridors (Bangalore, Chennai, Hyderabad, Mumbai, Pune, Salem, Hosur, Coimbatore).
- Clear, prominent `SIMULATED GPS / DEMO DATA` badge.
- Compass directional heading indicators and live velocity (km/h) telemetry.
- Zoom, pan, center, and pause/resume simulation controls.
- Inspection sidebar drawer for selected vehicle telematics.

### C. Dispatch & Scheduling Engine (`/trips`, `/trips/new`, `/trips/[id]`)
- Automated scheduling conflict engine that mathematically evaluates overlap intervals.
- Rejects double-booking of vehicles and drivers.
- Rejects dispatching vehicles with scheduled workshop maintenance or unresolved critical defects.
- Strictly permits adjacent back-to-back non-overlapping slots (`startA === endB`).
- Full trip lifecycle state machine: `scheduled -> inProgress -> completed` and `scheduled -> cancelled`.
- Mandatory 5-point safety inspection verification before departure.
- Idempotent odometer distance increment upon delivery sign-off.

### D. Driver Mobile-First Cockpit (`/driver`, `/driver/issues`)
- Mobile touch-first UI showing today's assigned convoy and upcoming dispatches.
- Interactive safety checklist verification (Tire pressure, Brakes, Oil, Lights, Cargo seal).
- Defect reporting form with severity rating and local in-browser photo preview.
- Automatic grounding: Critical severity defects instantly set vehicle to maintenance and block dispatch.

### E. Workshop Maintenance & Inspections (`/maintenance`, `/inspections`)
- Workshop calendar and work order logs tracking upcoming and overdue services.
- Overdue maintenance identification relative to operating reference date.
- Maintenance resolution workflow with invoiced cost tracking in ₹ INR and return-to-service protocols.

### F. Analytics & Secure CSV Reporting (`/analytics`, `/reports`)
- Trend visualization of delivery completion percentages, consignment volume, and workshop spend.
- Mathematically documented KPI formulas and explicit zero-data behaviors.
- Tabular consignment reporting with sorting and search.
- Secure CSV Export matching the entire filtered result set with formula injection sanitization (`'`, `=`, `+`, `-`, `@`).

### G. Governance, Theming & Audit (`/settings`, Navbar)
- In-app notification slide-over with unread badges and deep links to affected records.
- Seamless Dark Mode (`#071525`) and Light Mode toggle with local persistence.
- Client-side role demo switcher (Dispatcher, Driver with 14 selectable personas, Administrator).
- QA error simulation mode (forces controlled 500 error envelopes to test error boundaries).
- Instant, confirmed database reset restoring default seed fixtures.

---

## 3. Technology Stack & Key Libraries

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript 5.7 (Strict Mode) |
| **State & Store** | React Context API + Reducer + Versioned LocalStorage (`FLEETPULSE_STATE_V1.0`) |
| **Styling** | Tailwind CSS 3.4 (Custom enterprise command center palette) |
| **Data Viz** | Recharts 2.15 |
| **Icons & Motion** | Lucide React, Framer Motion (reduced motion compliant) |
| **Validation** | Zod 3.24 typed validation schemas |
| **Testing** | Vitest 2.1, React Testing Library, JSDOM |

---

## 4. Getting Started & Local Development

### Prerequisites
- Node.js v18.17+ or v20+ (Node v26 supported)
- npm v9+

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Run unit & component test suite
npm test

# 3. Typecheck with TypeScript in strict mode
npm run typecheck

# 4. Build optimized production bundle
npm run build

# 5. Start production server
npm start
# Open http://localhost:3000 in your browser
```

---

## 5. Demo Roles & Walkthrough Instructions

FleetPulse includes 3 built-in demo roles accessible via the **Role Switcher** in the top navigation bar:

1. **Dispatcher (Sunita Rao):**
   - Access: `/dashboard`, `/vehicles`, `/trips`, `/trips/new`, `/tracking`.
   - Try: Go to `/trips/new` and attempt to book vehicle `veh-01` during an active trip window to trigger the automated conflict detection banner.
2. **Driver (Rajesh Kumar / 14 Personas):**
   - Access: `/driver`, `/driver/issues`, `/tracking`.
   - Try: Complete the pre-trip checklist, start the transit convoy, and file a defect report under `/driver/issues`.
3. **Administrator (Vikramaditya Hegde):**
   - Access: Complete operational access including `/admin/drivers`, `/maintenance`, `/inspections`, `/analytics`, `/reports`, `/settings`.
   - Try: Go to `/reports`, filter by `inProgress`, and click **Export CSV** to download the sanitized report.

---

## 6. Project Structure

```
fleetpulse/
├── docs/                      # Enterprise documentation suite
│   ├── SRS.md                 # Software Requirements & Traceability Matrix
│   ├── ARCHITECTURE.md        # Architecture, Mermaid ER & State Machines
│   ├── UI_UX_SPECIFICATION.md # Design tokens, palette, and breakpoints
│   ├── API_CONTRACTS.md       # Mock REST envelope specifications
│   ├── METRICS_FORMULAS.md    # Mathematical KPI definitions
│   ├── TESTING_REPORT.md      # Automated test outcomes & gates
│   ├── KNOWN_LIMITATIONS.md   # Explicit boundary documentation
│   ├── DEPLOYMENT_GUIDE.md    # Vercel and production deployment
│   ├── FINAL_TECHNICAL_REPORT.md # Intern project final report
│   ├── PRESENTATION_SLIDES.md # Slide outline & demo walkthrough script
│   ├── INTERNSHIP_TEMPLATES.md# Weekly and daily report templates
│   └── postman_collection.json# Postman mock requests & responses
├── src/
│   ├── app/                   # Next.js 14 App Router routes (19 routes)
│   ├── components/
│   │   ├── layout/            # Navbar, Sidebar, AppShell, Search, Drawers
│   │   ├── fleet/             # KPI strip, status charts, vehicle table
│   │   ├── tracking/          # Interactive schematic SVG map & telemetry drawer
│   │   ├── trips/             # Dispatch forms, tables, route visualizer
│   │   ├── driver/            # Mobile-first driver cockpit & checklist
│   │   └── ui/                # Badges, buttons, cards, modals
│   ├── context/               # Canonical shared FleetContext & reducer
│   ├── data/                  # Deterministic seed fixtures (20 veh, 14 drv, 34 trips)
│   ├── lib/
│   │   ├── domain/            # Conflicts, lifecycle state machine, metrics, CSV
│   │   ├── validation/        # Zod form schemas
│   │   ├── storage/           # Versioned localStorage with corruption fallback
│   │   └── api/               # Typed mock API client & envelopes
│   └── types/                 # Universal TypeScript definitions
├── tests/                     # 23 Automated Vitest unit & component tests
├── public/                    # Static assets
├── tailwind.config.js         # Command center design tokens
├── tsconfig.json              # Strict TypeScript configuration
└── vitest.config.ts           # Test runner configuration
```

---

## 7. Quality Assurance Gates & Verification Results

- **Automated Tests:** `23 passed (23 total)` across 6 test suites.
- **TypeScript Strictness:** Zero compiler warnings or errors (`tsc --noEmit`).
- **Production Build:** Successfully compiled with 19 statically optimized routes.
- **Security Check:** Zero credentials in source code, strict CSV injection protection.

*Engineered by Chandan Mayur A for Jeevix Technologies.*
