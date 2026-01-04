# GitHub Copilot Instructions — ColorGameRoyale

Short, practical guidance for AI coding agents working in this repo. Focus on the files, patterns, and commands you must know to be productive immediately.

## Big picture
- Single-page frontend built with Vite + React + Tailwind. App entry: [src/main.jsx](src/main.jsx#L1).
- Main game surface is the `ColorGameRoyale` page: [src/pages/ColorGameRoyale.jsx](src/pages/ColorGameRoyale.jsx#L1). It orchestrates game state, persistence, and high-level rules.
- UI is componentized under `src/components/game/` (gameplay) and `src/components/ui/` (shared primitives). Examples: `GameBoard.jsx`, `GameHUD.jsx`, `ChampionSelect.jsx`.
- Small adapter layer under `src/api/` (Base44 integration): `base44Client.js`, `entities.js`, `integrations.js`.

## Architecture & data flow (how pieces interact)
- User actions → page state (`ColorGameRoyale.jsx`) → child components (`GameBoard`, `GameHUD`). Components receive props + callbacks; they do not use global stores.
- Persistence: save/load uses `src/utils/saveSystem.jsx` and localStorage key `colorGameRoyale_save` (see `ColorGameRoyale.jsx`).
- External comms: `src/api/*` adapts app objects to the Base44 SDK. The Vite plugin `@base44/vite-plugin` and env `BASE44_LEGACY_SDK_IMPORTS` affect import shims (see `vite.config.js`).

## Developer workflows & commands
- Dev server: `npm run dev` (Vite). Test production build: `npm run build` then `npm run preview`.
- Linting: `npm run lint` (fix: `npm run lint:fix`).
- Type-check: `npm run typecheck` (project uses `jsconfig.json` + `tsc`).
- No automated unit tests are present; use manual browser testing or build+preview for production behavior checks.

## Project conventions & patterns (do this here)
- Imports: use path alias `@/` (configured in `jsconfig.json`). Example: `import GameBoard from '@/components/game/GameBoard.jsx'`.
- Local-first state: prefer component-local state and passing callbacks up; avoid introducing global state managers unless necessary.
- UI primitives: reuse components in `src/components/ui/` (buttons, dialogs, form controls) rather than creating custom UI for small changes.
- Persistence key: do not rename `colorGameRoyale_save` without updating `src/pages/ColorGameRoyale.jsx` and `src/utils/saveSystem.jsx`.
- HMR hooks: `src/main.jsx` emits `sandbox:beforeUpdate` / `sandbox:afterUpdate` — maintain those messages if changing HMR behavior.

## Integrations & gotchas
- Base44 SDK: do not remove or alter `@base44/vite-plugin` in `vite.config.js` without scanning `src/api/` and `src/lib/` for legacy import usage.
- Environment flag: `BASE44_LEGACY_SDK_IMPORTS === 'true'` toggles legacy import shims used by the plugin.
- If you change SDK import surface, update adapters in `src/api/` and any usage in `src/lib/app-params.js` or `src/lib/AuthContext.jsx`.

## Typical agent tasks & examples
- Add a new gameplay component: create `src/components/game/NewThing.jsx`, export default, then import using alias in `ColorGameRoyale.jsx`.
- Fix a UI bug: look in `src/components/game/` and `src/components/ui/`. Use `npm run dev` and the browser console for runtime traces.
- Investigate save issues: inspect `src/utils/saveSystem.jsx` and `src/pages/ColorGameRoyale.jsx` localStorage handling.

## Files to inspect first (quick checklist)
- [src/pages/ColorGameRoyale.jsx](src/pages/ColorGameRoyale.jsx#L1) — central game logic and persistence.
- [src/components/game/GameBoard.jsx](src/components/game/GameBoard.jsx#L1) — board rendering & core interactions.
- [src/components/game/GameHUD.jsx](src/components/game/GameHUD.jsx#L1) — in-game controls and HUD state.
- [src/api/base44Client.js](src/api/base44Client.js#L1) — SDK adapter; important if touching integrations.
- [vite.config.js](vite.config.js#L1) — Vite plugins & BASE44 legacy flag.

---

## Agent notes
- Keep changes minimal and focused; follow existing `src/components/ui/` patterns for UI.
- Run `npm run lint` and `npm run typecheck` before proposing code changes — include outputs if you submit edits.

If you'd like, I can expand this file with a short migration checklist for removing `@base44/vite-plugin` or add recommended PR checklists.
# GitHub Copilot Instructions — ColorGameRoyale

Short, actionable guidance for AI coding agents working in this repository.

## Big picture
- Frontend React app built with Vite + Tailwind. Entry is `src/main.jsx`.
- Game UI and logic live in `src/pages/ColorGameRoyale.jsx` and the `src/components/game/` folder.
- Small API/adapter layer under `src/api/` integrates with the Base44 platform and other services.

## Key files & folders
- `package.json` — scripts and deps (use `npm run dev`, `build`, `preview`).
- `vite.config.js` — includes `@base44/vite-plugin`; keep this unless migrating SDK imports.
- `jsconfig.json` — path alias `@/*` → `src/*` (use `import Foo from '@/path'`).
- `src/components/game/` — core game components (ChampionSelect, GameBoard, GameHUD, etc.).
- `src/pages/ColorGameRoyale.jsx` — central game state, save/load (uses localStorage `colorGameRoyale_save`).

## Build / dev / lint workflows
- Start dev server: `npm run dev` (Vite). Use `npm run preview` after `npm run build` to preview production output.
- Lint: `npm run lint`; auto-fix: `npm run lint:fix`.
- Type-check: `npm run typecheck` (uses `jsconfig.json` + `tsc`).

## Project-specific conventions
- Path aliasing: always import app-local modules with `@/...` (see `jsconfig.json`). Example: `import App from '@/App.jsx'` (see `src/main.jsx`).
- Minimal global state: the main page handles game state locally (no global redux). Prefer component props and callbacks.
- Persistence: game saves are stored via localStorage under key `colorGameRoyale_save` in `src/pages/ColorGameRoyale.jsx`.
- HMR/sandbox hooks: `src/main.jsx` posts `sandbox:beforeUpdate` / `sandbox:afterUpdate` messages to parent — be careful when modifying hot-update behavior.

## Integrations & environment flags
- Base44 SDK is used (`@base44/sdk`) and a Vite plugin (`@base44/vite-plugin`) to support legacy import shims. The plugin reads `process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'` in `vite.config.js`.
- Do not remove or change the plugin without verifying SDK import paths across `src/api/` and `src/lib/`.

## Debugging tips
- Use browser devtools for runtime issues. The game's logic is mostly in `src/pages/ColorGameRoyale.jsx` and component files under `src/components/game/`.
- To reproduce production-only bugs, run `npm run build` then `npm run preview` and inspect the served `dist` output.

## Contribution & change guidance for AI agents
- Keep changes minimal and focused. Follow existing patterns in `src/components/ui/` for UI primitives.
- Run `npm run lint` and `npm run typecheck` before suggesting changes; include the exact script output if errors occur.
- If altering SDK imports, update or remove `@base44/vite-plugin` only after scanning `src/api/` and `src/lib/` for legacy import usages.

## Examples (quick references)
- Import alias: see [src/main.jsx](src/main.jsx#L1).
- Vite plugin config: see [vite.config.js](vite.config.js#L1).
- Save/load and localStorage key: see [src/pages/ColorGameRoyale.jsx](src/pages/ColorGameRoyale.jsx#L1).

If any section is unclear or you'd like more detail (tests, CI, or a migration plan for Base44 SDK), tell me which part to expand.
