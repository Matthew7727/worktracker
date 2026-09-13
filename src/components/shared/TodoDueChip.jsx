import { Box, Tooltip, Typography } from '@mui/material'
import { getTaskDueLabel, getTaskDueSeverity } from '../../utils/taskUrgency'
import { RULE, FONT } from '../../styles/tokens'

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
          border: `${RULE.hair}px solid`,
          borderColor: TONE[severity].borderColor,
          bgcolor: TONE[severity].bg,
          color: TONE[severity].color,
          flexShrink: 0,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: FONT.data,
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
