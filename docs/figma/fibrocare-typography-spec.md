# FibroCare Typography — Figma Library Spec

Date: 2026-08-10
Status: Implemented in code — ready to mirror into a Figma Text-Style library

This document specifies the typography system applied to FibroCare so it can be
ported 1:1 into a Figma library. Every value below is mapped to the running
implementation (Tailwind v4 + `next/font`) so the Figma and code sides stay in
sync.

## 1. Font Tokens (Figma "Paint"/font roles)

| Token | Figma Font | Role | Code ref |
|---|---|---|---|
| `Font / Alphabet / Latin` | **Plus Jakarta Sans** (variable) | All Latin UI + body | `--font-jakarta` |
| `Font / Alphabet / Arabic` | **Tajawal** | All Arabic UI once `<html lang="ar">` is active | `--font-tajawal` |
| `Font / Mono` | system mono stack (not shipped) | Reserved; no current consumers | Tailwind default |

The Arabic family swap is automatic at runtime: the app flips both `lang` and
`dir` when the user switches locale, and CSS re-points the whole family to
Tajawal. Design in Figma by keeping the two alphabet fonts in a single text
style component and swapping the font to Tajawal on the Arabic frame.

## 2. Weight Scale

| Weight | Value | Where |
|---|---|---|
| Regular | 400 | Large/quiet labels, long-form descriptive text, breathing labels |
| Medium | 500 | Body text, nav links, stat labels, chips |
| Semibold | 600 | Card titles, section headings |
| Bold | 700 | Page H1, hero numbers, key stats |

Load set: Plus Jakarta Sans is variable (200–800, all used). Tajawal ships
400 / 500 / 700 only — treat 600 in Arabic as an intermediate rendered weight
(synthesized from 500/700) or snap to 700.

## 3. Type Styles (Figma Text Styles)

Letter-spacing uses `em` so styles stay scale-independent.

| Style | Font | Wt | Size | Line | L.S. | Usage |
|---|---|---|---|---|---|---|
| `Display / H-Hero` | Plus Jakarta Sans | 700 | 48 px | 1.1 | −0.02 em | high-visibility hero only |
| `Display / H1` | Plus Jakarta Sans | 700 | 30 px | 1.2 | −0.02 em | page titles (`text-3xl tracking-tight`) — 24 px on mobile |
| `Display / H2` | Plus Jakarta Sans | 600 | 24 px | 1.33 | −0.02 em | section headings on pages |
| `Title / Card` | Plus Jakarta Sans | 600 | 20 px | 1.4 | −0.02 em | card / dialog titles (`CardTitle`) |
| `Title / Section` | Plus Jakarta Sans | 600 | 18 px | 1.4 | −0.02 em | in-card group headings |
| `Body / Regular` | Plus Jakarta Sans | 400 | 16 px | 1.6 | 0 | primary paragraph / card copy (`text-base`) |
| `Body / Medium` | Plus Jakarta Sans | 500 | 16 px | 1.5 | 0 | emphasized UI copy |
| `Body / Small` | Plus Jakarta Sans | 400 | 14 px | 1.5 | 0 | secondary copy, descriptions (`text-sm`) |
| `Label / Medium` | Plus Jakarta Sans | 500 | 14 px | 1.5 | +0.01 em | nav links, buttons, list items |
| `Caption` | Plus Jakarta Sans | 500 | 12 px | 1.4 | +0.02 em | stat labels, metadata, section eyebrows |
| `Micro` | Plus Jakarta Sans | 500 | 10–11 px | 1.4 | +0.02 em | chip text, weather units, chart tags |

Base rhythm notes (from `globals.css` `@layer base`):
- `body` fallback: 16 px / line-height 1.6.
- All headings default to line-height 1.2 + `letter-spacing: −0.02 em` and
  `text-wrap: balance` (headings with an explicit `text-*` utility keep the
  Tailwind scale line-height above).
- `text-rendering: optimizeLegibility`.

### Arabic (Tajawal) table

| Style | Wt | Notes |
|---|---|---|
| Display / Arabic headings | 700 | rising stroke-size is safe for titles; keep 700 for H1–Display |
| Body Arabic | 500 | Medium reads best for Tajawal at body sizes |
| Any Arabic | — | **letter-spacing: 0 on every style** (see §4) |

Tajawal ascends higher than Jakarta — do not share a shared vertical grid box
between the two fonts in the same component without eyeballing baseline/leading.

## 4. Typography Rules

1. **Sentence case everywhere.** Page titles, stats, chips and category
   eyebrows render in sentence case. No `uppercase` transformations in
   app UI (removed from the previous design). The only exceptions are
   phrases that are intrinsically acronyms or keys ("EN", "HPa").
2. **Arabic letter-spacing is always 0.** Arabic is a connected script;
   tracking opens visible gaps between letters. Code enforces this with an
   unlayered `html[lang="ar"] * { letter-spacing: 0 }` that out-ranks every
   `tracking-*` utility. Any Figma arabic style must keep L.S. at 0.
3. **Weights stay balanced**: body = medium at most; never regular-body +
   black-heading contrast. Keep display weights at 700 max.
4. **Heading tracking** sits at −0.02 em (tight) for Latin; never wider
   tracking on headings.
5. **Text flow**: body line-height 1.6, headings 1.2–1.33; heading
   `text-wrap: balance` for single-line titles in code — enable auto leading
   alignment per style in Figma, do not hand-add descenders spacing.

## 5. Implementation Map (Figma ⇄ code)

| Figma concept | Code |
|---|---|
| Font token `Latin` | `Plus_Jakarta_Sans({ variable: "--font-jakarta" })` in `src/app/layout.tsx` |
| Font token `Arabic` | `Tajawal({ variable: "--font-tajawal", weight: ["400","500","700"] })` |
| Family switch | `--font-app-sans` (set in `:root`, flipped in `html[lang="ar"]`) in `src/app/globals.css` |
| Theme font utilities | `@theme inline { --font-sans: var(--font-app-sans); --font-heading: var(--font-app-sans); --font-arabic: var(--font-tajawal) }` |
| Size scale | Tailwind v4 `text-xs / sm / base / lg / xl / 2xl / 3xl / 4xl` |
| Tracking | `tracking-tight` (−0.025 em), `tracking-wide` (+0.025 em), `tracking-widest` (+0.1 em) |

## 6. Changelog (this pass)

- Replaced `Geist Sans/Mono` (the default AI template pairing) with
  **Plus Jakarta Sans** + **Tajawal**.
- Fixed a broken font binding: `--font-sans: var(--font-sans)` self-reference
  silently fell back to the browser default; now routed through
  `--font-app-sans`.
- Added bilingual flip (`html[lang="ar"]`) + Arabic letter-spacing zeroing.
- Base rhythm: body 16 px / 1.6, headings 1.2 + −0.02 em + `text-wrap: balance`.
- Removed `uppercase` from stat labels, severity/pain chips, weather captions
  and category eyebrows; balanced chip weights (700→500/medium).