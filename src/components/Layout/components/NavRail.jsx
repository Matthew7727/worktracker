import React from 'react'
import { Box } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import GlobalSearch from './GlobalSearch'
import { RULE } from '../../../styles/tokens'

// A destination in the rail. Selected reads as an inverted block stamped with
// the section's colour; nothing here rounds, floats or glows.
const RailItem = ({ icon, label, isActive, accent, onClick, title }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    title={title}
    aria-current={isActive ? 'page' : undefined}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2.5,
      height: '100%',
      border: 0,
      borderRight: `${RULE.hair}px solid`,
      borderColor: 'divider',
      cursor: 'pointer',
      font: 'inherit',
      fontWeight: 700,
      fontSize: '0.82rem',
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      transition: 'background-color 0.1s linear, color 0.1s linear',
      bgcolor: isActive ? accent || 'text.primary' : 'transparent',
      color: isActive ? '#000' : 'text.primary',
      '&:hover': {
        bgcolor: isActive ? accent || 'text.primary' : 'action.hover',
      },
    }}
  >
    {React.cloneElement(icon, { sx: { fontSize: '1.15rem', flexShrink: 0 } })}
    <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
      {label}
    </Box>
  </Box>
)

/**
 * The command rail: one solid bar across the top of the app holding the
 * wordmark, every destination and the global tools. It is pinned, opaque and
 * squared off so the page beneath scrolls under a hard edge.
 */
const NavRail = ({
  items,
  currentPath,
  onNavigate,
  actions = [],
  searchRootDir,
  onSearchResultClick,
  brand,
  trailing,
}) => {
  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        height: '4.5rem',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        borderBottom: `${RULE.base}px solid`,
        borderColor: 'divider',
      }}
    >
      {brand}

      {items.map((item) => (
        <RailItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          isActive={currentPath === item.path}
          accent={item.activeColor}
          onClick={() => onNavigate(item.path)}
        />
      ))}

      <Box sx={{ flexGrow: 1 }} />

      <GlobalSearch
        rootDir={searchRootDir}
        onResultClick={onSearchResultClick}
        renderTrigger={(openSearch) => (
          <RailItem
            icon={<SearchIcon />}
            label="Search"
            title="Search entries (Ctrl+F)"
            isActive={false}
            onClick={openSearch}
          />
        )}
      />

      {actions.map((action) => (
        <RailItem
          key={action.label}
          icon={action.icon}
          label={action.label}
          isActive={action.path ? currentPath === action.path : false}
          onClick={action.onClick}
        />
      ))}

      {trailing}
    </Box>
  )
}

export default NavRail
