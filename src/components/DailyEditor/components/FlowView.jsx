import React from 'react'
import { Box, Typography, Fade } from '@mui/material'
import { ArrowForward, ArrowBack, Check, TaskAlt } from '@mui/icons-material'
import EntryCard from './EntryCard'
import { InkButton, EmptyState, MONO } from '../../shared/ui'
import GoalLinkPicker from '../../Goals/GoalLinkPicker'

const StepRail = ({ projects, drafts, currentStep, onJump }) => (
  <Box
    component="ol"
    aria-label="Writing steps"
    sx={{
      listStyle: 'none',
      m: 0,
      p: 0,
      border: '3px solid',
      borderColor: 'text.primary',
      bgcolor: 'background.paper',
      position: { md: 'sticky' },
      top: { md: 24 },
    }}
  >
    {projects.map((project, i) => {
      const isCurrent = i === currentStep
      const hasDraft = !!drafts[project.title]?.trim()
      return (
        <Box component="li" key={project.title}>
          <Box
            component="button"
            type="button"
            onClick={() => onJump(i)}
            aria-current={isCurrent ? 'step' : undefined}
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '2.25rem 1fr auto',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1.5,
              fontFamily: 'inherit',
              textAlign: 'left',
              border: 'none',
              borderTop: i === 0 ? 'none' : '2px solid',
              borderColor: 'divider',
              borderLeft: '8px solid',
              borderLeftColor: project.color,
              cursor: 'pointer',
              bgcolor: isCurrent ? 'text.primary' : 'transparent',
              color: isCurrent ? 'background.paper' : 'text.primary',
              '&:hover': isCurrent ? {} : { bgcolor: 'action.hover' },
            }}
          >
            <Typography
              sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.85rem' }}
            >
              {String(i + 1).padStart(2, '0')}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {project.title}
              </Typography>
              <Typography
                sx={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.7 }}
              >
                {project.streamName}
              </Typography>
            </Box>
            {hasDraft && (
              <Check
                aria-label="Written"
                sx={{
                  fontSize: '1rem',
                  color: isCurrent ? 'inherit' : project.color,
                }}
              />
            )}
          </Box>
        </Box>
      )
    })}
  </Box>
)

const FlowView = ({
  selectedFlowProjects,
  completedTodosByTitle,
  projectDrafts,
  updateProjectDraft,
  goalIds,
  onGoalIdsChange,
  currentStep,
  setCurrentStep,
  onBackToSelect,
  onSave,
}) => {
  if (selectedFlowProjects.length === 0) {
    return (
      <EmptyState
        title="Nothing selected to write about."
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <InkButton
              tone="outline"
              startIcon={<ArrowBack />}
              onClick={onBackToSelect}
            >
              Pick projects
            </InkButton>
            <InkButton
              color="primary.main"
              endIcon={<Check />}
              onClick={onSave}
            >
              Save day
            </InkButton>
          </Box>
        }
      >
        Go back and choose what you worked on, or save the day as it is.
      </EmptyState>
    )
  }

  const project = selectedFlowProjects[currentStep]
  const total = selectedFlowProjects.length
  const isLastStep = currentStep === total - 1
  const color = project.color || 'primary.main'
  const completedTodos = completedTodosByTitle?.[project.title] || []

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
        gap: 4,
        alignItems: 'start',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.9rem',
            mb: 1,
            color: 'text.secondary',
          }}
        >
          Today&apos;s sheet
        </Typography>
        <StepRail
          projects={selectedFlowProjects}
          drafts={projectDrafts}
          currentStep={currentStep}
          onJump={setCurrentStep}
        />
        <InkButton
          tone="ghost"
          size="sm"
          startIcon={<ArrowBack />}
          onClick={onBackToSelect}
          sx={{ mt: 1.5, px: 0.5 }}
        >
          Change selection
        </InkButton>
      </Box>

      <Fade in={true} key={currentStep}>
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}
          >
            <Box
              sx={{
                px: 1,
                py: 0.25,
                bgcolor: color,
                color: '#000',
                fontWeight: 800,
                fontSize: '0.8rem',
                border: '2px solid',
                borderColor: 'text.primary',
              }}
            >
              {project.streamName}
            </Box>
            <Typography
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                color: 'text.secondary',
              }}
            >
              {currentStep + 1} of {total}
            </Typography>
          </Box>

          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              mb: 3,
            }}
          >
            What did you do on {project.title}?
          </Typography>

          {completedTodos.length > 0 && (
            <Box
              sx={{
                mb: 3,
                borderLeft: '4px solid',
                borderColor: color,
                pl: 2,
                py: 0.5,
              }}
            >
              <Typography
                sx={{ fontWeight: 800, fontSize: '0.85rem', mb: 0.75 }}
              >
                Ticked off today
              </Typography>
              {completedTodos.map((todo) => (
                <Box
                  key={todo.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.25,
                  }}
                >
                  <TaskAlt sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {todo.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <EntryCard
            key={project.title}
            content={projectDrafts[project.title] || ''}
            onChange={(content) => updateProjectDraft(project.title, content)}
            accentColor={color}
          />
          <Box
            sx={{
              mt: 3,
              pt: 2.25,
              borderTop: '2px solid',
              borderColor: 'divider',
            }}
          >
            <GoalLinkPicker
              value={goalIds || []}
              onChange={onGoalIdsChange}
              label="This written entry supports goals"
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
              gap: 2,
            }}
          >
            <InkButton
              tone="outline"
              startIcon={<ArrowBack />}
              onClick={() =>
                currentStep === 0
                  ? onBackToSelect()
                  : setCurrentStep((prev) => prev - 1)
              }
            >
              {currentStep === 0 ? 'Back to selection' : 'Previous'}
            </InkButton>
            <InkButton
              size="lg"
              color={color}
              endIcon={isLastStep ? <Check /> : <ArrowForward />}
              onClick={() =>
                isLastStep ? onSave() : setCurrentStep((prev) => prev + 1)
              }
            >
              {isLastStep
                ? 'Save day'
                : `Next: ${selectedFlowProjects[currentStep + 1].title}`}
            </InkButton>
          </Box>
        </Box>
      </Fade>
    </Box>
  )
}

export default FlowView
