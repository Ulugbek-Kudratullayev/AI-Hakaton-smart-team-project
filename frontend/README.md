# Hokimiyat Transport Nazorati AI — Frontend

Hokimiyat transport parkini monitoring qilish va boshqarish uchun zamonaviy web-interfeys.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Custom CSS Design System
- **Charts:** Recharts
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Dashboard route group (with sidebar layout)
│   │   ├── page.tsx          # Main dashboard
│   │   ├── vehicles/         # Vehicles list + detail
│   │   ├── tasks/            # Tasks & assignments
│   │   ├── maintenance/      # Maintenance management
│   │   ├── alerts/           # Alert monitoring
│   │   ├── analytics/        # Analytics & reports
│   │   ├── settings/         # Settings
│   │   └── layout.tsx        # AppShell wrapper
│   ├── login/                # Login page (standalone)
│   ├── globals.css           # Design system & global styles
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/               # Sidebar, TopBar, AppShell
│   └── ui/                   # Reusable UI components
├── data/
│   └── mockData.ts           # Mock data layer (Uzbekistan-specific)
└── types/
    └── index.ts              # TypeScript type definitions
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Professional authentication screen |
| Dashboard | `/` | KPI cards, analytics charts, fleet status, alerts, map, activity feed |
| Vehicles | `/vehicles` | Searchable/filterable vehicle table |
| Vehicle Detail | `/vehicles/[id]` | Vehicle overview, usage chart, AI recommendations, timeline |
| Tasks | `/tasks` | Task management with AI vehicle recommendation |
| Maintenance | `/maintenance` | Service records, overdue alerts, risk tracking |
| Alerts | `/alerts` | System anomaly alerts with severity filtering |
| Analytics | `/analytics` | Deep analytics: efficiency, fuel, utilization, trends |
| Settings | `/settings` | Profile and notification settings |

## Design System

- **Colors:** Slate neutral base, Indigo primary accent, Emerald/Amber/Rose status colors
- **Typography:** Inter, 14px base, semibold headings
- **Cards:** White bg, subtle border, rounded-xl, soft shadow
- **Badges:** Pill-shaped, color-coded status indicators
- **Tables:** Clean headers, hover highlighting, monospace data
- **Charts:** Indigo/Emerald/Amber palette with gradient fills

## Mock Data

All data is Uzbekistan-specific:
- 25 vehicles (tractors, trucks, service cars, buses, excavators, irrigation)
- 5 departments (Agriculture, Municipal, Road-Transport, Ecology, Construction)
- 25 Uzbek driver names
- 8 tasks with AI vehicle recommendations
- 10 system alerts with severity levels
- 10 maintenance records
- Activity logs and chart data

## Interface Language

The entire UI is in **Uzbek (Latin script)**.

## Connecting to Backend

The mock data layer (`src/data/mockData.ts`) can be replaced with API calls.
All data types are defined in `src/types/index.ts`.
