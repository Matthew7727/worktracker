import { Box, Tooltip, Typography } from '@mui/material'
import { Repeat } from '@mui/icons-material'
import { describeRecurrence, isRecurring } from '../../utils/recurrence'
import { useIsFilofax } from '../../styles/useUiStyle'

/** Marks a todo as part of a recurring series. */
const TodoRecurrenceChip = ({ item, showLabel = false }) => {
  const isFx = useIsFilofax()
  if (!isRecurring(item)) return null
  const label = describeRecurrence(item.recurrence)

  return (
    <Tooltip title={label} placement="top" arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.35,
          flexShrink: 0,
          color: 'text.secondary',
        }}
      >
        <Repeat sx={{ fontSize: '0.85rem' }} />
        {showLabel && (
          <Typography
            component="span"
            sx={{
              fontFamily: isFx ? 'inherit' : '"JetBrains Mono", monospace',
              fontStyle: isFx ? 'italic' : 'normal',
              fontSize: '0.72rem',
              fontWeight: isFx ? 400 : 700,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}

export default TodoRecurrenceChip
