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
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Bolt,
  PushPin,
  LightMode,
  DarkMode,
} from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { useThemeContext } from '../../context/ThemeContext'
import { useNavigate, useLocation } from 'react-router-dom'

// Sub-components
import Brand from './components/Brand'
import NavRail from './components/NavRail'
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
      label: 'Notes',
      path: '/notes',
      icon: <PushPin />,
      activeColor: '#f45b69',
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

      <NavRail
        items={navItems}
        currentPath={location.pathname}
        onNavigate={navigate}
        actions={actionItems}
        searchRootDir={selectedDirectory}
        onSearchResultClick={handleSearchResultClick}
        brand={<Brand onClick={() => navigate('/')} />}
        trailing={
          <Tooltip
            title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            arrow
          >
            <IconButton
              onClick={toggleTheme}
              sx={toolbarIconStyles}
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            >
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
        }
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
        <Box sx={{ py: 6, px: { xs: 3, md: 6 } }}>{children}</Box>
      </Box>

      <ScrollTop>
        <Fab
          color="primary"
          size="large"
          aria-label="scroll back to top"
          sx={fabStyles}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: '2rem', color: '#000' }} />
        </Fab>
      </ScrollTop>

      <FeedbackSystem notification={notification} onHide={hideNotification} />
    </Box>
  )
}

export default MainLayout
