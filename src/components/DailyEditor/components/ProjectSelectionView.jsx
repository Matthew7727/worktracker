import React from 'react'
import { Box, Typography, Fade, InputBase } from '@mui/material'
import { ArrowForward, Check } from '@mui/icons-material'
import { DAY_STATUSES } from '../constants'
import { InkButton, Segmented, MONO } from '../../shared/ui'

const StepLabel = ({ children, meta }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      mb: 1.5,
    }}
  >
    <Typography
      component="h2"
      sx={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.025em' }}
    >
      {children}
    </Typography>
    {meta && (
      <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {meta}
      </Typography>
    )}
  </Box>
)

const ProjectToggle = ({ project, selected, doneCount, onToggle }) => (
  <Box
    component="button"
    type="button"
    role="checkbox"
    aria-checked={selected}
    onClick={onToggle}
    sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.5,
      fontFamily: 'inherit',
      textAlign: 'left',
      border: 'none',
      borderTop: '2px solid',
      borderColor: 'divider',
      cursor: 'pointer',
      bgcolor: selected ? `${project.color}` : 'transparent',
      color: selected ? '#000' : 'text.primary',
      '&:hover': selected ? {} : { bgcolor: 'action.hover' },
      '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'text.primary',
        outlineOffset: -3,
      },
    }}
  >
    <Box
      sx={{
        width: 20,
        height: 20,
        flexShrink: 0,
        border: '2.5px solid',
        borderColor: selected ? '#000' : 'text.primary',
        bgcolor: selected ? '#000' : 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected && <Check sx={{ fontSize: '0.9rem', color: project.color }} />}
    </Box>
    <Typography
      sx={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}
    >
      {project.title}
    </Typography>
    {doneCount > 0 && (
      <Typography
        title="Todos you ticked off on this day"
        sx={{
          fontFamily: MONO,
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
          opacity: selected ? 0.8 : 0.65,
        }}
      >
        {doneCount} done
      </Typography>
    )}
  </Box>
)

const ProjectSelectionView = ({
  dayStatus,
  onStatusChange,
  dayNote,
  onNoteChange,
  allAvailableProjects,
  completedTodosByTitle,
  selectedFlowProjects,
  onToggleProject,
  onStart,
  onSaveNonWorking,
}) => {
  const isWorking = dayStatus === 'working'
  const selectedStatus = DAY_STATUSES.find((s) => s.id === dayStatus)
  const selectedCount = selectedFlowProjects.length

  const streamGroups = []
  allAvailableProjects.forEach((project) => {
    let group = streamGroups.find((g) => g.streamId === project.streamId)
    if (!group) {
      group = {
        streamId: project.streamId,
        name: project.streamName,
        color: project.color,
        projects: [],
      }
      streamGroups.push(group)
    }
    group.projects.push(project)
  })

  return (
    <Fade in={true}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Box>
          <StepLabel>What kind of day was it?</StepLabel>
          <Segmented
            ariaLabel="Day type"
            value={dayStatus}
            onChange={onStatusChange}
            options={DAY_STATUSES.map((s) => ({
              value: s.id,
              label: s.label,
              color: s.color,
            }))}
          />
        </Box>

        {isWorking ? (
          <Box>
            <StepLabel
              meta={
                selectedCount > 0
                  ? `${selectedCount} selected`
                  : 'Pick one or more'
              }
            >
              What did you work on?
            </StepLabel>

            {streamGroups.length === 0 ? (
              <Box
                sx={{
                  border: '2.5px dashed',
                  borderColor: 'text.disabled',
                  p: 4,
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>
                  No active projects or activities.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Add one on the Activities page, then come back to log it.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: `repeat(${Math.min(streamGroups.length, 3)}, minmax(0, 1fr))`,
                  },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                {streamGroups.map((group) => {
                  const picked = group.projects.filter((p) =>
                    selectedFlowProjects.some((s) => s.title === p.title)
                  ).length
                  return (
                    <Box
                      key={group.streamId}
                      sx={{
                        border: '3px solid',
                        borderColor: 'text.primary',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          px: 2,
                          py: 1.25,
                          borderTop: '8px solid',
                          borderTopColor: group.color,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900 }}>
                          {group.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'text.secondary',
                          }}
                        >
                          {picked}/{group.projects.length}
                        </Typography>
                      </Box>
                      {group.projects.map((project) => (
                        <ProjectToggle
                          key={project.title}
                          project={project}
                          selected={selectedFlowProjects.some(
                            (p) => p.title === project.title
                          )}
                          doneCount={
                            (completedTodosByTitle?.[project.title] || [])
                              .length
                          }
                          onToggle={() => onToggleProject(project)}
                        />
                      ))}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <StepLabel>Anything to remember about it?</StepLabel>
            <Box
              sx={{
                border: '3px solid',
                borderColor: 'text.primary',
                borderLeft: '10px solid',
                borderLeftColor: selectedStatus.color,
                bgcolor: 'background.paper',
                px: 2.5,
                py: 2,
              }}
            >
              <InputBase
                fullWidth
                multiline
                minRows={3}
                placeholder={`A note about this ${selectedStatus.label.toLowerCase()} day (optional)`}
                value={dayNote}
                onChange={(e) => onNoteChange(e.target.value)}
                sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}
              />
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
            pt: 3,
            borderTop: '3px solid',
            borderColor: 'text.primary',
          }}
        >
          {isWorking && selectedCount === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Select what you worked on to start writing.
            </Typography>
          )}
          <InkButton
            size="lg"
            color={selectedStatus.color}
            disabled={isWorking && selectedCount === 0}
            onClick={() =>
              isWorking
                ? onStart()
                : onSaveNonWorking(dayStatus, dayNote.trim())
            }
            endIcon={isWorking ? <ArrowForward /> : <Check />}
          >
            {isWorking
              ? `Start writing${selectedCount > 0 ? ` (${selectedCount})` : ''}`
              : `Save ${selectedStatus.label} day`}
          </InkButton>
        </Box>
      </Box>
    </Fade>
  )
}

export default ProjectSelectionView
