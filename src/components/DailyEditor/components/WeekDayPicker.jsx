import React, { useState } from 'react'
import { Box, Typography, Menu, MenuItem, InputBase } from '@mui/material'
import { MoreHoriz } from '@mui/icons-material'
import { getDateKey, getRecentWorkingDays } from '../utils/weekDays'
import { DAY_STATUSES } from '../constants'
import { MONO } from '../../shared/ui'

const RULE = '3px solid'

const DayStatusMenu = ({ day, currentStatus, onSetStatus, inverted }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  return (
    <>
      <Box
        component="span"
        role="button"
        aria-label="Set day type"
        onClick={(e) => {
          e.stopPropagation()
          setAnchorEl(e.currentTarget)
        }}
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 3,
          display: 'flex',
          p: 0.25,
          color: inverted ? 'background.paper' : 'text.secondary',
          opacity: 0.6,
          '&:hover': { opacity: 1 },
        }}
      >
        <MoreHoriz sx={{ fontSize: '1.05rem' }} />
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
            sx={{ fontWeight: 700, gap: 1.25 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: status.color,
                border: '1.5px solid',
                borderColor: 'text.primary',
              }}
            />
            {status.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

const StaffitCell = ({ hours, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const commit = () => {
    setEditing(false)
    const parsed = parseFloat(value)
    onSave(isNaN(parsed) ? null : parsed)
  }

  const hasHours = hours != null && hours !== ''

  return (
    <Box
      component={editing ? 'div' : 'button'}
      type={editing ? undefined : 'button'}
      onClick={() => {
        if (editing) return
        setValue(hours ?? '')
        setEditing(true)
      }}
      title="Hours declared in STAFFIT this week"
      sx={{
        fontFamily: 'inherit',
        textAlign: 'left',
        border: 'none',
        borderLeft: RULE,
        borderColor: 'text.primary',
        bgcolor: 'background.subtle',
        color: 'text.primary',
        cursor: editing ? 'text' : 'pointer',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 132,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
        STAFFIT
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
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
            inputProps={{
              step: 0.5,
              min: 0,
              'aria-label': 'STAFFIT hours this week',
              style: {
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '2.4rem',
                width: 88,
                padding: 0,
                lineHeight: 1,
              },
            }}
          />
        ) : (
          <Typography
            sx={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '2.4rem',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: hasHours ? 'text.primary' : 'text.disabled',
            }}
          >
            {hasHours ? hours : '—'}
          </Typography>
        )}
        <Typography
          sx={{ fontFamily: MONO, fontWeight: 700, color: 'text.secondary' }}
        >
          h
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}
      >
        {editing ? 'Enter to save' : hasHours ? 'Click to edit' : 'Add hours'}
      </Typography>
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
  const workingDays = getRecentWorkingDays(new Date())
  const todayKey = new Date().toDateString()
  const activeStreams = streams.filter((s) => !s.archived)

  return (
    <Box sx={{ mb: 5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2.5,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
          }}
        >
          {currentDate.toLocaleDateString('en-GB', { weekday: 'long' })}{' '}
          <Box component="span" sx={{ color: 'text.secondary', ml: '0.12em' }}>
            {currentDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
            })}
          </Box>
        </Typography>
        <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Last 5 working days
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: onSaveStaffitHours
            ? 'repeat(5, minmax(0, 1fr)) minmax(120px, 0.9fr)'
            : 'repeat(5, minmax(0, 1fr))',
          border: RULE,
          borderColor: 'text.primary',
          bgcolor: 'background.paper',
          boxShadow: (t) => `6px 6px 0 ${t.palette.text.primary}`,
        }}
      >
        {workingDays.map((day, i) => {
          const isSelected = day.toDateString() === currentDate.toDateString()
          const isToday = day.toDateString() === todayKey
          const dateKey = getDateKey(day)
          const status = weekStatus[dateKey] || {}
          const dayStatus = status.dayStatus || 'working'
          const isNonWorking = dayStatus !== 'working'
          const statusConfig = DAY_STATUSES.find((s) => s.id === dayStatus)
          const filledCount = activeStreams.filter(
            (s) => status.filled?.[s.id]
          ).length

          return (
            <Box
              key={dateKey}
              component="button"
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={isSelected}
              aria-label={`${day.toDateString()}${isNonWorking ? `, ${statusConfig.label}` : `, ${filledCount} of ${activeStreams.length} streams logged`}`}
              sx={{
                position: 'relative',
                fontFamily: 'inherit',
                textAlign: 'left',
                border: 'none',
                borderLeft: i === 0 ? 'none' : RULE,
                borderColor: 'text.primary',
                p: 2,
                minHeight: 132,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
                bgcolor: isSelected ? 'text.primary' : 'transparent',
                color: isSelected ? 'background.paper' : 'text.primary',
                transition: 'background-color 0.12s ease',
                '&:hover': isSelected ? {} : { bgcolor: 'action.hover' },
                '&:focus-visible': {
                  outline: '3px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -6,
                },
              }}
            >
              {onQuickSetDayStatus && (
                <DayStatusMenu
                  day={day}
                  currentStatus={dayStatus}
                  onSetStatus={onQuickSetDayStatus}
                  inverted={isSelected}
                />
              )}

              <Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1 }}
                >
                  {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                  {isToday && (
                    <Box
                      component="span"
                      sx={{
                        ml: 0.75,
                        px: 0.6,
                        py: 0.1,
                        fontSize: '0.68rem',
                        bgcolor: 'primary.main',
                        color: '#000',
                      }}
                    >
                      Today
                    </Box>
                  )}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: '2.4rem',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    mt: 0.75,
                  }}
                >
                  {String(day.getDate()).padStart(2, '0')}
                </Typography>
              </Box>

              {isNonWorking ? (
                <Box
                  sx={{
                    alignSelf: 'flex-start',
                    px: 0.75,
                    py: 0.25,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    bgcolor: statusConfig.color,
                    color: '#000',
                    border: '2px solid',
                    borderColor: isSelected
                      ? 'background.paper'
                      : 'text.primary',
                  }}
                >
                  {statusConfig.label}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: '3px' }}>
                  {activeStreams.map((stream) => {
                    const isFilled = status.filled?.[stream.id]
                    return (
                      <Box
                        key={stream.id}
                        title={stream.name}
                        sx={{
                          flex: 1,
                          height: 10,
                          bgcolor: isFilled ? stream.color : 'transparent',
                          border: '2px solid',
                          borderColor: isFilled
                            ? stream.color
                            : isSelected
                              ? '#8a8a82'
                              : 'divider',
                        }}
                      />
                    )
                  })}
                </Box>
              )}
            </Box>
          )
        })}
        {onSaveStaffitHours && (
          <StaffitCell hours={staffitHours} onSave={onSaveStaffitHours} />
        )}
      </Box>
    </Box>
  )
}

export default WeekDayPicker
