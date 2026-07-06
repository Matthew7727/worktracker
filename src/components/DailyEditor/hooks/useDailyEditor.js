import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { getDailyFilePath } from '../../../utils/fileHelpers'
import {
  stringifyMarkdown,
  parseMarkdown,
  parseStreams,
  stringifyStreams,
  stringifyProjectEntries,
  parseStreamProjects,
} from '../../../utils/markdownParser'
import {
  loadProjects,
  groupProjectsByStream,
} from '../../../utils/projectsManager'
import { getProjectsByStream } from '../../../utils/DataManager'
import { loadDailyTodos } from '../../../utils/todoManager'
import { getWeekDays, getDefaultDate } from '../utils/weekDays'

// Legacy stream ids that older app versions understand via dedicated
// frontmatter keys. We keep writing those keys alongside the generic
// `projects` map so a not-yet-updated install reading the same synced
// folder stays compatible.
const LEGACY_FRONTMATTER_STREAMS = {
  clientWork: 'clientProjects',
  practiceDevelopment: 'pdActivities',
  businessDevelopment: 'bdActivities',
}

export const useDailyEditor = () => {
  const { selectedDirectory, showNotification, streamConfig, streams } =
    useAppContext()
  const location = useLocation()

  // All configured streams (including archived) — used when parsing history
  const allStreams = useMemo(
    () => streamConfig?.streams || streams,
    [streamConfig, streams]
  )

  const emptyStreams = useMemo(() => {
    const obj = {}
    allStreams.forEach((s) => {
      obj[s.id] = ''
    })
    return obj
  }, [allStreams])

  const [currentDate, setCurrentDate] = useState(() => {
    if (location.state?.initialDate) {
      return new Date(location.state.initialDate)
    }
    return getDefaultDate()
  })

  const [weekStatus, setWeekStatus] = useState({})
  const [streamContents, setStreamContents] = useState(emptyStreams)
  const [dayStatus, setDayStatus] = useState('working')
  const [dayNote, setDayNote] = useState('')

  // Project-centric flow state
  const [projectDrafts, setProjectDrafts] = useState({})
  const [selectedFlowProjects, setSelectedFlowProjects] = useState([])
  const [todayTodos, setTodayTodos] = useState([])

  const [availableByStream, setAvailableByStream] = useState({})
  const [viewMode, setViewMode] = useState('start')
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const streamById = useMemo(() => {
    const map = {}
    allStreams.forEach((s) => {
      map[s.id] = s
    })
    return map
  }, [allStreams])

  // Handle navigation to editor with autoStartFlow flag (from tray widget)
  useEffect(() => {
    if (location.state?.autoStartFlow) {
      setViewMode('start')
      setCurrentStep(0)
    }
  }, [location.state])

  // Load active projects and activities for selection chips
  useEffect(() => {
    if (!selectedDirectory || !streamConfig) return
    loadProjects(selectedDirectory).then((data) => {
      const { byStream } = groupProjectsByStream(data, streamConfig)
      const active = {}
      Object.entries(byStream).forEach(([streamId, projects]) => {
        active[streamId] = projects
          .filter((p) => p.status === 'active')
          .map((p) => p.title)
      })
      setAvailableByStream(active)
    })
  }, [selectedDirectory, streamConfig])

  // Flat list of all available projects with stream metadata
  const allAvailableProjects = streams.flatMap((stream) =>
    (availableByStream[stream.id] || []).map((title) => ({
      title,
      streamId: stream.id,
      streamName: stream.name,
      color: stream.color,
    }))
  )

  // Per-project entries for the summary view (new format)
  const projectEntries = selectedFlowProjects
    .map((p) => ({ ...p, content: projectDrafts[p.title] || '' }))
    .filter((p) => p.content.trim())

  // Load completion status for each day of the current week
  const loadWeekStatus = async () => {
    if (!selectedDirectory) return
    const days = getWeekDays(new Date())
    const status = {}
    await Promise.all(
      days.map(async (day) => {
        const key = day.toISOString().split('T')[0]
        const filePath = getDailyFilePath(selectedDirectory, day)
        const result = await window.electronAPI.readFile(filePath)
        const filled = {}
        allStreams.forEach((s) => {
          filled[s.id] = false
        })
        if (result.success) {
          const { frontmatter, body } = parseMarkdown(result.data)
          const parsed = parseStreams(body, allStreams)
          allStreams.forEach((s) => {
            filled[s.id] = !!(parsed[s.id] && parsed[s.id].trim())
          })
          status[key] = {
            filled,
            dayStatus: frontmatter.dayStatus || 'working',
          }
        } else {
          status[key] = { filled, dayStatus: 'working' }
        }
      })
    )
    setWeekStatus(status)
  }

  useEffect(() => {
    loadWeekStatus()
  }, [selectedDirectory, streamConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load entry data for the selected date
  useEffect(() => {
    const loadDailyData = async () => {
      if (!selectedDirectory || !streamConfig) return
      setIsLoading(true)
      try {
        const filePath = getDailyFilePath(selectedDirectory, currentDate)
        const fileResult = await window.electronAPI.readFile(filePath)

        if (fileResult.success) {
          const { frontmatter, body } = parseMarkdown(fileResult.data)
          const parsedStreams = parseStreams(body, allStreams)
          setStreamContents(parsedStreams)
          setDayStatus(frontmatter.dayStatus || 'working')
          setDayNote(frontmatter.dayNote || '')

          // Populate selectedFlowProjects from frontmatter (generic map
          // with legacy-key fallback)
          const byStream = getProjectsByStream(frontmatter)
          const flowProjects = Object.entries(byStream).flatMap(
            ([streamId, titles]) => {
              const stream = streamById[streamId]
              if (!stream) return []
              return titles.map((title) => ({
                title,
                streamId,
                streamName: stream.name,
                color: stream.color,
              }))
            }
          )
          setSelectedFlowProjects(flowProjects)

          // Try to parse per-project drafts from ## subheadings (new format)
          const drafts = {}
          allStreams.forEach((s) => {
            const projects = parseStreamProjects(parsedStreams[s.id])
            if (projects)
              projects.forEach((p) => {
                drafts[p.title] = p.content
              })
          })
          setProjectDrafts(drafts)

          const hasData =
            frontmatter.dayStatus && frontmatter.dayStatus !== 'working'
              ? true
              : Object.values(parsedStreams).some(
                  (val) => val && val.trim().length > 0
                )
          if (!location.state?.autoStartFlow) {
            setViewMode(hasData ? 'summary' : 'start')
          }
        } else {
          setStreamContents(emptyStreams)
          setSelectedFlowProjects([])
          setProjectDrafts({})
          setDayStatus('working')
          setDayNote('')
          if (!location.state?.autoStartFlow) {
            setViewMode('start')
          }
        }
        // Load todos for this date as flow reminders
        loadDailyTodos(selectedDirectory, currentDate).then(setTodayTodos)
      } catch (error) {
        console.error('Failed to load daily data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDailyData()
  }, [
    currentDate,
    selectedDirectory,
    streamConfig,
    location.state?.autoStartFlow,
  ])

  const buildProjectsFrontmatter = (flowProjects) => {
    const projects = {}
    flowProjects.forEach((p) => {
      if (!projects[p.streamId]) projects[p.streamId] = []
      projects[p.streamId].push(p.title)
    })
    const frontmatter = { projects }
    Object.entries(LEGACY_FRONTMATTER_STREAMS).forEach(([streamId, key]) => {
      if (streamById[streamId]) {
        frontmatter[key] = projects[streamId] || []
      }
    })
    return frontmatter
  }

  const handleSaveDay = async () => {
    if (!selectedDirectory) return
    setIsSaving(true)
    try {
      const filePath = getDailyFilePath(selectedDirectory, currentDate)

      const projectList = selectedFlowProjects.map((p) => ({
        ...p,
        content: projectDrafts[p.title] || '',
      }))
      const body = stringifyProjectEntries(projectList, allStreams)

      // Update streams so weekStatus and legacy summary stay in sync
      setStreamContents(parseStreams(body || '', allStreams))

      const frontmatter = {
        date: currentDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        ...buildProjectsFrontmatter(selectedFlowProjects),
        dayStatus: 'working',
      }

      const fileContent = stringifyMarkdown(body, frontmatter)
      const result = await window.electronAPI.writeFile(filePath, fileContent)

      if (result.success) {
        setDayStatus('working')
        setDayNote('')
        showNotification('Day archived successfully', 'success')
        setViewMode('summary')
        loadWeekStatus()
      } else {
        showNotification(`Save Error: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Failed to save day:', error)
      showNotification('Failed to save to system', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Saves a non-working day (PTO/Sick/Volunteering)
  const handleSaveNonWorkingDay = async (status, note) => {
    if (!selectedDirectory) return
    setIsSaving(true)
    try {
      const filePath = getDailyFilePath(selectedDirectory, currentDate)
      const body = stringifyStreams(emptyStreams, allStreams)
      const frontmatter = {
        date: currentDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        ...buildProjectsFrontmatter([]),
        dayStatus: status,
        dayNote: note,
      }

      const fileContent = stringifyMarkdown(body, frontmatter)
      const result = await window.electronAPI.writeFile(filePath, fileContent)

      if (result.success) {
        setStreamContents(emptyStreams)
        setSelectedFlowProjects([])
        setProjectDrafts({})
        setDayStatus(status)
        setDayNote(note)
        showNotification('Day logged', 'success')
        setViewMode('summary')
        loadWeekStatus()
      } else {
        showNotification(`Save Error: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Failed to save day:', error)
      showNotification('Failed to save to system', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Quickly sets a day's status from the week picker without opening the full flow
  const quickSetDayStatus = async (date, status) => {
    if (!selectedDirectory) return
    const filePath = getDailyFilePath(selectedDirectory, date)
    const existing = await window.electronAPI.readFile(filePath)

    let frontmatter = {
      date: date.toISOString().split('T')[0],
      ...buildProjectsFrontmatter([]),
    }
    let body = ''

    if (existing.success) {
      const parsed = parseMarkdown(existing.data)
      frontmatter = { ...parsed.frontmatter }
      body = parsed.body
    }

    frontmatter.dayStatus = status
    frontmatter.lastModified = new Date().toISOString()
    if (status === 'working') delete frontmatter.dayNote

    const fileContent = stringifyMarkdown(body, frontmatter)
    const result = await window.electronAPI.writeFile(filePath, fileContent)

    if (result.success) {
      loadWeekStatus()
      if (date.toDateString() === currentDate.toDateString()) {
        setDayStatus(status)
      }
    } else {
      showNotification(`Save Error: ${result.error}`, 'error')
    }
  }

  const updateProjectDraft = (title, content) => {
    setProjectDrafts((prev) => ({ ...prev, [title]: content }))
  }

  const toggleFlowProject = (project) => {
    setSelectedFlowProjects((prev) => {
      const exists = prev.find((p) => p.title === project.title)
      if (exists) return prev.filter((p) => p.title !== project.title)
      return [...prev, project]
    })
  }

  return {
    currentDate,
    setCurrentDate,
    weekStatus,
    streams: streamContents,
    streamDefs: allStreams,
    activeStreams: streams,
    dayStatus,
    setDayStatus,
    dayNote,
    setDayNote,
    projectDrafts,
    updateProjectDraft,
    selectedFlowProjects,
    toggleFlowProject,
    allAvailableProjects,
    projectEntries,
    viewMode,
    setViewMode,
    currentStep,
    setCurrentStep,
    isLoading,
    isSaving,
    handleSaveDay,
    handleSaveNonWorkingDay,
    quickSetDayStatus,
    todayTodos,
  }
}
