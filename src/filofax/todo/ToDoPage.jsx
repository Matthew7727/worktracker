import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import { Add, Delete, ChevronRight, ExpandMore } from '@mui/icons-material'
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
import useActivitiesData from '../../components/ActivitiesBoard/hooks/useActivitiesData'
import {
  getActivityStreamId,
  getTopLevelActivities,
  getChildActivities,
  reorderActivities,
} from '../../utils/projectsManager'
import { getStreamAbbrev } from '../../utils/streamConfig'
import { sortTasksByUrgency } from '../../utils/taskUrgency'
import ClientProjectsList from '../../components/ActivitiesBoard/components/ClientProjectsList'
import AllTodosView from '../../components/ActivitiesBoard/components/AllTodosView'
import AddActivityDialog from '../../components/ActivitiesBoard/components/AddActivityDialog'
import AddClientProjectDialog from '../../components/ActivitiesBoard/components/AddClientProjectDialog'
import ConfirmDialog from '../../components/ActivitiesBoard/components/ConfirmDialog'
import TodoDueChip from '../../components/shared/TodoDueChip'
import TodoAgeChip from '../../components/shared/TodoAgeChip'
import TodoRecurrenceChip from '../../components/shared/TodoRecurrenceChip'
import { InkButton, Segmented } from '../../components/shared/ui'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import {
  PageHead,
  PrintHeading,
  PrintLabel,
  StreamMark,
  TickBox,
  BlankLine,
} from '../paper'
import { LINE } from '../paperStyles'
import ActivitySheet from './ActivitySheet'

const Sortable = ({ id, disabled, children }) => {
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
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 2 : 'auto',
        position: 'relative',
      }}
    >
      {children(disabled ? null : { attributes, listeners })}
    </div>
  )
}

const NewMenu = ({ showProjects, onProject, onActivity }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  return (
    <>
      <InkButton
        startIcon={<Add />}
        onClick={(e) =>
          showProjects ? setAnchorEl(e.currentTarget) : onActivity()
        }
      >
        {showProjects ? 'New sheet' : 'New activity'}
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
            onProject()
          }}
        >
          Project
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onActivity()
          }}
        >
          Activity
        </MenuItem>
      </Menu>
    </>
  )
}

const FinishedRow = ({ activity, stream, onOpen, onDelete }) => {
  const ff = useFilofaxTokens()
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto auto 28px',
        alignItems: 'center',
        gap: 2,
        minHeight: LINE,
        borderBottom: `1px solid ${ff.rule}`,
        '&:hover .row-delete': { opacity: 1 },
      }}
    >
      <Typography
        onClick={onOpen}
        sx={{
          fontSize: '0.9rem',
          color: 'text.secondary',
          textDecoration: 'line-through',
          textDecorationColor: ff.ruleStrong,
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '&:hover': { color: ff.print },
        }}
      >
        {activity.title}
      </Typography>
      <StreamMark stream={stream} label={stream?.name || activity.type} />
      <Typography
        sx={{
          fontStyle: 'italic',
          fontSize: '0.78rem',
          color: 'text.secondary',
        }}
      >
        {activity.completedAt || ''}
      </Typography>
      <IconButton
        size="small"
        className="row-delete"
        aria-label={`Delete ${activity.title}`}
        onClick={() => setConfirmOpen(true)}
        sx={{ p: 0.25, opacity: 0, '&:focus-visible': { opacity: 1 } }}
      >
        <Delete sx={{ fontSize: '0.95rem' }} />
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

const ToDoPage = () => {
  const ff = useFilofaxTokens()
  const navigate = useNavigate()
  const { mainFocusStream } = useAppContext()
  const board = useActivitiesData()
  const {
    data,
    save,
    projectHierarchy,
    activityStreams,
    streamById,
    getStreamFor,
    recentlyCompletedIds,
  } = board
  const [view, setView] = useState('sheets')
  const [filter, setFilter] = useState('ALL')
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [showFinished, setShowFinished] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const typeMatch = (a) => filter === 'ALL' || getActivityStreamId(a) === filter
  const allActiveTop = getTopLevelActivities(data.activities).filter(
    (a) => a.status === 'active'
  )
  const activeTop = allActiveTop.filter(typeMatch)
  const finished = data.activities.filter(
    (a) => a.status === 'archived' && typeMatch(a)
  )
  const activeProjects = data.clientProjects.filter(
    (p) => p.status === 'active'
  )
  const dueNext = projectHierarchy
    ? sortTasksByUrgency(
        activeProjects.flatMap((p) =>
          (p.tasks || [])
            .filter((t) => !t.completed)
            .map((t) => ({ ...t, projectId: p.id, projectTitle: p.title }))
        )
      ).slice(0, 5)
    : []

  // Reordering only makes sense with every stream's sheets in view.
  const dndEnabled = filter === 'ALL'

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const a = data.activities.find((x) => x.id === active.id)
    const b = data.activities.find((x) => x.id === over.id)
    if (!a || !b || (a.parentId || null) !== (b.parentId || null)) return
    const ids = (
      a.parentId
        ? getChildActivities(data.activities, a.parentId).filter(
            (c) => c.status === 'active'
          )
        : allActiveTop
    ).map((x) => x.id)
    const from = ids.indexOf(active.id)
    const to = ids.indexOf(over.id)
    if (from === -1 || to === -1) return
    save({
      ...data,
      activities: reorderActivities(data.activities, arrayMove(ids, from, to)),
    })
  }

  const sheetFor = (activity) => (
    <Sortable key={activity.id} id={activity.id} disabled={!dndEnabled}>
      {(dragHandle) => (
        <ActivitySheet
          activity={activity}
          stream={getStreamFor(activity)}
          dragHandle={dragHandle}
          recentlyCompletedIds={recentlyCompletedIds}
          onAddTask={(text) => board.handleAddTask(activity.id, text)}
          onToggleTask={(taskId) => board.handleToggleTask(activity.id, taskId)}
          onFinish={() => board.handleFinishActivity(activity.id)}
          onRename={(title) => board.handleRenameActivity(activity.id, title)}
          onDelete={() => board.handleDeleteActivity(activity.id)}
          onOpenDetails={() => navigate(`/todos/activity/${activity.id}`)}
        />
      )}
    </Sortable>
  )

  const filterOptions = [
    { value: 'ALL', label: 'All streams', meta: allActiveTop.length },
    ...activityStreams.map((s) => ({
      value: s.id,
      label: s.name,
      swatch: s.color,
      meta: allActiveTop.filter((a) => getActivityStreamId(a) === s.id).length,
    })),
  ]

  return (
    <Box>
      <PageHead
        title="To do"
        aside={
          projectHierarchy
            ? `${activeProjects.length} active ${activeProjects.length === 1 ? 'project' : 'projects'}, ${allActiveTop.length} ${allActiveTop.length === 1 ? 'activity' : 'activities'}`
            : `${allActiveTop.length} active ${allActiveTop.length === 1 ? 'activity' : 'activities'}`
        }
      >
        <Segmented
          ariaLabel="To do view"
          value={view}
          onChange={setView}
          options={[
            { value: 'sheets', label: 'Sheets' },
            { value: 'master', label: 'Master list' },
          ]}
        />
        {view === 'sheets' && (
          <NewMenu
            showProjects={projectHierarchy}
            onProject={() => setAddProjectOpen(true)}
            onActivity={() => setAddActivityOpen(true)}
          />
        )}
      </PageHead>

      {view === 'master' ? (
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
          onToggleTask={board.handleToggleAnyTask}
          onAddTask={board.handleAddTask}
          onSetTaskRecurrence={board.handleSetAnyTaskRecurrence}
        />
      ) : (
        <>
          {projectHierarchy && (
            <Box
              component="section"
              sx={{
                mb: 6,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: dueNext.length ? 'minmax(0, 1fr) 280px' : '1fr',
                },
                gap: 5,
                alignItems: 'start',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <PrintHeading aside={`${data.clientProjects.length} on file`}>
                  {mainFocusStream?.name || 'Main focus'} projects
                </PrintHeading>
                <ClientProjectsList
                  projects={data.clientProjects}
                  accentColor={mainFocusStream?.color}
                  onToggleStatus={board.handleToggleClientProjectStatus}
                  onDelete={board.handleDeleteClientProject}
                  onRename={board.handleRenameClientProject}
                  onOpenDetails={(id) => navigate(`/todos/project/${id}`)}
                />
              </Box>
              {dueNext.length > 0 && (
                <Box component="aside" aria-label="Due next">
                  <PrintHeading>Due next</PrintHeading>
                  {dueNext.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minHeight: LINE,
                        borderBottom: `1px solid ${ff.rule}`,
                      }}
                    >
                      <TickBox
                        checked={task.completed}
                        onChange={() =>
                          board.handleToggleClientProjectTask(
                            task.projectId,
                            task.id
                          )
                        }
                        label={`Complete ${task.text}`}
                      />
                      <Box
                        component="button"
                        type="button"
                        onClick={() =>
                          navigate(`/todos/project/${task.projectId}`)
                        }
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          py: 0.5,
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.88rem', color: ff.ink }}>
                          {task.text}
                        </Typography>
                        <Typography
                          sx={{
                            fontStyle: 'italic',
                            fontSize: '0.74rem',
                            color: 'text.secondary',
                          }}
                        >
                          {task.projectTitle}
                        </Typography>
                      </Box>
                      <TodoDueChip item={task} />
                      {!task.dueDate && <TodoAgeChip item={task} />}
                      <TodoRecurrenceChip item={task} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          <Box component="section">
            <PrintHeading
              aside={`${activeTop.length} open ${activeTop.length === 1 ? 'sheet' : 'sheets'}`}
              action={
                activityStreams.length > 1 && (
                  <Segmented
                    ariaLabel="Filter by stream"
                    value={filter}
                    onChange={setFilter}
                    options={filterOptions}
                  />
                )
              }
            >
              Activities
            </PrintHeading>
            <PrintLabel sx={{ mb: 2.5 }}>
              {dndEnabled
                ? 'Drag a sheet by its handle to reorder.'
                : 'Show all streams to reorder.'}
            </PrintLabel>

            {activeTop.length === 0 && finished.length === 0 ? (
              <BlankLine
                action={
                  <InkButton
                    size="sm"
                    startIcon={<Add />}
                    onClick={() => setAddActivityOpen(true)}
                  >
                    New activity
                  </InkButton>
                }
              >
                No activity sheets yet. Activities are ongoing pieces of work
                with their own todos.
              </BlankLine>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeTop.map((a) => a.id)}
                  strategy={rectSortingStrategy}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(290px, 1fr))',
                      gap: 3,
                      alignItems: 'start',
                    }}
                  >
                    {activeTop.map((activity) => {
                      const children = getChildActivities(
                        data.activities,
                        activity.id
                      ).filter((c) => c.status === 'active' && typeMatch(c))
                      if (!children.length) return sheetFor(activity)
                      return (
                        <Box
                          key={activity.id}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {sheetFor(activity)}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.5,
                              pl: 2,
                              ml: 1.5,
                              borderLeft: `1px dashed ${ff.ruleStrong}`,
                            }}
                          >
                            <SortableContext
                              items={children.map((c) => c.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {children.map(sheetFor)}
                            </SortableContext>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </SortableContext>
              </DndContext>
            )}

            {finished.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Box
                  component="button"
                  type="button"
                  aria-expanded={showFinished}
                  onClick={() => setShowFinished((s) => !s)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0,
                    mb: 1,
                    border: 'none',
                    background: 'none',
                    fontFamily: 'inherit',
                    fontSize: '1.05rem',
                    color: ff.print,
                    cursor: 'pointer',
                  }}
                >
                  {showFinished ? <ExpandMore /> : <ChevronRight />}
                  Finished activities
                  <Box
                    component="span"
                    sx={{
                      fontStyle: 'italic',
                      fontSize: '0.85rem',
                      color: 'text.secondary',
                      ml: 0.75,
                    }}
                  >
                    {finished.length}
                  </Box>
                </Box>
                {showFinished &&
                  finished.map((activity) => (
                    <FinishedRow
                      key={activity.id}
                      activity={activity}
                      stream={getStreamFor(activity)}
                      onOpen={() => navigate(`/todos/activity/${activity.id}`)}
                      onDelete={() => board.handleDeleteActivity(activity.id)}
                    />
                  ))}
              </Box>
            )}
          </Box>
        </>
      )}

      <AddActivityDialog
        open={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        onAdd={board.handleAddActivity}
        streams={activityStreams}
        activities={data.activities}
      />
      <AddClientProjectDialog
        open={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        onAdd={board.handleAddClientProject}
      />
    </Box>
  )
}

export default ToDoPage
