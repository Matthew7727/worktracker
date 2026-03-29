import React from 'react'
import {
  Box,
  Typography,
  Fade,
  Button,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material'
import { ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material'
import { STEPS } from '../constants'
import { flowStyles } from '../DailyEditor.styles'
import EntryCard from './EntryCard'

const FlowView = ({
  streams,
  currentStep,
  setCurrentStep,
  onCancel,
  onSave,
  updateStream,
  taggedItems,
  updateTaggedItems,
  availableProjects,
}) => {
  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={((currentStep + 1) / STEPS.length) * 100}
          sx={{
            height: 16,
            borderRadius: 8,
            border: '4px solid', borderColor: 'text.primary',
            bgcolor: 'background.paper',
            '& .MuiLinearProgress-bar': { bgcolor: step.color },
          }}
        />
        <Typography
          sx={{ mt: 1, textAlign: 'right', fontWeight: 950, fontSize: '1.1rem' }}
        >
          STEP {currentStep + 1} OF {STEPS.length}
        </Typography>
      </Box>

      <Fade in={true} key={currentStep}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              mb: step.description ? 1 : 4,
              fontWeight: 950,
              color: step.color,
            }}
          >
            {step.question}
          </Typography>

          {step.description && (
            <Typography sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary' }}>
              {step.description}
            </Typography>
          )}

          {availableProjects[step.id]?.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mb: 2,
              }}
            >
              {availableProjects[step.id].map((title) => {
                const isActive = taggedItems[step.id]?.includes(title)
                return (
                  <Chip
                    key={title}
                    label={title}
                    onClick={() => updateTaggedItems(step.id, title)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      border: '2px solid',
                      borderColor: 'text.primary',
                      borderRadius: 0,
                      bgcolor: isActive ? step.color : 'transparent',
                      color: isActive ? 'text.primary' : 'text.secondary',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: step.color, color: 'text.primary', opacity: 0.85 },
                    }}
                  />
                )
              })}
            </Box>
          )}

          <EntryCard
            entry={{ content: streams[step.id], tags: [] }}
            onUpdateContent={(_id, content) => updateStream(step.id, content)}
            isStreamMode
            borderColor={step.color}
          />

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 6 }}>
            <Box
              component="button"
              onClick={() =>
                currentStep === 0
                  ? onCancel()
                  : setCurrentStep((prev) => prev - 1)
              }
              sx={{
                ...flowStyles.flowButton,
                px: 4,
                bgcolor: 'transparent',
              }}
            >
              <ArrowBack sx={{ fontSize: '1.2rem' }} />
              {currentStep === 0 ? 'CANCEL' : 'BACK'}
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
                bgcolor: step.color,
                '&:hover': {
                  ...flowStyles.flowButton['&:hover'],
                  bgcolor: step.color,
                },
              }}
            >
              {isLastStep ? 'FINISH & SAVE' : 'NEXT'}
              {isLastStep ? <CheckCircle sx={{ fontSize: '1.2rem' }} /> : <ArrowForward sx={{ fontSize: '1.2rem' }} />}
              <Box className="shine-layer" sx={flowStyles.shineLayer} />
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Box>
  )
}

export default FlowView
