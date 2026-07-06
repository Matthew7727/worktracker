import { useState, useEffect } from 'react'
import { useAppContext } from '../../../context/AppContext'
import { loadAllEntries } from '../../../utils/DataManager'
import { loadProjects } from '../../../utils/projectsManager'

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
    totalWords: 0,
    currentStreak: 0,
    balanceScore: 0,
    streamBreakdown: {},
  })
  const [projects, setProjects] = useState({
    activities: [],
    clientProjects: [],
  })
  const [allEntries, setAllEntries] = useState([])
  const [utilisationTarget, setUtilisationTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDirectory || !streamConfig) return
      setLoading(true)
      try {
        const allStreams = streamConfig.streams
        const [resolvedEntries, projectsData, settings] = await Promise.all([
          loadAllEntries(selectedDirectory, allStreams),
          loadProjects(selectedDirectory),
          window.electronAPI?.loadSettings
            ? window.electronAPI.loadSettings()
            : Promise.resolve({}),
        ])

        if (settings.utilisationTarget !== undefined) {
          setUtilisationTarget(settings.utilisationTarget)
        }

        setAllEntries(resolvedEntries)
        setProjects(projectsData)

        const uniqueDates = Array.from(
          new Set(resolvedEntries.map((e) => e.date))
        )
        const streamBreakdown = {}
        allStreams.forEach((s) => {
          streamBreakdown[s.id] = 0
        })
        let totalWords = 0

        resolvedEntries.forEach((entry) => {
          if (entry.streamCounts) {
            allStreams.forEach((s) => {
              streamBreakdown[s.id] += entry.streamCounts[s.id] || 0
            })
            totalWords += entry.totalWords
          }
        })

        // Balance score: how close the ACTIVE streams are to an even split
        const activeCounts = streams.map((s) => streamBreakdown[s.id] || 0)
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
          totalWords,
          currentStreak: calculateStreaks(uniqueDates),
          balanceScore,
          streamBreakdown,
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedDirectory, refreshTrigger, streamConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  return { stats, projects, allEntries, utilisationTarget, loading }
}

export default useDashboardData
