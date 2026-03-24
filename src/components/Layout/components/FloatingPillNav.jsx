import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useThemeContext } from '../../../context/ThemeContext'
import GlobalSearch from './GlobalSearch'

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const EASE_OUT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

const PillItem = ({
  icon,
  label,
  isActive,
  isHovered,
  isPressed,
  isDark,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
}) => (
  <Box
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: isHovered ? '7px' : '0px',
      pl: '11px',
      pr: isHovered ? '13px' : '11px',
      py: '9px',
      borderRadius: '999px',
      cursor: 'pointer',
      userSelect: 'none',
      overflow: 'hidden',
      transition: [
        `background-color 0.25s ${EASE_OUT}`,
        `transform 0.35s ${SPRING}`,
        `box-shadow 0.25s ${EASE_OUT}`,
        `gap 0.35s ${SPRING}`,
        `padding 0.35s ${SPRING}`,
      ].join(', '),
      bgcolor: isActive
        ? 'primary.main'
        : isHovered
          ? isDark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(0,0,0,0.06)'
          : 'transparent',
      color: isActive ? 'white' : 'text.primary',
      transform: isPressed
        ? 'scale(0.90)'
        : isActive
          ? 'scale(1.06)'
          : 'scale(1)',
      boxShadow: isActive
        ? isDark
          ? '0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)'
          : '0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5)'
        : 'none',
    }}
  >
    {React.cloneElement(icon, {
      sx: {
        fontSize: '1.2rem',
        flexShrink: 0,
        transition: `filter 0.3s ${EASE_OUT}, transform 0.35s ${SPRING}`,
        filter: isActive
          ? 'drop-shadow(0 0 8px rgba(255,255,255,0.55))'
          : 'none',
        transform: isHovered && !isActive ? 'scale(1.15)' : 'scale(1)',
      },
    })}
    <Box
      sx={{
        maxWidth: isHovered ? '80px' : '0px',
        opacity: isHovered ? 1 : 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontWeight: 900,
        fontSize: '0.78rem',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        transition: [
          `max-width 0.38s ${SPRING}`,
          `opacity 0.22s ${EASE_OUT}`,
        ].join(', '),
      }}
    >
      {label}
    </Box>
  </Box>
)

const FloatingPillNav = ({
  items,
  currentPath,
  onNavigate,
  actions = [],
  searchRootDir,
  onSearchResultClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [pressedIndex, setPressedIndex] = useState(null)
  const [hoveredAction, setHoveredAction] = useState(null)
  const [pressedAction, setPressedAction] = useState(null)
  const { mode } = useThemeContext()
  const isDark = mode === 'dark'

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '13px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        px: '6px',
        py: '6px',
        borderRadius: '999px',
        border: '2.5px solid',
        borderColor: 'text.primary',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        bgcolor: isDark
          ? 'rgba(18, 18, 18, 0.58)'
          : 'rgba(255, 255, 255, 0.58)',
        boxShadow: isDark
          ? '0 5px 0 rgba(0,0,0,0.95), 0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 5px 0 rgba(0,0,0,1), 0 20px 60px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {items.map((item, index) => (
        <PillItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          isActive={currentPath === item.path}
          isHovered={hoveredIndex === index}
          isPressed={pressedIndex === index}
          isDark={isDark}
          onClick={() => onNavigate(item.path)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => {
            setHoveredIndex(null)
            setPressedIndex(null)
          }}
          onMouseDown={() => setPressedIndex(index)}
          onMouseUp={() => setPressedIndex(null)}
        />
      ))}

      <Box
        sx={{
          width: '1.5px',
          height: '22px',
          mx: '3px',
          borderRadius: '1px',
          flexShrink: 0,
          bgcolor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
        }}
      />

      <GlobalSearch
        rootDir={searchRootDir}
        onResultClick={onSearchResultClick}
        renderTrigger={(openSearch) => (
          <PillItem
            icon={<SearchIcon />}
            label="Search"
            isActive={false}
            isHovered={hoveredAction === 'search'}
            isPressed={pressedAction === 'search'}
            isDark={isDark}
            onClick={openSearch}
            onMouseEnter={() => setHoveredAction('search')}
            onMouseLeave={() => {
              setHoveredAction(null)
              setPressedAction(null)
            }}
            onMouseDown={() => setPressedAction('search')}
            onMouseUp={() => setPressedAction(null)}
          />
        )}
      />

      {actions.map((action) => (
        <PillItem
          key={action.label}
          icon={action.icon}
          label={action.label}
          isActive={action.path ? currentPath === action.path : false}
          isHovered={hoveredAction === action.label}
          isPressed={pressedAction === action.label}
          isDark={isDark}
          onClick={action.onClick}
          onMouseEnter={() => setHoveredAction(action.label)}
          onMouseLeave={() => {
            setHoveredAction(null)
            setPressedAction(null)
          }}
          onMouseDown={() => setPressedAction(action.label)}
          onMouseUp={() => setPressedAction(null)}
        />
      ))}
    </Box>
  )
}

export default FloatingPillNav
