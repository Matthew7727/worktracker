import React from 'react'
import { Box, Typography } from '@mui/material'

const B = ({ children, color }) => (
  <Typography component="span" variant="h3" sx={{ fontWeight: 900, color: color || 'text.primary' }}>
    {children}
  </Typography>
)

const HeroStatement = ({ projects, stats, utilisationTarget }) => {
  const currentYear = new Date().getFullYear().toString()

  const activeClients = projects.clientProjects.filter((p) => p.status === 'active')

  const completedThisYear = (type) =>
    projects.activities.filter((a) => {
      const done = a.status === 'archived' || a.status === 'completed'
      const date = a.completedAt || a.createdAt || ''
      return done && a.type === type && date.startsWith(currentYear)
    }).length

  const pdDone = completedThisYear('PD')
  const bdDone = completedThisYear('BD')

  const currentUtil = stats.totalWords > 0
    ? Math.round((stats.streamBreakdown.clientWork / stats.totalWords) * 100)
    : 0

  // ── Line 1: client engagements ───────────────────────────────────────────
  let clientLine
  if (activeClients.length === 0) {
    clientLine = <>You have <B color="#888">no active client engagements</B> right now.</>
  } else if (activeClients.length === 1) {
    clientLine = <>You are currently engaged on <B color="#80b621">{activeClients[0].title}</B>.</>
  } else if (activeClients.length === 2) {
    clientLine = (
      <>
        You are currently engaged on <B color="#80b621">{activeClients[0].title}</B> and{' '}
        <B color="#80b621">{activeClients[1].title}</B>.
      </>
    )
  } else {
    clientLine = (
      <>
        You are currently engaged on <B color="#80b621">{activeClients[0].title}</B>,{' '}
        <B color="#80b621">{activeClients[1].title}</B>, and{' '}
        <B color="#80b621">{activeClients.length - 2} other engagement{activeClients.length - 2 !== 1 ? 's' : ''}</B>.
      </>
    )
  }

  // ── Line 2: PD/BD + utilisation ─────────────────────────────────────────
  let utilSuffix = null
  if (utilisationTarget !== null) {
    const diff = currentUtil - utilisationTarget
    const utilColor = diff >= 0 ? '#80b621' : diff >= -10 ? '#f59e0b' : '#d32f2f'
    utilSuffix = diff >= 0
      ? <>, and are <B color={utilColor}>{diff}% above</B> your utilisation target</>
      : <>, and are <B color={utilColor}>{Math.abs(diff)}% below</B> your utilisation target</>
  }

  const activityLine = (
    <>
      You've completed <B color="#4a6b13">{pdDone} PD</B> and{' '}
      <B color="#eb8449">{bdDone} BD</B> activities this year{utilSuffix}.
    </>
  )

  const hStyle = { fontWeight: 800, lineHeight: 1.4, color: 'text.primary' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="h3" sx={hStyle}>{clientLine}</Typography>
      <Typography variant="h3" sx={hStyle}>{activityLine}</Typography>
    </Box>
  )
}

export default HeroStatement
