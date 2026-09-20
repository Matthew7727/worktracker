import React, { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { Add, Bolt, CheckCircleOutline, Notes } from '@mui/icons-material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { loadProjects } from '../../utils/projectsManager'
import { loadAllEntries } from '../../utils/DataManager'
import { createGoal, loadGoals, saveGoals } from '../../utils/goalsManager'
import { InkButton, PageHeader } from '../shared/ui'
import { useIsFilofax, useFilofaxTokens } from '../../styles/useUiStyle'

const titleFor = (item) => item.text || item.title || item.label
const countdownFor = (targetDate) => {
  if (!targetDate) return 'No review date set'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${targetDate}T00:00:00`)
  const days = Math.round((target - today) / 86400000)
  if (days === 0) return 'Review today'
  if (days < 0) return `${Math.abs(days)} days since review date`
  return `${days} days to review`
}
const dateLabel = (date) => {
  if (!date) return 'Undated'
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
const timeProgress = (goal) => {
  if (!goal.targetDate) return null
  const start = new Date(goal.createdAt || `${goal.year}-01-01`).getTime()
  const end = new Date(`${goal.targetDate}T23:59:59`).getTime()
  if (!Number.isFinite(start) || end <= start) return null
  return Math.max(
    0,
    Math.min(100, ((Date.now() - start) / (end - start)) * 100)
  )
}

const GoalsPage = () => {
  const navigate = useNavigate()
  const { goalId } = useParams()
  const { selectedDirectory, streamConfig } = useAppContext()
  const isFx = useIsFilofax()
  const ff = useFilofaxTokens()
  const [goals, setGoals] = useState([])
  const [projects, setProjects] = useState({
    activities: [],
    clientProjects: [],
  })
  const [entries, setEntries] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      loadGoals(selectedDirectory),
      loadProjects(selectedDirectory),
      loadAllEntries(selectedDirectory, streamConfig?.streams),
    ]).then(([goalData, projectData, entryData]) => {
      if (cancelled) return
      setGoals(goalData)
      setProjects(projectData)
      setEntries(entryData)
    })
    return () => {
      cancelled = true
    }
  }, [selectedDirectory, streamConfig])

  const workOptions = useMemo(() => {
    const owners = [...projects.clientProjects, ...projects.activities]
    return owners.flatMap((owner) => [
      {
        id: `activity:${owner.id}`,
        kind: 'activity',
        refId: owner.id,
        title: owner.title,
      },
      ...(owner.tasks || []).map((task) => ({
        id: `task:${task.id}`,
        kind: 'task',
        refId: task.id,
        title: task.text,
        owner: owner.title,
      })),
    ])
  }, [projects])
  const entryOptions = entries.map((entry) => ({
    id: entry.id,
    label: `${entry.date}${entry.time ? ` ${entry.time}` : ''}`,
  }))
  const yearGoals = goals.filter((goal) => Number(goal.year) === Number(year))
  const save = async (goal) => {
    const next = goals.some((g) => g.id === goal.id)
      ? goals.map((g) => (g.id === goal.id ? goal : g))
      : [...goals, goal]
    setGoals(next)
    await saveGoals(selectedDirectory, next)
    setEditing(null)
  }

  const selectedGoal = goalId ? goals.find((goal) => goal.id === goalId) : null
  if (goalId) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 8 }}>
        <InkButton
          tone="ghost"
          size="sm"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/goals')}
          sx={{ ml: -1, mb: 2 }}
        >
          All goals
        </InkButton>
        {selectedGoal ? (
          <GoalCard
            goal={selectedGoal}
            projects={projects}
            entries={entries}
            isFx={isFx}
            ff={ff}
          />
        ) : (
          <Typography>This goal could not be found.</Typography>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 8 }}>
      <PageHeader
        title={`${year} goals`}
        meta={`${yearGoals.length} annual objectives`}
      >
        <TextField
          select
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 100 }}
        >
          {[year - 1, year, year + 1].map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <InkButton
          startIcon={<Add />}
          onClick={() => setEditing(createGoal(year))}
        >
          New goal
        </InkButton>
      </PageHeader>
      {editing && (
        <GoalEditor
          goal={editing}
          isNew={!goals.some((goal) => goal.id === editing.id)}
          workOptions={workOptions}
          entryOptions={entryOptions}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
      {yearGoals.length === 0 && !editing ? (
        <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Add a goal with a review date, then let its evidence build naturally
          through the year.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: 2.5,
          }}
        >
          {yearGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              workOptions={workOptions}
              entryOptions={entryOptions}
              projects={projects}
              entries={entries}
              isFx={isFx}
              ff={ff}
              compact
              onOpen={() => navigate(`/goals/${goal.id}`)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

const GoalCard = ({
  goal,
  projects,
  entries,
  isFx,
  ff,
  compact = false,
  onOpen,
}) => {
  const navigate = useNavigate()
  const owners = [...projects.clientProjects, ...projects.activities]
  const projectIds = new Set(
    projects.clientProjects.map((project) => project.id)
  )
  const activities = owners
    .filter(
      (item) =>
        item.goalIds?.includes(goal.id) || goal.activityIds?.includes(item.id)
    )
    .map((item) => ({
      id: `a-${item.id}`,
      type: 'activity',
      sourceId: item.id,
      path: `/todos/${projectIds.has(item.id) ? 'project' : 'activity'}/${item.id}`,
      date: item.createdAt,
      title: item.title,
      status: item.ongoing
        ? 'ongoing'
        : item.status === 'done' || item.status === 'archived'
          ? 'completed'
          : 'active',
      detail: item.ongoing
        ? 'Ongoing activity'
        : item.status === 'done' || item.status === 'archived'
          ? 'Completed'
          : 'Active work',
    }))
  const todos = owners.flatMap((owner) =>
    (owner.tasks || [])
      .filter(
        (task) =>
          task.goalIds?.includes(goal.id) || goal.taskIds?.includes(task.id)
      )
      .map((task) => ({
        id: `t-${task.id}`,
        type: 'todo',
        ownerId: owner.id,
        path: `/todos/${projectIds.has(owner.id) ? 'project' : 'activity'}/${owner.id}`,
        date: task.completedAt || task.createdAt,
        title: task.text,
        detail: `${task.completed ? 'Completed' : 'Open'} · ${owner.title}`,
      }))
  )
  const dailyEntries = entries
    .filter((entry) => {
      const streamGoals = Object.values(entry.metadata?.streamGoalIds || {})
      return (
        entry.metadata?.goalIds?.includes(goal.id) ||
        goal.entryIds?.includes(entry.id) ||
        streamGoals.some((ids) => ids?.includes(goal.id))
      )
    })
    .map((entry) => ({
      id: `e-${entry.id}`,
      type: 'entry',
      date: entry.date,
      title: `Daily entry — ${
        entry.content
          .replace(/[#*_`]/g, '')
          .trim()
          .slice(0, 70) || 'Recorded work'
      }`,
      detail: `Written on ${dateLabel(entry.date)}`,
      entry,
    }))
  const events = [...activities, ...todos, ...dailyEntries].sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || ''))
  )
  const elapsed = timeProgress(goal)
  return (
    <Paper
      component="article"
      onClick={onOpen}
      sx={{
        p: 2.5,
        cursor: onOpen ? 'pointer' : 'default',
        border: isFx ? `1px solid ${ff.ruleStrong}` : '3px solid',
        borderColor: isFx ? ff.ruleStrong : 'text.primary',
        borderTop: '8px solid #9b7dd4',
        boxShadow: isFx ? '0 4px 12px rgba(42,10,13,.1)' : undefined,
      }}
    >
      <Typography
        sx={{
          fontSize: '.75rem',
          textTransform: 'uppercase',
          letterSpacing: '.08em',
          color: 'text.secondary',
        }}
      >
        {countdownFor(goal.targetDate)}
      </Typography>
      <Typography
        component="h2"
        sx={{ fontWeight: 900, fontSize: '1.3rem', mt: 0.5 }}
      >
        {goal.title || 'Untitled goal'}
      </Typography>
      <Typography variant="caption">
        Review date: {goal.targetDate || 'Not set'} · {events.length} linked
        record
        {events.length === 1 ? '' : 's'}
      </Typography>
      {elapsed !== null && (
        <Box sx={{ mt: 1.5 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              Time to review
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {countdownFor(goal.targetDate)}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              overflow: 'hidden',
              bgcolor: 'divider',
              borderRadius: 99,
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${elapsed}%`,
                bgcolor: elapsed > 85 ? '#f45b69' : '#9b7dd4',
                transition: 'width 240ms ease',
              }}
            />
          </Box>
        </Box>
      )}
      {!compact && (
        <Box
          sx={{
            mt: 2.5,
            pl: 1.5,
            borderLeft: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              fontSize: '.7rem',
              fontWeight: 900,
              letterSpacing: '.08em',
              color: 'text.secondary',
              mb: 2,
            }}
          >
            EVIDENCE TIMELINE
          </Typography>
          {events.length ? (
            events.map((event) => (
              <TimelineItem
                key={event.id}
                event={event}
                onOpen={() =>
                  event.type === 'entry'
                    ? navigate('/workspace', { state: { entry: event.entry } })
                    : navigate(event.path)
                }
              />
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              The story will build here as you link work to this goal.
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  )
}

const EvidenceBoard = ({
  events,
  goalTitle,
  savedPositions = {},
  onPositionChange,
}) => {
  const width = 700
  const height = Math.max(500, events.length * 170 + 110)
  const ordered = [...events].reverse()
  const defaults = Object.fromEntries(
    ordered.map((event, index) => [
      event.id,
      {
        x: index % 2 ? 410 : 105,
        y: 72 + index * 170,
      },
    ])
  )
  const [positions, setPositions] = useState({ ...defaults, ...savedPositions })
  const [drag, setDrag] = useState(null)
  const startDrag = (event, item) => {
    event.preventDefault()
    setDrag({
      id: item.id,
      x: event.clientX,
      y: event.clientY,
      position: positions[item.id],
    })
  }
  const moveDrag = (event) => {
    if (!drag) return
    setPositions((current) => ({
      ...current,
      [drag.id]: {
        x: Math.max(8, drag.position.x + event.clientX - drag.x),
        y: Math.max(22, drag.position.y + event.clientY - drag.y),
      },
    }))
  }
  const finishDrag = () => {
    if (drag) onPositionChange?.(drag.id, positions[drag.id])
    setDrag(null)
  }
  const activityFor = Object.fromEntries(
    events
      .filter((event) => event.type === 'activity')
      .map((event) => [event.sourceId, event])
  )
  return (
    <Box
      sx={{
        mt: 2.5,
        overflow: 'auto',
        border: '2px solid',
        borderColor: 'divider',
        bgcolor: 'background.subtle',
      }}
    >
      <Box
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerLeave={finishDrag}
        sx={{
          position: 'relative',
          width,
          height,
          backgroundImage:
            'radial-gradient(rgba(80,60,45,.18) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <Typography
          sx={{
            position: 'absolute',
            top: 6,
            left: 12,
            fontSize: '.68rem',
            fontWeight: 800,
            color: 'text.secondary',
          }}
        >
          GOAL JOURNEY
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            top: 28,
            left: 295,
            width: 230,
            py: 1,
            px: 1.5,
            textAlign: 'center',
            bgcolor: '#9b7dd4',
            color: '#fff',
            border: '2px solid #593f8e',
            boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
            fontWeight: 900,
            fontSize: '.78rem',
            transform: 'rotate(-1deg)',
          }}
        >
          {goalTitle || 'Goal'}
        </Box>
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {ordered.map((event, index) => {
            const from =
              index === 0 ? { x: 410, y: 76 } : positions[ordered[index - 1].id]
            const to = positions[event.id]
            return (
              <path
                key={`story-${event.id}`}
                d={`M ${from.x} ${from.y} C ${from.x} ${from.y + 55}, ${to.x + 75} ${to.y - 45}, ${to.x + 75} ${to.y}`}
                fill="none"
                stroke="#8b6f47"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity=".72"
              />
            )
          })}
          {events
            .filter(
              (event) => event.type === 'todo' && activityFor[event.ownerId]
            )
            .map((event) => {
              const from = positions[`a-${event.ownerId}`]
              const to = positions[event.id]
              return (
                <path
                  key={event.id}
                  d={`M ${from.x + 70} ${from.y + 62} C ${from.x + 105} ${from.y + 115}, ${to.x + 35} ${to.y - 18}, ${to.x + 70} ${to.y}`}
                  fill="none"
                  stroke="#8b6f47"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity=".75"
                />
              )
            })}
        </svg>
        {events.map((event) => (
          <BoardCard
            key={event.id}
            event={event}
            position={positions[event.id]}
            onPointerDown={(pointer) => startDrag(pointer, event)}
          />
        ))}
      </Box>
    </Box>
  )
}

const BoardCard = ({ event, position, onPointerDown }) => {
  const style = EVENT_STYLE[event.type]
  return (
    <Box
      onPointerDown={onPointerDown}
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 150,
        cursor: 'grab',
        touchAction: 'none',
        p: 1.25,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: style.color,
        boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
        transform:
          event.type === 'entry'
            ? 'rotate(-1deg)'
            : event.type === 'todo'
              ? 'rotate(1deg)'
              : 'none',
      }}
    >
      <Typography
        sx={{
          fontSize: '.62rem',
          fontWeight: 900,
          color: style.color,
          textTransform: 'uppercase',
        }}
      >
        {style.label} · {dateLabel(event.date)}
      </Typography>
      <Typography
        sx={{ fontWeight: 800, fontSize: '.78rem', lineHeight: 1.2, mt: 0.5 }}
      >
        {event.title}
      </Typography>
    </Box>
  )
}

const EVENT_STYLE = {
  activity: { color: '#9b7dd4', icon: <Bolt />, label: 'Activity' },
  todo: { color: '#80b621', icon: <CheckCircleOutline />, label: 'Todo' },
  entry: { color: '#eb8449', icon: <Notes />, label: 'Daily entry' },
}
const TimelineItem = ({ event, onOpen }) => {
  const style = EVENT_STYLE[event.type]
  const activityStatus =
    event.status &&
    {
      ongoing: { label: 'Ongoing', color: '#4f7fba' },
      active: { label: 'Active', color: '#9b7dd4' },
      completed: { label: 'Completed', color: '#80b621' },
    }[event.status]
  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      sx={{
        position: 'relative',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        pb: 2,
        pl: 2.5,
        fontFamily: 'inherit',
        '&:last-child': { pb: 0 },
        '&:hover .timeline-title': { textDecoration: 'underline' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: -12,
          top: 1,
          width: 22,
          height: 22,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: style.color,
          color: '#fff',
          '& svg': { fontSize: '.85rem' },
        }}
      >
        {style.icon}
      </Box>
      <Typography
        sx={{
          fontSize: '.7rem',
          fontWeight: 800,
          color: style.color,
          textTransform: 'uppercase',
          letterSpacing: '.05em',
        }}
      >
        {dateLabel(event.date)} · {style.label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          className="timeline-title"
          sx={{ fontWeight: 800, fontSize: '.9rem', lineHeight: 1.3 }}
        >
          {event.title}
        </Typography>
        {activityStatus && (
          <Box
            component="span"
            sx={{
              px: 0.7,
              py: 0.1,
              borderRadius: 99,
              bgcolor: activityStatus.color,
              color: '#fff',
              fontSize: '.62rem',
              fontWeight: 900,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
            }}
          >
            {activityStatus.label}
          </Box>
        )}
      </Box>
      <Typography sx={{ color: 'text.secondary', fontSize: '.8rem', mt: 0.25 }}>
        {event.detail}
      </Typography>
    </Box>
  )
}

const GoalEditor = ({
  goal,
  isNew,
  workOptions,
  entryOptions,
  onSave,
  onCancel,
}) => {
  const [draft, setDraft] = useState(goal)
  const selectedWork = workOptions.filter(
    (item) =>
      draft.activityIds?.includes(item.refId) ||
      draft.taskIds?.includes(item.refId)
  )
  const selectedEntries = entryOptions.filter((entry) =>
    draft.entryIds?.includes(entry.id)
  )
  const patch = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }))
  return (
    <Paper
      sx={{ p: 2.5, mb: 3, border: '3px solid', borderColor: 'text.primary' }}
    >
      <Box sx={{ display: 'grid', gap: 2 }}>
        <TextField
          autoFocus
          label="Annual goal"
          value={draft.title}
          onChange={(e) => patch('title', e.target.value)}
        />
        <TextField
          label="Review or achievement date"
          type="date"
          value={draft.targetDate || ''}
          onChange={(e) => patch('targetDate', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: 240 }}
        />
        {!isNew && (
          <>
            <Autocomplete
              multiple
              options={workOptions}
              value={selectedWork}
              getOptionLabel={(item) =>
                `${titleFor(item)}${item.owner ? ` — ${item.owner}` : ''}`
              }
              onChange={(_, values) => {
                patch(
                  'activityIds',
                  values
                    .filter((v) => v.kind === 'activity')
                    .map((v) => v.refId)
                )
                patch(
                  'taskIds',
                  values.filter((v) => v.kind === 'task').map((v) => v.refId)
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Linked activities and todos"
                  placeholder="Add work as evidence"
                />
              )}
            />
            <Autocomplete
              multiple
              options={entryOptions}
              value={selectedEntries}
              getOptionLabel={(item) => item.label}
              onChange={(_, values) =>
                patch(
                  'entryIds',
                  values.map((v) => v.id)
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Linked daily entries"
                  placeholder="Add review evidence"
                />
              )}
            />
          </>
        )}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <InkButton tone="ghost" onClick={onCancel}>
            Cancel
          </InkButton>
          <InkButton
            disabled={!draft.title.trim()}
            onClick={() =>
              onSave({
                ...draft,
                title: draft.title.trim(),
                updatedAt: new Date().toISOString(),
              })
            }
          >
            Save goal
          </InkButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default GoalsPage
