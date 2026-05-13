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

## Notes

- The project is now a Vite React app.
- The source app uses `index.html`, `src/`, `public/`, and `package.json`.
- `resume.pdf`, `resume-ats-strict.pdf`, and `My_Image.png` are served from `public/`.
- `src/assets/my-image-processed.png` is the monochrome portrait used by the badge.
- For GitHub Pages, publish the built `dist/` output or configure Pages to build the Vite app.
