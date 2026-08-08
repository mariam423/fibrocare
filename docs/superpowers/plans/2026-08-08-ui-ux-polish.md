# Step 3: UI/UX Polish — Color, Typography, Icons, Accessibility

Status: Completed
Scope: Cohesive soothing color system, refined typography/padding/borders/touch targets, Hugeicons integration, top-tier accessibility. No 3D/2.5D animations in this step.

## Palette matrix (4 modes)

| Mode | Background | Primary | Accent | Notes |
|------|-----------|---------|--------|-------|
| Standard · Light | soft lavender white | violet/lavender | soft teal | "Productive Pastels" — replaces current greyscale |
| Standard · Dark | deep indigo-navy | light lavender | dark teal | |
| Sensitive · Light | gentle sage tint | sage green | soft lavender | existing, refine |
| Sensitive · Dark | deep navy | sage green | soft lavender | existing, refine |

## Tasks

- [x] Install `@hugeicons/react` + `@hugeicons/core-free-icons`; map lucide → hugeicons names
- [x] Redefine color tokens in `globals.css` (Standard light/dark) + `themes.css` (Sensitive) with WCAG AA contrast
- [x] Polish base UI: `button` (touch targets), `input` (h-11), `card` (ring-border), `dialog` (icons), `slider` (thumb), `tabs`
- [x] Replace `lucide-react` with Hugeicons across all 20 files (via `<HugeiconsIcon icon={...} />`)
- [x] Polish `AppHeader` nav (active states, touch targets, icons)
- [x] Polish auth shell + forms
- [x] Accessibility pass: focus-visible, contrast, responsive, reduced motion
- [x] Verify: scoped eslint, `npm run build`, re-run auth E2E; commit

## Icon mapping (lucide → hugeicons)

- `Loader2` → `Loading01Icon` · `Heart` → `HeartIcon` · `HeartPulse` → `HeartPulseIcon`
- `ArrowLeft` → `ArrowLeft01Icon` · `Moon` → `Moon02Icon` · `Sun` → `Sun02Icon`
- `Activity` → `Activity01Icon` · `BatteryLow` → `BatteryLowIcon` · `MoonStar` → `Moon01Icon`
- `Brain` → `BrainIcon` · `Waves` → `WaveIcon` · `MapPin` → `MapPinIcon` · `Spline` → `FlowConnectionIcon`
- `Lightbulb` → `SparklesIcon` · `Volume2` → `VolumeUpIcon` · `VolumeX` → `VolumeMute01Icon`
- `X` → `Cancel01Icon` · `KeyRound` → `Key01Icon` · `Lock` → `LockIcon` · `Delete` → `Delete01Icon`
- `ShieldCheck` → `Shield01Icon` · `Eye`/`EyeOff` → `EyeIcon`/`EyeOffIcon`
- `MailCheck` → `MailSend01Icon` · `ExternalLink` → `ExternalLinkIcon` · `Search` → `Search01Icon`
- `BookOpen` → `Book01Icon` · `Flame` → `FlameIcon` · `Apple` → `AppleIcon`
- `Calendar` → `Calendar01Icon` · `Trash2` → `Delete01Icon` · `Save` → `SaveIcon`
- `User` → `UserIcon` · `Zap` → `ZapIcon` · `FileText` → `File01Icon` · `LogOut` → `Logout01Icon`
- `Wind` → `FastWindIcon`

## Notes

- Hugeicons API: `<HugeiconsIcon icon={HeartIcon} className="h-5 w-5" />` — `icon` prop takes the icon data from `@hugeicons/core-free-icons`; `className` is forwarded to the SVG. For icon props typed in components, use `IconSvgElement` (exported from `@hugeicons/react`) — `IconSvgObject` from the core package is not exported.
- `hugeicons-react` (v0.4.0) is deprecated; maintained packages are `@hugeicons/react` + `@hugeicons/core-free-icons`.
- No `asChild` on Base UI Button — use styled `Link` for nav items.
