# Known Limitations

## Browser Validation

- Playwright MCP could not run because Chrome is missing from the expected path.
- Installing Chrome through Playwright failed due system privileges.
- Local Python Playwright with installed Microsoft Edge was used as the browser validation fallback.
- Microsoft Edge headless may render WebGL slightly differently than a normal visible browser window.

## Build Output

- `npm.cmd run build` passes.
- Vite reports large lazy-loaded 3D chunks after minification, mainly from Rapier/Three.js.
- The 3D badge is lazy-loaded, so the main portfolio content remains separate from the heavy badge chunk.

## Dependency Audit

- `npm.cmd install` reported 8 dependency audit findings from the npm tree.
- I did not run `npm audit fix` because this task was scoped to fixing the badge implementation and avoiding unrelated dependency churn.

## Accessibility And Fallback

- Critical profile, project, resume, and contact content remains outside the canvas.
- WebGL failure and reduced-motion preferences use a static portrait-card fallback.
- Keyboard users can still access all page CTAs and links; the card drag itself is pointer-based.
