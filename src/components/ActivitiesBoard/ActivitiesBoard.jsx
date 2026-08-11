import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Checkbox,
} from '@mui/material'
import {
  Add,
  Delete,
  CheckCircle,
  ChevronRight,
  ExpandMore,
} from '@mui/icons-material'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppContext } from '../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createActivity,
  createClientProject,
  createTask,
  getActivityStreamId,
  getTopLevelActivities,
  getChildActivities,
  reorderActivities,
} from '../../utils/projectsManager'
import { getStreamAbbrev } from '../../utils/streamConfig'
import ActivityCard from './components/ActivityCard'
import ClientProjectsList from './components/ClientProjectsList'
import AddActivityDialog from './components/AddActivityDialog'
import AddClientProjectDialog from './components/AddClientProjectDialog'
import ConfirmDialog from './components/ConfirmDialog'
import StreamTag from './components/StreamTag'
import { filterTabStyles } from './ActivitiesBoard.styles'
import TodoAgeChip from '../shared/TodoAgeChip'
import TodoDueChip from '../shared/TodoDueChip'
import { sortTasksByUrgency } from '../../utils/taskUrgency'

// Keep just-completed todos visible briefly so users can catch and undo mistakes.
const COMPLETED_TODO_GRACE_MS = 5000

// ── Local shared components ───────────────────────────────────────────────────

const SectionHeader = ({ title, count, countLabel, subtitle }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        {title}
      </Typography>
      {count !== undefined && (
        <Typography
          component="span"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'text.secondary',
            textTransform: 'uppercase',
          }}
        >
          {count} {countLabel}
        </Typography>
      )}
    </Box>
    {subtitle && (
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

const NewButton = ({ onAddProject, onAddActivity, showProjects }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (e) => {
    // Without a project pipeline there's only one thing to create.
    if (!showProjects) {
      onAddActivity()
      return
    }
    setAnchorEl(e.currentTarget)
  }

  return (
    <>
      <Box
        component="button"
        onClick={handleClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          fontFamily: 'inherit',
          fontSize: '0.85rem',
          fontWeight: 900,
          px: 2.5,
          py: 1,
          borderRadius: '25px',
          border: '2px solid',
          borderColor: 'text.primary',
          color: 'text.primary',
          bgcolor: 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': {
            boxShadow: '4px 4px 0px',
            transform: 'translate(-1px, -1px)',
          },
        }}
      >
        <Add sx={{ fontSize: '1rem' }} />
        New
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onAddProject()
          }}
          sx={{ fontWeight: 700 }}
        >
          Project
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onAddActivity()
          }}
          sx={{ fontWeight: 700 }}
        >
          Activity
        </MenuItem>
      </Menu>
    </>
  )
}

// Wraps a draggable activity: exposes the drag handle to `ActivityCard` while
// keeping click/rename interactions on the card untouched.
const SortableActivity = ({ id, disabled, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 'auto',
        position: 'relative',
      }}
    >
      {children(disabled ? null : { attributes, listeners })}
    </div>
  )
}

const ActivityGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 2,
      alignItems: 'stretch',
    }}
  >
    {children}
  </Box>
)

const MainGoalUrgentCard = ({
  stream,
  projects,
  onOpenProject,
  onToggleProjectTask,
}) => {
  const openTasks = sortTasksByUrgency(
    projects.flatMap((project) =>
      (project.tasks || [])
        .filter((task) => !task.completed)
        .map((task) => ({
          ...task,
          projectId: project.id,
          projectTitle: project.title,
        }))
    )
  ).slice(0, 3)

  if (openTasks.length === 0) return null

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '18px',
        border: '1.5px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>
            {stream?.name || 'Main goal'} urgent todos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Due date first, then longest-open work.
          </Typography>
        </Box>
        <StreamTag stream={stream} label={stream?.abbrev || 'MG'} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {openTasks.map((task) => (
          <Box
            key={task.id}
            onClick={() => onOpenProject(task.projectId)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              cursor: 'pointer',
              borderRadius: '12px',
              px: 0.5,
              py: 0.75,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: task.important ? 800 : 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                {task.projectTitle}
              </Typography>
            </Box>
            {onToggleProjectTask && (
              <Checkbox
                size="small"
                checked={task.completed}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggleProjectTask(task.projectId, task.id)}
                sx={{
                  p: 0.5,
                  color: 'text.secondary',
                  '&.Mui-checked': { color: 'primary.main' },
                }}
              />
            )}
            <TodoDueChip item={task} />
            {!task.dueDate && <TodoAgeChip item={task} />}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

const CompletedActivityRow = ({
  activity,
  stream,
  onDelete,
  onOpenDetails,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
        '&:hover .row-delete': { opacity: 1 },
      }}
    >
      <CheckCircle sx={{ fontSize: '1rem', color: 'primary.main' }} />
      <Typography
        variant="body2"
        onClick={onOpenDetails}
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textDecoration: 'line-through',
          cursor: 'pointer',
          '&:hover': { color: 'text.primary' },
        }}
      >
        {activity.title}
      </Typography>
      <StreamTag
        stream={stream}
        label={stream?.abbrev || activity.type}
        muted
      />
      <Box sx={{ flex: 1 }} />
      {activity.completedAt && (
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.66rem',
            color: 'text.disabled',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {activity.completedAt}
        </Typography>
      )}
      <IconButton
        size="small"
        className="row-delete"
        onClick={() => setConfirmOpen(true)}
        sx={{ opacity: 0, transition: 'opacity 0.15s', p: 0.25 }}
      >
        <Delete sx={{ fontSize: '0.9rem' }} />
      </IconButton>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Activity"
        message={`"${activity.title}" will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  )
}

// ── Board ─────────────────────────────────────────────────────────────────────

const ActivitiesBoard = () => {
  const navigate = useNavigate()
  const { selectedDirectory, streamConfig, streams, mainFocusStream } =
    useAppContext()
  const [data, setData] = useState({ activities: [], clientProjects: [] })
  const [activityFilter, setActivityFilter] = useState('ALL')
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(true)
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
  }, [selectedDirectory])

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

  const handleAddTask = (activityId, text) =>
    updateActivityTasks(activityId, (tasks) => [...tasks, createTask(text)])

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

  // ── Derived ────────────────────────────────────────────────────────────

  const typeMatch = (a) =>
    activityFilter === 'ALL' || getActivityStreamId(a) === activityFilter
  const activeTopLevel = getTopLevelActivities(data.activities).filter(
    (a) => a.status === 'active' && typeMatch(a)
  )
  const archivedActivities = data.activities.filter(
    (a) => a.status === 'archived' && typeMatch(a)
  )

  const cardPropsFor = (activity) => ({
    activity,
    stream: getStreamFor(activity),
    onAddTask: (text) => handleAddTask(activity.id, text),
    onToggleTask: (taskId) => handleToggleTask(activity.id, taskId),
    onFinish: () => handleFinishActivity(activity.id),
    onRename: (title) => handleRenameActivity(activity.id, title),
    onDelete: () => handleDeleteActivity(activity.id),
    onOpenDetails: () => navigate(`/todos/activity/${activity.id}`),
    recentlyCompletedIds,
  })

  // ── Drag-and-drop reordering ────────────────────────────────────────────
  // Reordering is only unambiguous when the full board is visible — a
  // stream filter hides siblings, which would corrupt their relative order.
  const dndEnabled = activityFilter === 'ALL'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeItem = data.activities.find((a) => a.id === active.id)
    const overItem = data.activities.find((a) => a.id === over.id)
    if (!activeItem || !overItem) return
    // Only reorder within the same sibling group (top-level, or the same
    // parent's children) — dragging never re-parents an activity.
    if ((activeItem.parentId || null) !== (overItem.parentId || null)) return

    const siblingIds = (
      activeItem.parentId
        ? getChildActivities(data.activities, activeItem.parentId).filter(
            (a) => a.status === 'active' && typeMatch(a)
          )
        : activeTopLevel
    ).map((a) => a.id)

    const oldIndex = siblingIds.indexOf(active.id)
    const newIndex = siblingIds.indexOf(over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(siblingIds, oldIndex, newIndex)
    save({ ...data, activities: reorderActivities(data.activities, reordered) })
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Box sx={{ pb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Projects & Activities
        </Typography>
        <NewButton
          showProjects={projectHierarchy}
          onAddProject={() => setAddProjectOpen(true)}
          onAddActivity={() => setAddActivityOpen(true)}
        />
      </Box>

      {/* ── Main focus project pipeline ── */}
      {projectHierarchy && (
        <Box sx={{ mb: 5 }}>
          <SectionHeader
            title={mainFocusStream?.name || 'Main Focus'}
            count={data.clientProjects.length}
            countLabel={
              data.clientProjects.length === 1 ? 'project' : 'projects'
            }
            subtitle="Dated engagements with a start, an end, and a status."
          />
          <MainGoalUrgentCard
            stream={
              mainFocusStream && {
                ...mainFocusStream,
                abbrev: getStreamAbbrev(mainFocusStream),
              }
            }
            projects={data.clientProjects.filter(
              (project) => project.status === 'active'
            )}
            onOpenProject={(projectId) =>
              navigate(`/todos/project/${projectId}`)
            }
            onToggleProjectTask={handleToggleClientProjectTask}
          />
          <ClientProjectsList
            projects={data.clientProjects}
            onToggleStatus={handleToggleClientProjectStatus}
            onDelete={handleDeleteClientProject}
            onRename={handleRenameClientProject}
            onOpenDetails={(projectId) =>
              navigate(`/todos/project/${projectId}`)
            }
          />
        </Box>
      )}

      {/* ── Activities ── */}
      <Box sx={{ mb: 5 }}>
        <SectionHeader
          title="Activities"
          count={activeTopLevel.length}
          countLabel="active"
        />

        {/* Filter tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Box
            component="button"
            onClick={() => setActivityFilter('ALL')}
            sx={filterTabStyles(
              activityFilter === 'ALL',
              'text.primary',
              'background.default'
            )}
          >
            All
          </Box>
          {activityStreams.map((s) => (
            <Box
              key={s.id}
              component="button"
              onClick={() => setActivityFilter(s.id)}
              sx={filterTabStyles(activityFilter === s.id, s.color, '#000000')}
            >
              {s.name}
            </Box>
          ))}
        </Box>

        {activeTopLevel.length === 0 && archivedActivities.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: '20px',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No activities yet.{' '}
              <Box
                component="span"
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 700,
                }}
                onClick={() => setAddActivityOpen(true)}
              >
                Add one
              </Box>
            </Typography>
          </Box>
        ) : (
          <>
            {activeTopLevel.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeTopLevel.map((a) => a.id)}
                  strategy={rectSortingStrategy}
                >
                  <ActivityGrid>
                    {activeTopLevel.map((activity) => {
                      const children = getChildActivities(
                        data.activities,
                        activity.id
                      ).filter((c) => c.status === 'active' && typeMatch(c))

                      if (children.length === 0) {
                        return (
                          <SortableActivity
                            key={activity.id}
                            id={activity.id}
                            disabled={!dndEnabled}
                          >
                            {(dragHandle) => (
                              <ActivityCard
                                dragHandle={dragHandle}
                                {...cardPropsFor(activity)}
                              />
                            )}
                          </SortableActivity>
                        )
                      }

                      return (
                        <Box
                          key={activity.id}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          <SortableActivity
                            id={activity.id}
                            disabled={!dndEnabled}
                          >
                            {(dragHandle) => (
                              <ActivityCard
                                dragHandle={dragHandle}
                                {...cardPropsFor(activity)}
                              />
                            )}
                          </SortableActivity>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.5,
                              pl: 2,
                              ml: 1,
                              borderLeft: '2px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <SortableContext
                              items={children.map((c) => c.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {children.map((child) => (
                                <SortableActivity
                                  key={child.id}
                                  id={child.id}
                                  disabled={!dndEnabled}
                                >
                                  {(dragHandle) => (
                                    <ActivityCard
                                      dragHandle={dragHandle}
                                      {...cardPropsFor(child)}
                                    />
                                  )}
                                </SortableActivity>
                              ))}
                            </SortableContext>
                          </Box>
                        </Box>
                      )
                    })}
                  </ActivityGrid>
                </SortableContext>
              </DndContext>
            )}

            {archivedActivities.length > 0 && (
              <Box sx={{ mt: activeTopLevel.length > 0 ? 4 : 0 }}>
                <Box
                  component="button"
                  onClick={() => setShowCompleted((s) => !s)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: 'none',
                    background: 'none',
                    p: 0.5,
                    mb: 0.5,
                    fontFamily: 'inherit',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: 'text.secondary',
                    cursor: 'pointer',
                  }}
                >
                  {showCompleted ? (
                    <ExpandMore sx={{ fontSize: '0.9rem' }} />
                  ) : (
                    <ChevronRight sx={{ fontSize: '0.9rem' }} />
                  )}
                  COMPLETED
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.66rem',
                      color: 'text.disabled',
                    }}
                  >
                    {archivedActivities.length}
                  </Typography>
                </Box>
                {showCompleted && (
                  <Box>
                    {archivedActivities.map((activity) => (
                      <CompletedActivityRow
                        key={activity.id}
                        activity={activity}
                        stream={getStreamFor(activity)}
                        onDelete={() => handleDeleteActivity(activity.id)}
                        onOpenDetails={() =>
                          navigate(`/todos/activity/${activity.id}`)
                        }
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      <AddActivityDialog
        open={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        onAdd={handleAddActivity}
        streams={activityStreams}
        activities={data.activities}
      />
      <AddClientProjectDialog
        open={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        onAdd={handleAddClientProject}
      />
    </Box>
  )
}

export default ActivitiesBoard
