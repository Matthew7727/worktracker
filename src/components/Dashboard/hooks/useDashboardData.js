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
  const { selectedDirectory, refreshTrigger } = useAppContext()

  const [stats, setStats] = useState({
    totalDays: 0,
    totalWords: 0,
    currentStreak: 0,
    balanceScore: 0,
    streamBreakdown: { clientWork: 0, practiceDevelopment: 0, businessDevelopment: 0 },
  })
  const [projects, setProjects] = useState({ activities: [], clientProjects: [] })
  const [allEntries, setAllEntries] = useState([])
  const [utilisationTarget, setUtilisationTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDirectory) return
      setLoading(true)
      try {
        const [resolvedEntries, projectsData, settings] = await Promise.all([
          loadAllEntries(selectedDirectory),
          loadProjects(selectedDirectory),
          window.electronAPI?.loadSettings ? window.electronAPI.loadSettings() : Promise.resolve({}),
        ])

        if (settings.utilisationTarget !== undefined) {
          setUtilisationTarget(settings.utilisationTarget)
        }

        setAllEntries(resolvedEntries)
        setProjects(projectsData)

        const uniqueDates = Array.from(new Set(resolvedEntries.map((e) => e.date)))
        const streamBreakdown = { clientWork: 0, practiceDevelopment: 0, businessDevelopment: 0 }
        let totalWords = 0

        resolvedEntries.forEach((entry) => {
          if (entry.streamCounts) {
            streamBreakdown.clientWork += entry.streamCounts.clientWork
            streamBreakdown.practiceDevelopment += entry.streamCounts.practiceDevelopment
            streamBreakdown.businessDevelopment += entry.streamCounts.businessDevelopment
            totalWords += entry.totalWords
          }
        })

        const counts = Object.values(streamBreakdown)
        const sum = counts.reduce((a, b) => a + b, 0)
        let balanceScore = 0
        if (sum > 0) {
          const percentages = counts.map((c) => (c / sum) * 100)
          const variance = percentages.reduce((acc, p) => acc + Math.abs(p - 33.33), 0)
          balanceScore = Math.max(0, Math.round(100 - variance / 1.33))
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
  }, [selectedDirectory, refreshTrigger])

  return { stats, projects, allEntries, utilisationTarget, loading }
}

export default useDashboardData
