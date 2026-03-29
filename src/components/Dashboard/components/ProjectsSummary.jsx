import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material'
import { FolderOpen, Build, Warning } from '@mui/icons-material'
import { loadProjects } from '../../../utils/projectsManager'
import { useAppContext } from '../../../context/AppContext'

const STALE_THRESHOLD = 30
const ACTIVITY_COLORS = { PD: '#4a6b13', BD: '#eb8449' }

const getAge = (createdAt) =>
  Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24))

const ProjectsSummary = () => {
  const { selectedDirectory, refreshTrigger } = useAppContext()
  const [projects, setProjects] = useState({ activities: [], clientProjects: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDirectory) return
      const data = await loadProjects(selectedDirectory)
      setProjects(data)
      setLoading(false)
    }
    fetch()
  }, [selectedDirectory, refreshTrigger])

  if (loading) return <CircularProgress size={20} />

  const activeClients = projects.clientProjects.filter((p) => p.status === 'active')
  const activeActivities = projects.activities.filter((a) => a.status === 'active')

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Client Work Pipeline */}
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <FolderOpen sx={{ fontSize: 20, opacity: 0.7 }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}
          >
            Client Work Pipeline
          </Typography>
        </Stack>
        {activeClients.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No active client projects.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {activeClients.map((project) => {
              const age = getAge(project.createdAt)
              const isStale = age >= STALE_THRESHOLD
              return (
                <Box
                  key={project.id}
                  sx={{
                    p: 2,
                    border: `2px solid ${isStale ? 'error.main' : 'black'}`,
                    borderColor: isStale ? 'error.main' : 'black',
                    borderRadius: 2,
                    boxShadow: '3px 3px 0px #000',
                    borderLeft: `5px solid ${isStale ? '#d32f2f' : '#80b621'}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      {isStale && (
                        <Tooltip title="Stale — active for over 30 days" placement="top">
                          <Warning sx={{ fontSize: 15, color: 'error.main' }} />
                        </Tooltip>
                      )}
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: isStale ? 'error.main' : 'text.primary' }}
                      >
                        {project.title}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: isStale ? 'error.main' : 'text.secondary', opacity: isStale ? 1 : 0.5 }}
                    >
                      {age}d active
                    </Typography>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>

      {/* Activities Breakdown */}
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Build sx={{ fontSize: 20, opacity: 0.7 }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}
          >
            Activities Breakdown
          </Typography>
        </Stack>
        {activeActivities.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No active activities.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {activeActivities.map((activity) => {
              const total = activity.tasks.length
              const completed = activity.tasks.filter((t) => t.completed).length
              const progress = total > 0 ? (completed / total) * 100 : 0
              const age = getAge(activity.createdAt)
              const isStale = age >= STALE_THRESHOLD
              const color = ACTIVITY_COLORS[activity.type] || '#888'
              return (
                <Box key={activity.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.75 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      {isStale && (
                        <Tooltip title="Stale — active for over 30 days" placement="top">
                          <Warning sx={{ fontSize: 15, color: 'error.main' }} />
                        </Tooltip>
                      )}
                      <Chip
                        label={activity.type}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          bgcolor: color,
                          color: 'white',
                          border: '1.5px solid black',
                          height: 20,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: isStale ? 'error.main' : 'text.primary' }}
                      >
                        {activity.title}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>
                        {age}d
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>
                        {completed}/{total}
                      </Typography>
                    </Stack>
                  </Stack>
                  {total > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        border: '2px solid black',
                        bgcolor: 'white',
                        '& .MuiLinearProgress-bar': { bgcolor: isStale ? 'error.main' : color },
                      }}
                    />
                  )}
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default ProjectsSummary
