import React, { useMemo, useState } from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { getDateKey } from '../../components/DailyEditor/utils/weekDays'
import { PrintHeading, PenLink, StreamMark } from '../paper'
import { statusInk } from '../paperStyles'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const STATUS_LABEL = { pto: 'PTO', sick: 'Sick', volunteering: 'Volunteering' }

/**
 * A printed year-at-a-glance planner: one row per month, one box per day.
 * Logged days are inked in the colour of the stream that dominated them;
 * days off carry their status initial. Any day opens its diary page.
 */
const YearPlanner = ({ entries, streams }) => {
  const ff = useFilofaxTokens()
  const navigate = useNavigate()
  const [year, setYear] = useState(new Date().getFullYear())
  const todayKey = getDateKey(new Date())
  const thisYear = new Date().getFullYear()

  const byDate = useMemo(() => {
    const map = new Map()
    entries.forEach((e) => map.set(e.date, e))
    return map
  }, [entries])

  const describe = (key) => {
    const entry = byDate.get(key)
    if (!entry) return null
    const status = entry.metadata?.dayStatus
    if (status && status !== 'working') {
      return { status, label: STATUS_LABEL[status] || status }
    }
    const counts = streams.map((s) => entry.streamCounts?.[s.id] || 0)
    const total = counts.reduce((a, b) => a + b, 0)
    if (!total) return { label: 'Logged, nothing written' }
    const top = counts.indexOf(Math.max(...counts))
    const dominant = counts.filter((c) => c === counts[top]).length === 1
    return {
      color: dominant ? streams[top].color : ff.inkSoft,
      label: dominant ? `Mostly ${streams[top].name}` : 'Mixed streams',
      words: total,
    }
  }

  const logged = entries.filter((e) => e.date.startsWith(String(year))).length

  return (
    <Box component="section">
      <PrintHeading
        aside={`${logged} ${logged === 1 ? 'day' : 'days'} logged`}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PenLink
              startIcon={<ChevronLeft />}
              onClick={() => setYear((y) => y - 1)}
            >
              {year - 1}
            </PenLink>
            <PenLink
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= thisYear}
            >
              {year + 1}
              <ChevronRight />
            </PenLink>
          </Box>
        }
      >
        Year planner {year}
      </PrintHeading>

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box
          role="grid"
          aria-label={`Year planner for ${year}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: '38px repeat(31, minmax(18px, 1fr))',
            minWidth: 720,
          }}
        >
          <Box />
          {Array.from({ length: 31 }, (_, i) => (
            <Typography
              key={i}
              sx={{
                fontStyle: 'italic',
                fontSize: '0.62rem',
                textAlign: 'center',
                color: ff.print,
                pb: 0.25,
              }}
            >
              {i + 1}
            </Typography>
          ))}

          {MONTHS.map((month, m) => {
            const daysInMonth = new Date(year, m + 1, 0).getDate()
            return (
              <React.Fragment key={month}>
                <Typography
                  role="rowheader"
                  sx={{
                    fontSize: '0.78rem',
                    color: ff.print,
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: `1px solid ${ff.rule}`,
                  }}
                >
                  {month}
                </Typography>
                {Array.from({ length: 31 }, (_, d) => {
                  if (d >= daysInMonth) {
                    return (
                      <Box
                        key={d}
                        aria-hidden
                        sx={{
                          borderTop: `1px solid ${ff.rule}`,
                          backgroundImage: `repeating-linear-gradient(135deg, transparent 0 3px, ${ff.rule} 3px 4px)`,
                        }}
                      />
                    )
                  }
                  const date = new Date(year, m, d + 1)
                  const key = getDateKey(date)
                  const weekend = date.getDay() === 0 || date.getDay() === 6
                  const info = describe(key)
                  const isToday = key === todayKey
                  const future = key > todayKey
                  const title = `${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}${
                    info
                      ? `: ${info.label}${info.words ? `, ${info.words} words` : ''}`
                      : ''
                  }`
                  return (
                    <Tooltip
                      key={d}
                      title={title}
                      placement="top"
                      disableInteractive
                    >
                      <Box
                        component="button"
                        type="button"
                        role="gridcell"
                        aria-label={title}
                        disabled={future}
                        onClick={() =>
                          navigate('/', {
                            state: { initialDate: `${key}T12:00:00` },
                          })
                        }
                        sx={{
                          position: 'relative',
                          height: 22,
                          p: 0,
                          border: 'none',
                          borderTop: `1px solid ${ff.rule}`,
                          borderLeft: `1px solid ${ff.rule}`,
                          bgcolor: weekend ? ff.pageShade : 'transparent',
                          cursor: future ? 'default' : 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '0.6rem',
                          fontStyle: 'italic',
                          color: info?.status
                            ? statusInk(ff, info.status)
                            : 'transparent',
                          outline: isToday ? `1.5px solid ${ff.print}` : 'none',
                          outlineOffset: -1,
                          zIndex: isToday ? 1 : 0,
                          '&:hover': future ? {} : { bgcolor: 'action.hover' },
                          '&:focus-visible': {
                            outline: `2px solid ${ff.gold}`,
                            zIndex: 2,
                          },
                          '&::after': info?.color
                            ? {
                                content: '""',
                                position: 'absolute',
                                inset: '4px 3px',
                                borderRadius: '2px',
                                bgcolor: info.color,
                                opacity: 0.85,
                              }
                            : {},
                        }}
                      >
                        {info?.status ? info.label[0] : ''}
                      </Box>
                    </Tooltip>
                  )
                })}
              </React.Fragment>
            )
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mt: 1.5 }}>
        {streams.map((s) => (
          <StreamMark key={s.id} stream={s} />
        ))}
        <StreamMark stream={{ color: ff.inkSoft }} label="Mixed" />
        {Object.entries(STATUS_LABEL).map(([id, label]) => (
          <Typography
            key={id}
            sx={{
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: statusInk(ff, id),
            }}
          >
            {label[0]} {label}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}

export default YearPlanner
