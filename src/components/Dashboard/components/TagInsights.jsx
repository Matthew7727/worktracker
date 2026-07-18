import React from 'react'
import { Box, Typography } from '@mui/material'

const cardSx = {
  border: '3px solid',
  borderColor: 'text.primary',
  borderRadius: '24px',
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
      <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 2 }}>
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
              border: '2px solid',
              borderColor: 'text.primary',
              borderRadius: '12px',
              px: 1.5,
              py: 0.5,
              bgcolor: 'background.subtle',
              fontWeight: 900,
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
