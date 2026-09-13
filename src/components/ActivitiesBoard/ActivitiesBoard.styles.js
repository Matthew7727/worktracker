import { OFFSET, RULE, hardShadow } from '../../styles/tokens'

export const sectionHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 2,
}

export const filterTabStyles = (
  active,
  customBg = 'text.primary',
  customText = 'background.default'
) => ({
  px: 2.5,
  py: 0.75,
  fontWeight: 800,
  fontSize: '0.8rem',
  cursor: 'pointer',
  border: `${RULE.base}px solid`,
  borderColor: active ? 'text.primary' : 'transparent',
  bgcolor: active ? customBg : 'action.hover',
  color: active ? customText : 'text.secondary',
  boxShadow: active
    ? (theme) => hardShadow(OFFSET.base, theme.palette.text.primary)
    : 'none',
  transform: active
    ? `translate(-${OFFSET.press}px, -${OFFSET.press}px)`
    : 'none',
  userSelect: 'none',
  '&:hover': {
    borderColor: 'text.primary',
    color: active ? customText : 'text.primary',
    ...(active
      ? {}
      : {
          transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
          boxShadow: (theme) =>
            hardShadow(OFFSET.press, theme.palette.text.primary),
        }),
  },
})

export const sectionDividerStyles = {
  width: `${RULE.hair}px`,
  bgcolor: 'divider',
  flexShrink: 0,
}
