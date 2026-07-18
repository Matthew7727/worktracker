import React from 'react'
import { Box, Typography, Stack, Avatar } from '@mui/material'
import { getInitials } from '../../../utils/dashboardInsights'

const cardSx = {
  border: '3px solid',
  borderColor: 'text.primary',
  borderRadius: '24px',
  bgcolor: 'background.paper',
  p: 3,
  flex: 1,
}

// Deterministic colour per person from the stream palette family.
const PALETTE = [
  '#80b621',
  '#9c6ade',
  '#4dabf7',
  '#eb8449',
  '#4ecdc4',
  '#f783ac',
]
const colorFor = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

/**
 * The people you collaborate with most, ranked by how many projects and
 * activities name them — team data that was captured but never shown.
 */
const Collaborators = ({ collaborators }) => {
  const top = collaborators.slice(0, 6)
  return (
    <Box sx={cardSx}>
      <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 2 }}>
        Who you work with most
      </Typography>
      <Stack spacing={1.5}>
        {top.map((c) => (
          <Stack
            key={c.name}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: colorFor(c.name),
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 14,
                  border: '3px solid',
                  borderColor: 'text.primary',
                }}
              >
                {getInitials(c.name)}
              </Avatar>
              <Typography sx={{ fontWeight: 800 }}>{c.name}</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, opacity: 0.6, fontSize: 13 }}>
              {c.count} {c.count === 1 ? 'project' : 'projects'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export default Collaborators
