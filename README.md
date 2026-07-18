# Work Tracker

![Version](https://img.shields.io/badge/version-1.8.2-80b621) ![License](https://img.shields.io/badge/license-MIT-green)

**Work Tracker** is a local-first desktop app for consultants and knowledge workers who need to record what they actually did each day, keep tasks moving, and stay on top of utilisation — without timers, sign-ins, or a backend. Every entry is a plain Markdown file on your own disk.

Built with **Electron**, **React 19**, **Vite 7**, and **Material UI 7**, wrapped in a bold, high-contrast interface.

---

## Why it exists

Timesheets tell you _how long_. Work Tracker tells you _what_. You write a short daily log across three work streams, attach it to the projects and activities you're engaged on, and the app turns that into streaks, utilisation forecasts, throughput, and reporting — all derived from files you own and can read in any Markdown editor.

---

## Features

### 📝 Daily logging across work streams

Each day is a single Markdown file split into three streams:

- **Client Work** — billable, client-facing delivery
- **Practice Development** — internal capability, tooling, enablement
- **Business Development** — pitches, proposals, relationship building

Write freely in Markdown under each stream, tag entries, and link the work to the projects/activities you touched. Stream names, colours, and icons are configurable in Settings.

### 📅 Day statuses

Not every day is a working day. Mark a day as **Working**, **PTO**, **Sick**, or **Volunteering**. Non-working days are excluded from utilisation and streak maths and surfaced in the dashboard's wellbeing view.

### 📁 Projects & activities

Organise your work into a lightweight hierarchy:

- **Client Projects** group related client engagements.
- **Activities** (Client Work / Practice Dev / Business Dev) hold **tasks**, which in turn hold **subtasks**.
- Activities can be **nested** under a parent, assigned **team members**, marked **ongoing**, and moved through **active → completed → archived**.

Everything you log can be attributed to these, which powers stream alignment, collaborator insights, and throughput.

### ✅ Todos with ageing & rollover

A dedicated todo board tracks open tasks and subtasks pulled from your activities. Items show how long they've been open (**ageing**), important items are flagged, and uncompleted work rolls forward so nothing quietly disappears.

### 📊 Analytics dashboard

The dashboard surfaces everything the app tracks:

- **Dynamic hero** — a greeting plus a rotating "spotlight" insight (utilisation, streaks, tags, collaborators, momentum, wins…) that changes each time you open the app.
- **Vital signs** — logging streak, days logged, utilisation, work-life balance, tasks closed per week.
- **Utilisation cycle** — progress through the June→May fiscal cycle with a predicted-vs-target bar and STAFFIT hours declared per week.
- **Task throughput** — tasks closed per week plus backlog health and subtask progress.
- **Stream alignment & weekly intensity** — where your effort is going.
- **Momentum trends** — activity over time.
- **Tag insights** — a weighted cloud of your most-used tags.
- **Collaborators** — the people you work with most.
- **Wellbeing** — PTO / Sick / Volunteering taken this cycle.
- **The Journey** — a contribution-graph heatmap of logged days.
- **Needs attention**, **recent accomplishments**, and **current priorities**.

Sections stay hidden until there's data to fill them, so a fresh workspace stays clean.

### 📈 Utilisation & STAFFIT

Track billable utilisation against a configurable target across the fiscal cycle. Enter your **STAFFIT** hours declared per week and set your **standard weekly hours** (default 37.5); the app forecasts where you'll land relative to target.

### 📤 Reports & export

Generate summaries over any date range and export your data for sharing or archiving.

### 🖥️ System tray widget

A frameless always-on-top tray popup lets you jump straight into today's entry. Clicking **Start** opens the editor in the main window without hunting for it.

### 🎨 Theme & extras

- Light and dark themes with a bold, high-contrast aesthetic (Outfit + JetBrains Mono).
- In-app documentation.
- Automatic background updates.
- **Data ownership** — everything is local Markdown + JSON. Point it at a folder synced by Obsidian, Dropbox, or Git if you like.

---

## Data & file layout

Work Tracker never uses a database or server. Your chosen root directory holds:

```
[root]/
├── YYYY/MM/YYYY-MM-DD.md         # daily entry (frontmatter + 3 stream sections)
├── YYYY/MM/YYYY-MM-DD-todos.md   # per-day todo file
├── projects.json                 # client projects, activities, tasks, subtasks, team
├── staffitHours.json             # weekKey → declared hours
└── worktracker.config.json       # your work streams (names, colours, icons)
```

App-level preferences (utilisation target, standard weekly hours, notification time, window state) live separately in `settings.json` under Electron's `userData` folder, so they follow the machine rather than the workspace.

A daily entry looks like:

```markdown
---
tags: [dev, meeting]
dayStatus: working
projects:
  client-work: [acme-corp-rebuild]
---

# Client Work

Wrapped up the auth refactor on Acme Corp Rebuild.

# Practice Development

Wrote up notes on the new deployment pipeline.

# Business Development

Prepped the Northwind proposal deck.
```

Frontmatter is parsed with `gray-matter`; the three stream sections are parsed/serialised by `src/utils/markdownParser.js`.

---

## Getting started

### Install

Download the latest build for your platform from the [Releases page](https://github.com/Matthew7727/worktracker/releases).

### First run

1. Launch Work Tracker.
2. Choose a folder to store your logs (e.g. `~/Documents/WorkLogs`).
3. Start logging your day.

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/Matthew7727/worktracker.git
cd worktracker
npm install
```

### Run locally

The dev server and the Electron shell run separately. In two terminals:

```bash
npm run dev        # Vite dev server (also runnable standalone in a browser via the mock)
npm run electron   # Electron app pointed at the dev server
```

Running `npm run dev` on its own works in a plain browser too: `src/mocks/electronMock.js` supplies an in-memory fake filesystem when `window.electronAPI` isn't present.

### Other scripts

```bash
npm run lint            # ESLint (Prettier rules enforced)
npm run lint:fix        # auto-fix lint/format
npm run format          # Prettier
npm run build           # Vite production build
npm run electron:build  # build + package with electron-builder
```

---

## Architecture

| Layer         | Tech                                                                 |
| ------------- | ------------------------------------------------------------------- |
| Shell         | Electron 40 (main process registers all `fs:*`, `dialog:*`, `settings:*`, `update:*`, `widget:*` IPC handlers) |
| UI            | React 19 + Vite 7 + Material UI 7 (`@emotion`)                       |
| Routing       | `react-router-dom` `HashRouter` (required for Electron's `file://`) |
| Data          | Local Markdown + JSON via `gray-matter`; file watching via `chokidar` |
| Updates / log | `electron-updater`, `electron-log`                                   |

The renderer never touches the filesystem directly. All access flows through a strict IPC bridge: `electron/preload.js` exposes `window.electronAPI` via `contextBridge` (context isolation on, `nodeIntegration` off), and `src/services/fileSystem.js` wraps it for use in components.

---

## License

MIT.
