import React, { useMemo } from 'react'
import { Box, Skeleton, Fade, Divider, Typography } from '@mui/material'
import useDashboardData from './hooks/useDashboardData'
import { useAppContext } from '../../context/AppContext'
import {
  getTagCounts,
  getCollaborators,
  getTasksClosedPerWeek,
  getTaskTotals,
  getWellbeingCounts,
  getCycleWeeks,
} from '../../utils/dashboardInsights'
import HeroStatement from './components/HeroStatement'
import { StatStrip } from '../shared/ui'
import UtilisationCycle from './components/UtilisationCycle'
import StreamAlignment from './components/StreamAlignment'
import ContributionGraph from './ContributionGraph'
import RecentAccomplishments from './components/RecentAccomplishments'
import ProjectsSummary from './components/ProjectsSummary'
import NeedsAttention from './components/NeedsAttention'
import MomentumTrends from './components/MomentumTrends'
import TaskThroughput from './components/TaskThroughput'
import TagInsights from './components/TagInsights'
import Collaborators from './components/Collaborators'
import Wellbeing from './components/Wellbeing'
import LockedTile from './components/LockedTile'

// The dashboard grows with the workspace: widgets unlock as more days are
// logged, so a fresh workspace stays simple and a mature one gets richer.
const UNLOCKS = {
  journey: 7, // contribution graph
  momentum: 14, // 8-week trends + comparison
}

const SectionLabel = ({ children }) => (
  <Typography
    component="h2"
    sx={{
      fontSize: '1.6rem',
      fontWeight: 900,
      letterSpacing: '-0.035em',
      mb: 2.5,
    }}
  >
    {children}
  </Typography>
)

const SectionDivider = () => (
  <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />
)

const Dashboard = () => {
  const {
    stats,
    projects,
    allEntries,
    utilisationTarget,
    utilisationPrediction,
    staffitHours,
    standardWeeklyHours,
    utilisationCoverage,
    loading,
  } = useDashboardData()
  const { streamConfig } = useAppContext()

  const utilisationEnabled = !!streamConfig?.features?.utilisation

  // Derived insight data — the dimensions the old dashboard left in the dark.
  const tagCounts = useMemo(() => getTagCounts(allEntries), [allEntries])
  const collaborators = useMemo(() => getCollaborators(projects), [projects])
  const perWeek = useMemo(() => getTasksClosedPerWeek(projects), [projects])
  const taskTotals = useMemo(() => getTaskTotals(projects), [projects])
  const wellbeing = useMemo(() => getWellbeingCounts(allEntries), [allEntries])
  const cycleWeeks = useMemo(() => getCycleWeeks(staffitHours), [staffitHours])

  const days = stats.totalDays
  const journeyUnlocked = days >= UNLOCKS.journey
  const momentumUnlocked = days >= UNLOCKS.momentum

  // Conditional sections keep a fresh workspace clean.
  const hasTasks =
    taskTotals.open > 0 ||
    taskTotals.closedThisCycle > 0 ||
    perWeek.some((w) => w.count > 0)
  const hasTags = tagCounts.length > 0
  const hasCollaborators = collaborators.length > 0
  const hasWellbeing =
    wellbeing.pto > 0 || wellbeing.sick > 0 || wellbeing.volunteering > 0
  const showUtilisation = utilisationEnabled && cycleWeeks.weeks.length > 0

  // ── Vital-signs tiles ──────────────────────────────────────────────────
  const tiles = [
    {
      value: stats.currentStreak,
      label: 'Day streak',
      sub: stats.currentStreak > 0 ? 'Keep it going' : 'Log today to start one',
      valueColor: stats.currentStreak > 0 ? '#80b621' : undefined,
      subColor: stats.currentStreak > 0 ? '#80b621' : undefined,
    },
    { value: days, label: 'Days logged' },
    utilisationEnabled && utilisationPrediction !== null
      ? {
          value: `${utilisationPrediction}%`,
          label: 'Utilisation',
          sub:
            utilisationTarget !== null
              ? `${utilisationPrediction >= utilisationTarget ? '▲' : '▼'} target ${utilisationTarget}%`
              : null,
          valueColor:
            utilisationTarget !== null &&
            utilisationPrediction >= utilisationTarget
              ? '#80b621'
              : undefined,
          subColor:
            utilisationTarget !== null &&
            utilisationPrediction >= utilisationTarget
              ? '#80b621'
              : '#d32f2f',
        }
      : null,
    stats.balanceScore > 0
      ? { value: stats.balanceScore, label: 'Balance' }
      : null,
    hasTasks
      ? {
          value: taskTotals.lastWeek,
          label: 'Todos closed last week',
          sub: (() => {
            const d = taskTotals.lastWeek - taskTotals.prevWeek
            if (d === 0) return 'Same as the week before'
            return `${d > 0 ? '▲' : '▼'} ${Math.abs(d)} on the week before`
          })(),
          subColor:
            taskTotals.lastWeek - taskTotals.prevWeek >= 0
              ? '#80b621'
              : '#d32f2f',
        }
      : null,
  ]

  return (
    <Fade in={true} timeout={600}>
      <Box
        className="dashboard-page"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pb: 10,
          maxWidth: 1100,
          mx: 'auto',
          width: '100%',
          pt: 4,
        }}
      >
        {/* ── Hero + vital signs ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={160}
              sx={{ borderRadius: 0 }}
            />
          ) : (
            <>
              <HeroStatement
                projects={projects}
                stats={stats}
                utilisationTarget={utilisationTarget}
                utilisationPrediction={utilisationPrediction}
                utilisationCoverage={utilisationCoverage}
                tagCounts={tagCounts}
                collaborators={collaborators}
                taskTotals={taskTotals}
                wellbeing={wellbeing}
              />
              <NeedsAttention />
              <StatStrip
                items={tiles.filter(Boolean).map((t) => ({
                  value: t.value,
                  label: t.label,
                  sub: t.sub,
                  color: t.valueColor,
                  subColor: t.subColor,
                }))}
              />
            </>
          )}
        </Box>

        <SectionDivider />

        {/* ── Utilisation cycle (NEW) ── */}
        {!loading && showUtilisation && (
          <>
            <Box>
              <SectionLabel>Utilisation cycle</SectionLabel>
              <UtilisationCycle
                cycleWeeks={cycleWeeks}
                standardWeeklyHours={standardWeeklyHours}
                utilisationTarget={utilisationTarget}
                utilisationPrediction={utilisationPrediction}
              />
            </Box>
            <SectionDivider />
          </>
        )}

        {/* ── Task throughput (NEW) ── */}
        {!loading && hasTasks && (
          <>
            <Box>
              <SectionLabel>Task throughput</SectionLabel>
              <TaskThroughput perWeek={perWeek} totals={taskTotals} />
            </Box>
            <SectionDivider />
          </>
        )}

        {/* ── Weekly Intensity + Stream Alignment ── */}
        <StreamAlignment entries={allEntries} stats={stats} loading={loading} />

        <SectionDivider />

        {/* ── Momentum (unlocks at 14 logged days) ── */}
        {!loading && (
          <>
            {momentumUnlocked ? (
              <MomentumTrends entries={allEntries} />
            ) : (
              <LockedTile
                title="Momentum trends"
                requirement={`Log ${UNLOCKS.momentum - days} more day${UNLOCKS.momentum - days === 1 ? '' : 's'} to unlock your 8-week momentum view.`}
                current={days}
                target={UNLOCKS.momentum}
              />
            )}
            <SectionDivider />
          </>
        )}

        {/* ── Tag Insights + Collaborators (NEW) ── */}
        {!loading && (hasTags || hasCollaborators) && (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 4,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: hasTags && hasCollaborators ? '1fr 1fr' : '1fr',
                },
              }}
            >
              {hasTags && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <SectionLabel>Tags</SectionLabel>
                  <TagInsights tagCounts={tagCounts} />
                </Box>
              )}
              {hasCollaborators && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <SectionLabel>Collaborators</SectionLabel>
                  <Collaborators collaborators={collaborators} />
                </Box>
              )}
            </Box>
            <SectionDivider />
          </>
        )}

        {/* ── Wellbeing / Time Off (NEW) ── */}
        {!loading && hasWellbeing && (
          <>
            <Box>
              <SectionLabel>Wellbeing and time off</SectionLabel>
              <Wellbeing counts={wellbeing} />
            </Box>
            <SectionDivider />
          </>
        )}

        {/* ── The Journey (unlocks at 7 logged days) ── */}
        <Box>
          <SectionLabel>The journey</SectionLabel>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{ borderRadius: 0 }}
            />
          ) : journeyUnlocked ? (
            <ContributionGraph
              entries={allEntries}
              streams={streamConfig?.streams || []}
            />
          ) : (
            <LockedTile
              title="The journey"
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

        {/* ── Current priorities ── */}
        <Box>
          <SectionLabel>Current priorities</SectionLabel>
          <ProjectsSummary />
        </Box>
      </Box>
    </Fade>
  )
}

export default Dashboard
