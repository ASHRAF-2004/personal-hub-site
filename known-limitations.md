# Known Limitations

## Lanyard Asset

- The exact original sandbox lanyard texture contains visible `Vercel Ship` branding.
- The rendered browser check also blocked loading that remote image directly.
- The live implementation therefore uses `public/band-neutral.png`, a local brand-neutral lanyard texture with the same MeshLine texture/repeat approach.

## Browser Validation

- Playwright MCP could not run because Chrome is missing from the expected path.
- Python Playwright with installed Microsoft Edge was used for desktop and mobile validation.
- Headless Edge can differ slightly from a normal visible GPU-backed browser, especially for WebGL lighting and antialiasing.

## Build Output

- `npm.cmd run build` passes.
- Vite still reports large lazy-loaded 3D chunks from Three.js/Rapier.
- The badge remains lazy-loaded so the main portfolio content is separated from the heavier 3D code.

## Dependency Audit

- The existing npm dependency tree previously reported audit findings.
- No audit fix was run because this task was scoped to the badge correction.
