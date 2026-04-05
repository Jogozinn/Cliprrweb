# CLIPRR Image Rollback Pass

Date: April 5, 2026  
Workspace: `D:\PythonProjects\CliprrWeb`

## What was reverted

The following optimized image substitutions were rolled back:

- `Screenshots/ShortMonitor-optimized.jpg`
- `assets/brand/precision-engine-optimized.jpg`
- `Screenshots/macro-crop-monitor-settings-optimized.jpg`
- `Screenshots/macro-crop-vod-selection-list-optimized.jpg`
- `Screenshots/macro-crop-library-grid-optimized.jpg`

## Original files restored

The site now points back to the original source assets in the live markup:

- `Screenshots/ShortMonitor.jpg`
- `assets/brand/precision-engine.jpg`
- `Screenshots/macro-crop-monitor-settings.jpg`
- `Screenshots/macro-crop-vod-selection-list.jpg`
- `Screenshots/macro-crop-library-grid.jpg`

## Whether any optimized assets were retained

- No optimized screenshot / feature-image variants are still in use by the site markup.
- The optimized files themselves were left on disk, but they are no longer referenced by the live pages.

## Why the rollback was necessary

This rollback was necessary because the prior image optimization pass reduced visible quality on high-value marketing visuals:

- product screenshots must stay crisp and trustworthy
- UI text and interface edges cannot look softened or compressed
- premium visuals are more important here than aggressive file-size reduction

Given that quality regression risk outweighed the size savings, restoring the original assets was the safer and correct choice.

## Confirmation that non-image improvements were preserved

The rollback was intentionally narrow and did **not** undo the non-image repair work:

- mobile navigation implementation was preserved
- hero/mobile typography fixes were preserved
- FAQ responsiveness fix was preserved
- dead CTA/link cleanup was preserved
- click-to-load video behavior was preserved
- reduced-motion support was preserved
- image sizing/loading attributes were preserved where they are still safe
- layout, spacing, and responsiveness changes were left intact
