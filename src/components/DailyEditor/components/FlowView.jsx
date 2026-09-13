import React from 'react'
import { Box, Typography, Fade, Stack, LinearProgress } from '@mui/material'
import {
  ArrowForward,
  ArrowBack,
  CheckCircle,
  TaskAlt,
} from '@mui/icons-material'
import { flowStyles } from '../DailyEditor.styles'
import EntryCard from './EntryCard'
import { FONT, RULE } from '../../../styles/tokens'

const FlowView = ({
  selectedFlowProjects,
  completedTodosByTitle,
  projectDrafts,
  updateProjectDraft,
  currentStep,
  setCurrentStep,
  onBackToSelect,
  onSave,
}) => {
  if (selectedFlowProjects.length === 0) {
    return (
      <Box
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          width: '100%',
          mt: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'text.secondary',
          }}
        >
          No projects selected — nothing to log.
        </Typography>
        <Stack direction="row" justifyContent="center" gap={2}>
          <Box
            component="button"
            onClick={onBackToSelect}
            sx={{ ...flowStyles.flowButton, px: 4, bgcolor: 'transparent' }}
          >
            <ArrowBack sx={{ fontSize: '1.2rem' }} />
            BACK
            <Box className="shine-layer" sx={flowStyles.shineLayer} />
          </Box>
          <Box
            component="button"
            onClick={onSave}
            sx={{
              ...flowStyles.flowButton,
              px: 4,
              bgcolor: 'primary.main',
              '&:hover': {
                ...flowStyles.flowButton['&:hover'],
                bgcolor: 'primary.main',
              },
            }}
          >
            SAVE DAY
            <CheckCircle sx={{ fontSize: '1.2rem' }} />
            <Box className="shine-layer" sx={flowStyles.shineLayer} />
          </Box>
        </Stack>
      </Box>
    )
  }

  const project = selectedFlowProjects[currentStep]
  const isLastStep = currentStep === selectedFlowProjects.length - 1
  const color = project.color || 'primary.main'
  const typeLabel = project.streamName || ''
  const completedTodos = completedTodosByTitle?.[project.title] || []

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={((currentStep + 1) / selectedFlowProjects.length) * 100}
          sx={{
            height: 16,
            border: `${RULE.base}px solid`,
            borderColor: 'text.primary',
            bgcolor: 'background.paper',
            '& .MuiLinearProgress-bar': { bgcolor: color },
          }}
        />
        <Typography
          sx={{
            mt: 1,
            textAlign: 'right',
            fontFamily: FONT.data,
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          Step {currentStep + 1} of {selectedFlowProjects.length}
        </Typography>
      </Box>

      <Fade in={true} key={currentStep}>
        <Box>
          {typeLabel && (
            <Typography
              sx={{
                mb: 0.5,
                fontWeight: 800,
                fontSize: '0.8rem',
                color,
              }}
            >
              {typeLabel}
            </Typography>
          )}

          <Typography
            variant="h3"
            sx={{
              mb: completedTodos.length ? 2 : 4,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color,
            }}
          >
            What did you do on {project.title} today?
          </Typography>

          {completedTodos.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                mb: 4,
              }}
            >
              {completedTodos.map((todo) => (
                <Stack
                  key={todo.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <TaskAlt sx={{ fontSize: '1.1rem', color }} />
                  <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {todo.text}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          <EntryCard
            entry={{ content: projectDrafts[project.title] || '', tags: [] }}
            onUpdateContent={(_id, content) =>
              updateProjectDraft(project.title, content)
            }
            isStreamMode
            borderColor={color}
          />

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 6 }}>
            <Box
              component="button"
              onClick={() =>
                currentStep === 0
                  ? onBackToSelect()
                  : setCurrentStep((prev) => prev - 1)
              }
              sx={{ ...flowStyles.flowButton, px: 4, bgcolor: 'transparent' }}
            >
              <ArrowBack sx={{ fontSize: '1.2rem' }} />
              BACK
              <Box className="shine-layer" sx={flowStyles.shineLayer} />
            </Box>

            <Box
              component="button"
              onClick={() =>
                isLastStep ? onSave() : setCurrentStep((prev) => prev + 1)
              }
              sx={{
                ...flowStyles.flowButton,
                px: 4,
                bgcolor: color,
                '&:hover': {
                  ...flowStyles.flowButton['&:hover'],
                  bgcolor: color,
                },
              }}
            >
              {isLastStep ? 'FINISH & SAVE' : 'NEXT'}
              {isLastStep ? (
                <CheckCircle sx={{ fontSize: '1.2rem' }} />
              ) : (
                <ArrowForward sx={{ fontSize: '1.2rem' }} />
              )}
              <Box className="shine-layer" sx={flowStyles.shineLayer} />
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Box>
  )
}

export default FlowView
