import React, { useEffect, useState } from 'react'
import { Box, Typography, Menu, MenuItem, InputBase } from '@mui/material'
import { MoreHoriz } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import {
  getDateKey,
  getWeekDays,
  getWeekendDays,
  isWeekend,
} from '../../components/DailyEditor/utils/weekDays'
import { DAY_STATUSES } from '../../components/DailyEditor/constants'
import {
  loadStaffitHours,
  setHoursForWeek,
  getWeekKey,
} from '../../utils/staffitManager'
import { PrintLabel } from '../paper'
import { SERIF, statusInk } from '../paperStyles'

const DayMenu = ({ day, currentStatus, onSetStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  return (
    <>
      <Box
        component="span"
        role="button"
        tabIndex={0}
        aria-label={`Set day type for ${day.toDateString()}`}
        className="day-menu"
        onClick={(e) => {
          e.stopPropagation()
          setAnchorEl(e.currentTarget)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation()
            setAnchorEl(e.currentTarget)
          }
        }}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          display: 'flex',
          color: 'text.secondary',
          opacity: 0,
          borderRadius: '3px',
          '&:hover, &:focus-visible': { opacity: 1 },
        }}
      >
        <MoreHoriz sx={{ fontSize: '1rem' }} />
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

const HoursCell = ({ weekDate }) => {
  const ff = useFilofaxTokens()
  const { selectedDirectory } = useAppContext()
  const weekKey = getWeekKey(weekDate)
  const [hours, setHours] = useState(null)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!selectedDirectory) return
    loadStaffitHours(selectedDirectory).then((data) =>
      setHours(data[weekKey] ?? null)
    )
  }, [selectedDirectory, weekKey])

  const commit = async () => {
    setEditing(false)
    const parsed = parseFloat(value)
    const next = isNaN(parsed) ? null : parsed
    setHours(next)
    await setHoursForWeek(selectedDirectory, weekDate, next)
  }

  const hasHours = hours != null && hours !== ''

  return (
    <Box
      component={editing ? 'div' : 'button'}
      type={editing ? undefined : 'button'}
      title="Client hours declared in STAFFIT for this week"
      onClick={() => {
        if (editing) return
        setValue(hours ?? '')
        setEditing(true)
      }}
      sx={{
        p: 1.25,
        textAlign: 'left',
        border: 'none',
        borderLeft: `1px solid ${ff.ruleStrong}`,
        bgcolor: 'transparent',
        color: ff.ink,
        fontFamily: SERIF,
        cursor: editing ? 'text' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': { bgcolor: editing ? 'transparent' : 'action.hover' },
      }}
    >
      <PrintLabel>STAFFIT hours</PrintLabel>
      {editing ? (
        <InputBase
          autoFocus
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          inputProps={{
            step: 0.5,
            min: 0,
            'aria-label': 'STAFFIT hours this week',
            style: { fontSize: '1.6rem', padding: 0, width: 80 },
          }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: '1.6rem',
            lineHeight: 1.2,
            color: hasHours ? ff.ink : 'text.disabled',
          }}
        >
          {hasHours ? `${hours}h` : '—'}
        </Typography>
      )}
      <Typography
        sx={{
          fontStyle: 'italic',
          fontSize: '0.72rem',
          color: 'text.secondary',
        }}
      >
        {editing ? 'Enter to save' : hasHours ? 'Click to change' : 'Add hours'}
      </Typography>
    </Box>
  )
}

/**
 * A printed week-to-view strip: Monday to Friday in full columns, the weekend
 * sharing narrower ones, and the week's STAFFIT hours in the last box.
 */
const WeekToView = ({
  currentDate,
  weekStatus,
  streams,
  onSelectDay,
  onQuickSetDayStatus,
}) => {
  const ff = useFilofaxTokens()
  const days = [...getWeekDays(currentDate), ...getWeekendDays(currentDate)]
  const todayKey = getDateKey(new Date())
  const activeStreams = streams.filter((s) => !s.archived)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(4, minmax(0, 1fr))',
          md: 'repeat(5, minmax(0, 1fr)) repeat(2, minmax(0, 0.62fr)) minmax(118px, 0.9fr)',
        },
        borderTop: `1px solid ${ff.ruleStrong}`,
        borderBottom: `1px solid ${ff.ruleStrong}`,
        mb: 4,
      }}
    >
      {days.map((day, i) => {
        const key = getDateKey(day)
        const status = weekStatus[key] || {}
        const dayStatus = status.dayStatus || 'working'
        const nonWorking = dayStatus !== 'working'
        const statusConfig = DAY_STATUSES.find((s) => s.id === dayStatus)
        const selected = key === getDateKey(currentDate)
        const isToday = key === todayKey
        const weekend = isWeekend(day)
        const filled = activeStreams.filter((s) => status.filled?.[s.id])

        return (
          <Box
            key={key}
            component="button"
            type="button"
            onClick={() => onSelectDay(day)}
            aria-pressed={selected}
            aria-label={`${day.toDateString()}${nonWorking ? `, ${statusConfig.label}` : `, ${filled.length} of ${activeStreams.length} streams logged`}`}
            sx={{
              position: 'relative',
              minHeight: 104,
              p: 1.25,
              textAlign: 'left',
              fontFamily: SERIF,
              color: ff.ink,
              border: 'none',
              borderLeft: {
                xs: i % 4 === 0 ? 'none' : `1px solid ${ff.rule}`,
                md: i === 0 ? 'none' : `1px solid ${ff.rule}`,
              },
              borderTop: {
                xs: i >= 4 ? `1px solid ${ff.rule}` : 'none',
                md: 'none',
              },
              bgcolor: weekend ? ff.pageShade : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': { bgcolor: 'action.hover' },
              '&:hover .day-menu': { opacity: 0.8 },
              '&:focus-visible': {
                outline: `2px solid ${ff.gold}`,
                outlineOffset: -2,
              },
            }}
          >
            {onQuickSetDayStatus && (
              <DayMenu
                day={day}
                currentStatus={dayStatus}
                onSetStatus={onQuickSetDayStatus}
              />
            )}
            <Box>
              <PrintLabel sx={{ color: isToday ? ff.print : ff.inkSoft }}>
                {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                {isToday ? ', today' : ''}
              </PrintLabel>
              <Box
                sx={{
                  mt: 0.25,
                  width: 40,
                  height: 40,
                  ml: '-6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  // The selected day is ringed, as if circled in pen
                  border: `1.5px solid ${selected ? ff.print : 'transparent'}`,
                  transform: selected ? 'rotate(-8deg)' : 'none',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.45rem',
                    lineHeight: 1,
                    color: selected ? ff.print : ff.ink,
                  }}
                >
                  {day.getDate()}
                </Typography>
              </Box>
            </Box>
            {nonWorking ? (
              <Typography
                sx={{
                  fontStyle: 'italic',
                  fontSize: '0.78rem',
                  color: statusInk(ff, dayStatus),
                }}
              >
                {statusConfig.label}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: '4px', minHeight: 8 }}>
                {activeStreams.map((stream) => (
                  <Box
                    key={stream.id}
                    title={stream.name}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: status.filled?.[stream.id]
                        ? stream.color
                        : 'transparent',
                      border: `1px solid ${status.filled?.[stream.id] ? stream.color : ff.ruleStrong}`,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )
      })}
      <HoursCell weekDate={currentDate} />
    </Box>
  )
}

export default WeekToView
