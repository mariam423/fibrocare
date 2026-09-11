# Enhanced Health Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive tracking for Menstrual Cycles and expanded Fibromyalgia symptoms with a correlation engine for proactive self-care recommendations.

**Architecture:** Additive schema extension for zero-breaking changes, Zod-validated API layer, and a responsive widget-based UI.

**Tech Stack:** Next.js 16, Prisma (Postgres), Zod, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-11-enhanced-health-tracking-design.md`

## Global Constraints
- Zero-Breaking-Change: No removal or modification of existing fields/routes.
- Bilingual Integrity: Full RTL/LTR support (Arabic/English).
- Mobile Responsive: Use `w-[calc(100vw-2.5rem)] max-w-xs sm:w-80` and `end-0` for popovers.
- Security: `getServerSession` required for all API access; strict `userId` isolation.
- Dashboard Visibility: The `CycleStatusWidget`, `SymptomMapWidget`, and `CareRecommendationCard` MUST be placed prominently on the main dashboard page. They should be the primary focus upon landing, requiring no navigation to sub-pages or hidden menus.
- Validation: All inputs must pass Zod schemas.

---

### Task 1: Database Schema Extension

**Files:**
- Modify: `prisma-pg/schema.prisma`
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `MenstrualCycle` model, updated `SymptomLog` model.

- [ ] **Step 1: Define Enums and MenstrualCycle Model**
  Add the following to both schema files:
  ```prisma
  enum CyclePhase {
    MENSTRUAL
    FOLLICULAR
    OVULATORY
    LUTEAL
  }

  enum SymptomCategory {
    PHYSICAL
    COGNITIVE
    MOOD
  }

  enum PainArea {
    PELVIC
    LOWER_BACK
    WIDESPREAD
    JOINTS
    OTHER
  }

  model MenstrualCycle {
    id               String   @id @default(cuid())
    userId           String
    startDate        DateTime
    endDate          DateTime?
    phase            CyclePhase
    overallSeverity  Int       @default(5)
    notes            String?
    user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    createdAt        DateTime  @default(now())

    @@index([userId, startDate])
  }
  ```
  Update `User` model: `cycles MenstrualCycle[]`

- [ ] **Step 2: Extend SymptomLog Model**
  Modify `SymptomLog` to add new fields with defaults:
  ```prisma
  model SymptomLog {
    id        String   @id @default(cuid())
    symptom   String
    date      String
    userId    String
    severity  Int      @default(5)
    category  SymptomCategory @default(PHYSICAL)
    area      PainArea?
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([userId, symptom, date])
    @@index([userId, date])
    @@index([symptom])
  }
  ```

- [ ] **Step 3: Run Migrations**
  Run: `npm run db:migrate:pg` (or equivalent prisma migrate command for the environment)
  Expected: Database updated without data loss.

- [ ] **Step 4: Verify Types**
  Run: `npm run build` or `tsc --noEmit` to ensure Prisma Client is regenerated and types are correct.

- [ ] **Step 5: Commit**
  `git add prisma-pg/schema.prisma prisma/schema.prisma`
  `git commit -m "db: extend schema for menstrual cycle and enhanced symptom tracking"`

---

### Task 2: Validation Layer (Zod)

**Files:**
- Create: `src/lib/validations/health.ts`

**Interfaces:**
- Produces: `CycleLogSchema`, `SymptomLogSchema`.

- [ ] **Step 1: Implement Zod Schemas**
  ```typescript
  import { z } from "zod";

  export const CycleLogSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    phase: z.enum(["MENSTRUAL", "FOLLICULAR", "OVULATORY", "LUTEAL"]),
    overallSeverity: z.number().int().min(1).max(10).default(5),
    notes: z.string().optional(),
  }).refine(data => !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"]
  });

  export const SymptomLogSchema = z.object({
    symptom: z.string().min(3),
    severity: z.number().int().min(1).max(10).default(5),
    category: z.enum(["PHYSICAL", "COGNITIVE", "MOOD"]),
    area: z.enum(["PELVIC", "LOWER_BACK", "WIDESPREAD", "JOINTS", "OTHER"]).optional(),
    date: z.string(), // ISO date string
  });
  ```

- [ ] **Step 2: Commit**
  `git add src/lib/validations/health.ts`
  `git commit -m "feat: add zod validation for health and cycle logs"`

---

### Task 3: Secure Backend API Endpoints

**Files:**
- Create: `src/app/api/health/cycle/route.ts`
- Create: `src/app/api/health/symptoms/route.ts`
- Create: `src/app/api/health/correlations/route.ts`

**Interfaces:**
- Consumes: `CycleLogSchema`, `SymptomLogSchema` (from `src/lib/validations/health.ts`)
- Produces: JSON responses for health data.

- [ ] **Step 1: Implement `/api/health/cycle` (POST)**
  - Use `getServerSession` to get `userId`.
  - Validate body with `CycleLogSchema`.
  - Create `MenstrualCycle` record via Prisma.
  - Return 201 Created.

- [ ] **Step 2: Implement `/api/health/symptoms` (POST)**
  - Use `getServerSession` to get `userId`.
  - Validate body with `SymptomLogSchema`.
  - Use `prisma.symptomLog.upsert` to update or create log for that date/symptom.
  - Return 201 Created.

- [ ] **Step 3: Implement `/api/health/correlations` (GET)**
  - Use `getServerSession` to get `userId`.
  - Fetch last 3 cycles and last 30 days of symptom logs.
  - Calculate correlation (e.g., avg severity of COGNITIVE symptoms per cycle phase).
  - Return structured JSON for the Dashboard.

- [ ] **Step 4: Commit**
  `git add src/app/api/health`
  `git commit -m "feat: implement secure health and cycle api endpoints"`

---

### Task 4: Intelligence Engine Update

**Files:**
- Modify: `src/lib/insightEngine.ts`

**Interfaces:**
- Consumes: `MenstrualCycle`, `SymptomLog` (Prisma models)
- Produces: `Insight` objects.

- [ ] **Step 1: Update `analyzeHealthPatterns` to include Cycle Data**
  - Modify function signature to accept `cycles: MenstrualCycle[]`.
  - Implement logic: If current phase is `LUTEAL` AND `COGNITIVE` symptom avg > 6 $\rightarrow$ add `Insight` with `type: "correlation"` and `severity: "warning"`.

- [ ] **Step 2: Implement Area-Based Recommendation Logic**
  - Add check: If any `SymptomLog` with `area` in [`PELVIC`, `LOWER_BACK`] has `severity` $\ge 7 \rightarrow$ add `Insight` recommending "Heat Therapy / Warm Compress".

- [ ] **Step 3: Verify with Tests**
  - Create/Update test cases in `src/lib/insightEngine.test.ts` to verify the new correlation and recommendation rules.
  - Run: `npm test src/lib/insightEngine.test.ts`

- [ ] **Step 4: Commit**
  `git add src/lib/insightEngine.ts src/lib/insightEngine.test.ts`
  `git commit -m "feat: update insight engine for cycle-symptom correlations"`

---

### Task 5: Responsive UI Widgets

**Files:**
- Create: `src/components/health/CycleStatusWidget.tsx`
- Create: `src/components/health/SymptomMapWidget.tsx`
- Create: `src/components/health/CareRecommendationCard.tsx`

**Interfaces:**
- Consumes: `/api/health/correlations` API.

- [ ] **Step 1: Build `CycleStatusWidget`**
  - Display current phase with a visual progress bar.
  - Use `Lavender` and `Teal` palette.
  - Ensure `w-full` and responsive padding.

- [ ] **Step 2: Build `SymptomMapWidget`**
  - Implement categories (Physical, Cognitive, Mood).
  - Add 1-10 severity sliders for logging.
  - Use a grid layout that stacks on mobile.

- [ ] **Step 3: Build `CareRecommendationCard`**
  - Display insights from `insightEngine` as a card.
  - Use `end-0` and `w-[calc(100vw-2.5rem)]` if implemented as a popover/toast.

- [ ] **Step 4: Commit**
  `git add src/components/health`
  `git commit -m "feat: implement responsive health tracking widgets"`

---

### Task 6: Dashboard Integration & Final Polish

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: All newly created widgets.

- [ ] **Step 1: Integrate Widgets into Dashboard**
  - Place `CycleStatusWidget` and `CareRecommendationCard` prominently at the top.
  - Add `SymptomMapWidget` to the main health tracking section.

- [ ] **Step 2: Verify RTL/LTR Layout**
  - Switch language to Arabic; verify layout flips correctly using logical properties.

- [ ] **Step 3: Final End-to-End Test**
  - Log a cycle $\rightarrow$ Log a high-severity pelvic pain $\rightarrow$ Verify "Heat Therapy" recommendation appears.
  - Log "Brain Fog" in Luteal phase $\rightarrow$ Verify correlation insight appears.

- [ ] **Step 4: Commit**
  `git add src/app/dashboard/page.tsx`
  `git commit -m "feat: integrate health tracking modules into dashboard"`
