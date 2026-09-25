import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import {
  FREQUENCIES,
  describeRecurrence,
  normalizeRecurrence,
} from '../../utils/recurrence'
import { useIsFilofax } from '../../styles/useUiStyle'

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const WEEKDAYS = [
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
  { value: 0, label: 'S' },
]

const PRESETS = [
  { label: 'Daily', value: { frequency: 'daily', interval: 1 } },
  { label: 'Weekdays', value: { frequency: 'weekdays', interval: 1 } },
  { label: 'Weekly', value: { frequency: 'weekly', interval: 1 } },
  { label: 'Monthly', value: { frequency: 'monthly', interval: 1 } },
]

/**
 * Editor for a todo's repeat rule. `value` is a recurrence object (or null for
 * "does not repeat"); `onChange` receives the next recurrence, or null when
 * repeating is turned off.
 */
const RecurrencePicker = ({ value, onChange }) => {
  const isFx = useIsFilofax()
  const rule = normalizeRecurrence(value)

  const update = (patch) =>
    onChange(
      normalizeRecurrence({ ...(rule || { frequency: 'weekly' }), ...patch })
    )

  const toggleWeekday = (day) => {
    const current = rule?.weekdays || []
    update({
      weekdays: current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    })
  }

  const buttonSx = {
    minWidth: 0,
    borderRadius: 0,
    px: 1,
    py: 0.5,
    fontSize: '0.72rem',
    whiteSpace: 'nowrap',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        <Button
          size="small"
          variant={rule ? 'outlined' : 'contained'}
          onClick={() => onChange(null)}
          sx={buttonSx}
        >
          Does not repeat
        </Button>
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size="small"
            variant={
              rule &&
              rule.frequency === preset.value.frequency &&
              rule.interval === 1
                ? 'contained'
                : 'outlined'
            }
            onClick={() => update({ ...preset.value, weekdays: [] })}
            sx={buttonSx}
          >
            {preset.label}
          </Button>
        ))}
      </Box>

      {rule && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <TextField
            select
            size="small"
            label="Repeats"
            value={rule.frequency}
            onChange={(event) =>
              update({ frequency: event.target.value, weekdays: [] })
            }
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 130 }}
          >
            {FREQUENCIES.map((frequency) => (
              <MenuItem key={frequency} value={frequency}>
                {FREQUENCY_LABELS[frequency]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            label="Every"
            value={rule.interval}
            onChange={(event) => update({ interval: event.target.value })}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: 1, max: 99, 'aria-label': 'Repeat interval' },
            }}
            sx={{ width: 92 }}
          />
          <TextField
            size="small"
            type="date"
            label="Until"
            value={rule.endDate || ''}
            onChange={(event) =>
              update({ endDate: event.target.value || null })
            }
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 170 }}
          />
          {rule.frequency === 'weekly' && (
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              {WEEKDAYS.map((day, index) => (
                <Button
                  key={`${day.value}-${index}`}
                  size="small"
                  variant={
                    rule.weekdays.includes(day.value) ? 'contained' : 'outlined'
                  }
                  onClick={() => toggleWeekday(day.value)}
                  aria-label={`Repeat on weekday ${day.value}`}
                  sx={{ ...buttonSx, width: 30, px: 0 }}
                >
                  {day.label}
                </Button>
              ))}
            </Box>
          )}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={rule.anchor === 'completion'}
                onChange={(event) =>
                  update({
                    anchor: event.target.checked ? 'completion' : 'schedule',
                  })
                }
              />
            }
            label={
              <Typography sx={{ fontSize: '0.75rem' }}>
                Count from completion
              </Typography>
            }
          />
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontStyle: isFx ? 'italic' : 'normal',
              fontWeight: isFx ? 400 : 700,
              color: 'text.secondary',
            }}
          >
            {describeRecurrence(rule)}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default RecurrencePicker
