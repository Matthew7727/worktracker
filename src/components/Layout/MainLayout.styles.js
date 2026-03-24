export const appBarStyles = {
  zIndex: 1100,
  bgcolor: 'transparent',
  color: 'text.primary',
  boxShadow: 'none',
}

export const toolbarStyles = {
  height: '4rem',
  minHeight: '4rem !important',
  px: '4rem !important',
  display: 'flex',
  gap: 4,
  bgcolor: 'transparent',
}

export const brandStyles = {
  cursor: 'pointer',
  fontWeight: 950,
  mr: 4,
  letterSpacing: '-0.05em',
  '& span': { color: 'primary.main' },
  whiteSpace: 'nowrap',
}

export const navItemStyles = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 2,
  height: '100%',
  cursor: 'pointer',
  fontWeight: 900,
  fontSize: '1rem',
  color: isActive ? 'primary.main' : 'text.primary',
  borderBottom: '4px solid',
  borderColor: isActive ? 'primary.main' : 'transparent',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  '&:hover': {
    bgcolor: 'rgba(0,0,0,0.04)',
  },
})

export const searchFieldStyles = {
  borderRadius: '12px',
  bgcolor: 'background.paper',
  '& fieldset': { borderWidth: '2px', borderColor: 'text.primary' },
  maxWidth: '400px',
  minWidth: '200px',
}

export const searchDialogStyles = {
  p: 2,
  borderRadius: '24px',
  border: '4px solid',
  borderColor: 'text.primary',
  bgcolor: 'background.paper',
}

export const alertStyles = {
  width: '100%',
  fontWeight: 900,
  border: '3px solid',
  borderColor: 'text.primary',
  borderRadius: '16px',
  boxShadow: '0 8px 0', // Shadow color inherits or needs specific handling
  color: 'text.primary', // Ensure text is visible
  '& .MuiAlert-icon': { fontSize: '1.5rem' },
}

export const fabStyles = {
  border: '3px solid',
  borderColor: 'text.primary',
  boxShadow: '0 6px 0',
  color: 'text.primary', // Just in case
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 0' },
}

export const toolbarIconStyles = {
  border: '2px solid',
  borderColor: 'text.primary',
  borderRadius: '12px',
  p: 1.5,
  transition: 'all 0.2s',
  color: 'text.primary',
  '&:hover': {
    bgcolor: 'primary.main',
    color: 'white',
    borderColor: 'primary.main', // Match border on hover
    transform: 'translateY(-2px)',
  },
}

// Documentation Page Styles
export const docsContainerStyles = {
  display: 'flex',
  gap: 6,
  py: 4,
}

export const docsSidebarStyles = {
  width: '280px',
  flexShrink: 0,
  position: 'sticky',
  top: '7.5rem',
  height: 'fit-content',
  display: { xs: 'none', lg: 'block' },
}

export const docsContentStyles = {
  flexGrow: 1,
  minWidth: 0,
  textAlign: 'left',
  '& h1': {
    fontWeight: 950,
    fontSize: '3rem',
    mb: 4,
    letterSpacing: '-0.02em',
    color: 'text.primary',
  },
  '& h2': {
    fontWeight: 900,
    fontSize: '2rem',
    mt: 6,
    mb: 3,
    borderBottom: '3px solid',
    borderColor: 'divider',
    pb: 1,
    color: 'text.primary',
  },
  '& h3': {
    fontWeight: 900,
    fontSize: '1.5rem',
    mt: 4,
    mb: 2,
    color: 'text.primary',
  },
  '& p': {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    mb: 3,
    opacity: 0.8,
    color: 'text.primary',
  },
  '& ul, & ol': { mb: 3, pl: 4, color: 'text.primary' },
  '& li': { mb: 1.5, fontSize: '1.1rem', opacity: 0.8 },
  '& code': {
    bgcolor: 'action.hover',
    px: 1,
    borderRadius: '4px',
    fontWeight: 700,
    fontFamily: '"JetBrains Mono", monospace',
  },
  '& blockquote': {
    borderLeft: '5px solid',
    borderColor: 'primary.main',
    pl: 3,
    py: 1,
    my: 3,
    bgcolor: 'action.hover',
    fontWeight: 600,
    color: 'text.primary',
  },
}
