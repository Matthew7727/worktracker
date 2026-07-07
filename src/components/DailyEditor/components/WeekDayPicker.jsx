import React, { useState } from 'react'
import { Box, Stack, Typography, Menu, MenuItem } from '@mui/material'
import { MoreHoriz } from '@mui/icons-material'
import { keyframes } from '@emotion/react'
import { getWeekDays } from '../utils/weekDays'
import { DAY_STATUSES } from '../constants'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const shineLoop = keyframes`
  0%   { transform: translateX(-150%) skewX(-15deg); }
  100% { transform: translateX(250%) skewX(-15deg); }
`

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const DayStatusMenu = ({ day, currentStatus, onSetStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  return (
    <>
      <Box
        component="span"
        onClick={(e) => {
          e.stopPropagation()
          setAnchorEl(e.currentTarget)
        }}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          zIndex: 3,
          display: 'flex',
          p: 0.25,
          borderRadius: '50%',
          color: 'text.disabled',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <MoreHoriz sx={{ fontSize: '0.9rem' }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(e) => {
          e?.stopPropagation?.()
          setAnchorEl(null)
        }}
      >
        {DAY_STATUSES.map((status) => (
          <MenuItem
            key={status.id}
            selected={status.id === currentStatus}
            onClick={(e) => {
              e.stopPropagation()
              setAnchorEl(null)
              onSetStatus(day, status.id)
            }}
          >
            {status.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

const WeekDayPicker = ({
  currentDate,
  onSelectDay,
  weekStatus,
  streams = [],
  onQuickSetDayStatus,
}) => {
  const weekDays = getWeekDays(new Date())

  return (
    <Stack alignItems="center" sx={{ mt: 2, mb: 4 }} spacing={2}>
      <Typography variant="h2" sx={{ fontWeight: 950, textAlign: 'center' }}>
        {formatDate(currentDate)}
      </Typography>

      <Stack direction="row" spacing={1.5}>
        {weekDays.map((day, i) => {
          const isSelected = day.toDateString() === currentDate.toDateString()
          const dateKey = day.toISOString().split('T')[0]
          const status = weekStatus[dateKey] || {}
          const dayStatus = status.dayStatus || 'working'
          const isNonWorking = dayStatus !== 'working'
          const statusConfig = DAY_STATUSES.find((s) => s.id === dayStatus)

          return (
            <Box
              key={i}
              component="button"
              onClick={() => onSelectDay(day)}
              sx={{
                px: 3,
                py: 1.5,
                fontFamily: 'inherit',
                fontWeight: 950,
                fontSize: '1rem',
                border: '4px solid',
                borderColor: 'text.primary',
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: isNonWorking
                  ? `${statusConfig.color}33`
                  : 'background.paper',
                color: 'text.primary',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                boxShadow: isSelected
                  ? (theme) => `4px 4px 0px ${theme.palette.text.primary}`
                  : 'none',
                '&:hover': {
                  transform: 'translate(-2px, -2px)',
                  boxShadow: (theme) =>
                    `4px 4px 0px ${theme.palette.text.primary}`,
                  ...(!isSelected && {
                    '& .shine-swipe': {
                      animation: `${shineLoop} 1.2s linear infinite`,
                      opacity: 1,
                    },
                  }),
                },
              }}
            >
              {/* Shine sweep layer — only animates on hover when not selected */}
              <Box
                className="shine-swipe"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  opacity: 0,
                  background:
                    'linear-gradient(90deg, transparent, #80b621, transparent)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />

              {onQuickSetDayStatus && (
                <DayStatusMenu
                  day={day}
                  currentStatus={dayStatus}
                  onSetStatus={onQuickSetDayStatus}
                />
              )}

              {DAY_LABELS[i]}

              {isNonWorking ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.6rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {statusConfig.label.toUpperCase()}
                </Typography>
              ) : (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {streams
                    .filter((s) => !s.archived)
                    .map((stream) => {
                      const isFilled = status.filled?.[stream.id]
                      return (
                        <Box
                          key={stream.id}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: isFilled ? stream.color : 'transparent',
                            border: isFilled ? 'none' : '2px solid',
                            borderColor: isFilled
                              ? 'transparent'
                              : 'text.disabled',
                            position: 'relative',
                            zIndex: 2,
                          }}
                        />
                      )
                    })}
                </Stack>
              )}
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}

export default WeekDayPicker
