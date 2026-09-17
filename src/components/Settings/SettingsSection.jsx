import React from 'react'
import { Box, Typography } from '@mui/material'
import { useIsFilofax } from '../../styles/useUiStyle'

export const SettingsSection = ({
  id,
  title,
  description,
  children,
  action,
}) => {
  const isFx = useIsFilofax()
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={`${id}-title`}
      sx={{
        scrollMarginTop: 24,
        ...(isFx
          ? {}
          : {
              border: '3px solid',
              borderColor: 'text.primary',
              bgcolor: 'background.paper',
            }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          px: isFx ? 0 : 3,
          py: isFx ? 1 : 2.25,
          borderBottom: isFx ? '1px solid' : '3px solid',
          borderColor: isFx ? 'secondary.main' : 'text.primary',
        }}
      >
        <Box sx={{ maxWidth: '62ch' }}>
          <Typography
            id={`${id}-title`}
            component="h2"
            sx={{
              fontSize: isFx ? '1.35rem' : '1.6rem',
              fontWeight: isFx ? 400 : 900,
              letterSpacing: isFx ? 0 : '-0.035em',
              lineHeight: 1.1,
              color: isFx ? 'primary.main' : 'text.primary',
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                color: 'text.secondary',
                mt: 0.75,
                lineHeight: 1.5,
                fontStyle: isFx ? 'italic' : 'normal',
                fontSize: isFx ? '0.88rem' : undefined,
              }}
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
}

export const SettingRow = ({ label, hint, children, sx = {} }) => {
  const isFx = useIsFilofax()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        px: isFx ? 0 : 3,
        py: isFx ? 1.5 : 2,
        borderTop: isFx ? '1px solid' : '2px solid',
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 'none' },
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
        <Typography sx={{ fontWeight: isFx ? 400 : 800 }}>{label}</Typography>
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
}

export const NumberField = ({
  value,
  onChange,
  unit,
  disabled,
  inputProps,
  width = 96,
  type = 'number',
  label,
}) => {
  const isFx = useIsFilofax()
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'stretch',
        borderRadius: isFx ? '3px' : 0,
        border: isFx ? '1px solid' : '2.5px solid',
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
          fontFamily: isFx ? 'inherit' : '"JetBrains Mono", monospace',
          fontWeight: isFx ? 400 : 700,
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
            borderLeft: isFx ? '1px solid' : '2.5px solid',
            borderColor: disabled ? 'divider' : 'text.primary',
            bgcolor: 'background.subtle',
            fontWeight: isFx ? 400 : 800,
            fontStyle: isFx ? 'italic' : 'normal',
            fontSize: '0.88rem',
            color: disabled ? 'text.disabled' : 'text.primary',
          }}
        >
          {unit}
        </Box>
      )}
    </Box>
  )
}
