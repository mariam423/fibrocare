# Final Audit Report — Menstrual Health Suite, Dietary Log & Personal Triggers

**Date:** 2026-09-18
**Audit axes:** RTL/Arabic localization, responsive design, interactivity/accessibility, print view
**Modules audited:** Menstrual Health Suite (cycle log + dashboard + status widget + spoon budget + clinical report + caregiver sync), Dietary Log + Personal Triggers + flare correlation, and the Clinical Hub report flow.
**Branches:** work uncommitted on `master` (HEAD `02963a8`); all audited modules are new/untracked files.

---

## 1. Bugs found and fixed

| # | Bug | Evidence | Fix |
|---|-----|----------|-----|
| 1 | ACR criteria row rendered the raw key string `clinical.acr.result.duration` instead of a label | Used at `src/components/clinical/AcrAssessment.tsx:100` (`{ key: "durationMet", tKey: "clinical.acr.result.duration" as TranslationKey }`). Grep over `src/lib/translations.ts` confirmed sibling keys `clinical.acr.result.generalized`/`.scoreRule` exist (EN `4404-4405`, AR `6759-6760`) but `.duration` did not, in the union **or** either dict. The `as TranslationKey` cast defeats the type checker, so `tsc` could not surface it. | Added union entry + EN `"Duration ≥ 3 months"` + AR `"المدة ≥ 3 أشهر"` to `src/lib/translations.ts`. |
| 2 | Hardcoded English `Day {n}` badge inside the cycle status widget | `src/components/health/CycleStatusWidget.tsx:96` | Replaced with `{t("health.currentDay")} {data.currentDay}`. |
| 3 | RTL mirroring broken in the cycle timeline — flare window + current-day marker positioned with absolute `left:` | `src/components/health/CycleStatusWidget.tsx` (flare window `style={{ left: … left: … }}`, marker `style={{ left: … }}`, lines ~105–114). `left` is not direction-aware, so in RTL the markers stayed pinned to the left instead of mirroring. | Switched both to `insetInlineStart` (logical property); `width` unchanged. |
| 4 | Raw cycle-phase enum displayed in Arabic UI — `cycle.phase` renders `MENSTRUAL` etc. verbatim | `src/components/health/MenstrualLogForm.tsx:269` (`…: {cycle.phase}`) | Added a `phaseLabels` map over `health.phase.*` keys; rendered `phaseLabels[cycle.phase] ?? cycle.phase`. |
| 5 | Raw lowercase English phase names in Clinical Report correlations — `(...menstrual)` shown to Arabic users | `src/components/health/ClinicalReportCard.tsx:11-16` (`PHASE_KEYS` mapped to `"menstrual"`, `"follicular"`, …) and render at line 93 | `PHASE_KEYS` is now `Record<string, TranslationKey>` over `health.phase.*`; rendered via `t(...)`. |
| 6 | Caregiver share page (`src/app/caregiver/[token]/page.tsx`) — new module, **100% hardcoded English** (page title, "Cycle phase", "Days to next period", "Elevated/Moderate/Calm", "Unknown", expired-link copy, insight paragraph) | Full-file read (107 lines, no `useLanguage`/cookie access). | Localized server-side using the same pattern as `src/app/layout.tsx`: `parseLocale((await cookies()).get(LOCALE_COOKIE)?.value)` → `translations[locale]` `t()` helper with `{name}` interpolation. Added 12 `caregiver.*` keys to the union + EN + AR dicts. |

---

## 2. Translation & RTL evidence

### 2.1 Key-set parity (authoritative script over `src/lib/translations.ts`, 7,101 lines)
- `en=2347` **ar=2347**; **EN-only orphans: none**, **AR-only orphans: none** (after the 4 added keys: `clinical.acr.result.duration` + 12 `caregiver.*` − 9 removed… net +4). Script: `Temp\opencode\audit-translations2.mjs`.
- Prefix counts (post-fix): `diet.` 108/108, `health.` 151/151, `clinical.` 289/289.
- **10 byte-identical latin-only keys** in both locales — all medical acronyms/labels (WPI, SSS, CBC, ESR, HRV, TSH, CRP, `dashboard.pro.badgeText`). Accepted.
- **Dynamic engine keys:** 345 used dynamic/static keys resolved against the dict; **0 missing**. Trigger engine ids `["gluten","dairy","sugar","fried","processed","alcohol","caffeine"]` match all 7 `diet.warn.known.*` keys and all 7 `diet.swap.*` ids one-for-one (script `dict-keys.mjs`).
- **Placeholder parity:** the only interpolation key using `{hour}` (`diet.correlation.timing.later`) contains `{hour}` in both EN and AR; engine `suggestedBeforeHour` literals are `19`/`20` in both.
- Sample spot-check (script `ar-sample.mjs`): 24 sampled `health`/`diet` keys all present in AR, contain Arabic script, and match EN placeholder sets. (A first-pass "orphan" `diet.triggers.namePlaceholder` was a false positive of an earlier script caused by its 4-space regex; present at EN 4349 / AR, with a cosmetic 2-space indent on the EN line.)

### 2.2 RTL CSS / JS-placement scan of the 12 new-module files
- Regex scan for `text-left|text-right|ml-*|mr-*|pl-*|pr-*|left-[0-9]|right-[0-9]|justify-start|justify-end|dir="ltr"|direction:ltr|left:{` across `MealLogger`, `TriggerWarnings`, `PersonalTriggerList`, `FlareCorrelationPanel`, `diet/page`, `MenstrualLogForm`, `CycleDashboard`, `CycleStatusWidget` (post-fix), `SpoonBudgetCalculator`, `ClinicalReportCard`, `CaregiverSyncCard`, `SegmentedFilter`: **0 hits**. All spacing uses logical properties (`start-3`, `ps-*`, `ms-*`, `me-*`, `border-x`).
- Width-based phase timeline / overlap bars in `CycleDashboard` use non-absolute fills → mirror automatically in RTL.
- Root layout (`src/app/layout.tsx:136-137`) sets `lang`+`dir` from the cookie; `Readex_Pro` loads both `arabic`+`latin` subsets (lines 21-25).
- Arabic label lengths are short (max 14 chars, e.g. "خفيف إلى متوسط") → nothing truncates in `SegmentedFilter` (meal type / severity filters) or the 5-column energy grid.

---

## 3. Responsive evidence
- All three pages collapse to a single column on mobile and expand on `lg`: dashboard suite `grid-cols-1 lg:grid-cols-3`, diet page `grid-cols-1 lg:grid-cols-3`, clinical hub `grid-cols-1 gap-6` single column of full-width cards (`src/app/clinical/page.tsx:63,88`).
- Form rows use `flex-wrap`/`flex-col` (`MenstrualLogForm` date + flow rows); date input fixed `w-44` fits a 320 px viewport.
- `SegmentedFilter` is `flex-col` on small screens with `whitespace-nowrap` buttons (`min-h-11` touch target).
- Energy selector uses `grid-cols-5` with `truncate` labels → no overflow on narrow widths. No `overflow-x` scroll sources found in the audited modules.

---

## 4. Interactivity / accessibility evidence
- Range inputs (`type="range"`) carry `aria-label`: `MenstrualLogForm.tsx:48/54` (severity), `:376/389` (energy, libido); `SpoonBudgetCalculator.tsx:73/86`.
- Toggle groups use `role="radiogroup"` + `aria-label` (`MenstrualLogForm.tsx:99`) and `aria-pressed` (`SpoonBudgetCalculator.tsx:87`, `MealLogger.tsx:322`, `SegmentedFilter.tsx:66-77`).
- `<select>` phase picker + date input have `aria-label`s (`CycleStatusWidget.tsx:182,189`).
- Every delete/remove/amount icon control in `MealLogger`/`PersonalTriggerList` has `aria-label`.

---

## 5. Print-view evidence
- `window.print()` confirmed: `src/components/health/ClinicalReportCard.tsx:102` (`onClick={() => window.print()}`).
- `src/app/print.css` (68 lines) drops app chrome for paper: `header, nav, footer, .ambient, .ambient-aurora, .aurora-glow-trail, .gradient-blur-top, [data-sonner-toaster]` → `display:none`; flattens `.dark` to white `#fff` / slate ink; strips backdrop-filter + box-shadow + text-shadow; `print-color-adjust: exact` keeps the verdict banner legible; `@page { margin: 14mm 12mm }`; resets `main#main-content` padding.
- Report panel uses `print:shadow-none` and is fully localized (all labels via `t()`; phase names corrected by Fix 5).
- Behavioral note: print emits the whole current viewport content (report + surrounding cards), not a report-only region — the page prints light-on-white and readable; acceptable, documented.

---

## 6. Test / type / lint verdict
- `npx tsc --noEmit` → **clean** (confirms the `as TranslationKey` cast in `AcrAssessment.tsx:100` now resolves to a real key, and the new union keys type-check).
- `eslint` on all changed files → **clean** (`src/lib/translations.ts`, `src/components/health/*`, `src/app/caregiver/[token]/page.tsx`).
- `npm test` (vitest): **968 passed / 9 failed** across 2 files — all 9 failures are **pre-existing and unrelated** CSRF expectation failures in `src/app/api/pro/posts/{route,mediaUrls}.test.ts` (Pro posts API; none of the audited files participate).
- Targeted re-run of the audited module suite (`src/lib/clinical`, `src/lib/diet`, `src/app/api/health`, `src/lib/validations/health.test.ts`, `src/components/health`): **13 files, 106/106 passed**.

---

## 7. Residual notes / recommendations
1. `diet.triggers.namePlaceholder` in `src/lib/translations.ts` (EN ~line 4349) uses a 2-space indent instead of 4 — cosmetic; no functional impact.
2. Print currently emits the full page; if a strict "report page only" sheet is wanted, gate the report in a `print:hidden`/print-only region or call `window.print()` from a dedicated print layout.
3. The caregiver share page is locale-aware only when the viewer carries the locale cookie; a raw fresh link defaults to English (acceptable default), which matches server behavior for every locale-toggled page.
4. Audit scripts are kept outside the repo at `C:\Users\user\AppData\Local\Temp\opencode\` (`audit-translations2.mjs`, `dict-keys.mjs`, `ar-sample.mjs`, `scan-jsx.mjs`) for re-runs.

---

## 8. Files changed during this audit
- `src/lib/translations.ts` — +`clinical.acr.result.duration` (union + EN + AR), +12 `caregiver.*` keys (union + EN + AR).
- `src/components/health/CycleStatusWidget.tsx` — translated "Day" badge; `left:` → `insetInlineStart` (×2).
- `src/components/health/MenstrualLogForm.tsx` — translated raw phase enum.
- `src/components/health/ClinicalReportCard.tsx` — translated correlation phase names.
- `src/app/caregiver/[token]/page.tsx` — localized (cookie-driven locale + `caregiver.*` keys).