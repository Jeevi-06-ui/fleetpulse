# Vercel Deployment & Production Setup Guide
## FleetPulse Enterprise Deployment Manual
**Organization:** Jeevix Technologies  
**Project:** FleetPulse  

---

### 1. Prerequisites
- Node.js v18.17+ or v20+ (Node v26 supported)
- npm v9+
- Git

---

### 2. Local Setup & Verification

```bash
# 1. Clone repository
git clone https://github.com/jeevix-tech/fleetpulse.git
cd fleetpulse

# 2. Install dependencies (ensures exact lockfile versions)
npm install

# 3. Execute quality assurance test suite
npm test

# 4. Verify TypeScript strict mode
npm run typecheck

# 5. Build production bundle
npm run build

# 6. Start production server locally
npm start
# Open http://localhost:3000
```

---

### 3. Vercel Deployment Instructions

1. Push your code to your GitHub/GitLab repository:
   ```bash
   git add .
   git commit -m "feat: complete FleetPulse production release"
   git push origin main
   ```
2. Log into your [Vercel Dashboard](https://vercel.com).
3. Click **Add New Project** and import the repository.
4. Framework Preset will automatically detect **Next.js**.
5. Set Root Directory to `./`.
6. Environment Variables (optional for demo mode):
   - `NEXT_PUBLIC_APP_NAME`: `FleetPulse`
   - `NEXT_PUBLIC_APP_VERSION`: `1.0.0`
7. Click **Deploy**. Vercel will execute `npm run build` and provision edge CDN endpoints.
