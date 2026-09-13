import React from 'react'
import { Paper, Stack, IconButton, Button } from '@mui/material'
import { ChevronLeft, ChevronRight, Add } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { toolbarStyles, datePickerStyles } from '../DailyEditor.styles'
import { FONT, OFFSET, RULE, hardShadow } from '../../../styles/tokens'

const pickerPaperProps = {
  elevation: 0,
  sx: {
    border: `${RULE.base}px solid`,
    borderColor: 'text.primary',
    borderRadius: 0,
    boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
  },
}

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
          sx={{
            border: `${RULE.hair}px solid`,
            borderColor: 'text.primary',
            '&:hover': {
              bgcolor: 'text.primary',
              color: 'background.paper',
            },
          }}
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
            desktopPaper: pickerPaperProps,
            mobilePaper: pickerPaperProps,
            day: {
              sx: {
                borderRadius: 0,
                fontFamily: FONT.data,
                fontWeight: 800,
                '&.Mui-selected': {
                  border: `${RULE.heavy}px solid`,
                  borderColor: 'text.primary',
                },
              },
            },
          }}
        />

        <IconButton
          onClick={onNextDay}
          sx={{
            border: `${RULE.hair}px solid`,
            borderColor: 'text.primary',
            '&:hover': {
              bgcolor: 'text.primary',
              color: 'background.paper',
            },
          }}
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
            fontWeight: 800,
            px: 4,
            boxShadow: (theme) =>
              hardShadow(OFFSET.base, theme.palette.text.primary),
          }}
        >
          Add Contribution
        </Button>
      )}
    </Paper>
  )
}

export default DateNavigation
