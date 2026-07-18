import { useState, useEffect } from 'react'
import { useAppContext } from '../../../context/AppContext'
import {
  loadAllEntries,
  getEntryMentionCounts,
} from '../../../utils/DataManager'
import { loadProjects } from '../../../utils/projectsManager'
import { loadStaffitHours } from '../../../utils/staffitManager'
import { getUtilisationPrediction } from '../../../utils/utilisationUtils'

const calculateStreaks = (uniqueDates) => {
  if (uniqueDates.length === 0) return 0
  const sorted = [...uniqueDates].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i + 1])) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

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
        setUtilisationPrediction(
          getUtilisationPrediction(staffitHours, settings.standardWeeklyHours)
        )

        setAllEntries(resolvedEntries)
        setProjects(projectsData)

        const uniqueDates = Array.from(
          new Set(resolvedEntries.map((e) => e.date))
        )

        const { byTitle: mentionsByTitle, byStream: mentionsByStream } =
          getEntryMentionCounts(resolvedEntries)

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
          currentStreak: calculateStreaks(uniqueDates),
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
    loading,
  }
}

export default useDashboardData
