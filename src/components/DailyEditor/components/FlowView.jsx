import React from 'react'
import {
  Box,
  Typography,
  Fade,
  Button,
  Stack,
  LinearProgress,
} from '@mui/material'
import { ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material'
import { STEPS } from '../constants'
import EntryCard from './EntryCard'

const FlowView = ({ streams, currentStep, setCurrentStep, onCancel, onSave, updateStream }) => {
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
            border: '4px solid black',
            bgcolor: 'white',
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

          <EntryCard
            entry={{ content: streams[step.id], tags: [] }}
            onUpdateContent={(_id, content) => updateStream(step.id, content)}
            isStreamMode
            borderColor={step.color}
          />

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() =>
                currentStep === 0
                  ? onCancel()
                  : setCurrentStep((prev) => prev - 1)
              }
              sx={{
                px: 4,
                py: 1.5,
                border: '4px solid black',
                borderWidth: '3px !important',
                fontWeight: 900,
                color: 'black',
              }}
            >
              {currentStep === 0 ? 'CANCEL' : 'BACK'}
            </Button>

            <Button
              variant="contained"
              size="large"
              endIcon={isLastStep ? <CheckCircle /> : <ArrowForward />}
              onClick={() =>
                isLastStep ? onSave() : setCurrentStep((prev) => prev + 1)
              }
              sx={{
                px: 6,
                py: 1.5,
                fontWeight: 900,
                bgcolor: step.color,
                border: '4px solid black',
                boxShadow: '8px 8px 0px black',
                '&:hover': {
                  bgcolor: step.color,
                  transform: 'translate(-2px, -2px)',
                  boxShadow: '10px 10px 0px black',
                },
              }}
            >
              {isLastStep ? 'FINISH & SAVE' : 'NEXT'}
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Box>
  )
}

export default FlowView
