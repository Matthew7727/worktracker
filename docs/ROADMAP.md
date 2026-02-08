# WorkTracker Roadmap

This document outlines the development roadmap for WorkTracker. It is a living document and should be updated as priorities change and versions are released.

## 📦 Version 1.0.0 (Current)
**Status:** Released / Stable
- Basic Daily Logging (Markdown based)
- Todo Board implementation
- Dashboard with basic stats
- Electron App shell with Auto-Update
- Dark Mode support

---

## 🚀 Version 1.1.0: Developer Experience & Code Quality
**Focus:** improve the "internal" quality of the project to make future feature development faster and safer.

### Coding Changes
- [ ] **Path Aliases**: Configure Vite and ESLint to support `@/` aliases (e.g., `@/components`, `@/utils`) to replace deep relative imports (`../../`).
- [ ] **Electron Refactor**: Split `electron/main.js` into modular handlers (e.g., `ipc/filesystem.js`, `ipc/updater.js`) to prevent the main file from becoming unmanageable.

### DevEx Improvements
- [ ] **Prettier Integration**: Add Prettier for consistent code formatting.
- [ ] **Husky & Lint-Staged**: Implement git hooks to ensure linting and formatting pass before commits.
- [ ] **VS Code Settings**: Standardize `.vscode/settings.json` to enable format-on-save for all contributors.

### Testing Strategy
- [ ] **Unit Test Expansion**: Increase code coverage for `utils` helper functions to >80%.
- [ ] **Component Testing**: Add basic render tests for all shared components in `src/components/Layout`.

---

## ✨ Version 1.2.0: User Experience & Customization
**Focus:** Give users more control over their data and view.

### New Features
#### Productivity
- [ ] **Pomodoro Timer**: Integrated timer in the dashboard to track focus sessions.
- [ ] **Daily Templates**: Pre-configured templates for daily logs (e.g., "Standup", "Retrospective").
- [ ] **Voice Memos**: Ability to record and embed audio notes in daily logs.

#### Organization
- [ ] **Tags & Categories**: Tag daily logs and todos for better filtering and searching.
- [ ] **Global Search +**: Advanced search with filters for date ranges, tags, and content types.

#### UX Improvements
- [ ] **Customizable Dashboard**: Allow users to toggle, reorder, or resize widgets on the Dashboard (Drag & Drop).
- [ ] **Calendar View**: A visual calendar component to browse past daily logs instead of just list navigation.
- [ ] **Rich Text Editor Upgrade**: Improve the markdown editor with slash commands or a toolbar.

### Coding Changes
- [ ] **Theme System Enhancement**: Allow users to pick "Accent Colors" in addition to Light/Dark mode.

---

---

## 🧠 Version 1.3.0: Insights & Intelligence
**Focus:** Leverage data and AI to provide actionable feedback.

### Features
- [ ] **Advanced Stat Tracking**: Detailed charts for commit history, focus time, and task completion trends.
- [ ] **AI Entry Analysis (Gemini)**: Use Gemini API to summarize weekly/monthly work, detect burnout patterns, and suggest improvements.
- [ ] **Natural Language Querying**: Ask "What did I work on last Tuesday?" using AI.

---

## 🛠 Version 2.0.0: Robustness & Scale
**Focus:** Major architectural improvements for long-term maintenance.

### Testing Strategy
- [ ] **End-to-End (E2E) Testing**: Implement **Playwright** for Electron to test full user flows (App Open -> Write Log -> Close).
- [ ] **Visual Regression Testing**: Ensure UI components don't break visually across updates.

### New Features
- [ ] **Data Export/Import**: Add functionality to export all data (Markdown + JSON) to a ZIP file and restore from it.
- [ ] **Cloud Sync (Optional)**: Investigate syncing mechanisms (Git-backed sync or cloud storage provider) for multi-device support.
- [ ] **Plugin System**: Allow users to write small JS plugins to extend dashboard widgets.
- [ ] **Plugin System**: Allow users to write small JS plugins to extend dashboard widgets.

---

## 🧪 Ongoing Testing Strategy

### Unit Testing (`vitest`)
- **When**: Run on every commit (via Husky) and PR.
- **What**: Utility functions, hooks, and isolated component logic.
- **Goal**: Ensure business logic remains correct.

### Integration/Component Testing (`@testing-library/react`)
- **When**: Run on PRs.
- **What**: Complex components (e.g., TodoBoard, DailyEditor).
- **Goal**: Verify components interact correctly with user inputs and props.

### E2E Testing (`playwright` - *Planned*)
- **When**: Run before Release.
- **What**: Critical paths (Startup, Data Persistence, Update Flow).
- **Goal**: Ensure the compiled app works as expected.
