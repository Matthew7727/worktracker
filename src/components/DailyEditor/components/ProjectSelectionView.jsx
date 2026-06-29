import React from 'react'
import { Box, Typography, Fade, Stack, TextField, Chip } from '@mui/material'
import { ArrowForward, CheckCircle } from '@mui/icons-material'
import { DAY_STATUSES } from '../constants'
import { flowStyles } from '../DailyEditor.styles'

const ProjectSelectionView = ({
  dayStatus,
  onStatusChange,
  dayNote,
  onNoteChange,
  allAvailableProjects,
  selectedFlowProjects,
  onToggleProject,
  onStart,
  onSaveNonWorking,
}) => {
  const isWorking = dayStatus === 'working'
  const selectedStatus = DAY_STATUSES.find((s) => s.id === dayStatus)
  const canStart = !isWorking || selectedFlowProjects.length > 0

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', mt: 4 }}>
      <Fade in={true}>
        <Box>
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 950 }}>
            How was your day?
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
            {DAY_STATUSES.map((status) => {
              const isActive = dayStatus === status.id
              return (
                <Box
                  key={status.id}
                  component="button"
                  onClick={() => onStatusChange(status.id)}
                  sx={{
                    fontFamily: 'inherit',
                    fontWeight: 900,
                    fontSize: '1rem',
                    px: 3,
                    py: 1.5,
                    border: '3px solid',
                    borderColor: 'text.primary',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    bgcolor: isActive ? status.color : 'transparent',
                    color: isActive ? 'text.primary' : 'text.secondary',
                    transition: 'all 0.15s',
                  }}
                >
                  {status.label}
                </Box>
              )
            })}
          </Box>

          {isWorking && allAvailableProjects.length > 0 && (
            <>
              <Typography
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'text.secondary',
                }}
              >
                What did you work on today?
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                {allAvailableProjects.map((project) => {
                  const isSelected = selectedFlowProjects.some(
                    (p) => p.title === project.title
                  )
                  return (
                    <Chip
                      key={project.title}
                      label={project.title}
                      onClick={() => onToggleProject(project)}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        border: '2px solid',
                        borderColor: 'text.primary',
                        borderRadius: 0,
                        bgcolor: isSelected ? project.color : 'transparent',
                        color: isSelected ? 'text.primary' : 'text.secondary',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': {
                          bgcolor: project.color,
                          color: 'text.primary',
                          opacity: 0.85,
                        },
                        '& .MuiChip-label': { px: 1.5 },
                      }}
                    />
                  )
                })}
              </Box>
            </>
          )}

          {!isWorking && (
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder={`Add a note about this ${selectedStatus.label.toLowerCase()} day (optional)...`}
              value={dayNote}
              onChange={(e) => onNoteChange(e.target.value)}
              sx={{ mb: 4 }}
            />
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Box
              component="button"
              onClick={() =>
                isWorking
                  ? onStart()
                  : onSaveNonWorking(dayStatus, dayNote.trim())
              }
              disabled={isWorking && selectedFlowProjects.length === 0}
              sx={{
                ...flowStyles.flowButton,
                px: 4,
                bgcolor: canStart
                  ? selectedStatus.color
                  : 'action.disabledBackground',
                color: canStart ? 'text.primary' : 'text.disabled',
                cursor: canStart ? 'pointer' : 'default',
                '&:hover': canStart
                  ? {
                      ...flowStyles.flowButton['&:hover'],
                      bgcolor: selectedStatus.color,
                    }
                  : {},
              }}
            >
              {isWorking ? 'START WRITING' : 'SAVE DAY'}
              {isWorking ? (
                <ArrowForward sx={{ fontSize: '1.2rem' }} />
              ) : (
                <CheckCircle sx={{ fontSize: '1.2rem' }} />
              )}
              <Box className="shine-layer" sx={flowStyles.shineLayer} />
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Box>
  )
}

export default ProjectSelectionView
