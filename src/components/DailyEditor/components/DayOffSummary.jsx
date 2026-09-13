import React from 'react'
import { Box, Typography } from '@mui/material'
import { DAY_STATUSES } from '../constants'
import { DaySheet } from './SummaryView'

const DayOffSummary = ({ dayStatus, dayNote, onEdit }) => {
  const status = DAY_STATUSES.find((s) => s.id === dayStatus) || DAY_STATUSES[0]

  return (
    <DaySheet onEdit={onEdit} status={`Logged as a ${status.label} day`}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 4,
            bgcolor: status.color,
            color: '#000',
            borderRight: { md: '3px solid' },
            borderColor: { md: 'text.primary' },
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '2.25rem',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {status.label}
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 4 }}>
          <Typography
            sx={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              maxWidth: '68ch',
              color: dayNote ? 'text.primary' : 'text.disabled',
              whiteSpace: 'pre-wrap',
            }}
          >
            {dayNote || 'No note for this day.'}
          </Typography>
        </Box>
      </Box>
    </DaySheet>
  )
}

export default DayOffSummary
