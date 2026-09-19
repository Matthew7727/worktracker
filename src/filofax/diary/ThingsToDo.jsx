import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Star } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import {
  loadProjects,
  saveProjects,
  getTasksCompletedOn,
} from '../../utils/projectsManager'
import {
  getTaskDueInDays,
  isTaskDueThisWeek,
  sortTasksByUrgency,
} from '../../utils/taskUrgency'
import TodoDueChip from '../../components/shared/TodoDueChip'
import TodoAgeChip from '../../components/shared/TodoAgeChip'
import { getDateKey } from '../../components/DailyEditor/utils/weekDays'
import { PrintHeading, TickBox, BlankLine } from '../paper'
import { LINE } from '../paperStyles'

const ownersOf = (data) => [
  ...(data.activities || []).map((a) => ({ item: a, type: 'activity' })),
  ...(data.clientProjects || []).map((p) => ({ item: p, type: 'project' })),
]

// Overdue and due-this-week todos first, falling back to the oldest open
// work, so the margin of a diary page is never blank.
const pickAttention = (data) => {
  const open = ownersOf(data)
    .filter(({ item }) => item.status === 'active')
    .flatMap(({ item, type }) =>
      (item.tasks || [])
        .filter((t) => !t.completed)
        .map((t) => ({
          ...t,
          ownerTitle: item.title,
          ownerType: type,
          ownerId: item.id,
        }))
    )
  const sorted = sortTasksByUrgency(open)
  const overdue = sorted.filter((t) => (getTaskDueInDays(t) ?? 1) < 0)
  const week = sorted.filter((t) => isTaskDueThisWeek(t))
  const due = [...overdue, ...week]
  return (due.length ? due : sorted).slice(0, 8)
}

const Row = ({ task, onToggle, onOpen }) => {
  const ff = useFilofaxTokens()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: LINE,
        borderBottom: `1px solid ${ff.rule}`,
      }}
    >
      <TickBox
        checked={!!task.completed}
        onChange={onToggle}
        label={`${task.completed ? 'Reopen' : 'Complete'} ${task.text}`}
      />
      <Box
        component="button"
        type="button"
        onClick={onOpen}
        sx={{
          flex: 1,
          minWidth: 0,
          py: 0.5,
          textAlign: 'left',
          border: 'none',
          background: 'none',
          fontFamily: 'inherit',
          cursor: 'pointer',
          color: ff.ink,
          '&:hover .owner': { color: ff.print },
        }}
      >
        <Typography
          sx={{
            fontSize: '0.88rem',
            lineHeight: 1.35,
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? 'text.secondary' : ff.ink,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {task.important && !task.completed && (
            <Star
              aria-label="Important"
              sx={{ fontSize: '0.8rem', color: ff.gold }}
            />
          )}
          {task.text}
        </Typography>
        <Typography
          className="owner"
          sx={{
            fontStyle: 'italic',
            fontSize: '0.74rem',
            color: 'text.secondary',
          }}
        >
          {task.ownerTitle}
        </Typography>
      </Box>
      {!task.completed && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <TodoDueChip item={task} />
          {!task.dueDate && <TodoAgeChip item={task} />}
        </Box>
      )}
    </Box>
  )
}

/** The diary page margin: what needs doing, and what got done that day. */
const ThingsToDo = ({ date }) => {
  const { selectedDirectory, refreshTrigger } = useAppContext()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [pinned, setPinned] = useState([])

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then((d) => {
      setData(d)
      setPinned(
        pickAttention(d).map((t) => `${t.ownerType}:${t.ownerId}:${t.id}`)
      )
    })
  }, [selectedDirectory, refreshTrigger])

  if (!data) return null

  const dateKey = getDateKey(date)
  const tasksById = new Map()
  ownersOf(data).forEach(({ item, type }) =>
    (item.tasks || []).forEach((t) =>
      tasksById.set(`${type}:${item.id}:${t.id}`, {
        ...t,
        ownerTitle: item.title,
        ownerType: type,
        ownerId: item.id,
      })
    )
  )
  // Keep the picked list stable while ticking, so a tick can be undone.
  const attention = pinned.map((k) => tasksById.get(k)).filter(Boolean)
  const doneThatDay = ownersOf(data)
    .flatMap(({ item, type }) =>
      getTasksCompletedOn(item.tasks, dateKey).map((t) => ({
        ...t,
        ownerTitle: item.title,
        ownerType: type,
        ownerId: item.id,
      }))
    )
    .filter((t) => !pinned.includes(`${t.ownerType}:${t.ownerId}:${t.id}`))

  const toggle = (task) => {
    const listKey =
      task.ownerType === 'project' ? 'clientProjects' : 'activities'
    const today = new Date().toISOString().split('T')[0]
    const next = {
      ...data,
      [listKey]: data[listKey].map((item) =>
        item.id !== task.ownerId
          ? item
          : {
              ...item,
              tasks: (item.tasks || []).map((t) =>
                t.id !== task.id
                  ? t
                  : {
                      ...t,
                      completed: !t.completed,
                      completedAt: !t.completed ? today : null,
                    }
              ),
            }
      ),
    }
    setData(next)
    saveProjects(selectedDirectory, next)
  }

  const open = (task) => navigate(`/todos/${task.ownerType}/${task.ownerId}`)

  return (
    <Box component="aside" aria-label="Things to do">
      <PrintHeading>Things to do</PrintHeading>
      {attention.length === 0 ? (
        <BlankLine>Nothing open. Add todos under the To do tab.</BlankLine>
      ) : (
        attention.map((task) => (
          <Row
            key={`${task.ownerType}-${task.ownerId}-${task.id}`}
            task={task}
            onToggle={() => toggle(task)}
            onOpen={() => open(task)}
          />
        ))
      )}

      {doneThatDay.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <PrintHeading aside={doneThatDay.length}>Done this day</PrintHeading>
          {doneThatDay.map((task) => (
            <Row
              key={`${task.ownerType}-${task.ownerId}-${task.id}`}
              task={task}
              onToggle={() => toggle(task)}
              onOpen={() => open(task)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ThingsToDo
