import { Box, Tooltip, Typography } from '@mui/material'
import { getTaskDueLabel, getTaskDueSeverity } from '../../utils/taskUrgency'

const TONE = {
  overdue: {
    borderColor: '#dc4c3f',
    color: '#dc4c3f',
    bg: 'rgba(220, 76, 63, 0.08)',
  },
  soon: {
    borderColor: '#d97706',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
  },
  scheduled: {
    borderColor: 'divider',
    color: 'text.secondary',
    bg: 'background.paper',
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
          px: 0.9,
          py: 0.2,
          borderRadius: '999px',
          border: '1px solid',
          borderColor: TONE[severity].borderColor,
          bgcolor: TONE[severity].bg,
          color: TONE[severity].color,
          flexShrink: 0,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.62rem',
            fontWeight: 700,
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
