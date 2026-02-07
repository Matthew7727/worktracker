
export const docsContent = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        content: `
# Getting Started
Work Tracker is a high-performance productivity logger designed for speed and clarity. Unlike traditional time trackers, it focuses on **what you did**, not how many minutes it took.

### The Workspace
When you first open the app, you select a **Workspace Folder**. All your logs are saved as simple Markdown files in this directory. This ensures you own your data and can open it in any other tool like Obsidian or Notion.
`
    },
    {
        id: 'daily-editor',
        title: 'The Daily Editor',
        content: `
## The Daily Editor
The Editor is where you spend most of your time. It's designed for rapid entry.

- **Creating Entries**: Click "Add Contribution" to start a new log entry.
- **Timestamping**: Each entry is automatically timestamped, helping you reconstruct your day later.
- **Tagging**: Use the tag field to categorize your work (e.g., #feature, #bugfix, #meeting).
- **Auto-Save**: The app automatically saves your work as you type. Look for the "Saved" indicator in the card corner.
- **Markdown Support**: The editor supports full Markdown syntax for bolding, lists, and code blocks.
`
    },
    {
        id: 'dashboard-widgets',
        title: 'Dashboard Widgets',
        content: `
## Dashboard Widgets
The Dashboard provides high-level intelligence about your productivity.

### 1. Summary Tiles
- **Total Contributions**: The all-time count of entries you've recorded.
- **Current Streak**: Number of consecutive days you've logged work.
- **Active Projects**: Count of unique tags used in the last 30 days.

### 2. Weekly Distribution
A bar chart showing your activity levels over the current week. It helps you identify your most productive days.

### 3. The Matrix (Tag Distribution)
This widget shows your most frequently used tags. It's a "reality check" on where your time is actually going.

### 4. System Persona
Our AI analyzer treats your logs as a "persona." It identifies patterns like **"The Consistency King"** or **"The Deep Work Specialist"** based on your frequency and entry length.
`
    },
    {
        id: 'reporting',
        title: 'Running Reports',
        content: `
## Running Reports
The Reports page allows you to look back at your progress over long periods.

- **Filtering**: Use the search bar on the reports page to filter by tags or keywords.
- **Date Ranges**: Analyze your work by Week, Month, or Year.
- **Exporting**: Since your data is Markdown, you can simply copy the files from your workspace folder into any external reporting tool.
`
    },
    {
        id: 'search-shortcuts',
        title: 'Search & Shortcuts',
        content: `
## Search & Shortcuts
Speed is a core feature of Work Tracker.

- **Global Search**: Press \`Ctrl + F\` (or \`Cmd + F\` on Mac) from anywhere to open the Global Search. It searches the content of every single log entry in your archive instantly.
- **Navigation**: Use the Top Navigation bar to switch between the Editor, Dashboard, and Reports instantly.
`
    }
];
