import React from 'react'
import { Box, Typography, Fade, Stack, LinearProgress } from '@mui/material'
import { ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material'
import { PROJECT_TYPE_LABELS } from '../constants'
import { flowStyles } from '../DailyEditor.styles'
import EntryCard from './EntryCard'
import TodoReminder from './TodoReminder'

const FlowView = ({
  selectedFlowProjects,
  projectDrafts,
  updateProjectDraft,
  currentStep,
  setCurrentStep,
  onBackToSelect,
  onSave,
  todayTodos = [],
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
          sx={{ mb: 4, fontWeight: 900, color: 'text.secondary' }}
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
  const typeLabel = PROJECT_TYPE_LABELS[project.type] || ''

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={((currentStep + 1) / selectedFlowProjects.length) * 100}
          sx={{
            height: 16,
            borderRadius: 8,
            border: '4px solid',
            borderColor: 'text.primary',
            bgcolor: 'background.paper',
            '& .MuiLinearProgress-bar': { bgcolor: color },
          }}
        />
        <Typography
          sx={{
            mt: 1,
            textAlign: 'right',
            fontWeight: 950,
            fontSize: '1.1rem',
          }}
        >
          STEP {currentStep + 1} OF {selectedFlowProjects.length}
        </Typography>
      </Box>

      <Fade in={true} key={currentStep}>
        <Box>
          {typeLabel && (
            <Typography
              sx={{
                mb: 0.5,
                fontWeight: 900,
                fontSize: '0.8rem',
                letterSpacing: '2px',
                color,
              }}
            >
              {typeLabel}
            </Typography>
          )}

          <Typography variant="h3" sx={{ mb: 4, fontWeight: 950, color }}>
            What did you do on {project.title} today?
          </Typography>

          {todayTodos.length > 0 && <TodoReminder lanes={todayTodos} />}

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
