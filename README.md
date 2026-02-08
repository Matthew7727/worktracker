# Work-Tracker 🚀

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

**Work-Tracker** is a minimalist, cross-platform desktop application designed for professionals who need to track their work without the hassle of rigid time-blocking. Built with **Electron**, **React**, and the **Carbon Design System**, it offers a distraction-free environment to log your daily achievements, manage tasks, and visualize your productivity.

## ✨ Features

-   **📝 Free-Text Daily Logging**: Log your work your way. No start/stop timers, just pure Markdown text.
-   **✅ Task Management**: Integrated Todo list with automatic rollover of uncompleted tasks.
-   **📊 Productivity Dashboard**: Visualizing your streak, active days, and daily objectives.
-   **🏷️ Tagging System**: Organize your entries with tags to track projects or skills.
-   **🌓 Dark Mode**: Sleek, eye-friendly dark theme for late-night coding sessions.
-   **📂 Data Ownership**: All data is stored as local Markdown files on your machine. Compatible with Obsidian, Notion, and other Markdown editors.
-   **🔄 Auto-Updates**: Stay up-to-date with automatic background updates.

## 🚀 Getting Started

### Installation

Download the latest release for your platform from the [Releases Page](https://github.com/Matthew7727/worktracker/releases).

-   **Windows**: Download access run `Work-Tracker Setup 1.0.0.exe`.
-   **macOS / Linux**: Coming soon.

### First Run

1.  Launch the application.
2.  Select a directory where you want to store your work logs (e.g., `~/Documents/WorkLogs`).
3.  Start tracking!

## 🛠️ Development

If you want to contribute or build from source:

### Prerequisites

-   Node.js (v18 or higher)
-   npm

### Setup

```bash
# Clone the repository
git clone https://github.com/Matthew7727/worktracker.git
cd worktracker

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite dev server and Electron app
npm run dev
```

### Building for Production

```bash
# Build for your current OS
npm run electron:build
```

## 🏗️ Architecture

-   **Frontend**: React + Vite
-   **Backend**: Electron (Main Process)
-   **UI Library**: Carbon Design System (@carbon/react)
-   **Data Storage**: Local File System (Markdown + Frontmatter)

## 📄 License

This project is licensed under the MIT License.
