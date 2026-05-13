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

Build output:

```text
dist/
```

## Notes

- The project is a Vite React app.
- The Vite base is `/` for the GitHub Pages user-site repository.
- The badge uses React Three Fiber, Drei, Rapier, Three.js, and MeshLine.
- The card portrait asset is `src/assets/my-image-processed.png`.
- The lanyard texture asset is `public/band-neutral.png`.
- Resume files are served from `public/resume.pdf` and `public/resume-ats-strict.pdf`.
