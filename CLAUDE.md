# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Start Vite dev server (browser mode with electron mock)
npm run electron       # Run Electron app (requires built or running Vite server)
npm run electron:build # Production build + package with electron-builder
npm run test           # Run all tests with Vitest
npm run test -- --reporter=verbose  # Run tests with verbose output
npx vitest run src/utils/markdownParser.test.js  # Run a single test file
npm run lint           # ESLint
```

For full local development, run `npm run dev` in one terminal and `npm run electron` in another.

## Architecture

This is an **Electron + React + Vite** desktop app. All data is stored as local Markdown files — no backend or database.

### IPC Bridge (Electron <-> React)

All file system access flows through a strict IPC boundary:

1. `electron/main.js` — Main process registers IPC handlers (`ipcMain.handle`) for all `fs:*`, `dialog:*`, `settings:*`, `update:*`, and `widget:*` channels.
2. `electron/preload.js` — Exposes `window.electronAPI` to the renderer via `contextBridge` (context isolation is enabled; `nodeIntegration` is false).
3. `src/services/fileSystem.js` — Thin renderer-side wrapper that calls `window.electronAPI.*`. Use this for file operations in components.

### Browser Dev Mode

`src/mocks/electronMock.js` is loaded unconditionally in `src/main.jsx` via `setupElectronMock()`. It sets up a fake `window.electronAPI` with in-memory mock files when `window.electronAPI` is not already defined (i.e., when running in a browser, not Electron). This allows `npm run dev` to work without Electron.

Tests use a separate vi.fn() mock in `src/setupTests.js`.

### Data Format

Files are stored at `[rootDir]/YYYY/MM/YYYY-MM-DD.md` (constructed by `src/utils/fileHelpers.js`).

Each daily entry is a Markdown file with gray-matter frontmatter:

```markdown
---
tags: [dev, meeting]
---

# Client Work

...

# Practice Development

...

# Business Development

...
```

Todo files follow the same path convention with a `-todos.md` suffix.

`src/utils/markdownParser.js` handles parse/stringify for both the frontmatter (via `gray-matter`) and the three work stream sections.

### Global State

`src/context/AppContext.jsx` provides:

- `selectedDirectory` — the root workspace path, persisted to `localStorage`
- `refreshTrigger` — incremented when `chokidar` detects external file changes
- `showNotification` / `hideNotification` — global snackbar

`src/context/ThemeContext.jsx` manages MUI theme (light/dark).

### Routing

Uses `HashRouter` (required for Electron's `file://` protocol). Routes: `/` (Dashboard), `/editor` (DailyEditor), `/todos` (TodoBoard), `/reports`, `/settings`, `/docs`, `/widget` (TrayWidget — rendered in the always-on-top system tray popup window).

The app gates all routes behind a `WelcomeScreen` until `selectedDirectory` is set.

### System Tray / Widget

`electron/main.js` creates two `BrowserWindow` instances: the main window and a small frameless `widgetWindow` (rendered at `/#/widget`). A `Tray` icon toggles the widget. Clicking "Start" in the widget fires the `app:start-flow` IPC event, which navigates the main window to `/editor`.
