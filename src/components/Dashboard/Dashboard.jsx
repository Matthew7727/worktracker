import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  Grid,
  Divider,
  Stack,
  LinearProgress,
} from '@mui/material'
import { useAppContext } from '../../context/AppContext'
import { loadAllEntries } from '../../utils/DataManager'
import { useNavigate } from 'react-router-dom'
import ContributionGraph from './ContributionGraph'

// Sub-components
import WeeklyChart from './WeeklyChart'
import RecentActivityContent from './components/RecentActivity'
import TodoSummaryContent from './components/TodoSummary'

const STREAM_COLORS = {
  clientWork: '#80b621',
  practiceDevelopment: '#4a6b13',
  businessDevelopment: '#eb8449',
}

const Dashboard = () => {
  const { selectedDirectory, refreshTrigger, showNotification } =
    useAppContext()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalDays: 0,
    totalWords: 0,
    currentStreak: 0,
    balanceScore: 0,
    streamBreakdown: {
      clientWork: 0,
      practiceDevelopment: 0,
      businessDevelopment: 0,
    },
    recentEntries: [],
  })
  const [loading, setLoading] = useState(true)
  const [allEntries, setAllEntries] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState(null)

  const calculateStreaks = (uniqueDates) => {
    if (uniqueDates.length === 0) return { current: 0 }
    const sortedDates = [...uniqueDates].sort().reverse()
    let currentStreak = 0
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0]

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = 1
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = new Date(sortedDates[i])
        const d2 = new Date(sortedDates[i + 1])
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24)
        if (diff === 1) currentStreak++
        else break
      }
    }
    return { current: currentStreak }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDirectory) return
      setLoading(true)
      try {
        const resolvedEntries = await loadAllEntries(selectedDirectory)
        setAllEntries(resolvedEntries)

        const uniqueDates = Array.from(
          new Set(resolvedEntries.map((e) => e.date))
        )
        const streaks = calculateStreaks(uniqueDates)

        const streamBreakdown = {
          clientWork: 0,
          practiceDevelopment: 0,
          businessDevelopment: 0,
        }
        let totalWords = 0

        resolvedEntries.forEach((entry) => {
          if (entry.streamCounts) {
            streamBreakdown.clientWork += entry.streamCounts.clientWork
            streamBreakdown.practiceDevelopment +=
              entry.streamCounts.practiceDevelopment
            streamBreakdown.businessDevelopment +=
              entry.streamCounts.businessDevelopment
            totalWords += entry.totalWords
          }
        })

        // Balance Score: 100 is perfect 33/33/33 split
        const counts = Object.values(streamBreakdown)
        const sum = counts.reduce((a, b) => a + b, 0)
        let balanceScore = 0
        if (sum > 0) {
          const percentages = counts.map((c) => (c / sum) * 100)
          const ideal = 33.33
          const variance = percentages.reduce(
            (acc, p) => acc + Math.abs(p - ideal),
            0
          )
          balanceScore = Math.max(0, Math.round(100 - variance / 1.33)) // Normalized
        }

        setStats({
          totalDays: uniqueDates.length,
          totalWords,
          currentStreak: streaks.current,
          balanceScore,
          streamBreakdown,
          recentEntries: resolvedEntries.slice(0, 5),
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedDirectory, refreshTrigger])

  const handleEntryClick = (dateStr) => {
    navigate('/', { state: { initialDate: dateStr } })
  }

  const confirmDelete = async () => {
    if (!entryToDelete || !selectedDirectory) return
    try {
      const result = await window.electronAPI.deleteFile(entryToDelete.path)
      if (result.success) {
        showNotification('Entry purged from history', 'info')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      showNotification('Deletion failed', 'error')
    } finally {
      setIsDeleteModalOpen(false)
      setEntryToDelete(null)
    }
  }

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
        {/* Hero Statement */}
        <Box>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 4 }}
            />
          ) : (
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, lineHeight: 1.4, color: 'text.primary' }}
            >
              You've written{' '}
              <Typography
                component="span"
                variant="h3"
                color="primary.main"
                sx={{ fontWeight: 900 }}
              >
                {stats.totalWords.toLocaleString()} words
              </Typography>{' '}
              over{' '}
              <Typography
                component="span"
                variant="h3"
                color="secondary.main"
                sx={{ fontWeight: 900 }}
              >
                {stats.totalDays} active days
              </Typography>
              , maintaining a{' '}
              <Typography
                component="span"
                variant="h3"
                sx={{ fontWeight: 900, color: '#eb8449' }}
              >
                {stats.currentStreak}-day streak
              </Typography>
              . Your stream alignment sits at an{' '}
              <Typography
                component="span"
                variant="h3"
                sx={{ fontWeight: 900, color: 'success.main' }}
              >
                {stats.balanceScore}% balance score
              </Typography>
              .
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'black' }} />

        {/* Activity & Stream Integration */}
        <Box
          sx={{
            display: 'flex',
            gap: 6,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
          }}
        >
          {/* Weekly Chart */}
          <Box sx={{ flex: 2, width: '100%' }}>
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
              Weekly Intensity
            </Typography>
            <Box sx={{ minHeight: 250 }}>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={250}
                  sx={{ borderRadius: 4 }}
                />
              ) : (
                <WeeklyChart entries={allEntries} />
              )}
            </Box>
          </Box>

          {/* Stream Breakdown */}
          <Box sx={{ flex: 1, width: '100%' }}>
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
              Stream Alignment
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={150}
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <>
                  <StreamBar
                    label="Client Work"
                    value={stats.streamBreakdown.clientWork}
                    total={stats.totalWords}
                    color={STREAM_COLORS.clientWork}
                  />
                  <StreamBar
                    label="Practice Dev"
                    value={stats.streamBreakdown.practiceDevelopment}
                    total={stats.totalWords}
                    color={STREAM_COLORS.practiceDevelopment}
                  />
                  <StreamBar
                    label="Business Dev"
                    value={stats.streamBreakdown.businessDevelopment}
                    total={stats.totalWords}
                    color={STREAM_COLORS.businessDevelopment}
                  />
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'black' }} />

        {/* Current Priorities */}
        <Box>
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
            Current Priorities
          </Typography>
          <TodoSummaryContent />
        </Box>

        <Divider sx={{ borderBottomWidth: 3, borderColor: 'black' }} />

        {/* The Journey (Contribution & Recents) */}
        <Box>
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
            The Journey
          </Typography>
          <Box sx={{ mb: 6 }}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={150}
                sx={{ borderRadius: 4 }}
              />
            ) : (
              <ContributionGraph entries={allEntries} />
            )}
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 900, mb: 3, opacity: 0.5 }}
          >
            Recent Sessions
          </Typography>
          <RecentActivityContent
            loading={loading}
            recentEntries={stats.recentEntries}
            onEntryClick={handleEntryClick}
            onDeleteClick={(entry) => {
              setEntryToDelete(entry)
              setIsDeleteModalOpen(true)
            }}
          />
        </Box>

        <Dialog
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              border: '4px solid black',
              p: 3,
              boxShadow: '8px 8px 0px #000',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 950,
              fontSize: '2rem',
              textAlign: 'center',
              borderBottom: '3px solid black',
              mb: 3,
            }}
          >
            CONFIRM ARCHIVE PURGE
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
              Are you absolutely sure?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              The entry for <strong>{entryToDelete?.date}</strong> will be
              purged.
              <br />
              This action is irreversible and final.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(false)}
              sx={{
                px: 4,
                borderWidth: 2,
                fontWeight: 700,
                borderColor: 'black',
                color: 'black',
                '&:hover': { borderWidth: 2, borderColor: 'black' },
              }}
            >
              KEEP CONTRIBUTION
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              sx={{
                px: 4,
                bgcolor: 'error.main',
                border: '2px solid black',
                boxShadow: '4px 4px 0px black',
                fontWeight: 700,
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              PERMANENTLY DELETE
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}

const StreamBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 900 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 900 }}>
          {Math.round(percentage)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 12,
          borderRadius: 6,
          border: '2px solid black',
          bgcolor: 'white',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
          },
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>
        {value.toLocaleString()} words total
      </Typography>
    </Box>
  )
}

export default Dashboard
