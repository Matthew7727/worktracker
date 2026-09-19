import { Box, Tooltip, Typography } from '@mui/material'
import { getTaskDueLabel, getTaskDueSeverity } from '../../utils/taskUrgency'
import { useIsFilofax } from '../../styles/useUiStyle'

const TONE = {
  overdue: { borderColor: '#c62f22', color: '#fff', bg: '#c62f22' },
  soon: { borderColor: 'text.primary', color: '#000', bg: '#ffb020' },
  scheduled: {
    borderColor: 'divider',
    color: 'text.secondary',
    bg: 'transparent',
  },
}

const FX_TONE = {
  overdue: 'error.main',
  soon: 'warning.main',
  scheduled: 'text.secondary',
}

const TodoDueChip = ({ item }) => {
  const isFx = useIsFilofax()
  const label = getTaskDueLabel(item)
  const severity = getTaskDueSeverity(item)
  if (!label || severity === 'none') return null

  if (isFx) {
    return (
      <Tooltip title={`Due ${item.dueDate}`} placement="top" arrow>
        <Typography
          component="span"
          sx={{
            fontStyle: 'italic',
            fontSize: '0.78rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            color: FX_TONE[severity],
            fontWeight: severity === 'overdue' ? 700 : 400,
          }}
        >
          {label}
        </Typography>
      </Tooltip>
    )
  }

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
