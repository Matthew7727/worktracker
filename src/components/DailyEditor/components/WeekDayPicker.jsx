import React, { useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Menu,
  MenuItem,
  InputBase,
} from '@mui/material'
import { MoreHoriz } from '@mui/icons-material'
import { getWeekDays } from '../utils/weekDays'
import { DAY_STATUSES } from '../constants'
import { FONT, OFFSET, RULE, hardShadow } from '../../../styles/tokens'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

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
          color: 'currentColor',
          opacity: 0.7,
          '&:hover': { opacity: 1 },
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
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              border: `${RULE.base}px solid`,
              borderColor: 'text.primary',
              boxShadow: (theme) =>
                hardShadow(OFFSET.base, theme.palette.text.primary),
            },
          },
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

const StaffitHoursBox = ({ hours, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const commit = () => {
    setEditing(false)
    const parsed = parseFloat(value)
    onSave(isNaN(parsed) ? null : parsed)
  }

  return (
    <Box
      component="button"
      onClick={() => {
        setValue(hours ?? '')
        setEditing(true)
      }}
      sx={{
        px: 3,
        py: 1.5,
        fontFamily: 'inherit',
        border: `${RULE.base}px solid`,
        borderColor: 'text.primary',
        cursor: editing ? 'text' : 'pointer',
        bgcolor: 'background.paper',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        minWidth: 96,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
          boxShadow: (theme) =>
            hardShadow(OFFSET.base, theme.palette.text.primary),
        },
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.65rem',
        }}
      >
        Staffit / wk
      </Typography>
      {editing ? (
        <InputBase
          autoFocus
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setValue(hours ?? '')
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          inputProps={{
            step: 0.5,
            min: 0,
            style: {
              textAlign: 'center',
              fontFamily: FONT.data,
              fontWeight: 800,
              fontSize: '1rem',
              width: 56,
              padding: 0,
            },
          }}
        />
      ) : (
        <Typography
          sx={{ fontFamily: FONT.data, fontWeight: 800, fontSize: '1rem' }}
        >
          {hours != null && hours !== '' ? hours : '—'}
        </Typography>
      )}
    </Box>
  )
}

const WeekDayPicker = ({
  currentDate,
  onSelectDay,
  weekStatus,
  streams = [],
  onQuickSetDayStatus,
  staffitHours,
  onSaveStaffitHours,
}) => {
  const weekDays = getWeekDays(new Date())

  return (
    <Stack alignItems="center" sx={{ mt: 2, mb: 4 }} spacing={2}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: FONT.data,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          textAlign: 'center',
        }}
      >
        {formatDate(currentDate)}
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center">
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
                fontWeight: 800,
                fontSize: '1rem',
                border: `${isSelected ? RULE.heavy : RULE.base}px solid`,
                borderColor: 'text.primary',
                cursor: 'pointer',
                bgcolor: isSelected
                  ? 'text.primary'
                  : isNonWorking
                    ? statusConfig.color
                    : 'background.paper',
                color: isSelected
                  ? 'background.default'
                  : isNonWorking
                    ? '#000'
                    : 'text.primary',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                position: 'relative',
                overflow: 'hidden',
                transition:
                  'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                transform: isSelected
                  ? `translate(-${OFFSET.press}px, -${OFFSET.press}px)`
                  : 'none',
                boxShadow: isSelected
                  ? (theme) =>
                      hardShadow(OFFSET.base, theme.palette.text.primary)
                  : 'none',
                '&:hover': {
                  transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
                  boxShadow: (theme) =>
                    hardShadow(OFFSET.base, theme.palette.text.primary),
                  bgcolor: isSelected
                    ? 'text.primary'
                    : isNonWorking
                      ? statusConfig.color
                      : 'text.primary',
                  color:
                    isSelected || !isNonWorking ? 'background.default' : '#000',
                },
              }}
            >
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
                    fontWeight: 800,
                    fontSize: '0.6rem',
                  }}
                >
                  {statusConfig.label}
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
                            width: 10,
                            height: 10,
                            bgcolor: isFilled ? stream.color : 'transparent',
                            border: `${RULE.hair}px solid`,
                            borderColor: isFilled
                              ? stream.color
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
        {onSaveStaffitHours && (
          <StaffitHoursBox hours={staffitHours} onSave={onSaveStaffitHours} />
        )}
      </Stack>
    </Stack>
  )
}

export default WeekDayPicker
