export const docsContent = [
  {
    id: 'philosophy',
    title: 'Philosophy & Core Concepts',
    content: `
# Philosophy & Core Concepts

Work Tracker is built on three unshakeable pillars: **Ownership**, **Speed**, and **Simplicity**.

### 1. Radical Data Ownership
Most productivity apps lock your data into a proprietary database or cloud server. If they shut down, you lose everything.
**Work Tracker is different.**
- There is no database.
- There is no cloud.
- Your data exists as simple, human-readable **Markdown files** on your own hard drive.
- You can open your work logs in *Notion*, *Obsidian*, *VS Code*, or even *Notepad*.

### 2. Speed as a Feature
The interface is designed to reduce friction.
- **Instant Load**: No API calls, no spinners.
- **Keyboard First**: Navigate the entire app without a mouse.
- **Zero Latency**: Everything happens locally on your machine.

### 3. "What, Not When"
Traditional time trackers ask you to punch a clock. Work Tracker asks: *"What did you achieve?"*
We believe that describing your output is more valuable than measuring your minutes.
`,
  },
  {
    id: 'filesystem-db',
    title: 'The File System Database',
    content: `
# The File System Database

Understanding how Work Tracker stores data allows you to master it.
When you select a *Workspace*, the app simply reads and writes files in that folder.

### Directory Structure
Your workspace will look like this:

\`\`\`text
/My_Workspace
  ├── 2024-03-28.md           # Daily Log
  ├── 2024-03-28-todos.md     # Daily Todo List
  ├── 2024-03-29.md
  ├── 2024-03-29-todos.md
  └── projects.json           # Client projects & activities metadata
\`\`\`

### File Formats

#### 1. Daily Logs (\`YYYY-MM-DD.md\`)
Contains your journal entries for the day, one section per work stream.
- **Frontmatter**: Stores metadata — tags, and the projects/activities you linked that day.
- **Body**: Standard Markdown with three H1 sections (Client Work, Practice Development, Business Development).

Example:
\`\`\`markdown
---
tags: [dev, meeting]
clientProjects: ["Acme Corp Website"]
pdActivities: ["TypeScript Deep Dive"]
bdActivities: []
---

# Client Work
...

# Practice Development
...

# Business Development
...
\`\`\`

#### 2. Todo Lists (\`YYYY-MM-DD-todos.md\`)
Contains your tasks for the day.
- Can be edited manually in any text editor.
- \`# Lane Title\` creates a column.
- \`- [ ] Task\` creates an open task.
- \`- [x] Task\` creates a completed task.

#### 3. Projects & Activities (\`projects.json\`)
A single JSON file at the workspace root that stores all your client projects and activities.
- Created automatically when you add your first project or activity.
- Can be safely copied as part of your normal backup.
- **Do not edit manually** unless you know what you're doing — the app manages this file.

### Backups
To backup your data, simply **copy/paste the entire folder** to a USB drive or sync it with Google Drive/Dropbox. The app doesn't care; it just reads files.
`,
  },
  {
    id: 'daily-editor',
    title: 'Daily Editor Deep Dive',
    content: `
# Daily Editor Deep Dive

The Editor is your daily command center. It guides you through a **structured three-step flow** — one step per work stream — so you build a complete picture of your day.

### The Three-Step Flow
When you open the editor you'll see a start screen with your week laid out. Pick a day and click **Start** to begin.

The editor walks you through three steps:
1. **Client Work** — What did you do for clients today?
2. **Practice Development** — What did you learn or improve?
3. **Business Development** — What did you do to grow the business?

A progress bar at the top shows where you are. Use **Next** and **Back** to navigate between steps, or jump directly between them. Hit **Save** on the final step to write the file.

### Project & Activity Tagging
At each step, colored chips appear representing your active projects and activities for that stream.

- **Green chips** — Client projects (Client Work step)
- **Yellow chips** — Practice Development activities (PD step)
- **Orange chips** — Business Development activities (BD step)

Click a chip to link that project/activity to today's entry. Click again to unlink. These selections are saved as frontmatter metadata so the Dashboard and Workspace Explorer can surface them later.

### Auto-Save Mechanics
You never need to press "Save" mid-session.
- The editor listens to your keystrokes.
- It waits for a **500ms pause** in your typing (debounce).
- It then writes the file to disk instantly.

### Markdown Support
The editor supports Github Flavored Markdown.
- **Bold**: \`**text**\` or \`__text__\`
- *Italic*: \`*text*\` or \`_text_\`
- \`Code\`: \` \`text\` \`
- **Lists**: \`- item\` or \`1. item\`
- **Headers**: \`# H1\`, \`## H2\`
`,
  },
  {
    id: 'activities-board',
    title: 'Projects & Activities',
    content: `
# Projects & Activities

The Activities Board is where you manage the ongoing work in your life — the things you tag in daily entries and track over time.

### Two Types of Work

#### Client Projects
Discrete engagements you do for clients or external stakeholders.
- Create a project with a name and it becomes available as a **green chip** in the Daily Editor.
- Projects have three statuses: **Active**, **Archived**, **Completed**.
- When you complete a project it appears in the Dashboard's *Recent Accomplishments* widget.
- A **stale warning** appears if a project has been active for more than 30 days without being completed — a nudge to either wrap it up or archive it.

#### Activities (PD & BD)
Ongoing initiatives that don't have a defined end date.
- **Practice Development (PD)** activities (yellow) — learning, upskilling, internal improvement.
- **Business Development (BD)** activities (orange) — growth-focused, strategy work.
- Activities follow the same Active / Archived / Completed lifecycle as client projects.

### Managing Status
Click the three-dot menu on any card to:
- **Archive** — remove from active lists without losing history.
- **Complete** — mark as done and record a completion date.
- Archived and completed items can be viewed by switching the filter tabs at the top.

### How Projects Link to Entries
Everything you tag in the Daily Editor flows back to \`projects.json\`. The frontmatter in each daily log records which projects and activities were active that day, giving the Dashboard and Workspace Explorer the data they need to surface trends and summaries.
`,
  },
  {
    id: 'workspace-explorer',
    title: 'Workspace Explorer',
    content: `
# Workspace Explorer

The Workspace Explorer gives you a read-only window into your entire work history — every entry, every day, all in one place.

### How It Works
Navigate to **Workspace** in the sidebar to open the explorer. It presents a split-pane view:
- **Left pane** — A hierarchical directory tree of your workspace folder, organised by year and month.
- **Right pane** — The content of the selected entry, rendered as formatted Markdown.

### Reading Entries
Click any file in the tree to open it in the viewer. The viewer shows:
- The full Markdown content of the entry.
- Any **project and activity chips** linked to that entry (pulled from frontmatter), displayed in their stream colors.
- Entry date as a header.

### What It's For
- Reviewing what you worked on during a specific period.
- Checking what was tagged to a particular project before archiving it.
- Getting a feel for the density and consistency of your historical output.

The explorer is **read-only** — use the Daily Editor to make or change entries.
`,
  },
  {
    id: 'dashboard-logic',
    title: 'Dashboard Intelligence',
    content: `
# Dashboard Intelligence

The Dashboard is a calculated analysis of your work habits, built from everything you've logged.

### Hero Statement
A narrative summary at the top of the dashboard that describes your current projects and recent focus areas in plain English. It updates automatically as you log work and tag projects.

### Stream Alignment
A visual balance indicator showing how your effort is split across the three work streams.
- The **ideal balance** is an equal 33.3% across Client Work, Practice Development, and Business Development.
- The balance score measures variance from that ideal — lower is better.
- The **Weekly Intensity** chart below it shows day-by-day activity volume for the current week.

### Streak & Consistency
A "streak" is the number of consecutive days you've logged at least one entry.
- **Missed a day?** The streak resets to 0.
- Weekends count — consistency is a 24/7 mindset (for now).

### The Contribution Graph
A calendar-style heatmap of your entire logging history. Darker squares = more activity on that day. A quick visual of your long-term consistency.

### Recent Accomplishments
A timeline of recently completed client projects and activities. Completing something in the Activities Board adds it here automatically.

### Current Priorities
A live view of your active client projects and activities, with age indicators so you can spot what's been sitting too long.
`,
  },
  {
    id: 'reports-export',
    title: 'Reports & Exporting',
    content: `
# Reports & Exporting

Your data is yours. The Reports page helps you get it out.

### Search
The Global Search (Ctrl+F / Cmd+F) and the Report Filter both use a linear scan across all your files.
- Because your data is local, thousands of files can be scanned in milliseconds.
- Search is **case-insensitive**.
- Matches surface the full entry text, including any project and activity metadata stored in frontmatter.

### Export Formats

#### Markdown Export (\`.md\`)
- Compiles all your selected entries into one chronological Master Document.
- Perfect for archiving a period of work into a single file for performance reviews.
- **Compatibility**: Copy-paste the result directly into Notion or Obsidian.

#### JSON Export (\`.json\`)
- Exports the raw data structure including frontmatter metadata (tags, linked projects, activities).
- Useful for developers who want to write custom visualisation scripts or migrate to other systems.
`,
  },
  {
    id: 'settings',
    title: 'Settings & Configuration',
    content: `
# Settings & Configuration

### Utilisation Target
Set a target percentage for how much of your logged work should be **Client Work**.
- Default is **70%** — meaning 70% of your output should be billable client work.
- The Dashboard's Stream Alignment widget uses this target to show whether you're on track.
- Adjust it to reflect your own goals (e.g., a lower target if you're in a heavy learning phase).

### Notifications
Schedule a daily reminder to log your work.
- Toggle notifications on and set a time (e.g., 17:00).
- The reminder fires as a native system notification via Electron.
- Requires the app to be running in the background.

### Auto-Update
Work Tracker can check for and install updates automatically.
- Click **Check for Updates** to trigger a manual check.
- If an update is available, a download will start and a progress bar will appear.
- Once downloaded, the app will prompt you to restart to apply the update.

### Workspace
Your workspace path is shown at the top of the Settings page. Click **Change Workspace** to point the app at a different folder. All your data stays wherever you put it — the app just remembers the path in \`localStorage\`.
`,
  },
]
