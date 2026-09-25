import React, { useMemo, useState } from 'react'
import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  Add,
  ChevronRight,
  Edit,
  ExpandMore,
  Repeat,
  Star,
  StarBorder,
} from '@mui/icons-material'
import StreamTag from './StreamTag'
import TodoAgeChip from '../../shared/TodoAgeChip'
import TodoDueChip from '../../shared/TodoDueChip'
import TodoRecurrenceChip from '../../shared/TodoRecurrenceChip'
import RecurrencePicker from '../../shared/RecurrencePicker'
import { EmptyState, MONO } from '../../shared/ui'
import { useIsFilofax } from '../../../styles/useUiStyle'
import {
  getTaskDueInDays,
  isTaskDueThisWeek,
  sortTasksByUrgency,
} from '../../../utils/taskUrgency'

const groupOpenTodosByDueDate = (todos) => {
  const groups = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
    noDueDate: [],
  }

  sortTasksByUrgency(todos).forEach((todo) => {
    const dueInDays = getTaskDueInDays(todo)
    if (dueInDays === null) groups.noDueDate.push(todo)
    else if (dueInDays < 0) groups.overdue.push(todo)
    else if (dueInDays === 0) groups.today.push(todo)
    else if (isTaskDueThisWeek(todo)) groups.thisWeek.push(todo)
    else groups.later.push(todo)
  })

  return [
    ['Overdue', groups.overdue],
    ['Due today', groups.today],
    ['Due this week', groups.thisWeek],
    ['Later', groups.later],
    ['No due date', groups.noDueDate],
  ].filter(([, todosInGroup]) => todosInGroup.length)
}

const AllTodosView = ({
  activities,
  projects,
  streamById,
  mainFocusStream,
  getActivityStreamId,
  onOpenItem,
  onToggleTask,
  onAddTask,
  onRenameTask,
  onSetTaskRecurrence,
}) => {
  const isFx = useIsFilofax()
  const [showCompleted, setShowCompleted] = useState(false)
  const [newText, setNewText] = useState('')
  const [newActivityId, setNewActivityId] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newImportant, setNewImportant] = useState(false)
  const [newRecurrence, setNewRecurrence] = useState(null)
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false)
  const [recurrenceTodo, setRecurrenceTodo] = useState(null)
  const [editingTodo, setEditingTodo] = useState(null)
  const [draftText, setDraftText] = useState('')

  const activeActivities = useMemo(
    () => (activities || []).filter((activity) => activity.status === 'active'),
    [activities]
  )
  const selectedActivity = activeActivities.find(
    (activity) => activity.id === newActivityId
  )
  const resetNewTodo = () => {
    setNewText('')
    setNewActivityId('')
    setNewDueDate('')
    setNewImportant(false)
    setNewRecurrence(null)
    setShowRecurrencePicker(false)
  }
  const addNewTodo = () => {
    if (!newText.trim() || !newActivityId) return
    onAddTask(newActivityId, newText.trim(), {
      dueDate: newDueDate,
      important: newImportant,
      recurrence: newRecurrence,
    })
    resetNewTodo()
  }

  const { openTodos, completedTodos } = useMemo(() => {
    const activityTodos = (activities || []).flatMap((activity) =>
      (activity.tasks || []).map((task) => ({
        ...task,
        ownerId: activity.id,
        ownerTitle: activity.title,
        ownerType: 'activity',
        ownerReadOnly: activity.status !== 'active',
        stream: streamById[getActivityStreamId(activity)],
      }))
    )
    const projectTodos = (projects || []).flatMap((project) =>
      (project.tasks || []).map((task) => ({
        ...task,
        ownerId: project.id,
        ownerTitle: project.title,
        ownerType: 'project',
        ownerReadOnly: project.status !== 'active',
        stream: mainFocusStream,
      }))
    )
    return {
      openTodos: [...activityTodos, ...projectTodos].filter(
        (todo) => !todo.completed && !todo.ownerReadOnly
      ),
      completedTodos: [...activityTodos, ...projectTodos].filter(
        (todo) => todo.completed
      ),
    }
  }, [activities, projects, streamById, mainFocusStream, getActivityStreamId])

  const openTodoGroups = useMemo(
    () => groupOpenTodosByDueDate(openTodos),
    [openTodos]
  )

  const todoKey = (todo) => `${todo.ownerType}-${todo.ownerId}-${todo.id}`

  const startEditingTodo = (todo) => {
    setDraftText(todo.text)
    setEditingTodo(todoKey(todo))
  }

  const saveTodoText = (todo) => {
    const text = draftText.trim()
    if (text && text !== todo.text) {
      onRenameTask?.(todo.ownerType, todo.ownerId, todo.id, text)
    }
    setEditingTodo(null)
  }

  const renderTable = (todos, completed = false) => {
    const groups = completed ? [[null, todos]] : openTodoGroups

    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: isFx ? 'none' : '3px solid',
          bgcolor: isFx ? 'transparent' : undefined,
          borderColor: 'text.primary',
          '& .MuiTableCell-root': {
            borderColor: 'divider',
            borderBottomWidth: 2,
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            bgcolor: isFx ? 'transparent' : 'background.subtle',
            borderBottom: isFx ? '1px solid' : '3px solid',
            borderColor: 'text.primary',
          },
        }}
      >
        <Table
          sx={{ minWidth: 880 }}
          aria-label={completed ? 'Completed todos' : 'All open todos'}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 52 }} />
              <TableCell sx={{ fontWeight: 800 }}>Todo</TableCell>
              <TableCell sx={{ width: 180, fontWeight: 800 }}>Stream</TableCell>
              <TableCell sx={{ width: 240, fontWeight: 800 }}>
                Project / activity
              </TableCell>
              <TableCell sx={{ width: 190, fontWeight: 800 }}>
                Due date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!completed && (
              <TableRow sx={{ bgcolor: isFx ? 'transparent' : 'action.hover' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={newImportant}
                    icon={<StarBorder fontSize="small" />}
                    checkedIcon={<Star fontSize="small" />}
                    onChange={(event) => setNewImportant(event.target.checked)}
                    inputProps={{ 'aria-label': 'Mark new todo as important' }}
                    sx={{ '&.Mui-checked': { color: '#f59e0b' } }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add a to-do…"
                    value={newText}
                    onChange={(event) => setNewText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') addNewTodo()
                    }}
                    inputProps={{ 'aria-label': 'New todo' }}
                  />
                </TableCell>
                <TableCell>
                  {selectedActivity ? (
                    <StreamTag
                      stream={streamById[getActivityStreamId(selectedActivity)]}
                      label={
                        streamById[getActivityStreamId(selectedActivity)]?.name
                      }
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={newActivityId}
                    onChange={(event) => setNewActivityId(event.target.value)}
                    SelectProps={{ displayEmpty: true }}
                    inputProps={{ 'aria-label': 'Activity for new todo' }}
                  >
                    <MenuItem value="" disabled>
                      Choose an activity
                    </MenuItem>
                    {activeActivities.map((activity) => (
                      <MenuItem key={activity.id} value={activity.id}>
                        {activity.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TextField
                      size="small"
                      type="date"
                      value={newDueDate}
                      onChange={(event) => setNewDueDate(event.target.value)}
                      inputProps={{ 'aria-label': 'Due date for new todo' }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setShowRecurrencePicker((open) => !open)}
                      aria-label="Repeat new todo"
                      sx={{
                        p: 0.5,
                        color: newRecurrence ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      <Repeat fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={addNewTodo}
                      disabled={!newText.trim() || !newActivityId}
                      aria-label="Add todo"
                      sx={{ p: 0.5 }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {!completed && showRecurrencePicker && (
              <TableRow sx={{ bgcolor: isFx ? 'transparent' : 'action.hover' }}>
                <TableCell colSpan={5}>
                  <RecurrencePicker
                    value={newRecurrence}
                    onChange={setNewRecurrence}
                  />
                </TableCell>
              </TableRow>
            )}
            {groups.flatMap(([label, todosInGroup]) => [
              label && (
                <TableRow
                  key={`divider-${label}`}
                  sx={{
                    bgcolor: isFx ? 'transparent' : 'background.subtle',
                  }}
                >
                  <TableCell colSpan={5} sx={{ py: 0.75 }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color:
                          label === 'Overdue' ? 'error.main' : 'text.secondary',
                      }}
                    >
                      {label}
                    </Typography>
                  </TableCell>
                </TableRow>
              ),
              ...todosInGroup.map((todo) => (
                <React.Fragment
                  key={`${todo.ownerType}-${todo.ownerId}-${todo.id}`}
                >
                  <TableRow hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={completed}
                        disabled={todo.ownerReadOnly}
                        aria-label={`${completed ? 'Reopen' : 'Complete'} ${todo.text}`}
                        onChange={() =>
                          onToggleTask(todo.ownerType, todo.ownerId, todo.id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        {todo.important && (
                          <Star sx={{ fontSize: '0.9rem', color: '#f59e0b' }} />
                        )}
                        {editingTodo === todoKey(todo) ? (
                          <TextField
                            autoFocus
                            fullWidth
                            size="small"
                            value={draftText}
                            onChange={(event) =>
                              setDraftText(event.target.value)
                            }
                            onBlur={() => saveTodoText(todo)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                event.currentTarget.blur()
                              }
                              if (event.key === 'Escape') {
                                event.preventDefault()
                                setEditingTodo(null)
                              }
                            }}
                            inputProps={{ 'aria-label': `Rename ${todo.text}` }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              fontWeight: isFx ? 400 : completed ? 500 : 650,
                              color: completed
                                ? 'text.secondary'
                                : 'text.primary',
                              textDecoration: completed
                                ? 'line-through'
                                : 'none',
                            }}
                          >
                            {todo.text}
                          </Typography>
                        )}
                        {onRenameTask &&
                          !todo.ownerReadOnly &&
                          editingTodo !== todoKey(todo) && (
                            <IconButton
                              size="small"
                              onClick={() => startEditingTodo(todo)}
                              aria-label={`Rename ${todo.text}`}
                              sx={{ p: 0.25 }}
                            >
                              <Edit sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {todo.stream ? (
                        <StreamTag
                          stream={todo.stream}
                          label={todo.stream.name}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.disabled' }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        onClick={() => onOpenItem(todo.ownerType, todo.ownerId)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          width: 'fit-content',
                          '&:hover .todo-owner': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <Box>
                          <Typography
                            className="todo-owner"
                            sx={{
                              fontWeight: isFx ? 400 : 800,
                              fontSize: '0.9rem',
                            }}
                          >
                            {todo.ownerTitle}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: 'text.secondary',
                            }}
                          >
                            {todo.ownerType === 'project'
                              ? 'Project'
                              : 'Activity'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {todo.dueDate ? (
                          <TodoDueChip item={todo} />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.disabled' }}
                          >
                            No due date
                          </Typography>
                        )}
                        {!todo.dueDate && <TodoAgeChip item={todo} />}
                        <TodoRecurrenceChip item={todo} />
                        {!completed &&
                          !todo.ownerReadOnly &&
                          onSetTaskRecurrence && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                setRecurrenceTodo((current) =>
                                  current === todo.id ? null : todo.id
                                )
                              }
                              aria-label={`Set repeat for ${todo.text}`}
                              sx={{
                                p: 0.25,
                                ml: 'auto',
                                color: todo.recurrence
                                  ? 'text.primary'
                                  : 'text.disabled',
                              }}
                            >
                              <Repeat fontSize="small" />
                            </IconButton>
                          )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  {recurrenceTodo === todo.id && !completed && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <RecurrencePicker
                          value={todo.recurrence}
                          onChange={(recurrence) =>
                            onSetTaskRecurrence?.(
                              todo.ownerType,
                              todo.ownerId,
                              todo.id,
                              recurrence
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )),
            ])}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Box>
      {openTodos.length > 0 || activeActivities.length > 0 ? (
        renderTable(openTodos)
      ) : (
        <EmptyState title="No open todos.">
          Everything on your projects and activities is ticked off.
        </EmptyState>
      )}

      {completedTodos.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box
            component="button"
            onClick={() => setShowCompleted((visible) => !visible)}
            aria-expanded={showCompleted}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
              p: 1,
              border: 0,
              bgcolor: 'transparent',
              color: 'text.primary',
              fontFamily: 'inherit',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {showCompleted ? (
              <ExpandMore sx={{ fontSize: '1.1rem' }} />
            ) : (
              <ChevronRight sx={{ fontSize: '1.1rem' }} />
            )}
            <Typography
              component="span"
              sx={{ fontSize: '1rem', fontWeight: 900 }}
            >
              Completed
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: MONO,
                fontSize: '0.8rem',
                color: 'text.secondary',
              }}
            >
              {completedTodos.length}
            </Typography>
          </Box>
          <Collapse in={showCompleted} unmountOnExit>
            {renderTable(completedTodos, true)}
          </Collapse>
        </Box>
      )}
    </Box>
  )
}

export default AllTodosView
