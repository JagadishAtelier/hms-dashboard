# Dashboard System Technical Documentation 🏥

This document outlines the architecture, components, and integration steps for the new **Multi-Role Dashboard System** added to the `hms-dashboard` React application.

---

## 1. Architecture Overview

The new dashboard system is built to be modular, highly scalable, and user-specific using Role-Based Access Control (RBAC).

*   **State Management:** Redux Toolkit (`@reduxjs/toolkit` and `react-redux`)
*   **Routing:** React Router (handled inside `App.jsx` pointing `/dashboard` to `DashboardDispatcher.jsx`)
*   **Styling:** Tailwind CSS (utilizing SaaS-style Indigo/Blue shading, rounded cards, and subtle shadows)
*   **Data Visualization:** `Recharts` (Bar charts, Line charts, Doughnut charts, and Area charts)
*   **Icons:** Lucide React (`lucide-react`)

---

## 2. Folder Structure Structure

All dashboard-specific code is organized into two primary folders to ensure code maintainability:

```text
src/
├── store/
│   ├── index.js                     <-- Global Redux Store initialization
│   └── slices/
│       └── dashboardSlice.js        <-- Slice holding current user role & global stats
├── components/
│   └── DashboardWidgets/            <-- Pure, reusable visualization components
│       ├── StatCard.jsx
│       ├── ChartCard.jsx
│       ├── RecentTableCard.jsx
│       └── SkeletonLoaders.jsx
└── pages/
    └── Dashboards/                  <-- Role-specific Container components
        ├── DashboardDispatcher.jsx  <-- Smart component that reads Redux role and renders children
        ├── AdminDashboard.jsx
        ├── DoctorDashboard.jsx
        ├── ReceptionistDashboard.jsx
        ├── LabDashboard.jsx
        ├── PharmacyDashboard.jsx
        └── HRDashboard.jsx
```

---

## 3. How RBAC (Role-Based Access Control) Works

The core of the system is the **`DashboardDispatcher.jsx`**. 

Instead of hardcoding separate routes for every user type (e.g., `/admin-dashboard`, `/doctor-dashboard`), your `App.jsx` handles `/dashboard` dynamically. When a user authenticates, their assigned role (e.g., `doctor`) is dispatched to the Redux store.

```javascript
// Example: After standard backend login succeeds
import { useDispatch } from 'react-redux';
import { setRole } from '../store/slices/dashboardSlice';

const dispatch = useDispatch();
dispatch(setRole('doctor')); // Sets the global state
```

The `DashboardDispatcher` will then read this `currentRole` variable and swap out the view automatically:

```javascript
const roleMap = {
    'admin': <AdminDashboard />,
    'doctor': <DoctorDashboard />,
    'receptionist': <ReceptionistDashboard />,
    // ...
};
```

---

## 4. Reusable Components API

The UI is built using standardized wrapper components so any new developer can quickly spin up an analytics view. All these are located in `src/components/DashboardWidgets/`.

### 4.1 `<StatCard />`
Shows a single Key Performance Indicator (KPI) with an optional trend.
*   **`title`** (String): Metric Name (e.g., "Total Patients")
*   **`value`** (Number/String): The metric value
*   **`icon`** (Node): A Lucide icon component.
*   **`bgClass`** (String): Tailwind background class (`bg-indigo-50/50`)
*   **`trend`** (Object, Optional): e.g., `{ positive: true, value: 5.2 }`

### 4.2 `<ChartCard />`
A clean white-box container ensuring all Recharts are responsive and properly padded.
*   **`title`** (String): Title of the Chart
*   **`subtitle`** (String, Optional): Small description text
*   **`colSpan`** (Number): Determines how wide the chart is on large screens (e.g., `2` for double width).
*   **`children`** (Node): Place your `<ResponsiveContainer>` inside directly.

### 4.3 `<RecentTableCard />`
Generates a highly readable data table with an optional "View" action button.
*   **`title`** (String): Table Title
*   **`columns`** (Array): Array of column objects `[{key: 'item', label: 'Item Name', render: (row) => ... }]`
*   **`data`** (Array): The row data payload mapped to your dataset.
*   **`onActionClick`** (Function, Optional): Fires when the default trailing "View" button is clicked, passing the specific `row` data.

### 4.4 `<SkeletonLoaders />`
Exports `<StatSkeleton />`, `<ChartSkeleton />`, and `<TableSkeleton />`. These should be used conditionally during `useEffect` data fetching to prevent the screen from jumping around.

---

## 5. Integrating with Live APIs

Currently, the pages use `setTimeout` delays and some mock properties combined with active Axios imports (e.g., `appointmentsService`) to simulate data fetching. 

**To fully wire them upstream:**
1. Navigate to the relevant dashboard file (e.g., `src/pages/Dashboards/AdminDashboard.jsx`).
2. Locate the `useEffect` block containing the `fetchData` function.
3. Replace the mocked payloads with real API service calls.
4. For charts like Recharts, ensure your backend aggregation returns data resembling this flat array structure:
```javascript
// Example format Recharts expects:
[
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 }
]
```

## 6. Starting & Testing

Since the Redux structure has been fully injected into `main.jsx`, the system is fully operational.

To test the different UI views manually until actual JWT parsing is built into the login screen:
1. Open `src/store/slices/dashboardSlice.js`
2. Change  `currentRole: 'admin'` to `currentRole: 'pharmacy'` and save. The UI will hot-reload to the Pharmacy Dashboard immediately!
