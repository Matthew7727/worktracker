import React from 'react'
import { Box, Typography } from '@mui/material'

export const SettingsSection = ({
  id,
  title,
  description,
  children,
  action,
}) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={`${id}-title`}
    sx={{
      scrollMarginTop: 24,
      border: '3px solid',
      borderColor: 'text.primary',
      bgcolor: 'background.paper',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        px: 3,
        py: 2.25,
        borderBottom: '3px solid',
        borderColor: 'text.primary',
      }}
    >
      <Box sx={{ maxWidth: '62ch' }}>
        <Typography
          id={`${id}-title`}
          component="h2"
          sx={{
            fontSize: '1.6rem',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{ color: 'text.secondary', mt: 0.75, lineHeight: 1.5 }}
          >
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
    {children}
  </Box>
)

export const SettingRow = ({ label, hint, children, sx = {} }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 2,
      px: 3,
      py: 2,
      borderTop: '2px solid',
      borderColor: 'divider',
      '&:first-of-type': { borderTop: 'none' },
      ...sx,
    }}
  >
    <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
      <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
      {hint && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {hint}
        </Typography>
      )}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {children}
    </Box>
  </Box>
)

export const NumberField = ({
  value,
  onChange,
  unit,
  disabled,
  inputProps,
  width = 96,
  type = 'number',
  label,
}) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'stretch',
      border: '2.5px solid',
      borderColor: disabled ? 'divider' : 'text.primary',
      bgcolor: 'background.paper',
    }}
  >
    <Box
      component="input"
      type={type}
      value={value}
      disabled={disabled}
      aria-label={label}
      onChange={onChange}
      {...inputProps}
      sx={{
        width,
        border: 'none',
        outline: 'none',
        px: 1.25,
        py: 0.9,
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        fontSize: '1.05rem',
        bgcolor: 'transparent',
        color: disabled ? 'text.disabled' : 'text.primary',
        colorScheme: 'inherit',
        '&:focus-visible': { bgcolor: 'action.hover' },
      }}
    />
    {unit && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.25,
          borderLeft: '2.5px solid',
          borderColor: disabled ? 'divider' : 'text.primary',
          bgcolor: 'background.subtle',
          fontWeight: 800,
          fontSize: '0.88rem',
          color: disabled ? 'text.disabled' : 'text.primary',
        }}
      >
        {unit}
      </Box>
    )}
  </Box>
)
