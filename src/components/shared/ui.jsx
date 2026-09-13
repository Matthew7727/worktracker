import React from 'react'
import { Box, Typography } from '@mui/material'

export const MONO = '"JetBrains Mono", monospace'

const ink = (theme) => theme.palette.text.primary

// Stream colours are light-to-mid tones, so ink text always reads on them.
const onColor = '#000'

export const InkButton = ({
  tone = 'solid',
  color,
  size = 'md',
  startIcon,
  endIcon,
  disabled = false,
  children,
  sx = {},
  ...props
}) => {
  const solidBg = color || 'text.primary'
  const solidFg = color ? onColor : 'background.paper'
  const pad =
    size === 'lg'
      ? { px: 3.5, py: 1.5, fontSize: '1rem' }
      : size === 'sm'
        ? { px: 1.5, py: 0.6, fontSize: '0.78rem' }
        : { px: 2.5, py: 1, fontSize: '0.88rem' }

  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        fontFamily: 'inherit',
        fontWeight: 800,
        letterSpacing: '-0.005em',
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        border: tone === 'ghost' ? '2.5px solid transparent' : '2.5px solid',
        borderColor: tone === 'ghost' ? 'transparent' : 'text.primary',
        bgcolor:
          tone === 'solid'
            ? solidBg
            : tone === 'outline'
              ? 'background.paper'
              : 'transparent',
        color: tone === 'solid' ? solidFg : 'text.primary',
        boxShadow: tone === 'ghost' ? 'none' : (t) => `3px 3px 0 ${ink(t)}`,
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        '& svg': { fontSize: '1.1em' },
        ...pad,
        '&:hover':
          tone === 'ghost'
            ? { borderColor: 'text.primary' }
            : {
                transform: 'translate(-2px, -2px)',
                boxShadow: (t) => `5px 5px 0 ${ink(t)}`,
              },
        '&:active': { transform: 'translate(1px, 1px)', boxShadow: 'none' },
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'primary.main',
          outlineOffset: 3,
        },
        '&:disabled': {
          bgcolor: 'transparent',
          color: 'text.disabled',
          borderColor: 'divider',
          borderStyle: 'dashed',
          boxShadow: 'none',
          transform: 'none',
        },
        ...sx,
      }}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </Box>
  )
}

// Joined options that share one ink rule — a single control, not a row of pills.
export const Segmented = ({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel,
  sx = {},
}) => (
  <Box
    role="radiogroup"
    aria-label={ariaLabel}
    sx={{
      display: 'inline-flex',
      flexWrap: 'wrap',
      border: '2.5px solid',
      borderColor: 'text.primary',
      bgcolor: 'background.paper',
      ...sx,
    }}
  >
    {options.map((opt, i) => {
      const active = opt.value === value
      return (
        <Box
          key={opt.value}
          component="button"
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(opt.value)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontFamily: 'inherit',
            fontWeight: 800,
            fontSize: size === 'sm' ? '0.8rem' : '0.92rem',
            px: size === 'sm' ? 1.75 : 2.5,
            py: size === 'sm' ? 0.75 : 1.1,
            border: 'none',
            borderLeft: i === 0 ? 'none' : '2.5px solid',
            borderColor: 'text.primary',
            cursor: 'pointer',
            bgcolor: active ? opt.color || 'text.primary' : 'transparent',
            color: active
              ? opt.color
                ? onColor
                : 'background.paper'
              : 'text.secondary',
            '&:hover': active
              ? {}
              : { color: 'text.primary', bgcolor: 'action.hover' },
            '&:focus-visible': {
              outline: '3px solid',
              outlineColor: 'primary.main',
              outlineOffset: -3,
            },
          }}
        >
          {opt.swatch && (
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                bgcolor: opt.swatch,
                border: '1.5px solid',
                borderColor: active ? onColor : 'text.primary',
              }}
            />
          )}
          {opt.label}
          {opt.meta != null && (
            <Box
              component="span"
              sx={{ fontFamily: MONO, fontSize: '0.72em', opacity: 0.7 }}
            >
              {opt.meta}
            </Box>
          )}
        </Box>
      )
    })}
  </Box>
)

export const PageHeader = ({ title, meta, children, sx = {} }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 3,
      flexWrap: 'wrap',
      pb: 2,
      mb: 5,
      borderBottom: '3px solid',
      borderColor: 'text.primary',
      ...sx,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, minWidth: 0 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '2.25rem', md: '3.25rem' },
          fontWeight: 900,
          letterSpacing: '-0.045em',
          lineHeight: 0.95,
        }}
      >
        {title}
      </Typography>
      {meta != null && (
        <Typography
          sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.secondary' }}
        >
          {meta}
        </Typography>
      )}
    </Box>
    {children && (
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {children}
      </Box>
    )}
  </Box>
)

export const SectionHeader = ({ title, meta, subtitle, action, sx = {} }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 2,
      mb: 2,
      ...sx,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </Typography>
        {meta != null && (
          <Typography
            sx={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            {meta}
          </Typography>
        )}
      </Box>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
)

// Joined scoreboard cells: a set of readings that belong to one instrument.
export const StatStrip = ({ items, sx = {} }) => {
  const visible = items.filter(Boolean)
  if (visible.length === 0) return null
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          md: `repeat(${visible.length}, 1fr)`,
        },
        border: '3px solid',
        borderColor: 'text.primary',
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      {visible.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            p: 2.25,
            borderLeft: {
              xs: i % 2 === 0 ? 'none' : '3px solid',
              md: i === 0 ? 'none' : '3px solid',
            },
            borderTop: { xs: i >= 2 ? '3px solid' : 'none', md: 'none' },
            borderColor: 'text.primary',
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: /\d/.test(String(item.value)) ? MONO : 'inherit',
              fontWeight: /\d/.test(String(item.value)) ? 700 : 900,
              fontSize: item.size === 'sm' ? '1.5rem' : '2.4rem',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: item.color || 'text.primary',
            }}
          >
            {item.value}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', mt: 1 }}>
            {item.label}
          </Typography>
          {item.sub && (
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.78rem',
                color: item.subColor || 'text.secondary',
              }}
            >
              {item.sub}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

export const EmptyState = ({ title, children, action }) => (
  <Box
    sx={{
      border: '2.5px dashed',
      borderColor: 'text.disabled',
      px: 4,
      py: 5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 3,
      flexWrap: 'wrap',
    }}
  >
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: '1.15rem' }}>
        {title}
      </Typography>
      {children && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {children}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
)
