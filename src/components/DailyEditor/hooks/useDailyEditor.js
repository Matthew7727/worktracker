import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { getDailyFilePath } from '../../../utils/fileHelpers'
import {
  stringifyMarkdown,
  parseMarkdown,
  parseStreams,
  stringifyStreams,
} from '../../../utils/markdownParser'
import { loadProjects } from '../../../utils/projectsManager'
import { getWeekDays, getDefaultDate } from '../utils/weekDays'

const EMPTY_STREAMS = {
  clientWork: '',
  practiceDevelopment: '',
  businessDevelopment: '',
}

const EMPTY_TAGGED_ITEMS = {
  clientWork: [],
  practiceDevelopment: [],
  businessDevelopment: [],
}

export const useDailyEditor = () => {
  const { selectedDirectory, showNotification } = useAppContext()
  const location = useLocation()

  const [currentDate, setCurrentDate] = useState(() => {
    if (location.state?.initialDate) {
      return new Date(location.state.initialDate)
    }
    return getDefaultDate()
  })

  const [weekStatus, setWeekStatus] = useState({})
  const [streams, setStreams] = useState(EMPTY_STREAMS)
  const [taggedItems, setTaggedItems] = useState(EMPTY_TAGGED_ITEMS)
  const [dayStatus, setDayStatus] = useState('working')
  const [dayNote, setDayNote] = useState('')
  const [availableProjects, setAvailableProjects] = useState({
    clientWork: [],
    practiceDevelopment: [],
    businessDevelopment: [],
  })
  const [viewMode, setViewMode] = useState(() =>
    location.state?.autoStartFlow ? 'flow' : 'start'
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Handle navigation to editor with autoStartFlow flag
  useEffect(() => {
    if (location.state?.autoStartFlow) {
      setViewMode('flow')
      setCurrentStep(0)
    }
  }, [location.state])

  // Load active projects and activities for tagging chips
  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then((data) => {
      setAvailableProjects({
        clientWork: (data.clientProjects || [])
          .filter((p) => p.status === 'active')
          .map((p) => p.title),
        practiceDevelopment: (data.activities || [])
          .filter((a) => a.type === 'PD' && a.status === 'active')
          .map((a) => a.title),
        businessDevelopment: (data.activities || [])
          .filter((a) => a.type === 'BD' && a.status === 'active')
          .map((a) => a.title),
      })
    })
  }, [selectedDirectory])

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
        if (result.success) {
          const { frontmatter, body } = parseMarkdown(result.data)
          const parsed = parseStreams(body)
          status[key] = {
            clientWork: !!(parsed.clientWork && parsed.clientWork.trim()),
            practiceDevelopment: !!(
              parsed.practiceDevelopment && parsed.practiceDevelopment.trim()
            ),
            businessDevelopment: !!(
              parsed.businessDevelopment && parsed.businessDevelopment.trim()
            ),
            dayStatus: frontmatter.dayStatus || 'working',
          }
        } else {
          status[key] = {
            clientWork: false,
            practiceDevelopment: false,
            businessDevelopment: false,
            dayStatus: 'working',
          }
        }
      })
    )
    setWeekStatus(status)
  }

  useEffect(() => {
    loadWeekStatus()
  }, [selectedDirectory]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load entry data for the selected date
  useEffect(() => {
    const loadDailyData = async () => {
      if (!selectedDirectory) return
      setIsLoading(true)
      try {
        const filePath = getDailyFilePath(selectedDirectory, currentDate)
        const fileResult = await window.electronAPI.readFile(filePath)

        if (fileResult.success) {
          const { frontmatter, body } = parseMarkdown(fileResult.data)
          const parsedStreams = parseStreams(body)
          setStreams(parsedStreams)
          setTaggedItems({
            clientWork: frontmatter.clientProjects || [],
            practiceDevelopment: frontmatter.pdActivities || [],
            businessDevelopment: frontmatter.bdActivities || [],
          })
          setDayStatus(frontmatter.dayStatus || 'working')
          setDayNote(frontmatter.dayNote || '')

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
          setStreams(EMPTY_STREAMS)
          setTaggedItems(EMPTY_TAGGED_ITEMS)
          setDayStatus('working')
          setDayNote('')
          if (!location.state?.autoStartFlow) {
            setViewMode('start')
          }
        }
      } catch (error) {
        console.error('Failed to load daily data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDailyData()
  }, [currentDate, selectedDirectory, location.state?.autoStartFlow])

  const handleSaveDay = async () => {
    if (!selectedDirectory) return
    setIsSaving(true)
    try {
      const filePath = getDailyFilePath(selectedDirectory, currentDate)
      const body = stringifyStreams(streams)
      const frontmatter = {
        date: currentDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        clientProjects: taggedItems.clientWork,
        pdActivities: taggedItems.practiceDevelopment,
        bdActivities: taggedItems.businessDevelopment,
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

  // Saves a non-working day (PTO/Sick/Volunteering) — skips the stream steps entirely
  const handleSaveNonWorkingDay = async (status, note) => {
    if (!selectedDirectory) return
    setIsSaving(true)
    try {
      const filePath = getDailyFilePath(selectedDirectory, currentDate)
      const body = stringifyStreams(EMPTY_STREAMS)
      const frontmatter = {
        date: currentDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        clientProjects: [],
        pdActivities: [],
        bdActivities: [],
        dayStatus: status,
        dayNote: note,
      }

      const fileContent = stringifyMarkdown(body, frontmatter)
      const result = await window.electronAPI.writeFile(filePath, fileContent)

      if (result.success) {
        setStreams(EMPTY_STREAMS)
        setTaggedItems(EMPTY_TAGGED_ITEMS)
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
      clientProjects: [],
      pdActivities: [],
      bdActivities: [],
    }
    let body = stringifyStreams(EMPTY_STREAMS)

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

  const updateStream = (streamId, content) => {
    setStreams((prev) => ({ ...prev, [streamId]: content }))
  }

  const updateTaggedItems = (streamId, title) => {
    setTaggedItems((prev) => {
      const current = prev[streamId]
      const next = current.includes(title)
        ? current.filter((t) => t !== title)
        : [...current, title]
      return { ...prev, [streamId]: next }
    })
  }

  return {
    currentDate,
    setCurrentDate,
    weekStatus,
    streams,
    updateStream,
    taggedItems,
    updateTaggedItems,
    availableProjects,
    viewMode,
    setViewMode,
    currentStep,
    setCurrentStep,
    isLoading,
    isSaving,
    handleSaveDay,
    dayStatus,
    dayNote,
    handleSaveNonWorkingDay,
    quickSetDayStatus,
  }
}
