import React from 'react'
import { Box, Typography } from '@mui/material'
import { Check } from '@mui/icons-material'
import { useFilofaxTokens } from '../styles/useUiStyle'
import { SERIF } from '../styles/filofaxTheme'

import { LINE } from './paperStyles'

/** Printed insert header: title, a right-hand aside, and a double rule. */
export const PageHead = ({ title, aside, children, sx = {} }) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        pb: 1.25,
        mb: 4,
        borderBottom: `3px double ${ff.print}`,
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: SERIF,
            fontSize: { xs: '1.9rem', md: '2.4rem' },
            lineHeight: 1.05,
            color: ff.print,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
        {aside && (
          <Typography
            sx={{
              mt: 0.5,
              fontStyle: 'italic',
              color: 'text.secondary',
              fontSize: '0.92rem',
            }}
          >
            {aside}
          </Typography>
        )}
      </Box>
      {children && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            flexWrap: 'wrap',
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  )
}

/** A printed section heading inside a page, with a hairline beneath. */
export const PrintHeading = ({ children, aside, action, sx = {} }) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${ff.ruleStrong}`,
        pb: 0.6,
        mb: 1.5,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
        <Typography
          component="h2"
          sx={{ fontSize: '1.2rem', color: ff.print, lineHeight: 1.3 }}
        >
          {children}
        </Typography>
        {aside != null && (
          <Typography
            sx={{
              fontStyle: 'italic',
              fontSize: '0.85rem',
              color: 'text.secondary',
            }}
          >
            {aside}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}

/** Small italic printed label, e.g. a column heading on an insert. */
export const PrintLabel = ({ children, sx = {}, ...props }) => {
  const ff = useFilofaxTokens()
  return (
    <Typography
      sx={{
        fontStyle: 'italic',
        fontSize: '0.8rem',
        color: ff.print,
        lineHeight: 1.4,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  )
}

/** A printed tick box. The tick is written in the page's print colour. */
export const TickBox = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 16,
  color,
}) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      component="button"
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange?.(!checked)
      }}
      sx={{
        width: size,
        height: size,
        p: 0,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1.25px solid ${checked ? color || ff.print : ff.inkSoft}`,
        borderRadius: '2px',
        bgcolor: 'transparent',
        color: color || ff.print,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        '& svg': { fontSize: size + 2, strokeWidth: 1 },
        '&:hover': disabled ? {} : { borderColor: color || ff.print },
        '&:focus-visible': {
          outline: `2px solid ${ff.gold}`,
          outlineOffset: 2,
        },
      }}
    >
      {checked && <Check sx={{ mt: '-3px', ml: '2px' }} />}
    </Box>
  )
}

/** Inked stream marker: a small swatch and the stream name. */
export const StreamMark = ({ stream, label, sx = {} }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      fontStyle: 'italic',
      fontSize: '0.82rem',
      color: 'text.secondary',
      minWidth: 0,
      ...sx,
    }}
  >
    <Box
      component="span"
      sx={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
        bgcolor: stream?.color || 'text.disabled',
      }}
    />
    <Box
      component="span"
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {label ?? stream?.name ?? 'Unfiled'}
    </Box>
  </Box>
)

/** A rubber-stamp status mark. */
export const Stamp = ({ children, color, sx = {} }) => {
  const ff = useFilofaxTokens()
  const c = color || ff.print
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 0.8,
        py: '1px',
        border: `1.25px solid ${c}`,
        borderRadius: '3px',
        color: c,
        fontStyle: 'italic',
        fontSize: '0.75rem',
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

/** A loose sheet laid on the page: slightly brighter card, rounded corners. */
export const Slip = ({ children, band, sx = {}, ...props }) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: ff.slip,
        border: `1px solid ${ff.rule}`,
        borderRadius: '6px',
        boxShadow: `0 1px 0 ${ff.pageShade}`,
        ...(band && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: 18,
            width: 44,
            height: 5,
            borderRadius: '0 0 3px 3px',
            bgcolor: band,
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

/** A quiet link-like pen action. */
export const PenLink = ({
  children,
  onClick,
  startIcon,
  sx = {},
  ...props
}) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0,
        border: 'none',
        background: 'none',
        fontFamily: SERIF,
        fontSize: '0.88rem',
        fontStyle: 'italic',
        color: ff.print,
        cursor: 'pointer',
        textDecoration: 'underline',
        textDecorationColor: ff.ruleStrong,
        textUnderlineOffset: '3px',
        '& svg': { fontSize: '1rem' },
        '&:hover': { textDecorationColor: ff.print },
        '&:disabled': {
          color: 'text.disabled',
          cursor: 'default',
          textDecoration: 'none',
        },
        '&:focus-visible': {
          outline: `2px solid ${ff.gold}`,
          outlineOffset: 2,
        },
        ...sx,
      }}
      {...props}
    >
      {startIcon}
      {children}
    </Box>
  )
}

/** Nothing written here yet: an italic line with an optional action. */
export const BlankLine = ({ children, action, sx = {} }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 2,
      flexWrap: 'wrap',
      py: 1,
      ...sx,
    }}
  >
    <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
      {children}
    </Typography>
    {action}
  </Box>
)
