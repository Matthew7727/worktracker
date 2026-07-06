import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import { getItemAge, getAgeSeverity } from '../../utils/ageUtils'

const SEVERITY_STYLES = {
  urgent: { bgcolor: '#d32f2f', color: '#fff' },
  warn: { bgcolor: '#f59e0b', color: '#000' },
  fresh: { bgcolor: 'action.selected', color: 'text.secondary' },
}

/** Small "how long has this been open" chip: grey <3d, amber 3-6d, red 7d+. */
const TodoAgeChip = ({ item }) => {
  const age = getItemAge(item)
  if (age === null) return null
  const severity = getAgeSeverity(age)
  return (
    <Tooltip title={`Created ${item.createdAt}`} placement="top" arrow>
      <Chip
        label={age === 0 ? 'today' : `${age}d`}
        size="small"
        sx={{
          height: 20,
          fontWeight: 900,
          fontSize: '0.65rem',
          border: 'none',
          flexShrink: 0,
          ...SEVERITY_STYLES[severity],
        }}
      />
    </Tooltip>
  )
}

export default TodoAgeChip
