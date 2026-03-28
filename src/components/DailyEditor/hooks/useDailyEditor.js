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
import { getWeekDays, getDefaultDate } from '../utils/weekDays'

const EMPTY_STREAMS = {
  clientWork: '',
  practiceDevelopment: '',
  businessDevelopment: '',
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
          const { body } = parseMarkdown(result.data)
          const parsed = parseStreams(body)
          status[key] = {
            clientWork: !!(parsed.clientWork && parsed.clientWork.trim()),
            practiceDevelopment: !!(parsed.practiceDevelopment && parsed.practiceDevelopment.trim()),
            businessDevelopment: !!(parsed.businessDevelopment && parsed.businessDevelopment.trim()),
          }
        } else {
          status[key] = { clientWork: false, practiceDevelopment: false, businessDevelopment: false }
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
          const { body } = parseMarkdown(fileResult.data)
          const parsedStreams = parseStreams(body)
          setStreams(parsedStreams)

          const hasData = Object.values(parsedStreams).some(
            (val) => val && val.trim().length > 0
          )
          if (!location.state?.autoStartFlow) {
            setViewMode(hasData ? 'summary' : 'start')
          }
        } else {
          setStreams(EMPTY_STREAMS)
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
      }

      const fileContent = stringifyMarkdown(body, frontmatter)
      const result = await window.electronAPI.writeFile(filePath, fileContent)

      if (result.success) {
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

  const updateStream = (streamId, content) => {
    setStreams((prev) => ({ ...prev, [streamId]: content }))
  }

  return {
    currentDate,
    setCurrentDate,
    weekStatus,
    streams,
    updateStream,
    viewMode,
    setViewMode,
    currentStep,
    setCurrentStep,
    isLoading,
    isSaving,
    handleSaveDay,
  }
}
