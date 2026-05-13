# Setup And Run Instructions

## Install Dependencies

```bash
npm.cmd install
```

## Run Locally

```bash
npm.cmd run dev -- --port 5173
```

Local URL:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm.cmd run build
```

Build output is generated in:

```text
dist/
```

## Validation Notes

- The project is a Vite React app.
- The Vite base is `/`, which matches the `ASHRAF-2004/ashraf-2004.github.io` user-site repository setup.
- The 3D badge depends on `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `three`, and `meshline`.
- The 3D card uses `src/assets/my-image-processed.png`.
- CV files are served from `public/resume.pdf` and `public/resume-ats-strict.pdf`.
- If Playwright MCP cannot launch Chrome on this machine, Python Playwright can use installed Microsoft Edge for local rendered checks.
