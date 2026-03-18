# SetupAI – Diagnostic Lab & Clinic Setup Platform

A production-ready multi-tenant SaaS platform for Indian diagnostic lab and clinic entrepreneurs. AI-powered roadmap, compliance tracking, equipment planning, and financial modeling.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **MongoDB** + **Mongoose**
- **NextAuth** (JWT session strategy)
- **bcrypt** (password hashing)
- **Zustand** (state management)
- **React Hook Form** + **Zod**
- **Recharts** (analytics)
- Role-Based Access Control (RBAC)

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or remote)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env and set values:

```bash
cp .env.example .env
```

Edit `.env`:

- `MONGODB_URI` – MongoDB connection string (default: `mongodb://127.0.0.1:27017/setupai`)
- `NEXTAUTH_SECRET` – Secret for JWT (use a long random string in production)
- `NEXTAUTH_URL` – App URL (e.g. `http://localhost:3000`)

### 3. Start MongoDB (local)

```bash
mongod
```

Or use a cloud instance and set `MONGODB_URI` accordingly.

### 4. Seed the database (optional)

```bash
npm run seed
```

This creates:

- 1 organization (City Diagnostics, Pro plan)
- 1 admin user: **admin@setupai.in** / **admin123**
- Sample roadmap, license, equipment, and QC logs

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (redirects to `/dashboard` if logged in) |
| `/pricing` | Pricing (Free / Pro / Enterprise) |
| `/contact` | Contact / Book demo |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Dashboard overview (protected) |
| `/dashboard/roadmap` | Setup roadmap & onboarding |
| `/dashboard/licensing` | Licensing & compliance (Pro) |
| `/dashboard/equipment` | Equipment planner & CAPEX |
| `/dashboard/staff` | Staff roles & benchmarks |
| `/dashboard/qc` | QC logs & SOP (Pro) |
| `/dashboard/finance` | Financial model & break-even (Pro) |
| `/dashboard/operations` | Sample orders & TAT (Enterprise) |

## Subscription gating

- **Free**: Basic roadmap only.
- **Pro**: Licensing, QC, Finance.
- **Enterprise**: Operations (multi-location / franchise).

Middleware redirects to `/dashboard?upgrade=pro` or `?upgrade=enterprise` when a gated module is accessed on a lower plan.

## Architecture

- **Multi-tenant**: Each user belongs to an **Organization**. All data is scoped by `organizationId`.
- **Roles**: Admin, Compliance Manager, Lab Manager, Viewer.
- **AI placeholder**: `lib/ai.ts` – `generateRoadmap()`, `documentGapAnalysis()`, `estimateLicenseApprovalTime()`, `recommendEquipment()` return mocked structured data; replace with real AI/LLM later.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm run seed` – Seed MongoDB (drops existing collections)

## License

Proprietary.
# setupai
