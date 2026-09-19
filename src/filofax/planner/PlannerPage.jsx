import React, { useMemo } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { Star } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useDashboardData from '../../components/Dashboard/hooks/useDashboardData'
import HeroStatement from '../../components/Dashboard/components/HeroStatement'
import { useAppContext } from '../../context/AppContext'
import {
  getTagCounts,
  getCollaborators,
  getTasksClosedPerWeek,
  getTaskTotals,
  getWellbeingCounts,
  getCycleWeeks,
} from '../../utils/dashboardInsights'
import { getActivityStreamId } from '../../utils/projectsManager'
import { StatStrip } from '../../components/shared/ui'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import {
  PageHead,
  PrintHeading,
  PrintLabel,
  StreamMark,
  BlankLine,
  PenLink,
  Slip,
} from '../paper'
import { LINE, statusInk } from '../paperStyles'
import YearPlanner from './YearPlanner'
import InkBars from './InkBars'

const UNLOCK_MOMENTUM = 14
const shortDate = (d) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const getMonday = (date) => {
  const d = new Date(date)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

const Figure = ({ value, label }) => {
  const ff = useFilofaxTokens()
  return (
    <Box>
      <Typography sx={{ fontSize: '1.6rem', lineHeight: 1.1, color: ff.ink }}>
        {value}
      </Typography>
      <PrintLabel>{label}</PrintLabel>
    </Box>
  )
}

const Line = ({ children, aside, onClick }) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        minHeight: LINE,
        px: 0,
        border: 'none',
        borderBottom: `1px solid ${ff.rule}`,
        background: 'none',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        color: ff.ink,
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { color: ff.print } : {},
      }}
    >
      <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
        {children}
      </Box>
      {aside != null && (
        <Box
          component="span"
          sx={{
            fontStyle: 'italic',
            fontSize: '0.78rem',
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          {aside}
        </Box>
      )}
    </Box>
  )
}

const PlannerPage = () => {
  const ff = useFilofaxTokens()
  const navigate = useNavigate()
  const { streamConfig, streams, mainFocusStream } = useAppContext()
  const {
    stats,
    projects,
    allEntries,
    utilisationTarget,
    utilisationPrediction,
    staffitHours,
    standardWeeklyHours,
    loading,
  } = useDashboardData()

  const tagCounts = useMemo(() => getTagCounts(allEntries), [allEntries])
  const collaborators = useMemo(() => getCollaborators(projects), [projects])
  const perWeek = useMemo(() => getTasksClosedPerWeek(projects), [projects])
  const taskTotals = useMemo(() => getTaskTotals(projects), [projects])
  const wellbeing = useMemo(() => getWellbeingCounts(allEntries), [allEntries])
  const cycleWeeks = useMemo(() => getCycleWeeks(staffitHours), [staffitHours])

  const utilisationEnabled = !!streamConfig?.features?.utilisation
  const projectHierarchy = !!streamConfig?.features?.projectHierarchy
  const days = stats.totalDays
  const streamById = Object.fromEntries(
    (streamConfig?.streams || []).map((s) => [s.id, s])
  )

  if (loading) {
    return (
      <Box>
        <PageHead title="Planner" />
        <Skeleton variant="rectangular" height={320} />
      </Box>
    )
  }

  // ── This week, by stream ────────────────────────────────────────────────
  const monday = getMonday(new Date())
  const weekColumns = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = d.toISOString().split('T')[0]
    const entry = allEntries.find((e) => e.date === key)
    const segments = streams.map((s) => ({
      value: entry?.streamCounts?.[s.id] || 0,
      color: s.color,
    }))
    return {
      key,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      segments,
      title: `${d.toLocaleDateString('en-GB', { weekday: 'long' })}: ${streams
        .map((s, j) => `${s.name} ${segments[j].value} words`)
        .join(', ')}`,
    }
  })

  // ── Momentum over 8 weeks ─────────────────────────────────────────────
  const momentumColumns = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(monday)
    start.setDate(start.getDate() - (7 - i) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    const tally = streams.map((s) =>
      allEntries
        .filter((e) => {
          const d = new Date(e.date)
          return d >= start && d < end
        })
        .reduce((n, e) => n + (e.streamCounts?.[s.id] || 0), 0)
    )
    return {
      key: start.toISOString(),
      segments: streams.map((s, j) => ({ value: tally[j], color: s.color })),
      title: `w/c ${shortDate(start)}: ${streams.map((s, j) => `${s.name} ${tally[j]} words`).join(', ')}`,
      total: tally.reduce((a, b) => a + b, 0),
    }
  })
  const recent = momentumColumns.slice(-4).reduce((n, c) => n + c.total, 0)
  const previous = momentumColumns.slice(0, 4).reduce((n, c) => n + c.total, 0)
  const momentumDelta =
    previous > 0 ? Math.round(((recent - previous) / previous) * 100) : null
  const momentumText =
    momentumDelta === null
      ? null
      : momentumDelta >= 10
        ? `Up ${momentumDelta}% on the previous four weeks`
        : momentumDelta <= -10
          ? `Down ${Math.abs(momentumDelta)}% on the previous four weeks`
          : 'Steady against the previous four weeks'

  // ── Stream balance ──────────────────────────────────────────────────────
  const totalMentions = streams.reduce(
    (n, s) => n + (stats.mentionsByStream?.[s.id] || 0),
    0
  )

  // ── Accomplishments & priorities ───────────────────────────────────────
  const completed = [
    ...projects.clientProjects
      .filter(
        (p) =>
          p.status === 'archived' ||
          p.status === 'completed' ||
          p.status === 'done'
      )
      .map((p) => ({ ...p, stream: mainFocusStream, type: 'project' })),
    ...projects.activities
      .filter((a) => a.status === 'archived' || a.status === 'completed')
      .map((a) => ({
        ...a,
        stream: streamById[getActivityStreamId(a)],
        type: 'activity',
      })),
  ]
    .sort((a, b) =>
      String(b.completedAt || b.createdAt).localeCompare(
        String(a.completedAt || a.createdAt)
      )
    )
    .slice(0, 6)
  const activeClients = projects.clientProjects.filter(
    (p) => p.status === 'active'
  )
  const activeActivities = projects.activities.filter(
    (a) => a.status === 'active'
  )
  const ageOf = (createdAt) =>
    Math.floor((new Date() - new Date(createdAt)) / 86400000)

  const deltaWeek = taskTotals.lastWeek - taskTotals.prevWeek
  const hasTasks =
    taskTotals.open > 0 ||
    taskTotals.closedThisCycle > 0 ||
    perWeek.some((w) => w.count > 0)
  const hasWellbeing =
    wellbeing.pto > 0 || wellbeing.sick > 0 || wellbeing.volunteering > 0

  const figures = [
    {
      value: stats.currentStreak,
      label: 'Day streak',
      sub: stats.currentStreak > 0 ? 'Keep it going' : 'Log today to start one',
    },
    { value: days, label: 'Days logged' },
    utilisationEnabled && utilisationPrediction !== null
      ? {
          value: `${utilisationPrediction}%`,
          label: 'Utilisation',
          sub:
            utilisationTarget !== null
              ? `${utilisationPrediction >= utilisationTarget ? 'At or above' : 'Below'} the ${utilisationTarget}% target`
              : null,
        }
      : null,
    stats.balanceScore > 0
      ? { value: stats.balanceScore, label: 'Balance' }
      : null,
    hasTasks
      ? {
          value: taskTotals.lastWeek,
          label: 'Todos closed last week',
          sub:
            deltaWeek === 0
              ? 'Same as the week before'
              : `${Math.abs(deltaWeek)} ${deltaWeek > 0 ? 'more' : 'fewer'} than the week before`,
        }
      : null,
  ]

  const twoCol = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
    gap: { xs: 5, lg: 6 },
    alignItems: 'start',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Box>
        <PageHead
          title="Planner"
          aside={`${days} working ${days === 1 ? 'day' : 'days'} on record`}
          sx={{ mb: 3 }}
        />
        {/* The dashboard's memo, set as a note clipped to the planner */}
        <Slip
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: 2.5,
            '& .MuiTypography-root': {
              fontSize: { xs: '1.15rem !important', md: '1.35rem !important' },
              fontWeight: '400 !important',
              letterSpacing: '0 !important',
              lineHeight: '1.55 !important',
            },
            // Emphasis in print ink: stream colours are too light for text on paper
            '& .MuiTypography-root span.MuiTypography-root': {
              color: `${ff.print} !important`,
              fontWeight: '700 !important',
              fontSize: 'inherit !important',
            },
            '& header': { p: 0, gap: 1.25 },
          }}
        >
          <HeroStatement
            projects={projects}
            stats={stats}
            utilisationTarget={utilisationTarget}
            utilisationPrediction={utilisationPrediction}
            tagCounts={tagCounts}
            collaborators={collaborators}
            taskTotals={taskTotals}
            wellbeing={wellbeing}
          />
        </Slip>
      </Box>

      <StatStrip items={figures} />

      <YearPlanner entries={allEntries} streams={streamConfig?.streams || []} />

      <Box sx={twoCol}>
        <Box component="section">
          <PrintHeading aside="Words written per day">This week</PrintHeading>
          <InkBars
            columns={weekColumns}
            emptyLabel="No sessions logged this week yet."
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5 }}>
            {streams.map((s) => (
              <StreamMark key={s.id} stream={s} />
            ))}
          </Box>
        </Box>
        <Box component="section">
          <PrintHeading aside="Entries mentioning each stream, last 90 days">
            Stream balance
          </PrintHeading>
          {totalMentions === 0 ? (
            <BlankLine>No entries logged yet.</BlankLine>
          ) : (
            streams.map((s) => {
              const value = stats.mentionsByStream?.[s.id] || 0
              const pct = Math.round((value / totalMentions) * 100)
              return (
                <Box key={s.id} sx={{ mb: 1.75 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <StreamMark
                      stream={s}
                      sx={{
                        color: ff.ink,
                        fontStyle: 'normal',
                        fontSize: '0.9rem',
                      }}
                    />
                    <Typography sx={{ fontSize: '0.88rem', color: ff.ink }}>
                      {pct}%{' '}
                      <Box
                        component="span"
                        sx={{
                          fontStyle: 'italic',
                          color: 'text.secondary',
                          fontSize: '0.78rem',
                        }}
                      >
                        {value} {value === 1 ? 'entry' : 'entries'}
                      </Box>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 0.5,
                      height: 6,
                      borderRadius: '3px',
                      bgcolor: ff.rule,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${pct}%`,
                        height: '100%',
                        bgcolor: s.color,
                        borderRadius: '3px',
                      }}
                    />
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      </Box>

      <Box component="section">
        <PrintHeading aside={days >= UNLOCK_MOMENTUM ? momentumText : null}>
          Momentum over eight weeks
        </PrintHeading>
        {days >= UNLOCK_MOMENTUM ? (
          <InkBars
            columns={momentumColumns}
            height={160}
            startLabel="Eight weeks ago"
            endLabel="This week"
          />
        ) : (
          <BlankLine>
            Log {UNLOCK_MOMENTUM - days} more working{' '}
            {UNLOCK_MOMENTUM - days === 1 ? 'day' : 'days'} to fill in this page
            ({days} of {UNLOCK_MOMENTUM}).
          </BlankLine>
        )}
      </Box>

      {((utilisationEnabled && cycleWeeks.weeks.length > 0) || hasTasks) && (
        <Box sx={twoCol}>
          {utilisationEnabled && cycleWeeks.weeks.length > 0 && (
            <Box component="section">
              <PrintHeading
                aside={`Week ${cycleWeeks.weekNumber} of ${cycleWeeks.totalWeeks}`}
              >
                Utilisation cycle
              </PrintHeading>
              {utilisationPrediction !== null && utilisationTarget !== null && (
                <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                  <Figure
                    value={`${utilisationPrediction}%`}
                    label="Predicted"
                  />
                  <Figure value={`${utilisationTarget}%`} label="Target" />
                  <Figure
                    value={`${utilisationPrediction - utilisationTarget >= 0 ? '+' : ''}${utilisationPrediction - utilisationTarget}%`}
                    label={
                      utilisationPrediction >= utilisationTarget
                        ? 'Ahead'
                        : 'Behind'
                    }
                  />
                </Box>
              )}
              <PrintLabel sx={{ mb: 1 }}>
                STAFFIT hours declared each week, June{' '}
                {cycleWeeks.weeks[0].weekStart.getFullYear()} to May{' '}
                {cycleWeeks.weeks[0].weekStart.getFullYear() + 1}
              </PrintLabel>
              <InkBars
                height={110}
                startLabel="Start of cycle"
                endLabel="This week"
                columns={cycleWeeks.weeks.map((w) => ({
                  key: w.weekStart.toISOString(),
                  title: `w/c ${shortDate(w.weekStart)}: ${w.hours}h${standardWeeklyHours ? ` of ${standardWeeklyHours}h` : ''}`,
                  segments: [
                    {
                      value: w.hours,
                      color: mainFocusStream?.color || ff.print,
                    },
                  ],
                }))}
              />
            </Box>
          )}
          {hasTasks && (
            <Box component="section">
              <PrintHeading aside="Last eight weeks">Todos closed</PrintHeading>
              <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                <Figure value={taskTotals.open} label="Open todos" />
                <Figure
                  value={taskTotals.closedThisCycle}
                  label="Closed this cycle"
                />
                {taskTotals.subtasksTotal > 0 && (
                  <Figure
                    value={`${taskTotals.subtasksDone} of ${taskTotals.subtasksTotal}`}
                    label="Subtasks on active work"
                  />
                )}
              </Box>
              <InkBars
                height={110}
                startLabel="Eight weeks ago"
                endLabel="This week"
                columns={perWeek.map((w) => ({
                  key: w.weekStart.toISOString(),
                  title: `w/c ${shortDate(w.weekStart)}: ${w.count} closed`,
                  segments: [{ value: w.count, color: ff.print }],
                }))}
              />
            </Box>
          )}
        </Box>
      )}

      {(tagCounts.length > 0 || collaborators.length > 0 || hasWellbeing) && (
        <Box sx={twoCol}>
          {tagCounts.length > 0 && (
            <Box component="section">
              <PrintHeading aside="Last 90 days">Tags</PrintHeading>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  columnGap: 2,
                  rowGap: 0.5,
                }}
              >
                {(() => {
                  const top = tagCounts.slice(0, 16)
                  const max = Math.max(...top.map((t) => t.count), 1)
                  const min = Math.min(...top.map((t) => t.count), 1)
                  return top.map((t) => (
                    <Typography
                      key={t.tag}
                      title={`${t.count} ${t.count === 1 ? 'day' : 'days'}`}
                      sx={{
                        fontStyle: 'italic',
                        color: ff.ink,
                        fontSize: `${max === min ? 1.1 : 0.85 + ((t.count - min) / (max - min)) * 0.9}rem`,
                      }}
                    >
                      {t.tag}
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          ml: 0.4,
                        }}
                      >
                        {t.count}
                      </Box>
                    </Typography>
                  ))
                })()}
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {collaborators.length > 0 && (
              <Box component="section">
                <PrintHeading
                  aside="Most frequent"
                  action={
                    <PenLink onClick={() => navigate('/contacts')}>
                      All contacts
                    </PenLink>
                  }
                >
                  Who you work with
                </PrintHeading>
                {collaborators.slice(0, 6).map((c) => (
                  <Line
                    key={c.name}
                    aside={`${c.count} ${c.count === 1 ? 'piece of work' : 'pieces of work'}`}
                    onClick={() =>
                      navigate('/contacts', { state: { name: c.name } })
                    }
                  >
                    {c.name}
                  </Line>
                ))}
              </Box>
            )}
            {hasWellbeing && (
              <Box component="section">
                <PrintHeading aside="This cycle">Time off</PrintHeading>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  {[
                    ['pto', 'PTO days', wellbeing.pto],
                    ['sick', 'Sick days', wellbeing.sick],
                    ['volunteering', 'Volunteering', wellbeing.volunteering],
                  ].map(([id, label, value]) => (
                    <Box key={id}>
                      <Typography
                        sx={{
                          fontSize: '1.6rem',
                          lineHeight: 1.1,
                          color: statusInk(ff, id),
                        }}
                      >
                        {value}
                      </Typography>
                      <PrintLabel>{label}</PrintLabel>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Box sx={twoCol}>
        <Box component="section">
          <PrintHeading>Recently finished</PrintHeading>
          {completed.length === 0 ? (
            <BlankLine>Nothing finished yet.</BlankLine>
          ) : (
            completed.map((item) => (
              <Line
                key={`${item.type}-${item.id}`}
                aside={item.completedAt || null}
                onClick={() => navigate(`/todos/${item.type}/${item.id}`)}
              >
                <StreamMark stream={item.stream} label="" />
                {item.title}
              </Line>
            ))
          )}
        </Box>
        <Box component="section">
          <PrintHeading>Current priorities</PrintHeading>
          {projectHierarchy && (
            <Box sx={{ mb: 3 }}>
              <PrintLabel>
                {mainFocusStream?.name || 'Main focus'} pipeline
              </PrintLabel>
              {activeClients.length === 0 ? (
                <BlankLine>No active projects.</BlankLine>
              ) : (
                activeClients.map((p) => (
                  <Line
                    key={p.id}
                    aside={`${ageOf(p.createdAt)} days active`}
                    onClick={() => navigate(`/todos/project/${p.id}`)}
                  >
                    {p.title}
                  </Line>
                ))
              )}
            </Box>
          )}
          <PrintLabel>Activities</PrintLabel>
          {activeActivities.length === 0 ? (
            <BlankLine>No active activities.</BlankLine>
          ) : (
            activeActivities.map((a) => {
              const total = (a.tasks || []).length
              const done = (a.tasks || []).filter((t) => t.completed).length
              return (
                <Line
                  key={a.id}
                  aside={`${total ? `${done} of ${total} done, ` : ''}${ageOf(a.createdAt)} days`}
                  onClick={() => navigate(`/todos/activity/${a.id}`)}
                >
                  <StreamMark
                    stream={streamById[getActivityStreamId(a)]}
                    label=""
                  />
                  {a.title}
                  {(a.tasks || []).some((t) => t.important && !t.completed) && (
                    <Star
                      aria-label="Has important todos"
                      sx={{ fontSize: '0.8rem', color: ff.gold }}
                    />
                  )}
                </Line>
              )
            })
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default PlannerPage
