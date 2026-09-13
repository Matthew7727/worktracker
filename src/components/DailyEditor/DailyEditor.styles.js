export const cardStyles = {
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  border: '3px solid',
  borderColor: 'text.primary',
  bgcolor: 'background.paper',
  boxShadow: (theme) => `6px 6px 0 ${theme.palette.text.primary}`,
}

export const entryBodyStyles = {
  disableUnderline: true,
  sx: {
    fontSize: '1.15rem',
    lineHeight: 1.65,
    bgcolor: 'transparent',
    px: 3,
    py: 2.5,
    textAlign: 'left',
    color: 'text.primary',
    '&:hover': { bgcolor: 'transparent' },
    '&.Mui-focused': { bgcolor: 'transparent' },
    '&::after': { borderBottom: 'none !important' },
    '&.Mui-focused::after': { borderBottom: 'none !important' },
    '& textarea:focus': { outline: 'none' },
    '& textarea::placeholder': { color: 'text.disabled', opacity: 1 },
  },
}

export const markdownToolbarStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
  px: 1,
  py: 0.75,
  borderBottom: '2px solid',
  borderColor: 'divider',
  bgcolor: 'background.subtle',
  width: '100%',
}

export const toolbarBtnStyles = {
  p: 0.75,
  color: 'text.secondary',
  '& svg': { fontSize: '1.15rem' },
  '&:hover': {
    bgcolor: 'text.primary',
    color: 'background.paper',
  },
}
