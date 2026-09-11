# Design Spec: Doctor's Analytical Health Summary
**Date**: 2026-09-11
**Status**: Approved
**Path**: Architectural

## 1. Context & Objectives
To empower healthcare providers with immediate, data-driven insights about their patients' fibromyalgia and menstrual cycle correlations. Instead of raw logs, doctors receive a processed summary that highlights critical patterns, enabling more personalized and timely clinical decisions.

### Core Objectives:
- **Immediate Insight**: Provide a high-level summary of the patient's current health state and hormonal phase.
- **Pattern Highlighting**: Surface strong correlations (e.g., Luteal phase $\rightarrow$ Cognitive flare) as actionable alerts.
- **Hotspot Mapping**: Display the most severe and frequent pain areas recorded by the patient.
- **Secure Access**: Ensure patient data is only accessible to authorized doctors within a specific consultation context.

## 2. Backend Design

### 2.1 API Endpoint
**Endpoint**: `GET /api/health/patient/[id]/correlations`
- **Input**: `patientId` (from URL).
- **Authorization**: 
  - User must be authenticated.
  - User must have `role === 'doctor'`.
  - The doctor must be linked to a consultation with the patient.
- **Logic**:
  - Fetch the last 3 menstrual cycles and the last 30 days of symptom logs for the patient.
  - Use `insightEngine.analyzeHealthPatterns` to generate insights.
  - Calculate the current phase and average severity of physical vs. cognitive symptoms.
- **Output**:
  ```json
  {
    "currentPhase": "LUTEAL",
    "alerts": [
      { "id": "luteal-cognitive-flare", "message": "Strong correlation between current phase and brain fog", "severity": "warning" }
    ],
    "topHotspots": [
      { "area": "PELVIC", "severity": 8 },
      { "area": "LOWER_BACK", "severity": 6 }
    ],
    "summary": {
      "physicalAvg": 7.2,
      "cognitiveAvg": 8.5,
      "moodAvg": 5.0
    }
  }
  ```

## 3. Frontend Design

### 3.1 `DoctorHealthSummary` Component
A compact, high-density card designed for clinical use.

**UI Elements:**
- **Header**: Current Phase Indicator (e.g., "Current Phase: Luteal") with a color-coded badge.
- **Alert Section**: A dedicated area for "Correlation Alerts" using an orange/amber theme to draw attention without causing alarm.
- **Hotspots Grid**: A small grid of tags showing the most severe pain areas (Area: Severity).
- **Metric Overview**: A three-column layout showing averages for Physical, Cognitive, and Mood symptoms.

**Placement**: Integrated into `src/app/pro/consultations/[id]/page.tsx` as a primary information source for the doctor.

## 4. Security & Integrity
- **Strict Authorization**: The API must verify the doctor's relationship with the patient to prevent unauthorized health data access.
- **Bilingual Support**: All alerts and labels must be localized via `useLanguage`.
- **Zero-Breaking-Change**: This is a purely additive feature; it does not modify existing patient-side functionality.

## 5. Verification
- **Auth Test**: Verify that a non-doctor user cannot access the correlation API.
- **Data Test**: Verify that the summary accurately reflects the data entered by the patient.
- **UI Test**: Ensure the component fits well within the consultation page layout on both desktop and tablet.
