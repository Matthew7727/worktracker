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

const HeroStatement = ({
  projects,
  stats,
  utilisationTarget,
  utilisationPrediction,
}) => {
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

  // ── Line 1: main-focus engagements (project pipeline) ────────────────────
  let mainLine
  if (!projectHierarchy) {
    const mainEntries = stats.mentionsByStream?.[mainFocusStream?.id] || 0
    mainLine = (
      <>
        Your main focus is <B color={mainColor}>{mainFocusStream?.name}</B> —{' '}
        <B color={mainColor}>{mainEntries.toLocaleString()}</B> entries logged
        so far.
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
  // Predicted, not measured: it's the trend across STAFFIT hours declared
  // so far this June-June cycle, projected forward — never a claim about
  // hours actually worked right now.
  let utilSuffix = null
  if (
    utilisationEnabled &&
    utilisationTarget !== null &&
    utilisationPrediction !== null
  ) {
    const diff = utilisationPrediction - utilisationTarget
    const utilColor =
      diff >= 0 ? '#80b621' : diff >= -10 ? '#f59e0b' : '#d32f2f'
    utilSuffix =
      diff >= 0 ? (
        <>
          , and are predicted to land <B color={utilColor}>{diff}% above</B>{' '}
          your utilisation target
        </>
      ) : (
        <>
          , and are predicted to land{' '}
          <B color={utilColor}>{Math.abs(diff)}% below</B> your utilisation
          target
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
