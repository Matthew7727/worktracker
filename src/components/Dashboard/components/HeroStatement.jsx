import React from 'react'
import { Box, Typography } from '@mui/material'
import { useAppContext } from '../../../context/AppContext'
import { getActivityStreamId } from '../../../utils/projectsManager'

const B = ({ children, color }) => (
  <Typography
    component="span"
    variant="h3"
    sx={{ fontWeight: 900, color: color || 'text.primary' }}
  >
    {children}
  </Typography>
)

const joinNodes = (nodes) =>
  nodes.map((node, i) => (
    <React.Fragment key={i}>
      {i > 0 && (i === nodes.length - 1 ? ' and ' : ', ')}
      {node}
    </React.Fragment>
  ))

const HeroStatement = ({ projects, stats, utilisationTarget }) => {
  const { streamConfig, streams, mainFocusStream } = useAppContext()
  const currentYear = new Date().getFullYear().toString()

  const projectHierarchy = !!streamConfig?.features?.projectHierarchy
  const utilisationEnabled = !!streamConfig?.features?.utilisation
  const mainColor = mainFocusStream?.color || 'primary.main'

  const activeClients = projects.clientProjects.filter(
    (p) => p.status === 'active'
  )

  const completedThisYear = (streamId) =>
    projects.activities.filter((a) => {
      const done = a.status === 'archived' || a.status === 'completed'
      const date = a.completedAt || a.createdAt || ''
      return (
        done &&
        getActivityStreamId(a) === streamId &&
        date.startsWith(currentYear)
      )
    }).length

  const currentUtil =
    stats.totalWords > 0 && mainFocusStream
      ? Math.round(
          ((stats.streamBreakdown[mainFocusStream.id] || 0) /
            stats.totalWords) *
            100
        )
      : 0

  // ── Line 1: main-focus engagements (project pipeline) ────────────────────
  let mainLine
  if (!projectHierarchy) {
    const mainWords = stats.streamBreakdown[mainFocusStream?.id] || 0
    mainLine = (
      <>
        Your main focus is <B color={mainColor}>{mainFocusStream?.name}</B> —{' '}
        <B color={mainColor}>{mainWords.toLocaleString()}</B> words logged so
        far.
      </>
    )
  } else if (activeClients.length === 0) {
    mainLine = (
      <>
        You have <B color="#888">no active {mainFocusStream?.name} projects</B>{' '}
        right now.
      </>
    )
  } else if (activeClients.length <= 2) {
    mainLine = (
      <>
        You are currently engaged on{' '}
        {joinNodes(
          activeClients.map((p) => <B color={mainColor}>{p.title}</B>)
        )}
        .
      </>
    )
  } else {
    mainLine = (
      <>
        You are currently engaged on{' '}
        <B color={mainColor}>{activeClients[0].title}</B>,{' '}
        <B color={mainColor}>{activeClients[1].title}</B>, and{' '}
        <B color={mainColor}>
          {activeClients.length - 2} other engagement
          {activeClients.length - 2 !== 1 ? 's' : ''}
        </B>
        .
      </>
    )
  }

  // ── Line 2: other streams + utilisation ──────────────────────────────────
  let utilSuffix = null
  if (utilisationEnabled && utilisationTarget !== null) {
    const diff = currentUtil - utilisationTarget
    const utilColor =
      diff >= 0 ? '#80b621' : diff >= -10 ? '#f59e0b' : '#d32f2f'
    utilSuffix =
      diff >= 0 ? (
        <>
          , and are <B color={utilColor}>{diff}% above</B> your utilisation
          target
        </>
      ) : (
        <>
          , and are <B color={utilColor}>{Math.abs(diff)}% below</B> your
          utilisation target
        </>
      )
  }

  const otherStreams = streams.filter((s) => s.id !== mainFocusStream?.id)
  const activityLine =
    otherStreams.length > 0 ? (
      <>
        You've completed{' '}
        {joinNodes(
          otherStreams.map((s) => (
            <B color={s.color}>
              {completedThisYear(s.id)} {s.name}
            </B>
          ))
        )}{' '}
        activities this year{utilSuffix}.
      </>
    ) : (
      <>
        You've logged <B>{stats.totalDays}</B> days this year{utilSuffix}.
      </>
    )

  const hStyle = { fontWeight: 800, lineHeight: 1.4, color: 'text.primary' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="h3" sx={hStyle}>
        {mainLine}
      </Typography>
      <Typography variant="h3" sx={hStyle}>
        {activityLine}
      </Typography>
    </Box>
  )
}

export default HeroStatement
