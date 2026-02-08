# Refactoring Strategy & Implementation Plan

## Goal
Systematically refactor the entire `WorkTracker` codebase to adhere to the strict "Clean Rules" architecture defined in the [Refactoring Instructions](.agent/skills/ralph-worker/refactoring_instructions.md.resolved).

## User Review Required
> [!IMPORTANT]
> This refactoring will change the file structure of every component.
> - **Current**: `src/components/MyComponent/MyComponent.jsx` (mixed logic/view/styles)
> - **New**:
>   - `src/components/MyComponent/index.js` (Export)
>   - `src/components/MyComponent/MyComponent.jsx` (View Only)
>   - `src/components/MyComponent/MyComponent.hooks.js` (Logic)
>   - `src/components/MyComponent/MyComponent.styles.js` (Styles)

## Strategy: The "Ralph Loop" Integration
Future agents will follow this loop:
1.  **Read** `REFACTORING_STATUS.md` to find the next `pending` component (sorted by priority).
2.  **Execute** the refactoring for that single component following the "Iron Rules".
3.  **Verify** the component works (Lint + Test).
4.  **Update** `REFACTORING_STATUS.md` (mark as `x`).
5.  **Commit** (if applicable/requested).

## Phased Implementation

### Phase 1: Foundation & Infrastructure
Ensures the shared utilities and styles are ready before components are refactored.
- [ ] **Move Theme**: Move `src/theme.js` to `src/styles/theme.js`. Update `main.jsx` and `App.jsx` imports.
- [ ] **Audit Context**: Ensure `AppContext` and `ThemeContext` are clean and ready for usage in hooks.

### Phase 2: Core Complex Components (High Risk)
These components are the hardest but provide the most value when cleaned up.
- [ ] **DailyEditor**: The largest component. Needs breaking down into `DateNavigation`, `EntryCard`, etc.
- [ ] **Dashboard**: Contains multiple widgets that need to be their own atomic components (`StatsCards`, `TodoSummary`, etc.).

### Phase 3: Feature Components (Medium Risk)
- [ ] **TodoBoard**
- [ ] **Reports**
- [ ] **Settings**
- [ ] **Onboarding**

### Phase 4: Layout & Documentation (Low Risk)
- [ ] **Layout** (Sidebar, Header)
- [ ] **Documentation**

## Component Architecture Standard

Every component directory **MUST** look like this:

### 1. `index.js`
```javascript
export { default } from './MyComponent';
```

### 2. `MyComponent.styles.js` (Styles)
- Contains **ALL** styling logic.
- NO `sx` props in the JSX.
- Uses `@mui/material/styles` or `@emotion/styled`.
```javascript
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
}));
```

### 3. `MyComponent.hooks.js` (Logic)
- Contains **ALL** `useState`, `useEffect`, and handlers.
- Returns only data and pure handlers needed for rendering.
```javascript
import { useState } from 'react';

export const useMyComponent = () => {
  const [value, setValue] = useState(0);
  const handleClick = () => setValue(v => v + 1);
  return { value, handleClick };
};
```

### 4. `MyComponent.jsx` (View)
- purely presentational.
- **NO** logic (switches, complex maps, effectiveness).
- **NO** inline styles.
```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { useMyComponent } from './MyComponent.hooks';
import { Container } from './MyComponent.styles';

const MyComponent = (props) => {
  const { value, handleClick } = useMyComponent(props);
  return <Container onClick={handleClick}>{value}</Container>;
};

MyComponent.propTypes = { /* ... */ };
export default MyComponent;
```

## Verification Plan
For *each* component refactored:
1.  **Lint Check**: Run `npx eslint src/components/MyComponent/**`
2.  **Manual Verification**:
    -   Start app: `npm run dev`
    -   Navigate to the page containing the component.
    -   Verify interactions work as before.
    -   Check console for errors.
