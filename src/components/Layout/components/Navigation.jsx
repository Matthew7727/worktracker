import React from 'react'
import { Box } from '@mui/material'
import { navItemStyles } from '../MainLayout.styles'

const Navigation = ({ items, currentPath, onNavigate }) => (
  <Box
    component="nav"
    sx={{
      display: 'flex',
      gap: 2,
      height: '5.5rem',
      flexGrow: 1,
      overflow: 'hidden',
    }}
  >
    {items.map((item) => (
      <Box
        key={item.label}
        onClick={() => onNavigate(item.path)}
        sx={navItemStyles(currentPath === item.path)}
      >
        {React.cloneElement(item.icon, { sx: { fontSize: '1.2rem' } })}
        {item.label}
      </Box>
    ))}
  </Box>
)

export default Navigation
