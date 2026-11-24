# UI/UX Design System Specification
## FleetPulse Command Center Design Tokens
**Organization:** Jeevix Technologies  
**Project:** FleetPulse — Smart Fleet Operations  
**Design Lead:** Chandan Mayur A  

---

### 1. Visual Direction & Aesthetics
FleetPulse represents a bespoke logistics command center inspired by mission-critical aerospace and maritime dispatch terminals. It rejects generic admin templates in favor of high-contrast data density, clean typography, and purposeful status accents.

#### 1.1 Color Palette & Design Tokens

| Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| **Surface Background** | `#F8FAFC` (Slate 50) | `#071525` (Midnight Navy) | Primary canvas |
| **Panel Surface** | `#FFFFFF` (Pure White) | `#102338` (Deep Slate) | Cards, modals, containers |
| **Panel Borders** | `#E2E8F0` (Slate 200) | `#1E3A5F` (Navy Slate) | Subtle demarcation lines |
| **Primary Accent** | `#0EA5A0` / `#13C8C1` | `#13C8C1` (Teal/Cyan) | Callouts, telemetry, actions |
| **Cobalt Secondary** | `#4169E1` (Royal Cobalt) | `#4169E1` (Royal Cobalt) | Navigation, links, branding |
| **Status: Available** | `#10B981` (Emerald 500) | `#10B981` (Emerald 400) | Ready for dispatch |
| **Status: In Transit** | `#0D9488` (Teal 600) | `#13C8C1` (Teal 400) | Active convoy en route |
| **Status: Assigned** | `#2563EB` (Blue 600) | `#3B82F6` (Blue 400) | Scheduled in queue |
| **Status: Maintenance** | `#D97706` (Amber 600) | `#F59E0B` (Amber 400) | Workshop work order |
| **Status: Grounded/Defect**| `#E11D48` (Rose 600) | `#F43F5E` (Rose 500) | Critical safety issue |

#### 1.2 Typography & Spacing
- **Font Stack:** Modern sans-serif fallback (`Inter`, system font stack), monospace font (`JetBrains Mono`, `Fira Code`) for registrations, trip IDs, metrics, and timestamps.
- **Corner Radii:** Consistent `12px` (`rounded-fleet`) for cards, buttons, modals, and inputs.
- **Spacing Scale:** Strict 8px baseline grid (`gap-2`, `gap-3`, `gap-4`, `gap-6`, `p-4`, `p-5`).

---

### 2. Multi-Screen Responsive Breakpoints

| Breakpoint | Target Device | Navigation Mode | Layout Adaptation |
| :--- | :--- | :--- | :--- |
| **360px – 640px** | Mobile phones | Collapsible slide-over drawer | 1-column cards, horizontal scroll on tables, touch checklist |
| **768px – 1024px** | Tablets / iPads | Collapsed icon sidebar | 2-column KPI grid, stacked map & sidebar |
| **1024px – 1440px** | Desktops | Fixed 256px sidebar | 3-column split, side-by-side tracking map & dossier |
| **1440px+** | Wide Command Centers | Full expanded dashboard | 6-column KPI strip, ultra-dense telemetry view |

---

### 3. Accessibility & Usability (WCAG 2.1 AA)
- **High-Contrast Typography:** All text meets or exceeds the 4.5:1 contrast requirement for normal text and 3:1 for large display metrics.
- **Dual Indicator Status:** Status badges combine semantic color with explicit textual labels and icons to ensure color-blind accessibility.
- **Keyboard Navigation:** Full tab order through forms, tables, and dialogs with visible focus indicators (`focus-visible:outline-teal-400`).
- **Reduced Motion:** Automatic suppression of animations for users with `prefers-reduced-motion: reduce`.
