import React from 'react'
import { Box, Typography } from '@mui/material'
import { RULE } from '../../../styles/tokens'

const cardSx = {
  border: `${RULE.base}px solid`,
  borderColor: 'text.primary',
  bgcolor: 'background.paper',
  p: 3,
  flex: 1,
}

/**
 * A weighted cloud of the tags you attach to daily entries — never surfaced
 * anywhere before. Font size scales with frequency over the last 90 days.
 */
const TagInsights = ({ tagCounts }) => {
  const top = tagCounts.slice(0, 16)
  const max = Math.max(...top.map((t) => t.count), 1)
  const min = Math.min(...top.map((t) => t.count), 1)

  const sizeFor = (count) => {
    if (max === min) return 20
    const ratio = (count - min) / (max - min)
    return Math.round(14 + ratio * 18) // 14px .. 32px
  }

  return (
    <Box sx={cardSx}>
      <Typography
        sx={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', mb: 2 }}
      >
        Most-used tags · last 90 days
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.25,
          alignItems: 'center',
        }}
      >
        {top.map((t) => (
          <Box
            key={t.tag}
            title={`${t.count} ${t.count === 1 ? 'entry' : 'entries'}`}
            sx={{
              border: `${RULE.hair}px solid`,
              borderColor: 'text.primary',
              px: 1.5,
              py: 0.5,
              bgcolor: 'background.subtle',
              fontWeight: 800,
              fontSize: sizeFor(t.count),
              lineHeight: 1.2,
            }}
          >
            {t.tag}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default TagInsights
