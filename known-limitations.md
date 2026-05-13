# Known Limitations

## Browser Validation

- Playwright MCP could not run because Chrome was missing from the expected path.
- Attempting to install Chrome through Playwright failed due system privileges.
- Microsoft Edge headless was used as the rendered validation fallback.
- Edge headless emitted internal browser task-manager warnings; these were not app console errors.

## Build Output

- `npm.cmd run build` passes.
- Vite still reports that the Three.js vendor chunk is larger than 500 kB after minification.
- The 3D code is lazy-loaded and split from the main app, so the initial portfolio bundle remains small.

## Deployment

- The project is now a Vite React source project.
- A direct GitHub Pages push from the repository root may need a Pages build workflow or a published `dist/` output.
- No deployment claim was added.

## 3D Badge

- The badge uses a React Three Fiber stage plus a draggable 3D-transformed HTML ID card for readability and accessibility.
- This is intentionally lighter and more stable than copying the sandbox physics/model approach.
- The local sandbox was used only as a technical reference for interaction direction.
