import React from 'react'
import { Box, Skeleton, Fade, Divider } from '@mui/material'
import useDashboardData from './hooks/useDashboardData'
import HeroStatement from './components/HeroStatement'
import StreamAlignment from './components/StreamAlignment'
import ContributionGraph from './ContributionGraph'
import RecentAccomplishments from './components/RecentAccomplishments'
import ProjectsSummary from './components/ProjectsSummary'
import { Typography } from '@mui/material'

const SectionLabel = ({ children }) => (
  <Typography
    variant="h6"
    sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}
  >
    {children}
  </Typography>
)

const Dashboard = () => {
  const { stats, projects, allEntries, utilisationTarget, loading } = useDashboardData()

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
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 4 }} />
          ) : (
            <HeroStatement
              projects={projects}
              stats={stats}
              utilisationTarget={utilisationTarget}
            />
          )}
        </Box>

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />

        {/* ── Weekly Intensity + Stream Alignment ── */}
        <StreamAlignment
          entries={allEntries}
          stats={stats}
          utilisationTarget={utilisationTarget}
          loading={loading}
        />

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />

        {/* ── The Journey ── */}
        <Box>
          <SectionLabel>The Journey</SectionLabel>
          {loading ? (
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
          ) : (
            <ContributionGraph entries={allEntries} />
          )}
        </Box>

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />

        {/* ── Recent Accomplishments ── */}
        <Box>
          {loading ? (
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          ) : (
            <RecentAccomplishments projects={projects} />
          )}
        </Box>

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />

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
