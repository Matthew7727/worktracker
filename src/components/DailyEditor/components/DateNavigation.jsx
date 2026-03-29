import React from 'react'
import { Paper, Stack, IconButton, Button } from '@mui/material'
import { ChevronLeft, ChevronRight, Add } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { toolbarStyles, datePickerStyles } from '../DailyEditor.styles'

const DateNavigation = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onDateChange,
  onAddEntry,
  hideAddEntry,
}) => {
  return (
    <Paper sx={toolbarStyles}>
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
          slotProps={{
            textField: {
              size: 'small',
              sx: datePickerStyles,
            },
          }}
        />

        <IconButton
          onClick={onNextDay}
          sx={{ border: '2px solid', borderColor: 'text.primary' }}
          aria-label="Next Day"
        >
          <ChevronRight />
        </IconButton>
      </Stack>

      {!hideAddEntry && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddEntry}
          sx={{
            fontWeight: 900,
            px: 4,
            boxShadow: '0 4px 14px rgba(128, 182, 33, 0.3)',
          }}
        >
          Add Contribution
        </Button>
      )}
    </Paper>
  )
}

export default DateNavigation
