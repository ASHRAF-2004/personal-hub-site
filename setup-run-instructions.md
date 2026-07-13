# Setup And Run Instructions

## Requirements

- Node.js 20.19 or newer
- npm

## Install

```powershell
npm install
```

## Develop

```powershell
npm run dev
```

The default local URL is `http://127.0.0.1:5173/`.

## Build

```powershell
npm run build
```

## Preview The Production Build

```powershell
npm run preview
```

Resume, portrait, moon, and lanyard assets are imported from `src/assets` so Vite emits hashed production URLs. The 3D scene is loaded dynamically only for eligible desktop browsers.
