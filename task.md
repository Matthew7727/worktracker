# Tasks
- [x] Phase 7: To-Do Feature <!-- id: 6 -->
    - [x] Plan and Architecture <!-- id: 7 -->
        - [x] Create implementation plan <!-- id: 8 -->
    - [x] Core Board Implementation <!-- id: 9 -->
        - [x] Create `TodoBoard` component structure <!-- id: 10 -->
        - [x] Implement `Swimlane` component <!-- id: 11 -->
        - [x] Add "To-Dos" tab to `MainLayout` navigation <!-- id: 12 -->
    - [x] Data Layer <!-- id: 13 -->
        - [x] Create `src/utils/todoManager.js` for MD storage <!-- id: 14 -->
        - [x] Implement `loadDailyTodos` and `saveDailyTodos` <!-- id: 15 -->
    - [x] Rollover Logic <!-- id: 16 -->
        - [x] Implement logic to scan previous days for incomplete tasks <!-- id: 17 -->
        - [x] Create UI for rollover notification/confirmation <!-- id: 18 -->
    - [x] Dashboard Integration <!-- id: 19 -->
        - [x] Create To-Do summary widget for Dashboard <!-- id: 20 -->

- [x] Phase 8: To-Do History
    - [x] Create `DateNavigator` component
    - [x] Integrate navigation into `TodoBoard`
    - [x] Ensure persistence/loading works on date change

- [x] Phase 9: Dashboard V2 & Stats
    - [x] Make Dashboard default route
    - [x] Implement `getTodoStats` in `todoManager.js`
    - [x] Refactor `TodoSummary` widget to show dynamic category stats

- [x] Phase 10: Dashboard Styling & Layout Overhaul
    - [x] Update `Dashboard.styles.js` with 3D shadow effect
    - [x] Apply 3D effect to all widgets
    - [x] Compact Dashboard layout (reduce whitespace)
    - [x] Increase Electron default window size

- [x] Phase 11: Dashboard Layout Restructure
    - [x] Update `SummaryTiles` to 2x2 grid
    - [x] Implement main Dashboard Grid layout
    - [x] Update `ContributionGraph` empty cell color
    - [x] Fix Grid breakpoints for 1300px window

- [x] Phase 12: React Componentization & Grid System
    - [x] Create generic `DashboardWidget` component
    - [x] Refactor `SummaryTiles` to be individual widgets
    - [x] Refactor `TodoSummary`, `StatsCards`, `RecentActivity` to content-only
    - [x] Rebuild `Dashboard.jsx` with composable grid
    - [x] Implement nested grid for top row (2x2 tiles + Daily Obj)

- [x] Phase 13: Chart Enhancements
    - [x] Implement Rolling 7-Day Window for Weekly Chart
    - [x] Ensure consistent bar width and percentage-based height

- [x] Phase 14: Dashboard Visual Rework <!-- id: 25 -->
    - [x] Create Implementation Plan <!-- id: 26 -->
    - [x] Refactor Dashboard Layout (2-Column Grid) <!-- id: 27 -->
    - [x] Balance Component Heights <!-- id: 28 -->
    - [x] Center and Streamline Container <!-- id: 29 -->
    - [x] Update Styles for Visual Consistency <!-- id: 30 -->

- [/] Phase 15: Browser Development Environment
    - [x] Create `electronMock.js`
    - [x] Integrate mock into `main.jsx`



