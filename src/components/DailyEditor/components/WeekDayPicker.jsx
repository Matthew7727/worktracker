import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { getWeekDays } from '../utils/weekDays'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const STREAM_DOTS = [
  { key: 'clientWork', color: 'primary.main' },
  { key: 'practiceDevelopment', color: 'secondary.main' },
  { key: 'businessDevelopment', color: '#eb8449' },
]

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

const WeekDayPicker = ({ currentDate, onSelectDay, weekStatus }) => {
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
                border: '4px solid black',
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: 'white',
                color: 'black',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                boxShadow: isSelected ? '4px 4px 0px black' : 'none',
                '&:hover': {
                  transform: 'translate(-2px, -2px)',
                  boxShadow: '4px 4px 0px black',
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

              {DAY_LABELS[i]}
              <Stack direction="row" spacing={0.5} alignItems="center">
                {STREAM_DOTS.map(({ key, color }) => (
                  <Box
                    key={key}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: status[key] ? color : 'transparent',
                      border: status[key] ? 'none' : '2px solid rgba(0,0,0,0.2)',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}

export default WeekDayPicker
