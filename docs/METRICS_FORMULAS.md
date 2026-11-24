# Mathematical KPI Formulas & Metric Definitions
## FleetPulse Operational Computation Engine
**Jeevix Technologies** — Technical Reference  

---

### 1. Fleet Utilization Rate
The Fleet Utilization KPI measures the operational efficiency of the carrier's capital assets by evaluating the proportion of operable vehicles actively generating ton-kilometers.

$$\text{Fleet Utilization (\%)} = \left( \frac{V_{\text{inTransit}}}{V_{\text{active}}} \right) \times 100$$

**Definitions:**
- $V_{\text{inTransit}}$: Count of vehicles with status `inTransit` engaged in an ongoing consignment.
- $V_{\text{active}}$: Total vehicles minus permanently decommissioned or inactive assets ($V_{\text{total}} - V_{\text{inactive}}$).
- **Zero-Data Behavior:** If $V_{\text{active}} = 0$, utilization returns $0.0\%$.

---

### 2. Trip Completion Rate
Measures consignment delivery success over scheduled operational commitments.

$$\text{Trip Completion Rate (\%)} = \left( \frac{T_{\text{completed}}}{T_{\text{total}} - T_{\text{cancelled}}} \right) \times 100$$

**Definitions:**
- $T_{\text{completed}}$: Successfully delivered consignments with confirmed driver sign-off.
- $T_{\text{cancelled}}$: Trips cancelled due to weather, mechanical defects, or consignor hold.
- **Denominator Basis:** Cancelled trips are explicitly excluded from the eligible cohort so carriers are not penalized for pre-dispatch commercial cancellations.
- **Zero-Data Behavior:** If no eligible trips exist, returns $0.0\%$.

---

### 3. Fleet Maintenance Downtime
Evaluates the proportion of asset hours absorbed by scheduled preventive maintenance or mechanical defect repairs over a 30-day operating window.

$$\text{Downtime Ratio} = \frac{\sum_{i=1}^{N} \text{Duration}_{\text{maint}, i}}{V_{\text{active}} \times 720 \text{ hours}}$$

---

### 4. Overdue Maintenance Count
Identifies vehicles operating beyond their OEM-mandated service window:

$$\text{Overdue Jobs} = \sum \mathbf{1}_{(\text{status} \in \{\text{scheduled}, \text{inProgress}\} \land \text{scheduledDate} < \text{referenceDate})}$$

Reference anchor date for baseline verification: `2026-11-24T10:00:00.000Z`.
