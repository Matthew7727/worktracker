export const cardStyles = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  border: '3px solid',
  borderColor: 'divider',
  borderRadius: '24px',
  transition: 'all 0.2s',
  bgcolor: 'background.paper',
  '&:hover': {
    bgcolor: 'action.hover',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
}

export const toolbarStyles = {
  p: 1.5,
  px: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '24px',
  border: '3px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  mb: 3,
}

export const datePickerStyles = {
  width: '180px',
  '& fieldset': { border: 'none' },
  '& .MuiInputBase-root': {
    bgcolor: 'action.hover',
    borderRadius: '12px',
    fontWeight: 900,
  },
}

export const entryBodyStyles = {
  disableUnderline: true,
  sx: {
    fontSize: '1.2rem',
    lineHeight: 1.4,
    borderRadius: '16px',
    bgcolor: 'action.hover',
    p: 2.5,
    textAlign: 'left',
    color: 'text.primary',
    '&:hover': { bgcolor: 'action.selected' },
    '&::after': { borderBottom: 'none !important' },
    '&.Mui-focused::after': { borderBottom: 'none !important' },
    '& textarea:focus': { outline: 'none' },
  },
}

export const markdownToolbarStyles = {
  display: 'flex',
  gap: 0.5,
  mb: 1,
  p: 0.5,
  bgcolor: 'action.hover',
  borderRadius: '12px',
  width: 'fit-content',
}

export const toolbarBtnStyles = {
  p: 1,
  borderRadius: '8px',
  color: 'text.secondary',
  '&:hover': {
    bgcolor: 'primary.main',
    color: 'background.paper',
  },
}

export const flowStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 4,
  },
  startButton: {
    fontFamily: 'inherit',
    fontSize: '3rem',
    fontWeight: 950,
    px: 8,
    py: 4,
    borderRadius: '40px',
    border: '6px solid',
    borderColor: 'text.primary',
    color: 'text.primary',
    bgcolor: 'background.paper',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: (theme) => `20px 20px 0px ${theme.palette.text.primary}`,
      '& .shine-layer': {
        opacity: 1,
        transform: 'translateX(100%) skewX(-15deg)',
      },
    },
  },
  flowButton: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 900,
    px: 4,
    py: 1.5,
    borderRadius: '25px',
    border: '3px solid',
    borderColor: 'text.primary',
    color: 'text.primary',
    bgcolor: 'background.paper',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '&:hover': {
      transform: 'translate(-2px, -2px)',
      boxShadow: (theme) => `6px 6px 0px ${theme.palette.text.primary}`,
      '& .shine-layer': {
        opacity: 1,
        transform: 'translateX(100%) skewX(-15deg)',
      },
    },
  },
  shineLayer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '200%',
    height: '100%',
    opacity: 0,
    transition: 'all 0.8s ease',
    background:
      'linear-gradient(90deg, transparent, #80b621, #00d2ff, #eb8449, transparent)',
    pointerEvents: 'none',
    zIndex: 1,
  },
}
