import { Box, Button, TextField } from '@mui/material'

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDueDatePresets = (now = new Date()) => {
  const dateFromToday = (days) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    date.setDate(date.getDate() + days)
    return date
  }
  const daysUntilEndOfWorkWeek = (5 - now.getDay() + 7) % 7

  return [
    { label: 'Today', date: dateFromToday(0) },
    { label: 'Tomorrow', date: dateFromToday(1) },
    { label: 'End of week', date: dateFromToday(daysUntilEndOfWorkWeek) },
    {
      label: 'End of next week',
      date: dateFromToday(daysUntilEndOfWorkWeek + 7),
    },
    {
      label: 'End of month',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    },
  ].map((preset) => ({ ...preset, value: formatDateInput(preset.date) }))
}

const DueDatePicker = ({ value, onChange }) => (
  <Box
    sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
  >
    <TextField
      size="small"
      type="date"
      label="Due date"
      value={value || ''}
      onChange={(event) => onChange(event.target.value || null)}
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{ minWidth: 190 }}
    />
    {[...getDueDatePresets(), { label: 'No due date', value: null }].map(
      (preset) => (
        <Button
          key={preset.label}
          size="small"
          variant={(value || null) === preset.value ? 'contained' : 'outlined'}
          onClick={() => onChange(preset.value)}
          sx={{
            minWidth: 0,
            borderRadius: 0,
            px: 1,
            py: 0.5,
            fontSize: '0.72rem',
            whiteSpace: 'nowrap',
          }}
        >
          {preset.label}
        </Button>
      )
    )}
  </Box>
)

export default DueDatePicker
