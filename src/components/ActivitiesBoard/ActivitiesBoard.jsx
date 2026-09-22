import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
} from '@mui/material'
import {
  Add,
  Delete,
  Check,
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
import TodoAgeChip from '../shared/TodoAgeChip'
import TodoDueChip from '../shared/TodoDueChip'
import { sortTasksByUrgency } from '../../utils/taskUrgency'
import {
  InkButton,
  PageHeader,
  SectionHeader,
  Segmented,
  EmptyState,
  MONO,
} from '../shared/ui'
import AllTodosView from './components/AllTodosView'
import useActivitiesData from './hooks/useActivitiesData'

// ── Local shared components ───────────────────────────────────────────────────

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
      <InkButton
        color="secondary.main"
        startIcon={<Add />}
        onClick={handleClick}
      >
        {showProjects ? 'New' : 'New activity'}
      </InkButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onAddProject()
          }}
          sx={{ fontWeight: 700, minWidth: 180 }}
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
      gap: 2.5,
      alignItems: 'start',
    }}
  >
    {children}
  </Box>
)

const getUrgentTasks = (projects) =>
  sortTasksByUrgency(
    projects.flatMap((project) =>
      (project.tasks || [])
        .filter((task) => !task.completed)
        .map((task) => ({
          ...task,
          projectId: project.id,
          projectTitle: project.title,
        }))
    )
  ).slice(0, 4)

const DueNextPanel = ({
  stream,
  tasks,
  onOpenProject,
  onToggleProjectTask,
}) => (
  <Box
    sx={{
      border: '3px solid',
      borderColor: 'text.primary',
      borderTop: '8px solid',
      borderTopColor: stream?.color || 'primary.main',
      bgcolor: 'background.paper',
    }}
  >
    <Box
      sx={{ px: 2, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}
    >
      <Typography sx={{ fontWeight: 900 }}>Due next</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Earliest due date first, then longest open.
      </Typography>
    </Box>
    {tasks.map((task, i) => (
      <Box
        key={task.id}
        onClick={() => onOpenProject(task.projectId)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.25,
          py: 1,
          cursor: 'pointer',
          borderTop: i === 0 ? 'none' : '2px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {onToggleProjectTask && (
          <Checkbox
            size="small"
            checked={task.completed}
            inputProps={{ 'aria-label': `Complete ${task.text}` }}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggleProjectTask(task.projectId, task.id)}
            sx={{
              p: 0.5,
              color: 'text.primary',
              '&.Mui-checked': { color: 'primary.main' },
            }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: task.important ? 900 : 700,
              fontSize: '0.92rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.text}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            {task.projectTitle}
          </Typography>
        </Box>
        <TodoDueChip item={task} />
        {!task.dueDate && <TodoAgeChip item={task} />}
      </Box>
    ))}
  </Box>
)

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
        display: 'grid',
        gridTemplateColumns: '24px minmax(0, 1fr) auto auto 32px',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 1.5,
        borderTop: '2px solid',
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 'none' },
        '&:hover .row-delete': { opacity: 1 },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Check sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
      <Typography
        onClick={onOpenDetails}
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'text.secondary',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '&:hover': { color: 'text.primary', textDecoration: 'underline' },
        }}
      >
        {activity.title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            bgcolor: stream?.color || 'text.disabled',
          }}
        />
        <Typography
          sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary' }}
        >
          {stream?.name || activity.type}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: MONO,
          fontSize: '0.75rem',
          color: 'text.secondary',
          minWidth: 88,
          textAlign: 'right',
        }}
      >
        {activity.completedAt || ''}
      </Typography>
      <IconButton
        size="small"
        className="row-delete"
        aria-label={`Delete ${activity.title}`}
        onClick={() => setConfirmOpen(true)}
        sx={{
          opacity: 0,
          transition: 'opacity 0.15s',
          p: 0.25,
          '&:focus-visible': { opacity: 1 },
        }}
      >
        <Delete sx={{ fontSize: '1rem' }} />
      </IconButton>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete activity"
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
  const { mainFocusStream } = useAppContext()
  const [viewMode, setViewMode] = useState('board')
  const [activityFilter, setActivityFilter] = useState('ALL')
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(true)
  const {
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
    handleSetAnyTaskRecurrence,
    handleRenameClientProject,
    handleDeleteClientProject,
  } = useActivitiesData()

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

  const allActiveTopLevel = getTopLevelActivities(data.activities).filter(
    (a) => a.status === 'active'
  )
  const urgentTasks = projectHierarchy
    ? getUrgentTasks(data.clientProjects.filter((p) => p.status === 'active'))
    : []
  const activeProjectCount = data.clientProjects.filter(
    (p) => p.status === 'active'
  ).length

  const filterOptions = [
    { value: 'ALL', label: 'All', meta: allActiveTopLevel.length },
    ...activityStreams.map((s) => ({
      value: s.id,
      label: s.name,
      color: s.color,
      swatch: s.color,
      meta: allActiveTopLevel.filter((a) => getActivityStreamId(a) === s.id)
        .length,
    })),
  ]

  const renderCard = (activity) => (
    <SortableActivity key={activity.id} id={activity.id} disabled={!dndEnabled}>
      {(dragHandle) => (
        <ActivityCard dragHandle={dragHandle} {...cardPropsFor(activity)} />
      )}
    </SortableActivity>
  )

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%', pb: 8 }}>
      <PageHeader
        title={projectHierarchy ? 'Projects & activities' : 'Activities'}
        meta={
          projectHierarchy
            ? `${activeProjectCount} active ${activeProjectCount === 1 ? 'project' : 'projects'}, ${allActiveTopLevel.length} ${allActiveTopLevel.length === 1 ? 'activity' : 'activities'}`
            : `${allActiveTopLevel.length} active`
        }
      >
        <Segmented
          size="sm"
          ariaLabel="Activities view"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'board', label: 'Board' },
            { value: 'todos', label: 'All todos' },
          ]}
        />
        {viewMode === 'board' && (
          <NewButton
            showProjects={projectHierarchy}
            onAddProject={() => setAddProjectOpen(true)}
            onAddActivity={() => setAddActivityOpen(true)}
          />
        )}
      </PageHeader>

      {viewMode === 'todos' ? (
        <AllTodosView
          activities={data.activities}
          projects={data.clientProjects}
          streamById={streamById}
          mainFocusStream={
            mainFocusStream && {
              ...mainFocusStream,
              abbrev: getStreamAbbrev(mainFocusStream),
            }
          }
          getActivityStreamId={getActivityStreamId}
          onOpenItem={(type, id) => navigate(`/todos/${type}/${id}`)}
          onToggleTask={handleToggleAnyTask}
          onAddTask={handleAddTask}
          onSetTaskRecurrence={handleSetAnyTaskRecurrence}
        />
      ) : (
        <>
          {/* ── Main focus project pipeline ── */}
          {projectHierarchy && (
            <Box component="section" sx={{ mb: 7 }}>
              <SectionHeader
                title={mainFocusStream?.name || 'Main focus'}
                meta={`${data.clientProjects.length} ${data.clientProjects.length === 1 ? 'project' : 'projects'}`}
                subtitle="Dated engagements with a start, an end and a status."
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: urgentTasks.length ? 'minmax(0, 1fr) 360px' : '1fr',
                  },
                  gap: 3,
                  alignItems: 'start',
                }}
              >
                <ClientProjectsList
                  projects={data.clientProjects}
                  accentColor={mainFocusStream?.color}
                  onToggleStatus={handleToggleClientProjectStatus}
                  onDelete={handleDeleteClientProject}
                  onRename={handleRenameClientProject}
                  onOpenDetails={(projectId) =>
                    navigate(`/todos/project/${projectId}`)
                  }
                />
                {urgentTasks.length > 0 && (
                  <DueNextPanel
                    stream={mainFocusStream}
                    tasks={urgentTasks}
                    onOpenProject={(projectId) =>
                      navigate(`/todos/project/${projectId}`)
                    }
                    onToggleProjectTask={handleToggleClientProjectTask}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* ── Activities ── */}
          <Box component="section">
            <SectionHeader
              title="Activities"
              meta={`${activeTopLevel.length} active`}
              subtitle={
                dndEnabled
                  ? 'Drag a card by its handle to reorder.'
                  : 'Show all streams to reorder.'
              }
              sx={{ flexWrap: 'wrap', mb: 2.5 }}
              action={
                activityStreams.length > 1 && (
                  <Segmented
                    size="sm"
                    ariaLabel="Filter by stream"
                    value={activityFilter}
                    onChange={setActivityFilter}
                    options={filterOptions}
                  />
                )
              }
            />

            {activeTopLevel.length === 0 && archivedActivities.length === 0 ? (
              <EmptyState
                title="No activities here yet."
                action={
                  <InkButton
                    startIcon={<Add />}
                    onClick={() => setAddActivityOpen(true)}
                  >
                    New activity
                  </InkButton>
                }
              >
                Activities are ongoing pieces of work with their own todos.
              </EmptyState>
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

                          if (children.length === 0) return renderCard(activity)

                          return (
                            <Box
                              key={activity.id}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                              }}
                            >
                              {renderCard(activity)}
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.5,
                                  pl: 2,
                                  ml: 2,
                                  borderLeft: '3px solid',
                                  borderColor: 'text.primary',
                                }}
                              >
                                <SortableContext
                                  items={children.map((c) => c.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {children.map(renderCard)}
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
                  <Box sx={{ mt: activeTopLevel.length > 0 ? 5 : 0 }}>
                    <Box
                      component="button"
                      type="button"
                      aria-expanded={showCompleted}
                      onClick={() => setShowCompleted((s) => !s)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        border: 'none',
                        background: 'none',
                        p: 0,
                        mb: 1,
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        fontWeight: 900,
                        color: 'text.primary',
                        cursor: 'pointer',
                      }}
                    >
                      {showCompleted ? <ExpandMore /> : <ChevronRight />}
                      Completed
                      <Box
                        component="span"
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.8rem',
                          color: 'text.secondary',
                        }}
                      >
                        {archivedActivities.length}
                      </Box>
                    </Box>
                    {showCompleted && (
                      <Box
                        sx={{
                          border: '3px solid',
                          borderColor: 'text.primary',
                          bgcolor: 'background.paper',
                        }}
                      >
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
        </>
      )}

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
