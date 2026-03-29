export const sectionHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 2,
}

export const filterTabStyles = (active, customBg = 'text.primary', customText = 'background.default') => ({
  px: 2.5,
  py: 0.75,
  borderRadius: '20px',
  fontWeight: 900,
  fontSize: '0.8rem',
  cursor: 'pointer',
  border: '3px solid',
  borderColor: active ? 'text.primary' : 'transparent',
  bgcolor: active ? customBg : 'action.hover',
  color: active ? customText : 'text.secondary',
  boxShadow: active ? (theme) => `3px 3px 0px ${theme.palette.text.primary}` : 'none',
  transform: active ? 'translate(-2px, -2px)' : 'none',
  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  userSelect: 'none',
  '&:hover': {
    borderColor: 'text.primary',
    color: active ? customText : 'text.primary',
    ...(active ? {} : { transform: 'translate(-1px, -1px)', boxShadow: (theme) => `2px 2px 0px ${theme.palette.text.primary}` })
  },
})

export const sectionDividerStyles = {
  width: '2px',
  bgcolor: 'divider',
  borderRadius: '2px',
  flexShrink: 0,
}
