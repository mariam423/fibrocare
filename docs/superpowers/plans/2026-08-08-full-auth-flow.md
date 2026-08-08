# Full Authentication Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the end-to-end authentication flow: sign-up, sign-in, sign-out, password reset (forgot/reset), server-side session enforcement on all data actions, and route protection for every private page.

**Architecture:** NextAuth v4 (JWT strategy) already provides credentials (bcrypt) and optional social sign-in. This plan finishes the flow on top of it: session-aware server actions, a token-based password reset using the existing `PasswordResetToken` model, and proxy protection for all private routes.

**Tech Stack:** Next.js 16 (App Router), NextAuth v4, Prisma/SQLite, bcryptjs.

## Global Constraints
- Passwords hashed with bcrypt (10 rounds) — never stored in plain text.
- Reset tokens: single-use, expire after 60 minutes, hashed or random 32-byte hex, cleaned up after use.
- Do not reveal whether an email has an account (generic success message).
- Accessibility: 16px+ type, labelled fields, `role="alert"` for errors, `aria-live` for success.

---

### Task 1: Session-aware data actions
**Files:**
- Modify: `src/app/actions.ts`

**Interfaces:**
- Produces: `getSessionUser(): Promise<User | null>` using `getServerSession(authOptions)`

- [x] **Step 1:** Add `getServerSession` + `authOptions` import; add `getSessionUser()` helper.
- [x] **Step 2:** Replace `getOrCreateDefaultUser()` with `getSessionUser()` in all data-scoped actions (getCurrentUser, updateUserName, savePainLog, updateUserProfile, updateHydration, getAllHealthLogs, getDashboardInsights, getReportData, getSymptomsForDate, toggleSymptom, getWeeklyPainTrend, getLatestLogs, deletePainLog, getStreak). Unauthenticated → return error/empty.
- [x] **Step 3:** Scope `deletePainLog` to verify ownership; scope `getLatestLogs`/`getWeeklyPainTrend`/`getStreak` by user.
- [x] **Step 4:** Remove `getOrCreateDefaultUser`.

### Task 2: Password reset server actions
**Files:**
- Modify: `src/app/actions.ts`

**Interfaces:**
- Produces: `requestPasswordReset(email): Promise<ResetResult>`, `resetPassword(token, password): Promise<ResetResult>`

- [x] **Step 1:** `requestPasswordReset`: validate email, create 60-min `PasswordResetToken` (crypto random hex), delete stale tokens, log reset link to console (return link in dev only).
- [x] **Step 2:** `resetPassword`: validate token (exists + unexpired), validate password rules, bcrypt-hash, update user, delete all user tokens.

### Task 3: Forgot-password page
**Files:**
- Create: `src/app/forgot-password/page.tsx`, `src/components/auth/ForgotPasswordForm.tsx`

- [x] **Step 1:** `/forgot-password` page using `AuthShell`.
- [x] **Step 2:** `ForgotPasswordForm` calls `requestPasswordReset`, shows success/error, links back to login.

### Task 4: Reset-password page
**Files:**
- Create: `src/app/reset-password/page.tsx`, `src/components/auth/ResetPasswordForm.tsx`

- [x] **Step 1:** `/reset-password` page reads `token` from search params.
- [x] **Step 2:** `ResetPasswordForm` validates confirmation, calls `resetPassword`, then links/signs in.

### Task 5: Link from login + route protection
**Files:**
- Modify: `src/components/auth/LoginForm.tsx`, `src/proxy.ts`

- [x] **Step 1:** Add "Forgot your password?" link on login form.
- [x] **Step 2:** Protect `/zen`, `/reports`, `/profile` in proxy.

### Task 6: Fix privacy gate so it never blocks the auth flow
**Files:**
- Modify: `src/components/auth/PrivacyLock.tsx`

- [x] **Step 1:** Exempt public auth paths (`/login`, `/signup`, `/forgot-password`, `/reset-password`) from `PrivacyGate` using `usePathname`.
- [x] **Step 2:** Only gate when a PIN has actually been configured (lock is optional, not forced on first run).
- [x] **Step 3:** Update `src/hooks/useDashboard.ts` and `src/app/profile/page.tsx` to handle the now-nullable `getCurrentUser()`.

### Task 7: Verify and commit
- [x] **Step 1:** `npm run lint` clean for all changed files (repo-wide lint has one pre-existing error in baseline `test-db.js`).
- [x] **Step 2:** `npm run build` succeeds.
- [x] **Step 3:** E2E browser test (Playwright) covers signup → sign-in → sign-out → wrong password → forgot password → reset → new password. 13/13 passed.
- [ ] **Step 4:** Commit all auth work.
