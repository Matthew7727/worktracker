import { Box, Tooltip, Typography } from '@mui/material'
import { getTaskDueLabel, getTaskDueSeverity } from '../../utils/taskUrgency'
import { RULE, FONT } from '../../styles/tokens'

// Urgency is stamped: the two states that need action are solid blocks, the
// merely scheduled one is left as an outline.
const TONE = {
  overdue: {
    borderColor: 'text.primary',
    color: '#fff',
    bg: '#c4241a',
  },
  soon: {
    borderColor: 'text.primary',
    color: '#000',
    bg: '#f2a900',
  },
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
