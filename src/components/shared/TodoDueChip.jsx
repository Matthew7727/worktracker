import { Box, Tooltip, Typography } from '@mui/material'
import { getTaskDueLabel, getTaskDueSeverity } from '../../utils/taskUrgency'

const TONE = {
  overdue: { borderColor: '#c62f22', color: '#fff', bg: '#c62f22' },
  soon: { borderColor: 'text.primary', color: '#000', bg: '#ffb020' },
  scheduled: {
    borderColor: 'divider',
    color: 'text.secondary',
    bg: 'transparent',
  },
}

const TodoDueChip = ({ item }) => {
  const label = getTaskDueLabel(item)
  const severity = getTaskDueSeverity(item)
  if (!label || severity === 'none') return null

  return (
    <Tooltip title={`Due ${item.dueDate}`} placement="top" arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 0.75,
          py: 0.15,
          border: '2px solid',
          borderColor: TONE[severity].borderColor,
          bgcolor: TONE[severity].bg,
          color: TONE[severity].color,
          flexShrink: 0,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            color: 'inherit',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default TodoDueChip
