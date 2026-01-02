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
