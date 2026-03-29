---
description: how to cut a new release for Work Tracker
---

## Release Workflow

The version is **always defined in `package.json`** — it is the single source of truth.
The Vite build injects it as `__APP_VERSION__` at compile time. Electron reads it via `app.getVersion()` at runtime.

### Steps to cut a new release

1. **Create a release branch** from `main` using the exact naming convention:
   ```
   git checkout -b release/vX.Y.Z
   ```

2. **Bump `package.json`** to the new version:
   ```
   npm version X.Y.Z --no-git-tag-version
   git add package.json package-lock.json
   git commit -m "chore: bump version to X.Y.Z"
   git push origin release/vX.Y.Z
   ```
   > This ensures the running dev server and browser mock both show the correct version immediately.

3. **Develop on the branch** as normal — merge feature branches into it via PRs.

4. **Open a PR: `release/vX.Y.Z` → `main`** when ready to ship.

5. **Merge the PR** — this triggers the `Release` workflow automatically:
   - Bumps `package.json` on `main` (idempotent if already correct)
   - Creates a `vX.Y.Z` git tag

6. **The `Build` workflow fires on the new tag**:
   - Builds the app for macOS and Windows via `electron-builder`
   - Publishes the `.dmg`/`.exe` and `latest-mac.yml`/`latest.yml` manifests to GitHub Releases

7. **Running instances auto-update**:
   - On next launch, installed apps call `checkForUpdatesAndNotify()`
   - `electron-updater` fetches `latest.yml` from GitHub Releases
   - If a newer version is found, download starts automatically
   - Users see the progress in **Settings → Application Updates**
   - After download: click **Restart & Install**

---

### Where version is displayed in the app

| Location | Source |
|---|---|
| Settings → Application Updates → "Current Version" | `electronAPI.getVersion()` → Electron `app.getVersion()` → `package.json` |
| Settings → About System | Same |
| Browser dev mode (mock) | `__APP_VERSION__` constant injected by Vite from `package.json` |

### Never hardcode a version string in a `.jsx` or `.js` source file.
