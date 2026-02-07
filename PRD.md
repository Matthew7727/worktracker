# Product Requirements Document (PRD) - Work Tracker

## 1. Introduction
The **Work Tracker** is a cross-platform desktop application designed to help professionals track their weekly work, analyze their productivity over time, and generate evidence for career progression (e.g., yearly promotions). The tool emphasizes a minimalistic design and a non-time-based, free-text entry approach.

## 2. Core Value Proposition
- **Effortless Tracking**: Log work as free text. No rigid time blocks.
- **Evidence Gathering**: Tag entries to compile data for specific projects or skills.
- **Data Ownership**: Direct manipulation of local Markdown files. Your data lives in your folder, compatible with Notion or Obsidian out of the box.
- **Focus**: A distraction-free, black-and-white UI using the **Carbon Design System**.

## 3. User Personas
- **The Developer/Professional**: Needs to track contributions and justify promotions but hates rigid time-tracking. Wants their data to be portable and editable in other tools like Obsidian.

## 4. Functional Requirements

### 4.1. Platform Support & Installation
- **Bootable Desktop App**:
    - Distributed as `.exe` (Windows) and `.dmg` (macOS).

### 4.2. Onboarding & Data
- **Designated Folder**: Upon first launch, the user must select a directory where all data will be stored.
- **File Structure**:
    - The app will read/write directly to Markdown files in this folder.
    - *Proposed Structure*: `[Root]/YYYY/MM/YYYY-MM-DD.md`

### 4.3. Entry Management
- **Daily Entries**:
    - Users can create/edit entries for any day.
    - **Free Text**: Main content is free-form Markdown.
    - **Metadata**: Each entry (or block within a daily file) must capture a creation timestamp (hidden or visible, but persisted).
- **Tagging**:
    - Tags are stored in the file (e.g., YAML frontmatter or inline `#tags`).
    - Tags are the primary source of color/organization in the UI.

### 4.4. Data Visualization & Reporting
- **Views**:
    - **Daily View**: Editor focus.
    - **Weekly/Monthly/Yearly**: Aggregated views of work.
- **Reports View**:
    - A dedicated "Stats & Data" page.
    - **Filtering**: Filter by Date Range AND/OR Tags (e.g., "Show me everything tagged 'Leadership' in Q3").
    - **Export**: Ability to export the *report* itself (e.g., as a summary PDF or Markdown file) from this view.

### 4.5. User Interface (UI) / User Experience (UX)
- **Design System**: **Carbon Design System** (by IBM).
- **Aesthetic**:
    - **Minimalistic**: Black and White predominantly.
    - **Theming**: Light and Dark mode support.
    - **Color**: Used *only* for tags.

## 5. Technical Architecture

- **Framework**: [Electron](https://www.electronjs.org/) (with Electron Forge/Builder for .exe/.dmg).
- **Frontend library**: [React](https://react.dev/) + [Vite](https://vitejs.dev/).
- **UI Component Library**: [Carbon Design System](https://carbondesignsystem.com/) (`@carbon/react`).
- **Data Layer**:
    - **File System (fs)**: Direct read/write to user's disk.
    - **Parsing**: `gray-matter` (for frontmatter) or similar for parsing Markdown files into app state.
    - **Chokidar**: Watch for file changes if edited externally (e.g., in Obsidian) to update UI in real-time.

## 6. Open Questions
1. **Granularity of Entries**: Should a "Daily File" contain multiple "Entries" (e.g., created at 10:00, 14:00), or is the whole day one big text blob? *Assumption based on "timestamp" request: A day can have multiple distinct entries, likely separated by headers or strict delimiters in the markdown file.*
2. **Report Export Format**: What format should the "Reports" be exported in? PDF? CSV? Markdown summary?

## 7. Roadmap
1. **Phase 1**: Project setup (Electron + Vite + Carbon).
2. **Phase 2**: Implement File System Handler (Read/Write/Watch Markdown).
3. **Phase 3**: Build Daily Editor with Tagging support.
4. **Phase 4**: Dashboard Views (Weekly -> Yearly).
5. **Phase 5**: Reports View & aggregated exports.
6. **Phase 6**: Packaging (.exe / .dmg) and Release.
