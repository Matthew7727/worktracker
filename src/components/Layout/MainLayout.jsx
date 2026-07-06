import React from 'react'
import {
  Box,
  Zoom,
  useScrollTrigger,
  Fab,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Home,
  Notes,
  Settings,
  FolderOpen,
  Assessment,
  MenuBook as DocsIcon,
  Checklist as ChecklistIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Bolt,
  LightMode,
  DarkMode,
} from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { useThemeContext } from '../../context/ThemeContext'
import { useNavigate, useLocation } from 'react-router-dom'

// Sub-components
import Brand from './components/Brand'
import FloatingPillNav from './components/FloatingPillNav'
import FeedbackSystem from './components/FeedbackSystem'
import { fabStyles, toolbarIconStyles } from './MainLayout.styles'

function ScrollTop({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor'
    )
    if (anchor) anchor.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  )
}

const MainLayout = ({ children }) => {
  const { selectedDirectory, notification, hideNotification } = useAppContext()
  const { mode, toggleTheme } = useThemeContext()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Home />, activeColor: '#80b621' },
    {
      label: 'Entries',
      path: '/editor',
      icon: <Notes />,
      activeColor: '#eb8449',
    },
    {
      label: 'Activities',
      path: '/todos',
      icon: <Bolt />,
      activeColor: '#ffd166',
    },
    {
      label: 'Tasks',
      path: '/tasks',
      icon: <ChecklistIcon />,
      activeColor: '#9c6ade',
    },
    {
      label: 'Workspace',
      path: '/workspace',
      icon: <FolderOpen />,
      activeColor: '#00d2ff',
    },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ]

  const actionItems = [
    {
      label: 'Docs',
      icon: <DocsIcon />,
      onClick: () => navigate('/docs'),
      path: '/docs',
    },
  ]

  const handleSearchResultClick = (date) => {
    navigate('/', { state: { initialDate: date } })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div id="back-to-top-anchor" style={{ position: 'absolute', top: 0 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          height: '5rem',
          display: 'flex',
          alignItems: 'center',
          px: '4rem',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ pointerEvents: 'auto' }}>
          <Brand onClick={() => navigate('/')} />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          arrow
        >
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{ ...toolbarIconStyles, pointerEvents: 'auto', p: 1 }}
          >
            {mode === 'light' ? (
              <DarkMode fontSize="small" />
            ) : (
              <LightMode fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <FloatingPillNav
        items={navItems}
        currentPath={location.pathname}
        onNavigate={navigate}
        actions={actionItems}
        searchRootDir={selectedDirectory}
        onSearchResultClick={handleSearchResultClick}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '4.5rem',
          overflowY: 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ py: 6, px: '4rem' }}>{children}</Box>
      </Box>

      <ScrollTop>
        <Fab
          color="primary"
          size="large"
          aria-label="scroll back to top"
          sx={fabStyles}
        >
          <KeyboardArrowUpIcon
            sx={{ fontSize: '2rem', color: 'background.paper' }}
          />
        </Fab>
      </ScrollTop>

      <FeedbackSystem notification={notification} onHide={hideNotification} />
    </Box>
  )
}

export default MainLayout
