# Portfolio Improvements

## Completed In This Fix

- Removed the previous flat ID-card overlay with personal text.
- Rebuilt the badge around Rapier physics instead of CSS-only movement.
- Added a visible MeshLine lanyard.
- Added rope joints and a spherical card attachment following the sandbox structure.
- Kept the card draggable on desktop through pointer capture and kinematic movement.
- Kept the card image-only, using the processed monochrome portrait.
- Preserved the black minimal portfolio theme.
- Preserved Projects, About, Skills, Resume, and Contact sections.
- Added a local favicon to avoid browser console noise.

## Suggested Next Improvements

- Tune the lanyard/card sizing after reviewing it in a normal desktop browser, since headless rendering can differ slightly from a visible GPU-backed browser.
- Add lightweight project screenshots when each repository has a clean visual worth showing.
- Add a small automated smoke test script for heading, project count, resume links, and core external links.
- Consider a future bundle-size pass if the 3D badge load becomes noticeable on slower devices.
