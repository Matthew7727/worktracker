import React, { useState, useEffect } from 'react'
import { Box, Typography, Stack, LinearProgress, Chip } from '@mui/material'
import { FolderOpen, Build } from '@mui/icons-material'
import {
  loadProjects,
  getActivityStreamId,
} from '../../../utils/projectsManager'
import { getStreamAbbrev } from '../../../utils/streamConfig'
import { useAppContext } from '../../../context/AppContext'
import { FONT, OFFSET, RULE, hardShadow } from '../../../styles/tokens'

const getAge = (createdAt) =>
  Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24))

const ProjectsSummary = () => {
  const { selectedDirectory, refreshTrigger, streamConfig, mainFocusStream } =
    useAppContext()
  const projectHierarchy = !!streamConfig?.features?.projectHierarchy
  const streamById = Object.fromEntries(
    (streamConfig?.streams || []).map((s) => [s.id, s])
  )
  const [projects, setProjects] = useState({
    activities: [],
    clientProjects: [],
  })
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

  if (loading) {
    return (
      <Box
        role="progressbar"
        aria-label="Loading projects"
        sx={{
          width: 20,
          height: 20,
          border: `${RULE.hair}px solid`,
          borderColor: 'text.primary',
          bgcolor: 'background.paper',
        }}
      />
    )
  }

  const activeClients = projects.clientProjects.filter(
    (p) => p.status === 'active'
  )
  const activeActivities = projects.activities.filter(
    (a) => a.status === 'active'
  )

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 6,
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Main-focus project pipeline */}
      {projectHierarchy && (
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <FolderOpen sx={{ fontSize: 20, opacity: 0.7 }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                opacity: 0.7,
              }}
            >
              {mainFocusStream?.name || 'Main focus'} pipeline
            </Typography>
          </Stack>
          {activeClients.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              No active projects.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {activeClients.map((project) => {
                const age = getAge(project.createdAt)
                return (
                  <Box
                    key={project.id}
                    sx={{
                      p: 2,
                      border: `${RULE.hair}px solid`,
                      borderColor: 'text.primary',
                      boxShadow: (theme) =>
                        hardShadow(OFFSET.base, theme.palette.text.primary),
                      borderLeft: `${RULE.heavy}px solid ${mainFocusStream?.color || '#80b621'}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: 'text.primary' }}
                      >
                        {project.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: FONT.data,
                          fontWeight: 700,
                          color: 'text.secondary',
                          opacity: 0.5,
                        }}
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
      )}

      {/* Activities Breakdown */}
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Build sx={{ fontSize: 20, opacity: 0.7 }} />
          <Typography
            variant="body1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              opacity: 0.7,
            }}
          >
            Activities breakdown
          </Typography>
        </Stack>
        {activeActivities.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontStyle: 'italic' }}
          >
            No active activities.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {activeActivities.map((activity) => {
              const total = activity.tasks.length
              const completed = activity.tasks.filter((t) => t.completed).length
              const progress = total > 0 ? (completed / total) * 100 : 0
              const age = getAge(activity.createdAt)
              const stream = streamById[getActivityStreamId(activity)]
              const color = stream?.color || '#888'
              return (
                <Box key={activity.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.75 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Chip
                        label={stream ? getStreamAbbrev(stream) : activity.type}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          bgcolor: color,
                          color: '#000',
                          border: `${RULE.hair}px solid`,
                          borderColor: 'text.primary',
                          height: 20,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: 'text.primary' }}
                      >
                        {activity.title}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: FONT.data,
                          fontWeight: 700,
                          opacity: 0.5,
                        }}
                      >
                        {age}d
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: FONT.data,
                          fontWeight: 700,
                          opacity: 0.6,
                        }}
                      >
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
                        border: `${RULE.hair}px solid`,
                        borderColor: 'text.primary',
                        bgcolor: 'background.paper',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                          borderRadius: 0,
                        },
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
