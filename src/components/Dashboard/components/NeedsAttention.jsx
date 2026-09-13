import React, { useEffect, useState } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { Star } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { loadProjects } from '../../../utils/projectsManager'
import { getItemAge } from '../../../utils/ageUtils'
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

  if (items === null) return <Skeleton variant="rectangular" height={80} />
  if (items.length === 0) return null

  return (
    <Box component="section">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1.5,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: '1.6rem',
            fontWeight: 900,
            letterSpacing: '-0.035em',
          }}
        >
          Needs attention
        </Typography>
        <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Overdue first, then due this week
        </Typography>
      </Box>
      <Box
        sx={{
          border: '3px solid',
          borderColor: 'text.primary',
          borderLeft: '10px solid',
          borderLeftColor: '#c62f22',
          bgcolor: 'background.paper',
        }}
      >
        {items.map((item, i) => (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => navigate(`/todos/${item.itemType}/${item.itemId}`)}
            sx={{
              width: '100%',
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontFamily: 'inherit',
              textAlign: 'left',
              color: 'text.primary',
              bgcolor: 'transparent',
              border: 'none',
              borderTop: i === 0 ? 'none' : '2px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              '&:focus-visible': {
                outline: '3px solid',
                outlineColor: 'primary.main',
                outlineOffset: -3,
              },
            }}
          >
            {item.important && (
              <Star
                aria-label="Important"
                sx={{ fontSize: 18, color: '#f59e0b' }}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: item.important ? 900 : 700,
                  fontSize: '0.95rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
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
      </Box>
    </Box>
  )
}

export default NeedsAttention
