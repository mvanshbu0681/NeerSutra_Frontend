# Architecture & Maintainer Map

A practical map of *where everything lives* so changes are fast and safe.
This reflects the codebase after the Dec/Jun cleanup pass. Pair it with
`SYSTEM_CONTEXT.md` (the domain/design spec) — this file is the **code layout**.

> TL;DR mental model: there are **two trees**. `app/` is the legacy
> landing-site + chatbot (mostly `.jsx`). `src/` is the newer typed
> data/engine layer (`.ts`) that powers the **NeerSutra** dashboard. The
> dashboard UI lives in `app/neersutra/` and pulls its data from `src/`.

---

## 1. Routes (Next.js App Router)

Every route is a thin wrapper in `app/(route)/<name>/page.js` that renders a
component from `app/pages/`. To find the code behind a URL, start there.

| URL | Wrapper | Renders | Notes |
|-----|---------|---------|-------|
| `/` | `app/page.js` | `HeroSection` + `Components/Navigation` | Landing. Background video `main.mp4` (+ poster). |
| `/about` | `app/(route)/about/page.js` | `Components/About` | Background image `About.jpg`. |
| `/floaters` | `app/(route)/floaters/page.js` | `pages/FloatersPage` → `FloaterScene` | 3D/video float showcase. |
| `/map` | `app/(route)/map/page.js` | `pages/MapPage` → `Components/Map` | Google Maps. Heavy route (~456 kB). |
| `/visuals` | `app/(route)/visuals/page.js` | `pages/VisualsPage` → `MissionDashboard` | `MissionDashboard` is **lazy-loaded** (recharts). |
| `/chatbot` | `app/(route)/chatbot/page.js` | `pages/ChatbotPage` → `Chatbot/ChatInterface` | RAG chat UI. |
| `/neersutra` | `app/neersutra/page.tsx` | `NeerSutraLayoutV2` | Fleet/ops cockpit. Heaviest route (~611 kB). |
| `/neersutra/pfz` | `app/neersutra/pfz/page.tsx` | `PFZLayout` | Potential Fishing Zones. |
| `/neersutra/che` | `app/neersutra/che/page.tsx` | `CHELayout` | Coastal Health Engine. |
| `/neersutra/ews` | `app/neersutra/ews/page.tsx` | `EWSLayout` | Early Warning System. |
| `/api/copernicus` | `app/api/copernicus/route.js` | — | Server route. Reads `public/Data_Fields/*.json`. |

**Navigation:** site-wide top nav is `app/Components/Navbar.jsx` (auto-hides on
`/neersutra`). The landing hero nav is `app/Components/Navigation.jsx`.

---

## 2. Directory responsibilities

```
app/
  page.js, layout.js, globals.css   App shell, root route, global styles
  (route)/<name>/page.js            URL → page wrappers (thin)
  pages/                            Page-level components rendered by routes
  Components/                       Landing + chatbot UI (.jsx)
    Chatbot/                        Chat UI (ChatInterface, ChatWindow, ...)
    FloatPopup/, FisheryPopup/      Map/data popups
    DatePicker/
  neersutra/                        The NeerSutra dashboard (the "app")
    NeerSutraLayoutV2.tsx           Active cockpit layout (V1 was deleted)
    pfz/ che/ ews/                  One folder per module: page + Layout + components/
    components/                     Shared dashboard UI (HUD/, Map/, GlassCard, ThemeProvider)
    store/                          UI-only Zustand stores (time, route, map view)
    styles/, types/
  utils/                            Plain-JS API clients + gsap helpers
  hooks/                            useDashboardData (aggregator)
  api/copernicus/route.js          Server route (file-backed data proxy)

src/                                Typed data/engine layer (the brains)
  config/env.ts                     Centralized env access (all NEXT_PUBLIC_*)
  lib/{pfz,che,ews}/engine.ts       Pure compute: forecasts, grids, simulations
  lib/{pfz,che,ews}/types.ts        Domain types + constants
  store/{usePFZ,useCHE,useEWS}Store.ts   Canonical DATA stores (Zustand)
  components/ui/AsyncView.tsx       Loading/error/empty wrapper

public/                             Static assets (now ~21 MB, was ~79 MB)
```

---

## 3. Data flow for a dashboard module (PFZ / CHE / EWS)

```
src/lib/<mod>/engine.ts   ──compute──▶   src/store/use<MOD>Store.ts   ──read──▶   app/neersutra/<mod>/components/*
   (pure functions)                          (Zustand state)                         (render maps/charts)
```

- **Engines are pure** — given inputs they return data; no React, no side effects.
  They can be CPU-heavy (CHE/PFZ grids) so memoize at the call site (`useMemo`).
- **`src/store/*` = data**, **`app/neersutra/store/*` = UI** (current time, selected
  route, map viewport). Keep that split; don't put data in the UI stores.
- Map panels are loaded with `next/dynamic({ ssr: false })` so deck.gl/maplibre
  stay out of the initial bundle. **Follow this pattern for any new heavy panel.**

---

## 4. Conventions (please keep these)

- **Heavy libs (deck.gl, maplibre, three, recharts, gsap) → `next/dynamic`.**
  See `app/pages/VisualsPage.jsx` and the neersutra map panels for the pattern.
- **Assets:** keep `public/` lean. Videos = H.264 CRF ~30, no audio, `+faststart`,
  with a `poster`. Logos/photos ≤ what they render at; prefer `.jpg/.webp` over
  multi-MB `.png`/embedded-raster `.svg`. (Original heavy assets are archived in
  the gitignored `_asset_backups_original/`.)
- **Env:** read everything through `src/config/env.ts`. Only `NEXT_PUBLIC_*` reaches
  the browser — never put a true secret behind that prefix. Domain-restrict the
  Google Maps & MapTiler keys in their consoles (they ship to the client).
- **Server routes:** log real errors server-side, return generic messages to clients
  (see `app/api/copernicus/route.js`).

---

## 5. Known remaining opportunities (not yet done — safe-first scope)

1. **Unify `app/` ↔ `src/`.** Long-term, move shared code into `src/` and convert
   landing `.jsx` → `.tsx` for one consistent, typed tree. Do this incrementally
   with a green `next build` after each move.
2. **`/neersutra` (611 kB) & `/map` (456 kB)** are the heaviest routes. Panels are
   already split; further wins need deferring deck.gl layer imports inside panels.
3. **Stray parent lockfile.** `../package.json` + `../package-lock.json` (in the
   folder *above* this app) are leftovers; Next's workspace-root warning is silenced
   via `outputFileTracingRoot` in `next.config.mjs`, but deleting those two stray
   files is the clean fix.
4. **`README.md`** still has placeholder text — replace with real run/setup notes.
5. **`COPERNICUS_API_KEY`** in `src/config/env.ts` is declared but unused; if you
   ever use Copernicus, call it from a **server** route, not a `NEXT_PUBLIC_` var.
```
