import { Box, Tooltip, Typography } from '@mui/material'
import { getItemAge, getAgeSeverity } from '../../utils/ageUtils'
import { useIsFilofax } from '../../styles/useUiStyle'

const DOT_COLORS = {
  urgent: '#dc4c3f',
  warn: '#d97706',
}

/**
 * "How long has this been open" marker: nothing when created today, a muted
 * day count when fresh, and a coloured dot + count once it starts ageing
 * (amber 3–6d, red 7d+).
 */
const TodoAgeChip = ({ item }) => {
  const isFx = useIsFilofax()
  const age = getItemAge(item)
  if (age === null || age === 0) return null
  const severity = getAgeSeverity(age)
  const dotColor = DOT_COLORS[severity]

  return (
    <Tooltip title={`Created ${item.createdAt}`} placement="top" arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.6,
          flexShrink: 0,
        }}
      >
        {dotColor && (
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: isFx ? '50%' : 0,
              bgcolor: dotColor,
            }}
          />
        )}
        <Typography
          component="span"
          sx={{
            fontFamily: isFx ? 'inherit' : '"JetBrains Mono", monospace',
            fontStyle: isFx ? 'italic' : 'normal',
            fontSize: '0.72rem',
            fontWeight: isFx ? 400 : 700,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {age}d
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default TodoAgeChip
