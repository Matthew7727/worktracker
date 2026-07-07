import React, { useState, useEffect } from 'react'
import { Box, Typography, Stack, Skeleton } from '@mui/material'
import { Star, NotificationsActive } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { loadProjects } from '../../../utils/projectsManager'
import { getItemAge } from '../../../utils/ageUtils'
import TodoAgeChip from '../../shared/TodoAgeChip'

/**
 * Shows the open todos (activity tasks) that most need eyes:
 * important ones first, then the ones that have been hanging around longest.
 */
const NeedsAttention = () => {
  const { selectedDirectory, refreshTrigger } = useAppContext()
  const navigate = useNavigate()
  const [items, setItems] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!selectedDirectory) return
      const data = await loadProjects(selectedDirectory)
      const allTasks = (data.activities || [])
        .filter((a) => a.status === 'active')
        .flatMap((a) =>
          (a.tasks || [])
            .filter((t) => !t.completed)
            .map((t) => ({ ...t, activityTitle: a.title }))
        )
      allTasks.sort((a, b) => {
        if (a.important !== b.important) return a.important ? -1 : 1
        return (getItemAge(b) ?? -1) - (getItemAge(a) ?? -1)
      })
      setItems(allTasks.slice(0, 6))
    }
    load()
  }, [selectedDirectory, refreshTrigger])

  if (items === null)
    return (
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
    )
  if (items.length === 0) return null

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <NotificationsActive sx={{ fontSize: 20, opacity: 0.7 }} />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 1,
            opacity: 0.7,
          }}
        >
          Needs Attention
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => navigate('/todos')}
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              border: '2px solid',
              borderColor: item.important ? 'text.primary' : 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: item.important
                ? (theme) => `3px 3px 0px ${theme.palette.text.primary}`
                : 'none',
              '&:hover': { transform: 'translate(-1px, -1px)' },
            }}
          >
            {item.important && <Star sx={{ fontSize: 18, color: '#f59e0b' }} />}
            <Typography
              variant="body2"
              sx={{ flex: 1, fontWeight: item.important ? 800 : 600 }}
            >
              {item.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, opacity: 0.4, flexShrink: 0 }}
            >
              {item.activityTitle}
            </Typography>
            <TodoAgeChip item={item} />
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default NeedsAttention
