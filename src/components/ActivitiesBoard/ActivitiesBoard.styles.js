export const sectionHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 2,
}

export const filterTabStyles = (active) => ({
  px: 2,
  py: 0.5,
  borderRadius: '12px',
  fontWeight: 900,
  fontSize: '0.75rem',
  cursor: 'pointer',
  border: '2px solid',
  borderColor: active ? 'text.primary' : 'divider',
  bgcolor: active ? 'text.primary' : 'transparent',
  color: active ? 'background.default' : 'text.secondary',
  transition: 'all 0.15s',
  userSelect: 'none',
  '&:hover': {
    borderColor: 'text.primary',
    color: active ? 'background.default' : 'text.primary',
  },
})

export const sectionDividerStyles = {
  width: '2px',
  bgcolor: 'divider',
  borderRadius: '2px',
  flexShrink: 0,
}
