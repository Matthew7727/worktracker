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
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'
import {
  Add,
  ChevronRight,
  ExpandMore,
  Star,
  StarBorder,
} from '@mui/icons-material'
import StreamTag from './StreamTag'
import TodoAgeChip from '../../shared/TodoAgeChip'
import TodoDueChip from '../../shared/TodoDueChip'
import { EmptyState, MONO } from '../../shared/ui'
import { useIsFilofax } from '../../../styles/useUiStyle'

const SORT_FIELDS = {
  name: (todo) => todo.text || '',
  stream: (todo) => todo.stream?.name || '',
  context: (todo) => todo.ownerTitle || '',
  dueDate: (todo) => todo.dueDate || null,
}

const compareValues = (left, right, direction) => {
  // Todos without a due date stay at the bottom in either direction.
  if (left === null && right === null) return 0
  if (left === null) return 1
  if (right === null) return -1
  const result = String(left).localeCompare(String(right), undefined, {
    sensitivity: 'base',
  })
  return direction === 'asc' ? result : -result
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
}) => {
  const isFx = useIsFilofax()
  const [sortField, setSortField] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showCompleted, setShowCompleted] = useState(false)
  const [newText, setNewText] = useState('')
  const [newActivityId, setNewActivityId] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newImportant, setNewImportant] = useState(false)

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
  }
  const addNewTodo = () => {
    if (!newText.trim() || !newActivityId) return
    onAddTask(newActivityId, newText.trim(), {
      dueDate: newDueDate,
      important: newImportant,
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
    const valueFor = SORT_FIELDS[sortField]
    const sorted = [...activityTodos, ...projectTodos].sort((a, b) => {
      const result = compareValues(valueFor(a), valueFor(b), sortDirection)
      return result || a.text.localeCompare(b.text)
    })
    return {
      openTodos: sorted.filter(
        (todo) => !todo.completed && !todo.ownerReadOnly
      ),
      completedTodos: sorted.filter((todo) => todo.completed),
    }
  }, [
    activities,
    projects,
    streamById,
    mainFocusStream,
    getActivityStreamId,
    sortField,
    sortDirection,
  ])

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortableHeader = (field, label) => (
    <TableSortLabel
      active={sortField === field}
      direction={sortField === field ? sortDirection : 'asc'}
      onClick={() => changeSort(field)}
      sx={{ fontWeight: 800 }}
    >
      {label}
    </TableSortLabel>
  )

  const renderTable = (todos, completed = false) => (
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
            <TableCell>{sortableHeader('name', 'Todo')}</TableCell>
            <TableCell sx={{ width: 180 }}>
              {sortableHeader('stream', 'Stream')}
            </TableCell>
            <TableCell sx={{ width: 240 }}>
              {sortableHeader('context', 'Project / activity')}
            </TableCell>
            <TableCell sx={{ width: 190 }}>
              {sortableHeader('dueDate', 'Due date')}
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
          {todos.map((todo) => (
            <TableRow
              hover
              key={`${todo.ownerType}-${todo.ownerId}-${todo.id}`}
            >
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {todo.important && (
                    <Star sx={{ fontSize: '0.9rem', color: '#f59e0b' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isFx ? 400 : completed ? 500 : 650,
                      color: completed ? 'text.secondary' : 'text.primary',
                      textDecoration: completed ? 'line-through' : 'none',
                    }}
                  >
                    {todo.text}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {todo.stream ? (
                  <StreamTag stream={todo.stream} label={todo.stream.name} />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
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
                    '&:hover .todo-owner': { textDecoration: 'underline' },
                  }}
                >
                  <Box>
                    <Typography
                      className="todo-owner"
                      sx={{ fontWeight: isFx ? 400 : 800, fontSize: '0.9rem' }}
                    >
                      {todo.ownerTitle}
                    </Typography>
                    <Typography
                      sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                    >
                      {todo.ownerType === 'project' ? 'Project' : 'Activity'}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {todo.dueDate ? (
                    <TodoDueChip item={todo} />
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      No due date
                    </Typography>
                  )}
                  {!todo.dueDate && <TodoAgeChip item={todo} />}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

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
