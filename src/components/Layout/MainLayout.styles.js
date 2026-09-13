import { RULE, OFFSET, FONT, hardShadow } from '../../styles/tokens'

export const appBarStyles = {
  zIndex: 1100,
  bgcolor: 'background.default',
  color: 'text.primary',
  boxShadow: 'none',
}

export const toolbarStyles = {
  height: '4.5rem',
  minHeight: '4.5rem !important',
  px: '0 !important',
  display: 'flex',
  gap: 0,
  bgcolor: 'background.default',
}

export const brandCellStyles = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  px: 3,
  cursor: 'pointer',
  borderRight: `${RULE.base}px solid`,
  borderColor: 'divider',
  '&:hover span span': { color: 'text.primary' },
}

export const brandStyles = {
  fontWeight: 800,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  '& span': { color: 'primary.main' },
}

export const navItemStyles = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 2.5,
  height: '100%',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.82rem',
  whiteSpace: 'nowrap',
  bgcolor: isActive ? 'text.primary' : 'transparent',
  color: isActive ? 'background.default' : 'text.primary',
  borderRight: `${RULE.hair}px solid`,
  borderColor: 'divider',
  '&:hover': { bgcolor: isActive ? 'text.primary' : 'action.hover' },
})

export const searchFieldStyles = {
  bgcolor: 'background.paper',
  '& fieldset': { borderWidth: RULE.hair, borderColor: 'text.primary' },
  maxWidth: '400px',
  minWidth: '200px',
}

export const searchDialogStyles = {
  p: 3,
  border: `${RULE.heavy}px solid`,
  borderColor: 'text.primary',
  bgcolor: 'background.paper',
}

export const alertStyles = {
  width: '100%',
  fontWeight: 700,
  border: `${RULE.base}px solid`,
  borderColor: 'text.primary',
  boxShadow: (theme) => hardShadow(OFFSET.lift, theme.palette.text.primary),
  color: 'text.primary',
  '& .MuiAlert-icon': { fontSize: '1.4rem' },
}

// Back-to-top: a stamped square that presses into the page when clicked.
export const fabStyles = {
  border: `${RULE.base}px solid`,
  borderColor: 'text.primary',
  boxShadow: (theme) => hardShadow(OFFSET.lift, theme.palette.text.primary),
  color: 'text.primary',
  '&:hover': {
    transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
    boxShadow: (theme) => hardShadow(OFFSET.hero, theme.palette.text.primary),
  },
  '&:active': {
    transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
    boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
  },
}

// Square tool button sized to sit flush inside the rail.
export const toolbarIconStyles = {
  width: '3.25rem',
  height: '100%',
  borderRadius: 0,
  borderLeft: `${RULE.hair}px solid`,
  borderColor: 'divider',
  color: 'text.primary',
  transition: 'background-color 0.1s linear, color 0.1s linear',
  '&:hover': {
    bgcolor: 'text.primary',
    color: 'background.default',
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
    fontWeight: 800,
    fontSize: '3.5rem',
    lineHeight: 0.95,
    mb: 4,
    letterSpacing: '-0.04em',
    color: 'text.primary',
  },
  '& h2': {
    fontWeight: 800,
    fontSize: '2rem',
    letterSpacing: '-0.03em',
    mt: 6,
    mb: 3,
    borderBottom: `${RULE.base}px solid`,
    borderColor: 'divider',
    pb: 1,
    color: 'text.primary',
  },
  '& h3': {
    fontWeight: 800,
    fontSize: '1.35rem',
    letterSpacing: '-0.02em',
    mt: 4,
    mb: 2,
    color: 'text.primary',
  },
  '& p': {
    fontSize: '1.05rem',
    lineHeight: 1.6,
    mb: 3,
    maxWidth: '68ch',
    color: 'text.secondary',
  },
  '& ul, & ol': { mb: 3, pl: 4, color: 'text.primary', maxWidth: '68ch' },
  '& li': { mb: 1.5, fontSize: '1.05rem', color: 'text.secondary' },
  '& code': {
    bgcolor: 'background.subtle',
    px: 1,
    borderRadius: 0,
    fontWeight: 700,
    fontFamily: FONT.data,
  },
  '& blockquote': {
    borderLeft: `${RULE.heavy}px solid`,
    borderColor: 'primary.main',
    pl: 3,
    py: 1,
    my: 3,
    ml: 0,
    bgcolor: 'background.subtle',
    fontWeight: 600,
    maxWidth: '68ch',
    color: 'text.primary',
  },
}
