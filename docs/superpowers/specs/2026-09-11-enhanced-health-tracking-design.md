# Design Spec: Enhanced Health Tracking (Menstrual Cycle & Fibromyalgia Mapping)
**Date**: 2026-09-11
**Status**: Approved (Design Phase)
**Path**: Architectural

## 1. Context & Objectives
The goal is to implement a comprehensive tracking system for menstrual cycles, fibromyalgia flare-ups, and overall well-being. This module aims to provide users with data-driven insights into the correlation between hormonal phases and fibromyalgia symptoms, specifically targeting "brain fog," mood changes, and specific pain hotspots.

### Core Objectives:
- **Correlative Tracking**: Map menstrual cycle phases (Follicular, Luteal, etc.) to fibro flare intensity.
- **Expanded Symptom Mapping**: Move beyond simple symptom names to include severity (1-10), category (Physical, Cognitive, Mood), and pain area.
- **Intelligent Recommendations**: Provide proactive self-care tips (e.g., heat therapy) based on real-time data analysis.
- **Zero-Breaking-Change**: Ensure all updates are additive to maintain existing system stability.

## 2. Database Schema Design (Prisma)

### 2.1 MenstrualCycle Model (New)
A new model to track cycle events.
- `id`: `String` (@id, cuid)
- `userId`: `String` (Relation to `User`)
- `startDate`: `DateTime`
- `endDate`: `DateTime?`
- `phase`: `CyclePhase` (Enum: `MENSTRUAL`, `FOLLICULAR`, `OVULATORY`, `LUTEAL`)
- `overallSeverity`: `Int` (1-10)
- `notes`: `String?`

### 2.2 SymptomLog Extension (Additive)
The existing `SymptomLog` will be extended with the following fields:
- `severity`: `Int` (Default: 5, 1-10)
- `category`: `SymptomCategory` (Enum: `PHYSICAL`, `COGNITIVE`, `MOOD`)
- `area`: `PainArea?` (Enum: `PELVIC`, `LOWER_BACK`, `WIDESPREAD`, `JOINTS`, `OTHER`)

### 2.3 Migration Strategy
- Use `prisma migrate dev` for additive changes.
- All new fields in `SymptomLog` will have default values or be optional to prevent breaking existing records.

## 3. Backend & API Design

### 3.1 Validation Layer (Zod)
Strict validation will be enforced for all inputs:
- `CycleLogSchema`: Validates dates (start $\le$ end), phase enum, and severity range.
- `SymptomLogSchema`: Validates symptom length, severity range, category enum, and area enum.

### 3.2 API Endpoints
All endpoints will be protected by `getServerSession` and scoped to the authenticated `userId`.
- `POST /api/health/cycle`: Create/Update cycle logs.
- `POST /api/health/symptoms`: Create expanded symptom logs.
- `GET /api/health/correlations`: Analyze and return correlations between cycle phase and symptom severity.

### 3.3 Insight Engine Updates
The `analyzeHealthPatterns` logic in `src/lib/insightEngine.ts` will be expanded:
- **Phase-Symptom Correlation**: Detect if `COGNITIVE` symptoms peak during the `LUTEAL` phase.
- **Area-Specific Tips**: Trigger recommendations (e.g., heat therapy) if `severity` $\ge 7$ in `PELVIC` or `LOWER_BACK` areas.

## 4. Frontend & UI Design

### 4.1 Dashboard Components
- **Cycle Status Widget**: Visual progress bar of the current cycle phase and flare-risk window.
- **Cognitive/Mood Tracker**: Quick-log buttons for "Brain Fog" and "Focus Fatigue" with a 1-10 severity slider.
- **Symptom Heatmap**: Categorized list (Physical, Cognitive, Mood) with color-coded severity indicators.
- **Care Recommendation Card**: Contextual tips based on the current state (e.g., "Recommended: Warm compression for lower back").

### 4.2 Responsive & Accessibility Guidelines
- **Mobile First**: Layouts using `w-[calc(100vw-2.5rem)] max-w-xs sm:w-80` and logical positioning (`end-0`).
- **Bilingual Support**: Full RTL/LTR support using Tailwind logical properties (`ps-`, `pe-`).
- **Low-Friction Input**: Large sliders and buttons to accommodate users during high-pain episodes.

## 5. Verification & Security
- **TypeScript**: `tsc --noEmit` to ensure type safety.
- **Zod**: Unit tests for all validation schemas.
- **Auth**: Verify `userId` isolation for all database queries.
- **UI**: Verify mobile responsiveness and RTL flip.
