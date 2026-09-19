import React, { useState } from 'react'
import { Box, Zoom, useScrollTrigger, Fab } from '@mui/material'
import {
  Home,
  Notes,
  Settings,
  FolderOpen,
  MenuBook as DocsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Bolt,
  PushPin,
  Flag,
} from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { useThemeContext } from '../../context/ThemeContext'
import { useNavigate, useLocation } from 'react-router-dom'

import BinderTabs from './components/BinderTabs'
import FeedbackSystem from './components/FeedbackSystem'
import { fabStyles } from './MainLayout.styles'

function ScrollTop({ target, children }) {
  const trigger = useScrollTrigger({
    target: target || undefined,
    disableHysteresis: true,
    threshold: 400,
  })

  return (
    <Zoom in={!!target && trigger}>
      <Box
        onClick={() => target?.scrollTo({ top: 0, behavior: 'smooth' })}
        role="presentation"
        sx={{ position: 'fixed', bottom: 40, right: 112, zIndex: 1000 }}
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
  const [sheetEl, setSheetEl] = useState(null)

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
      label: 'Goals',
      path: '/goals',
      icon: <Flag />,
      activeColor: '#9b7dd4',
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
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.desk',
        pt: 2,
        pl: 2,
      }}
    >
      <Box
        component="main"
        ref={setSheetEl}
        sx={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          bgcolor: 'background.default',
          border: '3px solid',
          borderRight: 'none',
          borderBottom: 'none',
          borderColor: 'text.primary',
        }}
      >
        <Box sx={{ py: 6, px: { xs: 3, md: '4rem' } }}>{children}</Box>
      </Box>

      <BinderTabs
        items={navItems}
        currentPath={location.pathname}
        onNavigate={navigate}
        actions={actionItems}
        searchRootDir={selectedDirectory}
        onSearchResultClick={handleSearchResultClick}
        mode={mode}
        onToggleTheme={toggleTheme}
      />

      <ScrollTop target={sheetEl}>
        <Fab
          size="medium"
          aria-label="Back to top"
          sx={{ ...fabStyles, bgcolor: 'background.paper' }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>

      <FeedbackSystem notification={notification} onHide={hideNotification} />
    </Box>
  )
}

export default MainLayout
