import React, { useEffect, useState } from 'react'
import { Box, Typography, Stack, Skeleton } from '@mui/material'
import { Star, NotificationsActive } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { loadProjects } from '../../../utils/projectsManager'
import { getItemAge } from '../../../utils/ageUtils'
import { OFFSET, RULE, hardShadow } from '../../../styles/tokens'
import TodoAgeChip from '../../shared/TodoAgeChip'
import TodoDueChip from '../../shared/TodoDueChip'
import {
  getTaskDueInDays,
  isTaskDueThisWeek,
  sortTasksByUrgency,
} from '../../../utils/taskUrgency'

const flattenAttentionTasks = (data) => {
  const activityTasks = (data.activities || [])
    .filter((activity) => activity.status === 'active')
    .flatMap((activity) =>
      (activity.tasks || [])
        .filter((task) => !task.completed)
        .map((task) => ({
          ...task,
          ownerLabel: activity.title,
          itemType: 'activity',
          itemId: activity.id,
        }))
    )

  const projectTasks = (data.clientProjects || [])
    .filter((project) => project.status === 'active')
    .flatMap((project) =>
      (project.tasks || [])
        .filter((task) => !task.completed)
        .map((task) => ({
          ...task,
          ownerLabel: project.title,
          itemType: 'project',
          itemId: project.id,
        }))
    )

  return [...activityTasks, ...projectTasks]
}

/**
 * Shows overdue and this week's due tasks first, then falls back to the oldest
 * open work so the space never goes empty.
 */
const NeedsAttention = () => {
  const { selectedDirectory, refreshTrigger } = useAppContext()
  const navigate = useNavigate()
  const [items, setItems] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!selectedDirectory) return
      const data = await loadProjects(selectedDirectory)
      const openTasks = flattenAttentionTasks(data)
      const sorted = sortTasksByUrgency(openTasks)
      const weeklyDue = sorted.filter((task) => isTaskDueThisWeek(task))
      const overdueFirst = sorted.filter(
        (task) => (getTaskDueInDays(task) ?? 1) < 0
      )
      const dueFocused = [...overdueFirst, ...weeklyDue]
      setItems((dueFocused.length > 0 ? dueFocused : sorted).slice(0, 6))
    }
    load()
  }, [selectedDirectory, refreshTrigger])

  if (items === null)
    return (
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 0 }} />
    )
  if (items.length === 0) return null

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
        <NotificationsActive sx={{ fontSize: 20, opacity: 0.7 }} />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            opacity: 0.7,
          }}
        >
          Needs attention
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Overdue and due-this-week todos first.
      </Typography>
      <Stack spacing={1}>
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => navigate(`/todos/${item.itemType}/${item.itemId}`)}
            sx={(theme) => ({
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              border: `${RULE.hair}px solid`,
              borderColor: item.important ? 'text.primary' : 'divider',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: item.important
                ? hardShadow(OFFSET.base, theme.palette.text.primary)
                : 'none',
              '&:hover': {
                transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
                boxShadow: hardShadow(OFFSET.press, theme.palette.text.primary),
              },
            })}
          >
            {item.important && <Star sx={{ fontSize: 18, color: '#f59e0b' }} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: item.important ? 800 : 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, opacity: 0.5, display: 'block' }}
              >
                {item.ownerLabel}
              </Typography>
            </Box>
            <TodoDueChip item={item} />
            {!item.dueDate && getItemAge(item) > 0 && (
              <TodoAgeChip item={item} />
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default NeedsAttention
