import React from 'react'
import { Paper, Stack, IconButton, Box } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { toolbarStyles, datePickerStyles } from '../TodoBoard.styles'

const DateNavigator = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onDateChange,
  children,
}) => {
  // Determine if we are on "today" (or theoretically a future date, though blocked)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const viewingDate = new Date(currentDate)
  viewingDate.setHours(0, 0, 0, 0)

  // Disable next if we are viewing today or any future date
  const disableNext = viewingDate >= today

  return (
    <Paper sx={toolbarStyles} elevation={0}>
      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton
          onClick={onPrevDay}
          sx={{ border: '2px solid', borderColor: 'text.primary' }}
          aria-label="Previous Day"
        >
          <ChevronLeft />
        </IconButton>

        <DatePicker
          value={currentDate}
          onChange={onDateChange}
          disableFuture
          slotProps={{
            textField: {
              size: 'small',
              sx: datePickerStyles,
            },
          }}
        />

        <IconButton
          onClick={onNextDay}
          disabled={disableNext}
          sx={{
            border: '2px solid',
            borderColor: 'text.primary',
            opacity: disableNext ? 0.3 : 1,
            bgcolor: disableNext ? 'action.disabledBackground' : 'transparent',
            cursor: disableNext ? 'not-allowed' : 'pointer',
          }}
          aria-label="Next Day"
        >
          <ChevronRight />
        </IconButton>
      </Stack>

      <Box>{children}</Box>
    </Paper>
  )
}

export default DateNavigator
