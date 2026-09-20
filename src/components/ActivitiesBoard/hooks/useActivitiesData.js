import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppContext } from '../../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createActivity,
  createClientProject,
  createTask,
  getActivityStreamId,
} from '../../../utils/projectsManager'
import { getStreamAbbrev } from '../../../utils/streamConfig'

// Keep just-completed todos visible briefly so users can catch and undo mistakes.
export const COMPLETED_TODO_GRACE_MS = 5000

/**
 * Projects and activities data for the board views, with every mutation the
 * board offers. Shared by the ledger board and the Filofax To do section.
 */
const useActivitiesData = () => {
  const {
    selectedDirectory,
    refreshTrigger,
    streamConfig,
    streams,
    mainFocusStream,
  } = useAppContext()
  const [data, setData] = useState({ activities: [], clientProjects: [] })
  const [recentlyCompleted, setRecentlyCompleted] = useState({})
  const completionTimersRef = useRef({})

  const projectHierarchy = !!streamConfig?.features?.projectHierarchy

  // Streams whose work is tracked as activities (everything except the
  // main focus when it has its own project pipeline)
  const activityStreams = streams.filter(
    (s) => !(projectHierarchy && s.id === mainFocusStream?.id)
  )
  const streamById = Object.fromEntries(
    (streamConfig?.streams || []).map((s) => [
      s.id,
      { ...s, abbrev: getStreamAbbrev(s) },
    ])
  )
  const getStreamFor = (activity) => streamById[getActivityStreamId(activity)]

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then(setData)
  }, [selectedDirectory, refreshTrigger])

  useEffect(() => {
    const timers = completionTimersRef.current
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const markCompletedForGracePeriod = (taskId) => {
    if (!taskId) return
    if (completionTimersRef.current[taskId]) {
      clearTimeout(completionTimersRef.current[taskId])
    }
    setRecentlyCompleted((prev) => ({ ...prev, [taskId]: true }))
    completionTimersRef.current[taskId] = setTimeout(() => {
      setRecentlyCompleted((prev) => {
        const next = { ...prev }
        delete next[taskId]
        return next
      })
      delete completionTimersRef.current[taskId]
    }, COMPLETED_TODO_GRACE_MS)
  }

  const recentlyCompletedIds = useMemo(
    () => new Set(Object.keys(recentlyCompleted)),
    [recentlyCompleted]
  )

  const save = (newData) => {
    setData(newData)
    saveProjects(selectedDirectory, newData)
  }

  // ── Activity task handlers (cards only add + toggle; detail manages) ──

  const updateActivityTasks = (activityId, updateFn) => {
    save({
      ...data,
      activities: data.activities.map((item) =>
        item.id === activityId
          ? { ...item, tasks: updateFn(item.tasks || []) }
          : item
      ),
    })
  }

  const handleAddTask = (activityId, text, options = {}) =>
    updateActivityTasks(activityId, (tasks) => [
      ...tasks,
      createTask(text, options),
    ])

  const handleToggleTask = (activityId, taskId) => {
    let justCompleted = false
    updateActivityTasks(activityId, (tasks) =>
      tasks.map((t) => {
        if (t.id !== taskId) return t
        const nextCompleted = !t.completed
        justCompleted = nextCompleted
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted
            ? new Date().toISOString().split('T')[0]
            : null,
        }
      })
    )
    if (justCompleted) markCompletedForGracePeriod(taskId)
  }

  // ── Activity handlers ──────────────────────────────────────────────────

  const handleAddActivity = (title, type, options) => {
    save({
      ...data,
      activities: [...data.activities, createActivity(title, type, options)],
    })
  }

  const handleRenameActivity = (activityId, newTitle) => {
    save({
      ...data,
      activities: data.activities.map((a) =>
        a.id === activityId ? { ...a, title: newTitle } : a
      ),
    })
  }

  const handleFinishActivity = (activityId) => {
    save({
      ...data,
      activities: data.activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              status: 'archived',
              completedAt: new Date().toISOString().split('T')[0],
            }
          : a
      ),
    })
  }

  const handleDeleteActivity = (activityId) => {
    save({
      ...data,
      activities: data.activities.filter((a) => a.id !== activityId),
    })
  }

  // ── Client project handlers ────────────────────────────────────────────

  const handleAddClientProject = (title, options) => {
    save({
      ...data,
      clientProjects: [
        ...data.clientProjects,
        createClientProject(title, options),
      ],
    })
  }

  const handleToggleClientProjectStatus = (projectId) => {
    const today = new Date().toISOString().split('T')[0]
    save({
      ...data,
      clientProjects: data.clientProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: p.status === 'active' ? 'done' : 'active',
              completedAt: p.status === 'active' ? today : null,
            }
          : p
      ),
    })
  }

  const updateClientProjectTasks = (projectId, updateFn) => {
    save({
      ...data,
      clientProjects: data.clientProjects.map((project) =>
        project.id === projectId
          ? { ...project, tasks: updateFn(project.tasks || []) }
          : project
      ),
    })
  }

  const handleToggleClientProjectTask = (projectId, taskId) => {
    updateClientProjectTasks(projectId, (tasks) =>
      tasks.map((task) => {
        if (task.id !== taskId) return task
        const nextCompleted = !task.completed
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted
            ? new Date().toISOString().split('T')[0]
            : null,
        }
      })
    )
  }

  const handleToggleAnyTask = (ownerType, ownerId, taskId) => {
    if (ownerType === 'project') {
      handleToggleClientProjectTask(ownerId, taskId)
    } else {
      handleToggleTask(ownerId, taskId)
    }
  }

  const handleRenameClientProject = (projectId, newTitle) => {
    save({
      ...data,
      clientProjects: data.clientProjects.map((p) =>
        p.id === projectId ? { ...p, title: newTitle } : p
      ),
    })
  }

  const handleDeleteClientProject = (projectId) => {
    save({
      ...data,
      clientProjects: data.clientProjects.filter((p) => p.id !== projectId),
    })
  }

  return {
    data,
    save,
    projectHierarchy,
    activityStreams,
    streamById,
    getStreamFor,
    recentlyCompletedIds,
    handleAddTask,
    handleToggleTask,
    handleAddActivity,
    handleRenameActivity,
    handleFinishActivity,
    handleDeleteActivity,
    handleAddClientProject,
    handleToggleClientProjectStatus,
    handleToggleClientProjectTask,
    handleToggleAnyTask,
    handleRenameClientProject,
    handleDeleteClientProject,
  }
}

export default useActivitiesData
