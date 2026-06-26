import React from 'react'
import { Box, Typography, Fade, Stack, Paper, Button } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { DAY_STATUSES } from '../constants'

const DayOffSummary = ({ dayStatus, dayNote, onEdit }) => {
  const status = DAY_STATUSES.find((s) => s.id === dayStatus) || DAY_STATUSES[0]

  return (
    <Fade in={true}>
      <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%', mt: 4 }}>
        <Paper
          sx={{
            p: 6,
            borderRadius: '40px',
            border: '5px solid',
            borderColor: 'text.primary',
            boxShadow: (theme) =>
              `15px 15px 0px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
            mb: 10,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: 950, letterSpacing: '-2px' }}
            >
              {status.label.toUpperCase()} DAY
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{
                bgcolor: 'text.primary',
                color: 'background.paper',
                fontWeight: 900,
                px: 4,
                '&:hover': { bgcolor: '#333' },
              }}
            >
              EDIT DAY
            </Button>
          </Stack>

          {dayNote ? (
            <Typography sx={{ fontSize: '1.25rem', color: 'text.secondary' }}>
              {dayNote}
            </Typography>
          ) : (
            <Typography sx={{ fontStyle: 'italic', opacity: 0.5 }}>
              No note added for this day.
            </Typography>
          )}
        </Paper>
      </Box>
    </Fade>
  )
}

export default DayOffSummary
