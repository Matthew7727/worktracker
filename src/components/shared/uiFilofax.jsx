import React from 'react'
import { Box, Typography } from '@mui/material'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { SERIF } from '../../styles/filofaxTheme'
import { PageHead, PrintHeading } from '../../filofax/paper'

// Filofax renderings of the shared primitives in ui.jsx. Same props, printed
// stationery instead of hard ink blocks.

export const FxInkButton = ({
  tone = 'solid',
  // eslint-disable-next-line no-unused-vars
  color,
  size = 'md',
  startIcon,
  endIcon,
  disabled = false,
  children,
  sx = {},
  ...props
}) => {
  const ff = useFilofaxTokens()
  const pad =
    size === 'lg'
      ? { px: 2.75, py: 1, fontSize: '1rem' }
      : size === 'sm'
        ? { px: 1.25, py: 0.35, fontSize: '0.82rem' }
        : { px: 2, py: 0.7, fontSize: '0.9rem' }

  const toneSx =
    tone === 'solid'
      ? {
          bgcolor: ff.print,
          color: ff.page,
          border: `1px solid ${ff.print}`,
          '&:hover': { filter: 'brightness(1.12)' },
        }
      : tone === 'outline'
        ? {
            bgcolor: 'transparent',
            color: ff.ink,
            border: `1px solid ${ff.ruleStrong}`,
            '&:hover': { borderColor: ff.print, color: ff.print },
          }
        : {
            bgcolor: 'transparent',
            color: ff.print,
            border: '1px solid transparent',
            fontStyle: 'italic',
            '&:hover': {
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            },
          }

  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        fontFamily: SERIF,
        fontWeight: 400,
        whiteSpace: 'nowrap',
        borderRadius: '3px',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'filter 0.12s ease, border-color 0.12s ease',
        '& svg': { fontSize: '1.05em' },
        ...pad,
        ...toneSx,
        '&:focus-visible': {
          outline: `2px solid ${ff.gold}`,
          outlineOffset: 2,
        },
        '&:disabled': {
          bgcolor: 'transparent',
          color: 'text.disabled',
          borderColor: ff.rule,
          filter: 'none',
          textDecoration: 'none',
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

// Printed options: the chosen one is ringed in the print colour, as if
// circled with a pen.
export const FxSegmented = ({
  options,
  value,
  onChange,
  ariaLabel,
  sx = {},
}) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.5,
        ...sx,
        borderWidth: 0,
      }}
    >
      {options.map((opt) => {
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
              gap: 0.75,
              px: 1.1,
              py: 0.3,
              fontFamily: SERIF,
              fontSize: '0.86rem',
              fontStyle: active ? 'normal' : 'italic',
              color: active ? ff.print : ff.inkSoft,
              bgcolor: 'transparent',
              border: `1px solid ${active ? ff.print : 'transparent'}`,
              borderRadius: '999px',
              cursor: 'pointer',
              '&:hover': active ? {} : { color: ff.ink },
              '&:focus-visible': {
                outline: `2px solid ${ff.gold}`,
                outlineOffset: 1,
              },
            }}
          >
            {(opt.swatch || opt.color) && (
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: opt.swatch || opt.color,
                  display: opt.color?.includes?.('.') ? 'none' : 'block',
                }}
              />
            )}
            {opt.label}
            {opt.meta != null && (
              <Box component="span" sx={{ fontSize: '0.8em', opacity: 0.7 }}>
                {opt.meta}
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export const FxPageHeader = ({ title, meta, children, sx = {} }) => (
  <PageHead title={title} aside={meta} sx={sx}>
    {children}
  </PageHead>
)

export const FxSectionHeader = ({ title, meta, subtitle, action, sx = {} }) => (
  <Box sx={{ mb: 2, ...sx, flexWrap: undefined }}>
    <PrintHeading aside={meta} action={action} sx={{ mb: subtitle ? 0.5 : 0 }}>
      {title}
    </PrintHeading>
    {subtitle && (
      <Typography
        sx={{
          fontStyle: 'italic',
          fontSize: '0.85rem',
          color: 'text.secondary',
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
)

// Figures set in a row, divided by hairlines — like totals on a ledger insert.
export const FxStatStrip = ({ items, sx = {} }) => {
  const ff = useFilofaxTokens()
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
        borderTop: `1px solid ${ff.ruleStrong}`,
        borderBottom: `1px solid ${ff.ruleStrong}`,
        ...sx,
      }}
    >
      {visible.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            px: 2,
            py: 1.5,
            borderLeft: i === 0 ? 'none' : `1px solid ${ff.rule}`,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: item.size === 'sm' ? '1.25rem' : '2rem',
              lineHeight: 1.1,
              color: ff.ink,
            }}
          >
            {item.value}
          </Typography>
          <Typography
            sx={{ fontStyle: 'italic', fontSize: '0.82rem', color: ff.print }}
          >
            {item.label}
          </Typography>
          {item.sub && (
            <Typography
              sx={{
                fontSize: '0.76rem',
                color: item.subColor ? undefined : 'text.secondary',
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

export const FxEmptyState = ({ title, children, action }) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        flexWrap: 'wrap',
        py: 2.5,
        borderTop: `1px solid ${ff.rule}`,
        borderBottom: `1px solid ${ff.rule}`,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: '1.05rem', color: ff.ink }}>
          {title}
        </Typography>
        {children && (
          <Typography
            sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 0.25 }}
          >
            {children}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}
