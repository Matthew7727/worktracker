import { FONT, OFFSET, RULE, hardShadow } from '../../styles/tokens'

export const cardStyles = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  border: `${RULE.base}px solid`,
  borderColor: 'divider',
  transition:
    'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
  bgcolor: 'background.paper',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: 'background.paper',
    transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
    boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
  },
}

export const toolbarStyles = {
  p: 1.5,
  px: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `${RULE.base}px solid`,
  borderColor: 'divider',
  bgcolor: 'background.paper',
  boxShadow: 'none',
  mb: 3,
}

export const datePickerStyles = {
  width: '180px',
  '& fieldset': { border: 'none' },
  '& .MuiInputBase-root': {
    bgcolor: 'background.paper',
    border: `${RULE.hair}px solid`,
    borderColor: 'text.primary',
    fontFamily: FONT.data,
    fontWeight: 800,
    '&:hover': {
      bgcolor: 'action.hover',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
    },
  },
}

export const entryBodyStyles = {
  disableUnderline: true,
  sx: {
    fontSize: '1.2rem',
    lineHeight: 1.4,
    border: `${RULE.hair}px solid`,
    borderColor: 'divider',
    bgcolor: 'background.paper',
    p: 2.5,
    textAlign: 'left',
    color: 'text.primary',
    '&:hover': {
      borderColor: 'text.primary',
      bgcolor: 'background.paper',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
    },
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
  bgcolor: 'background.paper',
  border: `${RULE.hair}px solid`,
  borderColor: 'divider',
  width: 'fit-content',
}

export const toolbarBtnStyles = {
  p: 1,
  border: `${RULE.hair}px solid`,
  borderColor: 'transparent',
  color: 'text.secondary',
  '&:hover': {
    borderColor: 'text.primary',
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
    fontWeight: 800,
    px: 8,
    py: 4,
    border: `${RULE.heavy}px solid`,
    borderColor: 'text.primary',
    color: 'text.primary',
    bgcolor: 'background.paper',
    cursor: 'pointer',
    transition:
      'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, color 0.15s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
      boxShadow: (theme) => hardShadow(OFFSET.hero, theme.palette.text.primary),
      bgcolor: 'text.primary',
      color: 'background.paper',
    },
  },
  flowButton: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 800,
    px: 4,
    py: 1.5,
    border: `${RULE.base}px solid`,
    borderColor: 'text.primary',
    color: 'text.primary',
    bgcolor: 'background.paper',
    cursor: 'pointer',
    transition:
      'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, color 0.15s ease',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '&:hover': {
      transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
      boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
      bgcolor: 'text.primary',
      color: 'background.paper',
    },
  },
  shineLayer: {
    display: 'none',
  },
}
