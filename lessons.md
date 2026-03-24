# Lessons Learned & Architecture Decisions

This file accumulates knowledge to prevent regression.

## ⚠️ "Do Not Break" Rules

1. **Design Guidelines**: Always follow the Carbon Design System guidelines strictly. Minimalist B&W aesthetic.
2. **File Paths**: Use absolute paths when referencing files in tool calls.
3. **Tool Usage**: Do not assume tools exist unless verified.

## 🧠 Solved Problems

- None yet.
- **MUI Theme in Production**: When using `createTheme`, explicitly define nested objects like `palette.action` even if using defaults. In production builds (especially with Vite/Electron), tree-shaking or minification might cause issues if internal components try to access these properties on an undefined object (e.g., `reading 'active'`).
- **Gradients in MUI Themes**: Use `backgroundImage: 'linear-gradient(...)'` instead of `background` shorthand within `styleOverrides`. Emotion or MUI's color manipulator might try to parse the string as a color if strictly assigned to `background`, leading to parsing errors like `reading 'match'` on undefined values during build optimization.
- **Theme Stability**: Dark mode implementation with dynamic request/context can introduce subtle runtime errors in production builds. For this iteration, we reverted to a static Light Theme to ensure stability and eliminate `undefined` property access errors.
- **MUI Dialogs in Electron**: If inputs in a Dialog are non-interactive or "unclickable", it may be due to z-index layering or focus trapping conflicts. Fix by increasing `zIndex` (e.g., 9999) and adding `disableEnforceFocus` and `disableRestoreFocus` props to the Dialog component.
- **Inputs in Scrollable Areas**: In Electron, inputs within scrollable or complex flex containers may lose interactivity. Explicitly adding `className="nodrag"`, `pointerEvents: 'auto'`, and `onMouseDown={(e) => e.stopPropagation()}` to the input container usually resolves this.
- **Date Navigation Constraints**: When implementing date navigation, implementing strict future-date blocking reinforces rollover logic by ensuring users can only move forward as real time progresses.

- **Windows Shell**: When running `npm` commands via `run_command` on Windows, prepend `cmd /c` to bypass PowerShell execution policy restrictions (e.g., `cmd /c npm run lint`).
- **Carbon Design System**:
  - Requires `@carbon/styles/css/styles.css` import in `main.jsx`.
  - Default Vite `index.css` styles (centering, dark body) conflict with Carbon's Shell. Use a minimal reset or Carbon's own reset.
- **Packaging on Windows**: `electron-builder` may fail with exit code 1 if it cannot create symbolic links in its cache (`winCodeSign`). This often happens when building for multiple platforms or if multi-platform tools are extracted. However, the target platform build (e.g., `.exe`) might still succeed despite the error. To prevent this, run as Administrator or enable Windows Developer Mode.
- **Vite build and Electron**: Always run `vite build` before `electron-builder` to ensure `dist/` is up to date. The `electron:build` script should combine these: `"vite build && electron-builder"`.
- **Window Sizing**: When designing for a "compact" dashboard with multiple columns, standard 1200x800 may be too tight. Increasing to 1300x900 provides necessary breathing room for 4-column grids without cramping.
