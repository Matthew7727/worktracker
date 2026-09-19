import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createTask,
  createActivity,
  getActivityStreamId,
  getChildActivities,
} from '../../../utils/projectsManager'
import { getStreamAbbrev } from '../../../utils/streamConfig'
import {
  loadNotes,
  saveNote,
  deleteNote,
  createNote,
  getNotesForActivity,
  getNotesForProject,
} from '../../../utils/notesManager'

const EMPTY_CONFIRM = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  danger: false,
  onConfirm: null,
}

/**
 * Everything the project/activity detail page reads and changes: the item,
 * its todos, team, sub-activities, linked notes and lifecycle. Shared by the
 * ledger detail page and the Filofax insert page.
 */
const useActivityDetails = () => {
  const { itemType, itemId } = useParams()
  const navigate = useNavigate()
  const { selectedDirectory, streamConfig, mainFocusStream } = useAppContext()
  const [data, setData] = useState({ activities: [], clientProjects: [] })
  const [teamInput, setTeamInput] = useState('')
  const [addingTeam, setAddingTeam] = useState(false)
  const [addSubOpen, setAddSubOpen] = useState(false)
  const [confirm, setConfirm] = useState(EMPTY_CONFIRM)
  const [notes, setNotes] = useState([])
  // null = no editor open; 'new' = creating a fresh note; a note object =
  // editing that note in place, right where its card would be.
  const [noteEditorTarget, setNoteEditorTarget] = useState(null)
  const openConfirm = (options) =>
    setConfirm({ ...EMPTY_CONFIRM, ...options, open: true })
  const closeConfirm = () => setConfirm(EMPTY_CONFIRM)

  const streamById = useMemo(
    () =>
      Object.fromEntries(
        (streamConfig?.streams || []).map((s) => [
          s.id,
          { ...s, abbrev: getStreamAbbrev(s) },
        ])
      ),
    [streamConfig]
  )

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then(setData)
  }, [selectedDirectory])

  const refreshNotes = () => {
    if (!selectedDirectory) return
    loadNotes(selectedDirectory).then(setNotes)
  }

  useEffect(() => {
    refreshNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory])

  const isProject = itemType === 'project'
  const listKey = isProject ? 'clientProjects' : 'activities'
  const item = data[listKey].find((entry) => entry.id === itemId) || null
  const itemReadOnly =
    (isProject && item?.status === 'done') ||
    (!isProject && item?.status === 'archived')

  const stream = isProject
    ? mainFocusStream
    : streamById[getActivityStreamId(item || {})]

  const parentActivity =
    !isProject && item?.parentId
      ? data.activities.find((a) => a.id === item.parentId) || null
      : null
  const childActivities =
    !isProject && item ? getChildActivities(data.activities, item.id) : []

  const save = (nextData) => {
    setData(nextData)
    saveProjects(selectedDirectory, nextData)
  }

  const addSubActivity = (title, streamIdArg, options) => {
    save({
      ...data,
      activities: [
        ...data.activities,
        createActivity(title, streamIdArg, options),
      ],
    })
  }

  const updateItem = (patchOrUpdater) => {
    save({
      ...data,
      [listKey]: data[listKey].map((entry) => {
        if (entry.id !== itemId) return entry
        if (typeof patchOrUpdater === 'function') return patchOrUpdater(entry)
        return { ...entry, ...patchOrUpdater }
      }),
    })
  }

  const updateTasks = (updateFn) => {
    updateItem((entry) => ({ ...entry, tasks: updateFn(entry.tasks || []) }))
  }

  const taskHandlers = {
    onAddTask: (text) => updateTasks((tasks) => [...tasks, createTask(text)]),
    onToggleTask: (taskId) =>
      updateTasks((tasks) =>
        tasks.map((t) => {
          if (t.id !== taskId) return t
          const nextCompleted = !t.completed
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted
              ? new Date().toISOString().split('T')[0]
              : null,
          }
        })
      ),
    onDeleteTask: (taskId) =>
      updateTasks((tasks) => tasks.filter((t) => t.id !== taskId)),
    onToggleTaskImportant: (taskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId ? { ...t, important: !t.important } : t
        )
      ),
    onSetTaskDueDate: (taskId, dueDate) =>
      updateTasks((tasks) =>
        tasks.map((t) => (t.id === taskId ? { ...t, dueDate } : t))
      ),
    onSetTaskGoalIds: (taskId, goalIds) =>
      updateTasks((tasks) =>
        tasks.map((t) => (t.id === taskId ? { ...t, goalIds } : t))
      ),
    onAddSubtask: (taskId, text) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: [...(t.subtasks || []), createTask(text)] }
            : t
        )
      ),
    onToggleSubtask: (taskId, subtaskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: (t.subtasks || []).map((s) =>
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                ),
              }
            : t
        )
      ),
    onDeleteSubtask: (taskId, subtaskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
              }
            : t
        )
      ),
  }

  const teamMembers = item?.teamMembers || []
  const addTeamMember = () => {
    const name = teamInput.trim()
    if (!name || teamMembers.includes(name)) {
      setTeamInput('')
      setAddingTeam(false)
      return
    }
    updateItem({ teamMembers: [...teamMembers, name] })
    setTeamInput('')
  }

  const removeTeamMember = (name) => {
    updateItem({ teamMembers: teamMembers.filter((member) => member !== name) })
  }

  // ── Lifecycle actions ────────────────────────────────────────────────

  const today = () => new Date().toISOString().split('T')[0]

  const markComplete = () => {
    if (isProject) {
      updateItem({ status: 'done', completedAt: today() })
    } else {
      updateItem({ status: 'archived', completedAt: today() })
    }
  }

  const reopen = () => {
    if (isProject) {
      updateItem({ status: 'active', completedAt: null })
    } else {
      updateItem({ status: 'active', completedAt: null })
    }
  }

  const deleteItem = () => {
    save({
      ...data,
      [listKey]: data[listKey].filter((entry) => entry.id !== itemId),
    })
    navigate('/todos')
  }

  // ── Linked notes ─────────────────────────────────────────────────────

  const linkedNotes = isProject
    ? getNotesForProject(notes, itemId)
    : getNotesForActivity(notes, itemId)

  const openNewNote = () => {
    setNoteEditorTarget('new')
  }

  const openExistingNote = (note) => {
    setNoteEditorTarget(note)
  }

  const closeNoteEditor = () => setNoteEditorTarget(null)

  const editingNote = noteEditorTarget === 'new' ? null : noteEditorTarget

  const handleSaveNote = async (fields) => {
    const base = editingNote || createNote()
    const updated = {
      ...base,
      ...fields,
      activityId: isProject ? null : itemId,
      activityTitle: isProject ? null : item?.title || null,
      projectId: isProject ? itemId : null,
      projectTitle: isProject ? item?.title || null : null,
      updatedAt: new Date().toISOString(),
    }
    await saveNote(selectedDirectory, updated, editingNote?.filePath)
    closeNoteEditor()
    refreshNotes()
  }

  const handleDeleteNote = async () => {
    if (!editingNote) return
    await deleteNote(selectedDirectory, editingNote)
    closeNoteEditor()
    refreshNotes()
  }

  return {
    itemType,
    itemId,
    navigate,
    streamConfig,
    data,
    item,
    isProject,
    itemReadOnly,
    stream,
    streamById,
    parentActivity,
    childActivities,
    updateItem,
    taskHandlers,
    teamMembers,
    teamInput,
    setTeamInput,
    addingTeam,
    setAddingTeam,
    addTeamMember,
    removeTeamMember,
    addSubOpen,
    setAddSubOpen,
    addSubActivity,
    confirm,
    openConfirm,
    closeConfirm,
    markComplete,
    reopen,
    deleteItem,
    linkedNotes,
    noteEditorTarget,
    openNewNote,
    openExistingNote,
    closeNoteEditor,
    handleSaveNote,
    handleDeleteNote,
  }
}

export default useActivityDetails
