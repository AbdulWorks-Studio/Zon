# Zon AI Tools (Windows-ready build)

A clean, standalone React + Vite + Tailwind CSS v4 rebuild of the Zon project,
with all Replit/pnpm-workspace specific configuration removed so it installs
and runs natively on Windows 10/11 with plain `npm`.

## Run it on Windows (CMD)

1. Install [Node.js LTS](https://nodejs.org) (v20 or newer) if you don't have it.
2. Unzip this folder somewhere simple, e.g. `C:\Projects\Zon-AI-Tools`.
3. Open **Command Prompt** and `cd` into the folder:
   ```
   cd C:\Projects\Zon-AI-Tools
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the dev server:
   ```
   npm run dev
   ```
6. Open the URL it prints (usually `http://localhost:5173`) in your browser.

To build a production bundle: `npm run build` (output goes to `dist/`).
To preview that build locally: `npm run preview`.

## What was changed from the original Replit export

- Flattened `artifacts/zon` (the actual app) out of the pnpm workspace into
  this single root folder — no more `lib/*`, `artifacts/*` workspace packages.
- Removed `pnpm-workspace.yaml`, `pnpm-lock.yaml`, the `.npmrc` preinstall
  hook, and every `catalog:`/`workspace:*` dependency reference.
- Removed Replit-only plugins (`@replit/vite-plugin-cartographer`,
  `vite-plugin-dev-banner`, `vite-plugin-runtime-error-modal`) and the
  `PORT`/`BASE_PATH` environment variables the old `vite.config.ts` required.
- Rewrote `package.json` with plain, pinned npm dependency ranges. Because
  this is a normal npm install (not pnpm with the original workspace's
  platform overrides), npm will pull in `@rollup/rollup-win32-x64-msvc`
  automatically on Windows — that's what was missing before.
- Kept the Green & Gold liquid-glassmorphism theme, fonts, and all custom
  CSS (`src/index.css`) exactly as they were.

## Heads up: only one of the three tools is actually built

Looking through the exported code, only the **Background Remover** is a
real, working tool — it runs `@imgly/background-removal` in the browser
with a local canvas-based fallback, and has the "sponsor pause" export/ad
modal before download, all preserved here.

**Video Joiner** and **Music Joiner** are not implemented anywhere in the
project you exported — in the source they're "on the workbench" / "coming
soon" cards on the roadmap section (`Tools` component in `src/App.tsx`)
with a "Keep me posted" button, not functional tools. I kept them exactly
as-is (same cards, same copy, same roadmap section) rather than inventing
functionality that wasn't in your original code. Let me know if you'd like
me to build those two out — happy to do it as a next step.

## Project structure

```
Zon-AI-Tools/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ public/
│  ├─ favicon.svg
│  └─ robots.txt
└─ src/
   ├─ main.tsx
   ├─ App.tsx              # Hero, Background Remover, Tools roadmap, Footer
   ├─ index.css            # Zon theme: colors, fonts, glassmorphism, buttons
   ├─ assets/
   │  └─ Zon_1787488516571.png
   ├─ components/
   │  ├─ error-boundary.tsx
   │  └─ ui/
   │     ├─ card.tsx
   │     ├─ toast.tsx
   │     ├─ toaster.tsx
   │     └─ tooltip.tsx
   ├─ hooks/
   │  └─ use-toast.ts
   ├─ lib/
   │  └─ utils.ts
   └─ pages/
      └─ not-found.tsx
```

## Production SPA routing (refresh / direct URLs)

Zon is a single-page app (wouter). For production hosts, map unknown paths to `index.html` so routes like `/remover` or `/settings` work on refresh:

- **Vercel**: `rewrites` → `{ "source": "/(.*)", "destination": "/index.html" }` in `vercel.json`
- **Netlify**: `/*  /index.html  200` in `_redirects` or `netlify.toml`

Without this, a full page refresh on a client route may 404 at the server before React loads.
