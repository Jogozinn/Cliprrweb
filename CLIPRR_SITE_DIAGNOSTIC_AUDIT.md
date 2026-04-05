# CLIPRR Site Diagnostic Audit

Date: April 5, 2026  
Workspace: `D:\PythonProjects\CliprrWeb`  
Audit mode: diagnostic-only, no production code changes made

## 1. Site overview

This repo is a small static marketing site with four main pages:

- `index.html` - home / primary conversion page
- `workflow.html` - product workflow explainer
- `pricing.html` - pricing + mini FAQ
- `faq.html` - technical FAQ / trust page

Shared implementation is concentrated in:

- `assets/styles/site.css`
- `assets/scripts/site.js`
- `assets/brand/*`
- `Screenshots/*`

Validation approach used in this pass:

- Full source review of all HTML/CSS/JS in the repo
- Asset-size audit for brand and screenshot imagery
- Headless browser render checks on the local files at key widths
- Visual checks performed directly at `1440`, `1024`, `768`, `430`, and `390`
- `375` and `320` behavior was inferred from neighboring mobile renders plus the actual CSS because exact Edge screenshot persistence at those widths was unreliable in this environment

## 2. High-level findings

- The site is structurally simple, which is good for a safe optimization pass.
- The biggest real UX breakage is mobile navigation: below `920px`, the main nav disappears, but no mobile panel exists in any page, so the menu button does nothing.
- The FAQ page has a genuine mobile responsiveness failure because an inline `grid-template-columns: repeat(3, ...)` override blocks the shared mobile stacking rules.
- The home hero headline clips horizontally at small mobile widths in real renders around `430px` and below.
- The site is visually polished, but several premium effects are stacked in a way that likely increases paint/compositing cost on mid-range devices: fixed grid overlay, full-page blurred glow animation, sticky glass topbar, large shadows, and permanent `will-change`.
- Asset efficiency is weak for a marketing site this small. Several above-the-fold images are over 1 MB, and most images do not declare intrinsic dimensions or lazy-loading hints.
- CSS maintainability is fragile: many duplicated selectors, many inline style overrides, and several "patch-on-patch" comments indicate the stylesheet is already drifting into accidental behavior.

## 3. Critical issues

### C1. Mobile navigation is effectively broken below 920px

- What: The desktop nav and topbar CTA are hidden at `max-width: 920px`, but there is no `[data-mobile-panel]` element in any HTML page, so the toggle script cannot open anything.
- Where:
  - `assets/styles/site.css:1146-1169`
  - `assets/scripts/site.js:2-10`
  - `index.html:32-37`
  - `workflow.html:29-34`
  - `pricing.html:29-34`
  - `faq.html:29-34`
- Why it matters: On tablet and mobile, users lose page-to-page navigation and lose the header download CTA. This is a real conversion and usability failure, not just a polish issue.
- Safest fix: Add a real mobile panel component to each page, or better, extract a shared header partial pattern and include a simple stacked nav + CTA inside `[data-mobile-panel]`.
- Risk of fixing: Low if done surgically; moderate only if header markup is refactored aggressively.

### C2. Home hero headline clips on small mobile widths

- What: The home H1 visibly overflows/crops on rendered mobile views around `430px` and below. The combination of large clamp values, `text-wrap: balance`, centered max-width tuning, and gradient text styling is too aggressive for narrow devices.
- Where:
  - `assets/styles/site.css:360-379`
  - `assets/styles/site.css:1041-1060`
  - `assets/styles/site.css:1233-1235`
  - `index.html:47`
- Why it matters: This is the first thing mobile users see, and the clipping makes the site feel broken rather than premium.
- Safest fix: Add a narrower mobile-specific H1 rule for the hero on `<= 430px` and especially `<= 375px`, reducing size/line length without changing the desktop typography direction.
- Risk of fixing: Low if scoped to hero H1 on narrow viewports only.

### C3. FAQ page stays in a 3-column layout on mobile

- What: The FAQ page hard-codes `grid-template-columns: repeat(3, minmax(0, 1fr))` inline, which overrides the shared mobile rule that would normally collapse `.audience-grid` to one column.
- Where:
  - `faq.html:53`
  - shared mobile rule blocked at `assets/styles/site.css:1191-1199`
- Why it matters: On mobile, the FAQ cards become ultra-narrow, text-heavy columns with crushed readability and poor tap comfort. This is visible in the 390px render.
- Safest fix: Move the FAQ page grid definition out of inline styles and into a dedicated class with responsive breakpoints that collapse to 1 column at mobile and likely 2 columns at tablet.
- Risk of fixing: Low.

### C4. Broken primary CTA placeholder remains on the home page

- What: The main hero button still points to `LINK_TO_YOUR_ZIP_FILE`.
- Where: `index.html:54`
- Why it matters: This is the highest-intent conversion surface on the site. Users can click a dead CTA.
- Safest fix: Replace with the real release/download URL already used elsewhere on the site.
- Risk of fixing: Low.

## 4. Important issues

### I1. Broken internal footer links to a non-existent page

- What: Footer links point to `platform.html`, which does not exist.
- Where:
  - `index.html:158`
  - `workflow.html:179`
- Why it matters: Dead internal links reduce trust, hurt crawl quality, and create obvious site incompleteness.
- Safest fix: Remove or replace these links with an existing page.
- Risk of fixing: Low.

### I2. Above-the-fold images are oversized for a lightweight static marketing site

- What: Several shipped images are much larger than necessary:
  - `assets/brand/app-icon.jpg` - about `1.37 MB` for a 40px/42px displayed icon
  - `Screenshots/ShortMonitor.jpg` - about `1.31 MB`
  - `assets/brand/precision-engine.jpg` - about `1.10 MB`
- Where:
  - `index.html:18`, `62`, `126`, `151`
  - `pricing.html:15`, `134`
  - `faq.html:15`, `141`
  - `workflow.html:15`, `171`
- Why it matters: These inflate load time, memory, and decode cost, especially on mobile and mid-range laptops.
- Safest fix: Replace the icon with a tiny optimized asset, produce responsive screenshot/image variants, and serve compressed modern formats where possible.
- Risk of fixing: Low to moderate; low if dimensions remain identical.

### I3. Images are missing intrinsic dimensions and most are missing lazy-loading hints

- What: Most `<img>` tags have no `width`/`height` attributes, and below-the-fold imagery does not use `loading="lazy"` / `decoding="async"`.
- Where: all main page image tags, especially:
  - `index.html:62`, `126`, `151`
  - `workflow.html:78`, `94`, `122`, `138`, `162`, `171`
- Why it matters: This increases CLS risk, makes layout less stable during image decode, and wastes early bandwidth.
- Safest fix: Add intrinsic width/height to all static images and lazy-load non-critical imagery only.
- Risk of fixing: Low if applied carefully and above-the-fold hero media remains eager.

### I4. The embedded YouTube iframe loads immediately with no lightweight thumbnail strategy

- What: The home page embeds YouTube directly in the page flow.
- Where: `index.html:100-103`
- Why it matters: This can add expensive network, layout, and script work before users choose to play anything. It is one of the clearest performance suspects on the home page.
- Safest fix: Replace with a poster/thumbnail + click-to-load embed, or at minimum add `loading="lazy"` if interaction timing allows.
- Risk of fixing: Moderate if you replace behavior; low if you only defer loading safely.

### I5. Premium visual effects are stacked in a way that can produce lag on weaker hardware

- What:
  - fixed grid overlay with masking
  - full-page blurred animated glow
  - sticky glass nav with `backdrop-filter`
  - large shadows on many panels/cards
  - hover transforms on multiple large containers
  - permanent `will-change` on screenshot frames
- Where:
  - `assets/styles/site.css:57-83`
  - `assets/styles/site.css:122-143`
  - `assets/styles/site.css:573-588`
  - `assets/styles/site.css:945-954`
- Why it matters: None of these alone is fatal, but together they likely drive extra compositing and paint cost, which aligns with the "feels a bit laggy" report.
- Safest fix: Keep the look, but reduce the most expensive layers first:
  - remove permanent `will-change`
  - tone down or isolate the full-page blurred glow
  - simplify hover effects on mobile/touch
  - test whether the sticky nav blur can be reduced without losing the aesthetic
- Risk of fixing: Moderate if done broadly; low if optimized one effect at a time.

### I6. No reduced-motion fallback for infinite or high-visibility motion

- What: `pulseGlow` and `gradientShift` run continuously, while hover transforms/shadows animate broadly.
- Where:
  - `assets/styles/site.css:85-89`
  - `assets/styles/site.css:395-406`
  - `assets/styles/site.css:269-272`
  - `assets/styles/site.css:584-588`
  - `assets/styles/site.css:950-954`
- Why it matters: This is both an accessibility issue and a battery/performance issue.
- Safest fix: Add a `prefers-reduced-motion` block that disables non-essential looping and reduces transitions.
- Risk of fixing: Low.

### I7. CSS is accumulating duplicate rules and override layering

- What: Several selectors are defined multiple times with incremental overrides:
  - `.nav-link[aria-current="page"]`
  - `.hero-copy h1`
  - `.section-lead h2`
  - `.brand-lockup`
- Where:
  - `assets/styles/site.css:170-173`, `250-253`
  - `assets/styles/site.css:354-380`, `1041-1060`
  - `assets/styles/site.css:740-753`, `1063-1069`
  - `assets/styles/site.css:190-195`, `1033-1038`
- Why it matters: The site still works, but this is now brittle. Future edits will increasingly rely on accidental cascade order instead of clear intent.
- Safest fix: Consolidate duplicate rules into one authoritative block per selector after functional issues are fixed.
- Risk of fixing: Moderate if mixed with redesign work; low if done as a cleanup pass after screenshots/regression checks.

### I8. Heavy use of inline styles weakens responsive control and consistency

- What: Many important layout and spacing decisions live inline in HTML.
- Where:
  - `faq.html:39`, `51`, `53`, `57`, `78`, `99`, `125`, `127`, `128`, `129`
  - `pricing.html:53`, `56`, `59`, `61`, `63`, `67`, `68`, `71`, `72`, `84`, `90`, `91`, `95`, `110`
  - `workflow.html:61-63`, `76`, `83-86`, `92`, `105-107`, `120`, `127-130`, `136`
  - `index.html:18`, `70`, `117`, `120`
- Why it matters: Inline styles override shared breakpoints and are already the direct cause of at least one mobile bug (`faq.html`).
- Safest fix: Move only layout-critical inline rules into named classes first; leave purely one-off decorative tweaks until later.
- Risk of fixing: Low to moderate depending on scope.

### I9. Tablet-landscape layout collapses earlier than needed

- What: At `max-width: 1200px`, nearly all two-column layouts drop to one column.
- Where: `assets/styles/site.css:1106-1143`
- Why it matters: `1024px` tablet landscape and smaller laptops lose side-by-side structure earlier than necessary, making pages like `workflow.html` longer and less information-dense than they need to be.
- Safest fix: Revisit the `1200px` breakpoint for `split-grid` and related layouts. Some sections likely work better staying two-column until around `1024px` or `960px`.
- Risk of fixing: Moderate because it requires section-by-section verification.

### I10. Intended typography may not be loading at all

- What: CSS uses `"Poppins"` first, but there is no font import, self-hosted font-face, or preload.
- Where: `assets/styles/site.css:35`
- Why it matters: The site’s polish depends heavily on typography. On most systems this likely falls back to `"Segoe UI"` or another installed font, causing design inconsistency and possible text reflow if a font is later added.
- Safest fix: Either self-host/load the intended font or explicitly embrace the fallback stack and retune sizing from there.
- Risk of fixing: Moderate because typography changes can affect wrapping across all pages.

## 5. Minor issues

### M1. Focus-state styling is not explicitly designed

- What: There are hover styles, but no obvious custom `:focus-visible` treatment for nav links, buttons, summaries, or the mobile toggle.
- Where: mainly `assets/styles/site.css`
- Why it matters: Keyboard usability will feel under-designed relative to the rest of the site.
- Safest fix: Add a consistent focus ring token and apply it to key interactive elements.
- Risk of fixing: Low.

### M2. `scroll-behavior: smooth` applies globally with no accessibility exception

- What: Smooth scrolling is enabled on `html`.
- Where: `assets/styles/site.css:27-29`
- Why it matters: Small issue alone, but it should be disabled in reduced-motion mode.
- Safest fix: Keep it, but override inside `prefers-reduced-motion`.
- Risk of fixing: Low.

### M3. Some hover effects are defined for touch-first contexts where they add no value

- What: Large hover transforms/shadows are applied globally to cards, panels, screenshot frames, and origin image.
- Where:
  - `assets/styles/site.css:269-272`
  - `assets/styles/site.css:584-588`
  - `assets/styles/site.css:950-954`
  - `assets/styles/site.css:1087-1088`
- Why it matters: On touch devices they still contribute code/paint complexity without much UX payoff.
- Safest fix: Scope heavier hover effects to `(hover: hover) and (pointer: fine)`.
- Risk of fixing: Low.

### M4. Comment style suggests patching over prior issues instead of consolidating intent

- What: The stylesheet contains notes like "Replace your existing..." and "Add this to the bottom..." alongside repeated selector blocks.
- Where: several sections of `assets/styles/site.css`
- Why it matters: This is a maintainability smell and increases the odds of future regressions.
- Safest fix: Clean comments while consolidating selectors in a later cleanup pass.
- Risk of fixing: Low.

## 6. Responsiveness audit by breakpoint

### 1440+ desktop

- Status: Mostly good.
- Verified: home render at `1440px`.
- Notes:
  - Hero, topbar, and main screenshot feel balanced.
  - Design language reads premium and intentional.
  - Main opportunities here are performance-related, not layout-related.

### 1280 desktop/laptop

- Status: Likely acceptable, but not directly captured in this run.
- Basis: CSS review plus neighboring `1440px` and `1024px` renders.
- Notes:
  - Should remain in the desktop nav state.
  - Worth checking after repairs because the `1200px` breakpoint is close and may create abrupt layout transitions just below this range.

### 1024 tablet landscape

- Status: Mixed.
- Verified: home and workflow renders at `1024px`.
- Findings:
  - Header remains usable.
  - Workflow collapses into a long single-column experience earlier than ideal.
  - This is not broken, but it feels less efficient than it should at this width.

### 768 tablet

- Status: Functional, but degraded by the broken mobile nav.
- Verified: home render at `768px`.
- Findings:
  - Hero stacks cleanly.
  - Buttons become full width, which is acceptable here.
  - Navigation failure is significant because the hamburger appears but still does nothing.

### 430 mobile large

- Status: Not clean.
- Verified: home render at `430px`.
- Findings:
  - Hero H1 clips horizontally.
  - Mobile nav is still broken.
  - The page still feels visually rich, but the clipped hero undermines trust immediately.

### 390 / 375 mobile

- Status: Problematic.
- Verified: home, workflow, pricing, and FAQ at `390px`; `375px` inferred from neighboring render + CSS.
- Findings:
  - Home hero clipping persists.
  - Workflow hero/title area is readable, but the page is very tall because of early one-column collapse.
  - Pricing remains usable overall.
  - FAQ is clearly broken because the three-column layout is retained.

### 320 narrow mobile

- Status: High risk; inferred issue range.
- Basis: CSS plus observed failures at `390px` and `430px`.
- Findings:
  - With `body { min-width: 320px; }` and the current hero sizing, the home H1 issue is likely worse, not better.
  - Broken mobile nav remains.
  - FAQ’s forced three-column structure would be severely compromised here.

## 7. Performance / jank audit

Most likely contributors to the "laggy" feel, in order of suspicion:

1. Full-page animated glow layer on `.site-shell::after`
   - `assets/styles/site.css:72-83`
   - Large blurred animated layers are expensive, especially over long pages.

2. Sticky glass topbar with `backdrop-filter`
   - `assets/styles/site.css:98-143`
   - Backdrop blur on a sticky header often costs more during scroll than it appears to.

3. Large shadows + hover transitions across many cards/panels
   - `assets/styles/site.css:483-495`
   - `assets/styles/site.css:945-954`
   - This can make scrolling and hover feel heavy on lower-end GPUs.

4. Permanent `will-change` on `.screenshot-frame`
   - `assets/styles/site.css:580-581`
   - This is a common over-optimization that can keep elements on promoted layers unnecessarily.

5. Immediate YouTube embed
   - `index.html:100-103`
   - Third-party iframe cost is disproportionate on a small marketing site.

6. Oversized hero/media assets
   - especially `app-icon.jpg`, `ShortMonitor.jpg`, `precision-engine.jpg`
   - High decode and transfer cost for relatively few page elements.

What does **not** look like the main problem:

- JavaScript complexity. `assets/scripts/site.js` is tiny.
- Client-side state or framework overhead. There is none.

## 8. CSS / JS structural audit

### CSS

- Shared stylesheet size is manageable, but organization is drifting.
- Duplicated selector definitions and late-file overrides are creating hidden coupling.
- Inline styles are doing too much layout work.
- Breakpoint logic is coarse:
  - `1200px` collapse is probably too early for some sections.
  - `920px` switches to a mobile header state that is not fully implemented.
- Some unused-looking structural classes exist or are minimally used, suggesting leftover design exploration:
  - examples include `.hero-grid`, `.pipeline-chain`, `.placeholder-*`, `.chip-row`, `.chip`
  - These are not necessarily harmful, but they should be verified before a cleanup pass.

### JavaScript

- JS is very small and not a runtime performance concern.
- It is currently functionally incomplete:
  - expects `[data-mobile-panel]`, but none exists
  - tries to support `[data-page-link]`, but no links use that attribute
- Safe conclusion: JS should be fixed, not expanded.

## 9. Safe repair plan

### Stage 1. Fix true breakage first

- Repair the mobile navigation pattern end to end.
- Replace the `LINK_TO_YOUR_ZIP_FILE` placeholder.
- Remove or replace dead `platform.html` footer links.
- Fix the FAQ page’s forced 3-column mobile layout.

### Stage 2. Stabilize mobile typography and layout

- Add narrow-mobile H1 tuning for the home hero.
- Check CTA/button spacing and text wrapping at `430`, `390`, `375`, and `320`.
- Revisit only the layouts that collapse too early, especially `workflow.html` sections around `1024px`.

### Stage 3. Reduce obvious performance cost without changing the visual language

- Remove permanent `will-change`.
- Add `prefers-reduced-motion` safeguards.
- Reduce the cost of the animated page glow if profiling still shows jank.
- Consider slightly softening topbar blur or reducing shadow complexity only if needed after testing.

### Stage 4. Improve asset efficiency and visual stability

- Optimize the app icon and large hero/support images.
- Add width/height to all images.
- Lazy-load non-critical screenshots.
- Replace or defer the YouTube embed with a lighter interaction pattern.

### Stage 5. Consolidate structure carefully

- Move layout-critical inline styles into named classes.
- Consolidate duplicated CSS selectors into single authoritative definitions.
- Remove dead or truly unused utility blocks only after verifying they are not needed.

## 10. Files likely to change in next pass

- `D:\PythonProjects\CliprrWeb\index.html`
- `D:\PythonProjects\CliprrWeb\workflow.html`
- `D:\PythonProjects\CliprrWeb\pricing.html`
- `D:\PythonProjects\CliprrWeb\faq.html`
- `D:\PythonProjects\CliprrWeb\assets\styles\site.css`
- `D:\PythonProjects\CliprrWeb\assets\scripts\site.js`
- `D:\PythonProjects\CliprrWeb\assets\brand\app-icon.jpg` or replacement asset
- `D:\PythonProjects\CliprrWeb\assets\brand\precision-engine.jpg` or replacement asset
- `D:\PythonProjects\CliprrWeb\Screenshots\ShortMonitor.jpg` or responsive replacement assets

## 11. Things to preserve / do not break

- The overall visual direction: dark premium product-marketing feel with glass, gradients, and polished screenshot framing.
- Desktop hero composition on the home page at large widths.
- The general CTA hierarchy: free trial first, paid/license path second.
- The use of product screenshots as proof, especially on home and workflow pages.
- The pricing page’s single-plan focus; it is clear and conversion-oriented.
- The workflow page’s narrative structure; it is long, but the content sequencing makes sense.
- The FAQ page’s intent to feel more technical and trust-oriented than the other pages.

## Prioritized issue list

1. Broken mobile navigation below `920px`
2. Home hero headline clipping on small mobile widths
3. FAQ page forced into 3 columns on mobile
4. Dead primary CTA placeholder on the home hero
5. Dead `platform.html` footer links
6. Oversized above-the-fold assets
7. Immediate YouTube embed cost
8. Full-page blur/animation + sticky backdrop-filter + permanent `will-change`
9. Duplicate CSS / inline layout overrides
10. Missing reduced-motion and explicit focus-state polish

## Final note

This site does **not** need a redesign. It needs a careful stabilization pass:

- fix the broken mobile interactions,
- correct the narrow-width typography/layout failures,
- trim the highest-cost rendering patterns,
- then consolidate the CSS without flattening the design.

That is the minimum-risk route to making it feel smoother, more reliable, and more premium without losing the current identity.
