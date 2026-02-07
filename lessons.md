# Lessons Learned & Architecture Decisions

This file accumulates knowledge to prevent regression.

## ⚠️ "Do Not Break" Rules
1. **Design Guidelines**: Always follow the Carbon Design System guidelines strictly. Minimalist B&W aesthetic.
2. **File Paths**: Use absolute paths when referencing files in tool calls.
3. **Tool Usage**: Do not assume tools exist unless verified.

## 🧠 Solved Problems
- None yet.
- **Node Compatibility**: The environment runs Node 25.6. Use latest versions of packages (e.g., Vite 6+). If compatibility issues arise, prompt the user to update their environment rather than downgrading packages.
- **Windows Shell**: When running `npm` commands via `run_command` on Windows, prepend `cmd /c` to bypass PowerShell execution policy restrictions (e.g., `cmd /c npm run lint`).
- **Carbon Design System**:
  - Requires `@carbon/styles/css/styles.css` import in `main.jsx`.
  - Default Vite `index.css` styles (centering, dark body) conflict with Carbon's Shell. Use a minimal reset or Carbon's own reset.
- **Packaging on Windows**: `electron-builder` may fail with exit code 1 if it cannot create symbolic links in its cache (`winCodeSign`). This often happens when building for multiple platforms or if multi-platform tools are extracted. However, the target platform build (e.g., `.exe`) might still succeed despite the error. To prevent this, run as Administrator or enable Windows Developer Mode.
- **Vite build and Electron**: Always run `vite build` before `electron-builder` to ensure `dist/` is up to date. The `electron:build` script should combine these: `"vite build && electron-builder"`.
