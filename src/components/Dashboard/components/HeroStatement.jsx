import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useAppContext } from '../../../context/AppContext'
import { getActivityStreamId } from '../../../utils/projectsManager'
import { getGreeting } from '../../../utils/dashboardInsights'

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

// Bumps a persisted counter once per mount (i.e. once per app-open / visit),
// so each session surfaces a different spotlight with no manual refresh.
const useRotationSeed = () =>
  useState(() => {
    const next = Number(localStorage.getItem('wt_heroSpotlight') || 0) + 1
    localStorage.setItem('wt_heroSpotlight', String(next))
    return next
  })[0]

const HeroStatement = ({
  projects,
  stats,
  utilisationTarget,
  utilisationPrediction,
  tagCounts = [],
  collaborators = [],
  taskTotals = null,
  wellbeing = null,
}) => {
  const { streamConfig, streams, mainFocusStream } = useAppContext()
  const seed = useRotationSeed()
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

  // ── Anchor line: greeting + current engagements (stable) ──────────────────
  let anchor
  if (!projectHierarchy) {
    const mainEntries = stats.mentionsByStream?.[mainFocusStream?.id] || 0
    anchor = (
      <>
        {getGreeting()}. Your main focus is{' '}
        <B color={mainColor}>{mainFocusStream?.name}</B> —{' '}
        <B color={mainColor}>{mainEntries.toLocaleString()}</B> entries logged
        so far.
      </>
    )
  } else if (activeClients.length === 0) {
    anchor = (
      <>
        {getGreeting()}. You have{' '}
        <B color="#888">no active {mainFocusStream?.name} projects</B> right
        now.
      </>
    )
  } else if (activeClients.length <= 2) {
    anchor = (
      <>
        {getGreeting()}. You are currently engaged on{' '}
        {joinNodes(
          activeClients.map((p) => <B color={mainColor}>{p.title}</B>)
        )}
        .
      </>
    )
  } else {
    anchor = (
      <>
        {getGreeting()}. You are currently engaged on{' '}
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

  // ── Spotlight pool: each entry taps a different data dimension ─────────────
  const otherStreams = streams.filter((s) => s.id !== mainFocusStream?.id)
  const pool = []

  // Classic "activities completed this year (+ utilisation)" line.
  if (otherStreams.length > 0) {
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
    pool.push(
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
    )
  }

  // Streak.
  if (stats.currentStreak >= 2) {
    pool.push(
      <>
        You're on a{' '}
        <B color="#80b621">{stats.currentStreak}-day logging streak</B> — keep
        it alive.
      </>
    )
  }

  // Utilisation, standalone framing.
  if (
    utilisationEnabled &&
    utilisationTarget !== null &&
    utilisationPrediction !== null
  ) {
    const diff = utilisationPrediction - utilisationTarget
    const utilColor =
      diff >= 0 ? '#80b621' : diff >= -10 ? '#f59e0b' : '#d32f2f'
    pool.push(
      <>
        You're predicted to land at{' '}
        <B color={utilColor}>{utilisationPrediction}% utilisation</B> this
        cycle, against a target of <B>{utilisationTarget}%</B>.
      </>
    )
  }

  // Top tag.
  if (tagCounts.length > 0) {
    const top = tagCounts[0]
    pool.push(
      <>
        Your most-used tag lately is <B color={mainColor}>{top.tag}</B>, on{' '}
        <B>{top.count}</B> {top.count === 1 ? 'day' : 'days'} in the last 90.
      </>
    )
  }

  // Top collaborator.
  if (collaborators.length > 0) {
    const top = collaborators[0]
    pool.push(
      <>
        You've partnered with <B color="#9c6ade">{top.name}</B> on{' '}
        <B>{top.count}</B> {top.count === 1 ? 'piece' : 'pieces'} of work — your
        most frequent collaborator.
      </>
    )
  }

  // Task throughput.
  if (taskTotals && taskTotals.lastWeek > 0) {
    const delta = taskTotals.lastWeek - taskTotals.prevWeek
    pool.push(
      <>
        You closed <B color="#80b621">{taskTotals.lastWeek} tasks</B> last week
        {delta !== 0 && (
          <>
            {' '}
            —{' '}
            <B color={delta > 0 ? '#80b621' : '#d32f2f'}>
              {delta > 0 ? `${delta} more` : `${Math.abs(delta)} fewer`}
            </B>{' '}
            than the week before
          </>
        )}
        .
      </>
    )
  }

  // Balance.
  if (stats.balanceScore > 0) {
    pool.push(
      <>
        Your effort is spread across streams with a{' '}
        <B color="#80b621">balance score of {stats.balanceScore}</B>.
      </>
    )
  }

  // Wellbeing.
  if (wellbeing && wellbeing.pto > 0) {
    pool.push(
      <>
        You've taken <B color="#4dabf7">{wellbeing.pto} PTO</B>{' '}
        {wellbeing.pto === 1 ? 'day' : 'days'} this cycle — rest is productive
        too.
      </>
    )
  }

  // Days logged fallback.
  if (stats.totalDays > 0) {
    pool.push(
      <>
        You've logged <B>{stats.totalDays}</B>{' '}
        {stats.totalDays === 1 ? 'day' : 'days'} of work — consistency
        compounds.
      </>
    )
  }

  const spotlight = pool.length > 0 ? pool[seed % pool.length] : null
  const hStyle = { fontWeight: 800, lineHeight: 1.4, color: 'text.primary' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="h3" sx={hStyle}>
        {anchor}
      </Typography>
      {spotlight && (
        <Typography variant="h3" sx={hStyle}>
          {spotlight}
        </Typography>
      )}
    </Box>
  )
}

export default HeroStatement
