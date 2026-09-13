import React from 'react'
import { Box } from '@mui/material'
import { Search as SearchIcon, LightMode, DarkMode } from '@mui/icons-material'
import GlobalSearch from './GlobalSearch'

const RULE = 3

// A divider tab sticking out of the sheet's right edge. The sheet's edge rule
// is drawn by the tab column; the active tab sits above it so it reads as
// joined to the page.
const Tab = ({
  icon,
  label,
  ariaLabel,
  color,
  isActive,
  onClick,
  compact = false,
}) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    aria-label={ariaLabel}
    sx={{
      position: 'relative',
      zIndex: isActive ? 3 : 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      width: isActive ? 70 : 50,
      py: compact ? 1.1 : 1.75,
      flexShrink: 0,
      fontFamily: 'inherit',
      border: `${RULE}px solid`,
      borderLeft: 'none',
      borderColor: 'text.primary',
      bgcolor: color || 'background.paper',
      color: color ? '#000' : 'text.primary',
      cursor: 'pointer',
      boxShadow: isActive
        ? 'none'
        : (t) => `3px 3px 0 ${t.palette.text.primary}`,
      transition: 'width 0.14s ease, margin 0.14s ease',
      '& svg': { fontSize: '1.1rem' },
      '@media (max-height: 940px)': {
        py: compact ? 0.75 : 1,
        '& span': { fontSize: '0.8rem' },
      },
      '&:hover': isActive ? {} : { width: 58 },
      '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'primary.main',
        outlineOffset: 2,
      },
    }}
  >
    {icon}
    {label && (
      <Box
        component="span"
        sx={{
          writingMode: 'vertical-rl',
          fontWeight: isActive ? 900 : 800,
          fontSize: '0.92rem',
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Box>
    )}
  </Box>
)

const BinderTabs = ({
  items,
  currentPath,
  onNavigate,
  actions = [],
  searchRootDir,
  onSearchResultClick,
  mode,
  onToggleTheme,
}) => {
  const isActivePath = (path) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path)

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: RULE,
          bgcolor: 'text.primary',
          zIndex: 2,
        }}
      />
      <Box
        component="nav"
        aria-label="Sections"
        sx={{
          width: 86,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0.75,
          pt: 1,
          pb: 2,
          pr: 1,
          minHeight: 0,
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => onNavigate('/')}
          aria-label="Work Tracker home"
          sx={{
            alignSelf: 'center',
            mb: 1.5,
            p: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            writingMode: 'vertical-rl',
            fontFamily: 'inherit',
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '-0.05em',
            flexShrink: 0,
            lineHeight: 1,
            color: 'text.primary',
            '@media (max-height: 940px)': { fontSize: '0.85rem', mb: 0.75 },
          }}
        >
          WORK
          <Box component="span" sx={{ color: 'primary.main' }}>
            TRACKER
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.75,
            pb: 2,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {items.map((item) => (
            <Tab
              key={item.path}
              label={item.label}
              color={item.activeColor}
              isActive={isActivePath(item.path)}
              onClick={() => onNavigate(item.path)}
            />
          ))}
        </Box>

        <GlobalSearch
          rootDir={searchRootDir}
          onResultClick={onSearchResultClick}
          renderTrigger={(openSearch) => (
            <Tab
              icon={<SearchIcon />}
              ariaLabel="Search entries (Ctrl+F)"
              onClick={openSearch}
              compact
            />
          )}
        />
        {actions.map((action) => (
          <Tab
            key={action.label}
            icon={action.icon}
            ariaLabel={action.label}
            isActive={action.path ? isActivePath(action.path) : false}
            onClick={action.onClick}
            compact
          />
        ))}
        <Tab
          icon={mode === 'light' ? <DarkMode /> : <LightMode />}
          onClick={onToggleTheme}
          ariaLabel={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          compact
        />
      </Box>
    </Box>
  )
}

export default BinderTabs
