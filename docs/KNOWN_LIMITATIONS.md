# Known Limitations and Production Considerations
## FleetPulse Operational Boundaries
**Organization:** Jeevix Technologies  

---

### 1. Client-Side Demo Authorization
- **Design Intent:** The role switcher (Dispatcher, Driver, Administrator) facilitates interactive user evaluation of role-specific workflows within a single frontend runtime.
- **Production Requirement:** In a production deployment, this client-side session must be replaced with an OAuth 2.0 / OpenID Connect authorization server (e.g. Auth0, Keycloak, or Firebase Auth) using HttpOnly secure cookies and JWT bearer tokens verified on an API gateway.

### 2. Simulated GPS Telemetry
- **Design Intent:** Telematics positions and headings are synthetically computed using deterministic mathematical nudges along fictional logistics corridors. No GPS device permissions or real geolocation APIs are requested.
- **Production Requirement:** Real-world deployment requires integration with hardware telematics OBD-II / CAN-bus trackers transmitting MQTT or WebSocket packets to an ingestion broker (e.g., AWS IoT Core or Apache Kafka).

### 3. Local-Only File Previews
- **Design Intent:** Defect photo attachments are handled via the HTML5 `FileReader` API as data URLs stored in local memory.
- **Production Requirement:** Production applications require presigned URL uploads directly to an S3-compatible object storage bucket (e.g., AWS S3 or Cloudflare R2) with CDN image optimization.

### 4. Storage Persistence Cap
- **Design Intent:** Data is saved to browser `localStorage` under `FLEETPULSE_STATE_V1.0`.
- **Limitation:** Browser local storage is subject to a 5 MB per-origin quota and does not sync across separate browser profiles. A database reset action is provided to restore seed data at any time.
