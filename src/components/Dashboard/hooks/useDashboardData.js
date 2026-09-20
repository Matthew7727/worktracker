import { useState, useEffect } from 'react'
import { useAppContext } from '../../../context/AppContext'
import {
  loadAllEntries,
  getEntryMentionCounts,
} from '../../../utils/DataManager'
import { loadProjects } from '../../../utils/projectsManager'
import { loadStaffitHours } from '../../../utils/staffitManager'
import {
  getUtilisationCoverage,
  getUtilisationPrediction,
} from '../../../utils/utilisationUtils'
import {
  calculateWorkingDayStreak,
  isWeekend,
} from '../../DailyEditor/utils/weekDays'

const useDashboardData = () => {
  const { selectedDirectory, refreshTrigger, streamConfig, streams } =
    useAppContext()

  const [stats, setStats] = useState({
    totalDays: 0,
    currentStreak: 0,
    balanceScore: 0,
    // Entries mentioning each activity/stream — the effort proxy for
    // non-client (PD/BD-style) streams, replacing word counts.
    mentionsByStream: {},
    mentionsByTitle: {},
  })
  const [projects, setProjects] = useState({
    activities: [],
    clientProjects: [],
  })
  const [allEntries, setAllEntries] = useState([])
  const [utilisationTarget, setUtilisationTarget] = useState(null)
  const [utilisationPrediction, setUtilisationPrediction] = useState(null)
  const [staffitHours, setStaffitHours] = useState({})
  const [standardWeeklyHours, setStandardWeeklyHours] = useState(null)
  const [utilisationCoverage, setUtilisationCoverage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDirectory || !streamConfig) return
      setLoading(true)
      try {
        const allStreams = streamConfig.streams
        const [resolvedEntries, projectsData, settings, staffitHours] =
          await Promise.all([
            loadAllEntries(selectedDirectory, allStreams),
            loadProjects(selectedDirectory),
            window.electronAPI?.loadSettings
              ? window.electronAPI.loadSettings()
              : Promise.resolve({}),
            loadStaffitHours(selectedDirectory),
          ])

        if (settings.utilisationTarget !== undefined) {
          setUtilisationTarget(settings.utilisationTarget)
        }
        setStandardWeeklyHours(settings.standardWeeklyHours ?? null)
        setStaffitHours(staffitHours || {})
        setUtilisationPrediction(
          getUtilisationPrediction(staffitHours, settings.standardWeeklyHours)
        )
        setUtilisationCoverage(getUtilisationCoverage(staffitHours))

        // Weekend logs are intentionally available from Entries when needed,
        // but dashboard totals and trends use the default working-week view.
        const workingEntries = resolvedEntries.filter(
          (entry) => !isWeekend(new Date(`${entry.date}T00:00:00`))
        )
        setAllEntries(workingEntries)
        setProjects(projectsData)

        const uniqueDates = Array.from(
          new Set(workingEntries.map((e) => e.date))
        )

        const { byTitle: mentionsByTitle, byStream: mentionsByStream } =
          getEntryMentionCounts(workingEntries)

        // Balance score: how evenly effort (entry mentions) spreads across
        // the active streams — client work included, on the same footing.
        const activeCounts = streams.map((s) => mentionsByStream[s.id] || 0)
        const sum = activeCounts.reduce((a, b) => a + b, 0)
        let balanceScore = 0
        if (sum > 0 && streams.length > 0) {
          const ideal = 100 / streams.length
          const percentages = activeCounts.map((c) => (c / sum) * 100)
          const variance = percentages.reduce(
            (acc, p) => acc + Math.abs(p - ideal),
            0
          )
          // Max possible deviation is 2 * (100 - ideal)
          const maxVariance = 2 * (100 - ideal)
          balanceScore = Math.max(
            0,
            Math.round(100 - (variance / maxVariance) * 100)
          )
        }

        setStats({
          totalDays: uniqueDates.length,
          currentStreak: calculateWorkingDayStreak(uniqueDates),
          balanceScore,
          mentionsByStream,
          mentionsByTitle,
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedDirectory, refreshTrigger, streamConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    stats,
    projects,
    allEntries,
    utilisationTarget,
    utilisationPrediction,
    staffitHours,
    standardWeeklyHours,
    utilisationCoverage,
    loading,
  }
}

export default useDashboardData
