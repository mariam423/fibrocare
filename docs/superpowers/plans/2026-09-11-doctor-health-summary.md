# Doctor's Analytical Health Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a doctor-facing health summary that surfaces menstrual cycle and fibromyalgia correlations within the consultation view.

**Architecture:** Secure API endpoint for patient health analysis $\rightarrow$ New UI component for doctors $\rightarrow$ Integration into Consultation Detail page.

**Tech Stack:** Next.js 16, Prisma, Zod, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-11-doctor-health-summary-design.md`

## Global Constraints
- Security: `getServerSession` required; strict `role === 'doctor'` and patient-relationship verification.
- Zero-Breaking-Change: Additive changes only.
- Bilingual Integrity: Full RTL/LTR support.
- Accessibility: Contrast and typography compliant with project guidelines.

---

### Task 1: Secure Analysis API

**Files:**
- Create: `src/app/api/health/patient/[id]/correlations/route.ts`

**Interfaces:**
- Consumes: `insightEngine.analyzeHealthPatterns` (from `src/lib/insightEngine.ts`)
- Produces: JSON summary of patient health (phase, alerts, hotspots).

- [ ] **Step 1: Implement Authorization Guard**
  - Check `getServerSession`.
  - Verify `user.role === 'doctor'`.
  - Verify a `Consultation` exists between the doctor and the `patientId` from the URL.

- [ ] **Step 2: Implement Data Fetching and Analysis**
  - Fetch `MenstrualCycle` and `SymptomLog` for the `patientId`.
  - Pass data to `analyzeHealthPatterns` to generate insights.
  - Calculate averages for Physical, Cognitive, and Mood categories.

- [ ] **Step 3: Implement Response Formatting**
  - Map `Insight` objects to a simplified alert format.
  - Extract top 3 hotspots based on severity.
  - Return 200 OK with the final summary.

- [ ] **Step 4: Verify with API Test**
  - Test as doctor (Success).
  - Test as patient/unauthenticated (403 Forbidden).

- [ ] **Step 5: Commit**
  `git add src/app/api/health/patient`
  `git commit -m "feat: implement secure doctor-facing health analysis api"`

---

### Task 2: DoctorHealthSummary UI Component

**Files:**
- Create: `src/components/pro/DoctorHealthSummary.tsx`

**Interfaces:**
- Consumes: `/api/health/patient/[id]/correlations` API.

- [ ] **Step 1: Implement Base Layout**
  - Create a compact Card layout.
  - Implement the "Current Phase" header with a color-coded badge.

- [ ] **Step 2: Implement Alerts Section**
  - Map alerts from the API to a "Correlation Alerts" list.
  - Use an amber/orange theme for alerts.

- [ ] **Step 3: Implement Hotspots and Metrics**
  - Create a grid for top hotspots (Area: Severity).
  - Create a metric bar for Physical/Cognitive/Mood averages.

- [ ] **Step 4: Implement RTL/LTR Logic**
  - Use logical properties for padding and alignment.

- [ ] **Step 5: Commit**
  `git add src/components/pro/DoctorHealthSummary.tsx`
  `git commit -m "feat: create DoctorHealthSummary UI component"`

---

### Task 3: Integration into Consultation Page

**Files:**
- Modify: `src/app/pro/consultations/[id]/page.tsx`

**Interfaces:**
- Consumes: `DoctorHealthSummary` component.

- [ ] **Step 1: Integrate Component**
  - Import `DoctorHealthSummary`.
  - Place it prominently in the `isDoctor` block, ideally above or alongside `ClinicalMemo`.

- [ ] **Step 2: Pass Necessary Props**
  - Pass `patientId` to the component to fetch data.

- [ ] **Step 3: Verify Visual Integration**
  - Check layout on desktop and tablet.
  - Ensure it doesn't displace other critical tools like `DoctorCopilot`.

- [ ] **Step 4: Final End-to-End Test**
  - Log symptoms as patient $\rightarrow$ Open consultation as doctor $\rightarrow$ Verify summary is accurate and alerts are visible.

- [ ] **Step 5: Commit**
  `git add src/app/pro/consultations/[id]/page.tsx`
  `git commit -m "feat: integrate health summary into doctor consultation view"`
