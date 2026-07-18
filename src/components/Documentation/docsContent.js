export const docsContent = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
# Getting Started

This guide explains how each part of Work Tracker works and how the pieces fit together. Start here for the lay of the land, then dive into the feature you need.

### Choosing a workspace
On first launch you pick a **workspace folder**. This is where every file the app creates lives — daily entries, todos, projects, and configuration. Nothing is stored in a database or the cloud; the folder *is* the app's storage.

You can point the app at a folder synced by Dropbox, Google Drive, or Git to keep your data backed up or shared across machines. To switch workspaces later, use **Settings → Change Workspace**. The current path is remembered in \`localStorage\`, so the app reopens where you left off.

### The main navigation
The left sidebar is your map:

- **Dashboard** — analytics and insights derived from everything you log.
- **Entries** — the daily editor where you record your work.
- **Activities** — projects, activities, tasks, and subtasks.
- **Workspace** — a read-only explorer of your entire history.
- **Settings** — streams, utilisation, notifications, updates.
- **Docs** — this documentation.

A global search box lets you jump to any day that matches your query. There's also a **system tray widget** for logging without opening the full window (see *Tray Widget*).

### A typical day
1. Open **Entries** and start today's log.
2. Write what you did under each work stream, tag the projects/activities you touched, and set the day's status.
3. The file saves itself as you type.
4. Check the **Dashboard** to see your streak, utilisation forecast, and throughput update in real time.
`,
  },
  {
    id: 'daily-entries',
    title: 'Logging Your Day',
    content: `
# Logging Your Day

The **Entries** page (the Daily Editor) is where you record what you actually did. It walks you through a structured flow so you end up with a complete, consistently formatted log.

### The guided flow
Opening the editor shows your week. Pick a day and click **Start**.

The editor then steps you through your day one section at a time, grouped by your **work streams**. A progress bar tracks where you are; use **Next** / **Back** to move between steps or jump directly to one. Each step is a free-text Markdown field — write as much or as little as you like.

### Setting the day's status
Every day carries a **status** so non-working days don't distort your stats:

- **Working** — a normal day of logged work.
- **PTO** — annual leave / holiday.
- **Sick** — sick leave.
- **Volunteering** — volunteering or charity days.

Non-working days are excluded from streak and utilisation calculations and are counted in the Dashboard's *Wellbeing* view.

### Tagging projects & activities
Coloured chips represent your active projects and activities, each tinted with its stream's colour. **Click a chip to link** it to today's entry; click again to unlink. These links are written into the file's frontmatter, which is what lets the Dashboard and Workspace Explorer connect a day to the work it belonged to.

You can also add free-form **tags** (e.g. \`meeting\`, \`review\`, \`travel\`). Tags are aggregated on the Dashboard's *Tag Insights* widget.

### Auto-save
You never press Save mid-session. The editor watches your keystrokes, waits for a **500 ms pause** (a debounce), then writes the file to disk. Switching days or steps also flushes the current text.

### Markdown support
Entries support GitHub-Flavored Markdown:

- **Bold** — \`**text**\`
- *Italic* — \`*text*\`
- \`Code\` — backticks
- Lists — \`- item\` or \`1. item\`
- Headings — \`# H1\`, \`## H2\`

Because entries are plain \`.md\` files, they render correctly in Obsidian, VS Code, or any Markdown viewer.
`,
  },
  {
    id: 'streams',
    title: 'Work Streams',
    content: `
# Work Streams

**Streams** are the top-level buckets your day is divided into. Out of the box Work Tracker uses the classic consulting split:

- **Client Work** — billable, client-facing delivery.
- **Practice Development** — internal capability, tooling, enablement.
- **Business Development** — proposals, pitches, relationships.

Each stream has a **name**, a **colour**, and an **icon**, all editable in **Settings → Work Streams**. Those colours flow through the whole app — chips in the editor, stream tabs on the Activities board, and every chart on the Dashboard.

### How streams map to files
Each stream becomes an \`# H1\` section inside your daily \`.md\` file, named after the stream. \`src/utils/markdownParser.js\` reads and writes these sections, so renaming a stream is safe:

- Renaming keeps the **old name as an alias**, so historical files still parse correctly.
- Streams are **archived, never deleted** — your history stays intact.
- Existing pre-1.8 workspaces are detected automatically and keep the classic three-stream layout with no changes to old files.

### The main-goal stream
One stream can be designated your **main goal** — typically Client Work. This is the stream your **utilisation target** measures against (see *Utilisation & STAFFIT*) and the one whose completed projects feed the Dashboard's *Recent Accomplishments*.

Stream configuration lives in \`worktracker.config.json\` at the workspace root, so it travels with your data across devices.
`,
  },
  {
    id: 'projects-activities',
    title: 'Projects & Activities',
    content: `
# Projects & Activities

The **Activities** page is where you manage ongoing work — the things you tag in daily entries and track over weeks and months.

### Projects vs activities
- **Client Projects** are **dated engagements** with a start, an end, and a status. Completing one records a completion date and surfaces it in the Dashboard's *Recent Accomplishments*.
- **Activities** are ongoing initiatives in your other streams (learning, enablement, internal work) that don't have a fixed end date.

Both take the colour of their stream and appear as chips in the Daily Editor.

### Tasks & subtasks
Every project and activity can hold a checklist of **tasks**, and each task can hold **subtasks**. Tasks carry:

- A **completed** flag (with a brief grace period after ticking, so an accidental tick is easy to undo).
- An **important** flag.
- **Created** and **completed** timestamps, which power ageing and throughput analytics.

Open tasks and their ageing feed the Dashboard's *Task Throughput* and *Current Priorities* widgets.

### Team members
Assign **team members** to a project or activity from its detail page. The people you collaborate with most often are ranked on the Dashboard's *Collaborators* widget.

### Nesting
Activities can be **nested** under a parent activity, letting you group related workstreams into a hierarchy while still tracking each piece individually.

### The lifecycle
Every item moves through three states, switchable from its card menu or detail page:

- **Active** — currently in flight.
- **Completed** — done; records a completion date.
- **Archived** — removed from active lists without losing history.

Filter tabs at the top of the board switch between these states and between streams. A **stale warning** flags a project that's been active for more than 30 days without completing — a nudge to wrap it up or archive it.

### How it connects
Everything here is stored in \`projects.json\` at the workspace root. When you tag a project or activity in the Daily Editor, that link is written into the day's frontmatter — which is how the Dashboard turns your logs into stream alignment, collaborator, and throughput insights.
`,
  },
  {
    id: 'dashboard',
    title: 'The Dashboard',
    content: `
# The Dashboard

The Dashboard is a live analysis of everything you've logged. Sections stay hidden until there's data to fill them, so a new workspace stays clean and reveals more as you build history.

### Dynamic hero
A narrative greeting at the top: a time-of-day salutation plus the projects you're currently engaged on. Beneath it, a **rotating spotlight** highlights one real insight drawn from your data — utilisation, streaks, tags, collaborators, momentum, recent wins, and more. The spotlight **advances each time you open the app**, so you see a different angle on your work from visit to visit.

### Vital signs
A strip of headline stats: your **logging streak**, **days logged**, **utilisation**, **work-life balance**, and **tasks closed per week**. Tiles with no data are hidden automatically.

### Utilisation cycle
Progress through the **June → May fiscal cycle**, with a bar showing your **predicted** utilisation against your **target** and a marker for where the target sits. Below it, a mini bar chart shows **STAFFIT hours declared per week** across the cycle so far.

### Task throughput
**Tasks closed per week** over the last eight weeks, plus **backlog health** — open vs closed counts and overall subtask progress — so you can see whether you're keeping pace or accumulating a backlog.

### Stream alignment & weekly intensity
How your effort is split across your streams, scored against an even balance, with a day-by-day intensity chart for the current week.

### Momentum trends
Your activity volume over time, so you can spot ramps and lulls.

### Tag insights
A weighted cloud of your most-used tags from roughly the last 90 days — larger tags mean more frequent use.

### Collaborators
The team members you've worked with most, ranked, each with a coloured initials avatar.

### Wellbeing
**PTO**, **Sick**, and **Volunteering** days taken this cycle, drawn from your daily statuses — a quick read on whether you're taking time off.

### The Journey
A contribution-graph heatmap of every logged day. Darker squares mean more activity; it's an at-a-glance view of long-term consistency. It unlocks once you've logged enough days.

### Needs attention, accomplishments & priorities
- **Needs Attention** — stale projects and items that need a decision.
- **Recent Accomplishments** — a timeline of recently completed projects and activities.
- **Current Priorities** — your active work with age indicators so nothing sits too long.
`,
  },
  {
    id: 'utilisation-staffit',
    title: 'Utilisation & STAFFIT',
    content: `
# Utilisation & STAFFIT

Work Tracker forecasts your billable **utilisation** across the fiscal cycle so you can see, early, whether you'll land on target.

### The fiscal cycle
The cycle runs **June to May**. All utilisation maths — the prediction, the weekly bars, and the wellbeing counts — are scoped to the current cycle.

### STAFFIT hours
Enter the hours you've **declared** each week. These are stored in \`staffitHours.json\` as a map of week → hours. Each week is keyed consistently so a given week always lines up with the right bar on the Dashboard.

### Standard weekly hours
In **Settings** you set your **standard weekly hours** (default **37.5**). This is your capacity baseline — the denominator the prediction divides declared hours by.

### The prediction
Your predicted utilisation is the average, across the weeks elapsed this cycle, of *declared hours ÷ standard weekly hours*. The Dashboard's **Utilisation Cycle** widget plots this prediction against your **utilisation target** (default **70%**), and the **vital signs** strip shows whether you're above or below target at a glance.

Non-working days (PTO, sick, volunteering) don't count against you — capacity is measured in whole weeks, and time off is reported separately in *Wellbeing*.
`,
  },
  {
    id: 'workspace-reports',
    title: 'Workspace Explorer & Reports',
    content: `
# Workspace Explorer & Reports

### Workspace Explorer
The **Workspace** page is a read-only window into your entire history. It's a split view:

- **Left** — a directory tree of your workspace, organised by year and month.
- **Right** — the selected entry rendered as formatted Markdown, with its linked project/activity chips shown in their stream colours.

Use it to review a period, check what was tagged to a project before archiving it, or gauge how consistent your output has been. To *change* an entry, use the Daily Editor — the explorer never edits.

### Search
The global search box scans every file in your workspace with a simple case-insensitive linear pass. Because your data is local, thousands of files scan in milliseconds. Matches include text stored in frontmatter (tags, linked projects), and clicking a result jumps you to that day.

### Reports & export
The **Reports** page turns a date range into a shareable summary and lets you export your data:

- **Markdown (\`.md\`)** — compiles the selected entries into one chronological document, ideal for performance reviews or archiving a period. Paste it straight into Notion or Obsidian.
- **JSON (\`.json\`)** — the raw structured data, including frontmatter metadata, for custom scripts or migrating elsewhere.
`,
  },
  {
    id: 'settings',
    title: 'Settings & Configuration',
    content: `
# Settings & Configuration

### Work streams
Rename streams, change their colours and icons, choose your **main-goal** stream, and enable optional features like the project pipeline. Stream config is saved to \`worktracker.config.json\` in your workspace, so it syncs with your data. Renamed streams keep the old name as an alias; removed streams are archived, never deleted.

### Utilisation target & standard weekly hours
- **Utilisation target** — the percentage of effort you aim to put into your main-goal stream (default **70%**). The Dashboard measures your forecast against it.
- **Standard weekly hours** — your capacity baseline (default **37.5**), used to turn STAFFIT hours into a utilisation percentage.

These app-level preferences live in \`settings.json\` in Electron's \`userData\` folder, so they belong to the machine rather than the workspace.

### Notifications
Schedule a daily reminder to log your work. Toggle it on and pick a time; the reminder fires as a native system notification. The app needs to be running (it can sit in the tray) to deliver it.

### Auto-update
Click **Check for Updates** for a manual check. If an update is available it downloads in the background with a progress bar, then prompts you to restart to apply it. Updates are handled by \`electron-updater\`.

### Workspace
Your workspace path is shown at the top of Settings. **Change Workspace** points the app at a different folder; your data stays wherever it lives — only the remembered path changes.

### Theme
Switch between the light and dark themes from the header toggle. Your choice is remembered across sessions.
`,
  },
  {
    id: 'tray-widget',
    title: 'Tray Widget',
    content: `
# Tray Widget

Work Tracker adds an icon to your system tray so you can log without bringing up the full window.

### How it works
The app runs two windows: the **main window** and a small, frameless, always-on-top **widget**. Clicking the tray icon toggles the widget popup.

### Starting a log from the tray
Hit **Start** in the widget and the app fires an internal event that navigates the main window straight to the **Daily Editor** for today — no hunting through the interface. It's the fastest path from "I should log that" to actually logging it.

### Staying available
Keeping the app running in the tray is also what lets **daily reminder notifications** fire at your chosen time (see *Settings*).
`,
  },
  {
    id: 'file-formats',
    title: 'File Formats & Data',
    content: `
# File Formats & Data

Everything Work Tracker knows lives in plain files in your workspace. Understanding the layout lets you back it up, sync it, or read it in any editor.

### Directory structure
\`\`\`text
[workspace]/
  ├── 2026/07/2026-07-06.md         # daily log
  ├── 2026/07/2026-07-06-todos.md   # per-day todo list
  ├── projects.json                 # projects, activities, tasks, subtasks, team
  ├── staffitHours.json             # weekKey → declared hours
  └── worktracker.config.json       # work streams (names, colours, icons)
\`\`\`

### Daily logs (\`YYYY-MM-DD.md\`)
Frontmatter holds metadata; the body has one \`# H1\` section per stream.

\`\`\`markdown
---
tags: [dev, meeting]
dayStatus: working
projects:
  clientWork: ["Acme Corp Rebuild"]
  practiceDevelopment: ["TypeScript Deep Dive"]
---

# Client Work
...

# Practice Development
...

# Business Development
...
\`\`\`

- **tags** — free-form labels aggregated into *Tag Insights*.
- **dayStatus** — \`working\`, \`pto\`, \`sick\`, or \`volunteering\`.
- **projects** — the projects/activities linked that day, bucketed by stream.

### Todo lists (\`YYYY-MM-DD-todos.md\`)
Editable in any text editor:
- \`# Lane Title\` creates a column.
- \`- [ ] Task\` is open; \`- [x] Task\` is done.
- A trailing metadata block like \`{created:2026-07-06 !important}\` powers the **age chips** (amber at 3 days, red at 7) and the **important** flag. It survives the daily **rollover**, so an item's age keeps counting until it's actually finished.

### Projects & activities (\`projects.json\`)
A single JSON file created automatically when you add your first project or activity. It stores every project, activity, task, subtask, team member, status, and nesting relationship. Back it up with the rest of the folder, but let the app manage it rather than editing by hand.

### STAFFIT hours (\`staffitHours.json\`)
A map of week → declared hours that drives the utilisation forecast.

### Streams (\`worktracker.config.json\`)
Your stream definitions. Lives in the workspace so it syncs with your data.

### Backups
There's no export ritual — just **copy the whole folder** to a USB drive or a synced folder. The app only ever reads and writes files, so a plain copy is a complete, portable backup.
`,
  },
]
