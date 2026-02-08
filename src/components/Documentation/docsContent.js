
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
`
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
  ├── 2023-10-27.md          # Daily Log
  ├── 2023-10-27-todos.md    # Daily Todo List
  ├── 2023-10-28.md
  └── 2023-10-28-todos.md
\`\`\`

### File Formats

#### 1. Daily Logs (\`YYYY-MM-DD.md\`)
Contains your journal entries for the day.
- **Frontmatter**: Stores metadata like tags.
- **Body**: Standard Markdown.

#### 2. Todo Lists (\`YYYY-MM-DD-todos.md\`)
Contains your tasks for the day.
- Can be edited manually in any text editor.
- Format:
  - \`# Lane Title\` creates a column.
  - \`- [ ] Task\` creates an open task.
  - \`- [x] Task\` creates a completed task.

### Backups
To backup your data, simply **copy/paste the entire folder** to a USB drive or sync it with Google Drive/Dropbox. The app doesn't care; it just reads files.
`
    },
    {
        id: 'dashboard-logic',
        title: 'Dashboard Intelligence',
        content: `
# Dashboard Intelligence

The Dashboard isn't just pretty charts; it's a calculated analysis of your work habits.

### 1. The Persona System
The app assigns you a "Productivity Persona" based on your recent activity.
- **READY FOR ACTION**: You have 0 days logged. Start working!
- **CONSISTENCY KING**: You have a **current streak of 7+ days**. You show up every day.
- **ARCHIVE ARCHITECT**: You average **3+ logs per active day**. You are detailed and thorough.
- **LEGACY BUILDER**: You have logged **30+ total days**. You are building a long-term body of work.
- **PRODUCTIVITY SCOUT**: The default rank for active users.

### 2. Streak Logic
Streaks are calculated with strict precision.
- A "Streak" is defined as consecutive days with at least one log entry.
- **Missed a day?** The streak resets to 0.
- **Weekends**: The system currently counts weekends. If you take Saturday off, your streak *will* reset. This is by design—consistency is a 24/7 mindset (for now).

### 3. Tag Matrix
The Heatmap/Matrix scans **every single file** in your history to find your top tags.
- It aggregates tags defined in the editor (e.g., \`#feature\`).
- It helps you visualize where your effort is actually going versus where you *think* it's going.
`
    },
    {
        id: 'daily-editor',
        title: 'Daily Editor Deep Dive',
        content: `
# Daily Editor Deep Dive

The Editor is your command center.

### Smart Tagging
Tags are the primary way to categorize work.
- Type \`#\` followed by any text (e.g., \`#bugfix\`, \`#meeting\`).
- The app automatically detects these specific patterns and saves them as metadata.
- **Pro Tip**: Be consistent. \`#bug-fix\` and \`#bugfix\` are treated as different tags in reports.

### Auto-Save Mechanics
You never need to press "Save".
- The editor listens to your keystrokes.
- It waits for a **500ms pause** in your typing (debounce).
- It then writes the file to disk instantly.
- Look for the "Saved" indicator in the top right.

### Markdown Support
The editor supports Github Flavored Markdown.
- **Bold**: \`**text**\` or \`__text__\`
- *Italic*: \`*text*\` or \`_text_\`
- \`Code\`: \` \`text\` \`
- **Lists**: \`- item\` or \`1. item\`
- **Headers**: \`# H1\`, \`## H2\`
`
    },
    {
        id: 'todo-logic',
        title: 'Todo System & Rollover',
        content: `
# Todo System & Rollover

The Todo Board is more than a checklist; it's a daily workflow engine.

### The Rollover Engine
This is the app's most powerful hidden feature.
When you open the Todo Board for a **new day** (e.g., you open the app on Tuesday morning):
1. The system looks for the **most recent previous todo file** (e.g., Monday's list).
2. It scans for any tasks that are **unchecked** \`- [ ]\`.
3. It **automatically copies** those tasks to Tuesday's list.
4. It marks them with a prefix: \`(Rollover)\`.

*This ensures you never lose track of a task. If you didn't do it yesterday, it haunts you today.*

### Lane Management
- **Create**: Click "Add Category" to make a new lane (e.g., "Morning", "Afternoon", "Urgent").
- **Rename**: Click the three dots top-right of a lane.
- **Delete**: Deleting a lane *permanently* removes all tasks within it.

### File Persistence
Remember, these lanes are just H1 headers in a markdown file: \`# Morning\`. You can open the file in Notepad to mass-edit your tasks if needed.
`
    },
    {
        id: 'reports-export',
        title: 'Reports & Exporting',
        content: `
# Reports & Exporting

Your data is yours. The Reports page helps you get it out.

### Search Engine
The Global Search (Ctrl+F) and Report Filter use a linear scan algorithm.
- Because your data is local, we can scan thousands of files in milliseconds.
- Search is **case-insensitive**.

### Export Formats

#### Markdown Export (\`.md\`)
- Compiles *all* your selected entries into one massive Master Document.
- Organized chronologically.
- Perfect for archiving a month of work into a single file for performance reviews.
- **Compatibility**: Copy-paste the result directly into Notion or Obsidian.

#### JSON Export (\`.json\`)
- Exports the raw data structure.
- Useful for developers who want to write their own visualization scripts or migrate to other database systems.
`
    }
];
