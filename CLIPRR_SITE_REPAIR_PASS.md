# CLIPRR Site Repair Pass

Date: April 5, 2026  
Workspace: `D:\PythonProjects\CliprrWeb`

## Summary of what was fixed

- Implemented a working mobile navigation shell on all four pages.
- Fixed the FAQ page’s broken mobile grid by moving the layout into shared CSS.
- Replaced dead placeholder / dead internal links.
- Reduced several likely jank sources without flattening the visual style.
- Deferred the home demo video embed until user interaction.
- Added image sizing/loading hints and replaced the oversized shared app icon with a lightweight asset.

## Files changed

- `D:\PythonProjects\CliprrWeb\index.html`
- `D:\PythonProjects\CliprrWeb\workflow.html`
- `D:\PythonProjects\CliprrWeb\pricing.html`
- `D:\PythonProjects\CliprrWeb\faq.html`
- `D:\PythonProjects\CliprrWeb\assets\styles\site.css`
- `D:\PythonProjects\CliprrWeb\assets\scripts\site.js`
- `D:\PythonProjects\CliprrWeb\assets\brand\app-icon-96.jpg`

## Exact audit issues resolved

### 1. Mobile navigation breakage

- Added real `[data-mobile-panel]` markup to all pages.
- Added mobile nav links and the primary download CTA to each panel.
- Updated JS to open, close, hide, and escape-close the panel reliably.
- Kept desktop nav unchanged above the mobile breakpoint.

### 2. FAQ page mobile grid bug

- Removed the inline 3-column FAQ layout override.
- Replaced it with dedicated FAQ grid classes in shared CSS.
- FAQ now stacks cleanly on mobile and keeps structured multi-column behavior on larger screens.

### 3. Dead CTA and dead links

- Home hero CTA now points to the real GitHub releases download URL.
- Dead footer links to `platform.html` were replaced with real existing routes.
- Placeholder routing from the audit is no longer present.

### 4. CSS / structural fragility related to the repaired areas

- Moved several layout-critical inline styles into named CSS classes.
- Consolidated the specific duplicated/overlapping logic around hero sizing, workflow section leads, pricing card layout, FAQ column layout, and the mobile header.
- Removed the incomplete `data-page-link` expectation from JS instead of expanding it.

## Performance optimizations applied

- Removed permanent `will-change` usage from screenshot frames.
- Scoped heavier hover effects to hover-capable fine-pointer devices.
- Added `prefers-reduced-motion` handling for looping motion, transitions, and smooth scrolling.
- Toned down the full-page glow cost by reducing blur/opacity and slowing the animation.
- Reduced sticky topbar blur strength while keeping the glass effect.
- Replaced the immediate YouTube iframe with a click-to-load video launcher.
- Added `width` and `height` attributes to static images that are rendered on the site.
- Added `loading=\"lazy\"` and `decoding=\"async\"` to non-critical images.
- Replaced the shared app icon usage with a smaller `app-icon-96.jpg` asset.

## Issues partially improved but not fully solved

- Narrow-screen hero typography is improved and no longer showed horizontal document overflow in debug validation, but the home and workflow hero wraps are still dense at the smallest emulated widths. This likely needs a second micro-polish pass with real device/browser validation, especially around `390` and `320`.
- Large marketing imagery is now better behaved from a layout/loading perspective, but the main hero screenshot itself is still a relatively heavy asset. I did not replace the large screenshot binaries in this pass to avoid visible quality regressions without a more controlled asset-generation step.

## Intentionally deferred items

- Full asset optimization for the large hero/product screenshots beyond sizing/lazy-loading hints.
- Typography system cleanup and any font-loading decisions.
- Broader CSS cleanup outside the repaired areas.
- More aggressive visual-effect reduction. I only trimmed the highest-confidence costs.

## Breakpoint validation summary

Validated with headless renders plus source inspection at:

- `1440`
- `1280`
- `1024`
- `768`
- `430`
- `390`
- `375`
- `320`

What was checked:

- Header / footer integrity
- Hero fit behavior
- FAQ readability
- Workflow stacking
- Pricing stability
- Presence of mobile nav markup/logic
- Absence of obvious dead internal links

Important validation note:

- In headless file-based Edge rendering, very narrow window sizes reported a larger CSS viewport than the raw window width in a temporary debug check (`scrollWidth == clientWidth`, but CSS width was larger than the requested window size). Because of that, the smallest-width validation is good directional evidence, but it is not a perfect substitute for final manual browser/device QA.

## Follow-up recommendations for a second polish pass

- Do a true interactive browser/device pass for the mobile menu and smallest hero layouts on real widths.
- Generate responsive or modern-format variants for `ShortMonitor.jpg` and the other largest product images.
- Decide whether to keep loading `Poppins` or standardize the fallback stack intentionally.
- Tighten the hero wrapping rules one more time after real-device QA, especially on home/workflow at the narrowest widths.
