import React from 'react'
import { Box, Skeleton, Fade, Divider, Typography } from '@mui/material'
import useDashboardData from './hooks/useDashboardData'
import { useAppContext } from '../../context/AppContext'
import HeroStatement from './components/HeroStatement'
import StreamAlignment from './components/StreamAlignment'
import ContributionGraph from './ContributionGraph'
import RecentAccomplishments from './components/RecentAccomplishments'
import ProjectsSummary from './components/ProjectsSummary'
import NeedsAttention from './components/NeedsAttention'
import MomentumTrends from './components/MomentumTrends'
import LockedTile from './components/LockedTile'

// The dashboard grows with the workspace: widgets unlock as more days are
// logged, so a fresh workspace stays simple and a mature one gets richer.
const UNLOCKS = {
  journey: 7, // contribution graph
  momentum: 14, // 8-week trends + comparison
}

const SectionLabel = ({ children }) => (
  <Typography
    variant="h6"
    sx={{
      fontWeight: 900,
      mb: 3,
      textTransform: 'uppercase',
      letterSpacing: 1,
      opacity: 0.7,
    }}
  >
    {children}
  </Typography>
)

const SectionDivider = () => (
  <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />
)

const Dashboard = () => {
  const { stats, projects, allEntries, utilisationTarget, loading } =
    useDashboardData()
  const { streamConfig } = useAppContext()

  const days = stats.totalDays
  const journeyUnlocked = days >= UNLOCKS.journey
  const momentumUnlocked = days >= UNLOCKS.momentum

  return (
    <Fade in={true} timeout={600}>
      <Box
        className="dashboard-page"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pb: 10,
          maxWidth: 1000,
          mx: 'auto',
          width: '100%',
          pt: 4,
        }}
      >
        {/* ── Hero ── */}
        <Box>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={160}
              sx={{ borderRadius: 4 }}
            />
          ) : (
            <HeroStatement
              projects={projects}
              stats={stats}
              utilisationTarget={utilisationTarget}
            />
          )}
        </Box>

        <SectionDivider />

        {/* ── Needs Attention (important + ageing todos) ── */}
        <NeedsAttention />

        {/* ── Weekly Intensity + Stream Alignment ── */}
        <StreamAlignment
          entries={allEntries}
          stats={stats}
          utilisationTarget={utilisationTarget}
          loading={loading}
        />

        <SectionDivider />

        {/* ── Momentum (unlocks at 14 logged days) ── */}
        {!loading && (
          <>
            {momentumUnlocked ? (
              <MomentumTrends entries={allEntries} />
            ) : (
              <LockedTile
                title="Momentum Trends"
                requirement={`Log ${UNLOCKS.momentum - days} more day${UNLOCKS.momentum - days === 1 ? '' : 's'} to unlock your 8-week momentum view.`}
                current={days}
                target={UNLOCKS.momentum}
              />
            )}
            <SectionDivider />
          </>
        )}

        {/* ── The Journey (unlocks at 7 logged days) ── */}
        <Box>
          <SectionLabel>The Journey</SectionLabel>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{ borderRadius: 4 }}
            />
          ) : journeyUnlocked ? (
            <ContributionGraph
              entries={allEntries}
              streams={streamConfig?.streams || []}
            />
          ) : (
            <LockedTile
              title="The Journey"
              requirement={`Log ${UNLOCKS.journey - days} more day${UNLOCKS.journey - days === 1 ? '' : 's'} to unlock your year-at-a-glance map.`}
              current={days}
              target={UNLOCKS.journey}
            />
          )}
        </Box>

        <SectionDivider />

        {/* ── Recent Accomplishments ── */}
        <Box>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          ) : (
            <RecentAccomplishments projects={projects} />
          )}
        </Box>

        <SectionDivider />

        {/* ── Current Priorities ── */}
        <Box>
          <SectionLabel>Current Priorities</SectionLabel>
          <ProjectsSummary />
        </Box>
      </Box>
    </Fade>
  )
}

export default Dashboard
