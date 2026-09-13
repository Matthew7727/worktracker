import React, { useState } from 'react'
import { Box, Typography, Fade, Stack, TextField } from '@mui/material'
import { ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material'
import { DAY_STATUSES } from '../constants'
import { flowStyles } from '../DailyEditor.styles'
import { OFFSET, RULE, hardShadow } from '../../../styles/tokens'

const DayTypeView = ({
  initialStatus = 'working',
  initialNote = '',
  onCancel,
  onContinueWorking,
  onSaveNonWorking,
}) => {
  const [selected, setSelected] = useState(initialStatus)
  const [note, setNote] = useState(initialNote)

  const isWorking = selected === 'working'
  const selectedStatus = DAY_STATUSES.find((s) => s.id === selected)

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', mt: 4 }}>
      <Fade in={true}>
        <Box>
          <Typography
            variant="h3"
            sx={{ mb: 4, fontWeight: 800, letterSpacing: '-0.04em' }}
          >
            What kind of day is this?
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
            {DAY_STATUSES.map((status) => {
              const isActive = selected === status.id
              return (
                <Box
                  key={status.id}
                  component="button"
                  onClick={() => setSelected(status.id)}
                  sx={{
                    fontFamily: 'inherit',
                    fontWeight: 800,
                    fontSize: '1rem',
                    px: 3,
                    py: 1.5,
                    border: `${isActive ? RULE.heavy : RULE.base}px solid`,
                    borderColor: 'text.primary',
                    cursor: 'pointer',
                    bgcolor: isActive ? status.color : 'transparent',
                    color: isActive ? '#000' : 'text.secondary',
                    transition:
                      'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, color 0.15s ease',
                    '&:hover': {
                      bgcolor: isActive ? status.color : 'text.primary',
                      color: isActive ? '#000' : 'background.default',
                      transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
                      boxShadow: (theme) =>
                        hardShadow(OFFSET.base, theme.palette.text.primary),
                    },
                  }}
                >
                  {status.label}
                </Box>
              )
            })}
          </Box>

          {!isWorking && (
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder={`Add a note about this ${selectedStatus.label.toLowerCase()} day (optional)...`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mb: 4 }}
            />
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <Box
              component="button"
              onClick={onCancel}
              sx={{ ...flowStyles.flowButton, px: 4, bgcolor: 'transparent' }}
            >
              <ArrowBack sx={{ fontSize: '1.2rem' }} />
              CANCEL
              <Box className="shine-layer" sx={flowStyles.shineLayer} />
            </Box>

            <Box
              component="button"
              onClick={() =>
                isWorking
                  ? onContinueWorking()
                  : onSaveNonWorking(selected, note.trim())
              }
              sx={{
                ...flowStyles.flowButton,
                px: 4,
                bgcolor: selectedStatus.color,
                '&:hover': {
                  ...flowStyles.flowButton['&:hover'],
                  bgcolor: selectedStatus.color,
                },
              }}
            >
              {isWorking ? 'CONTINUE' : 'SAVE DAY'}
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

export default DayTypeView
