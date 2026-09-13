import React, { useMemo, useState } from 'react'
import {
  Box,
  Checkbox,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import {
  CheckCircle,
  ChevronRight,
  ExpandMore,
  Star,
} from '@mui/icons-material'
import StreamTag from './StreamTag'
import TodoAgeChip from '../../shared/TodoAgeChip'
import TodoDueChip from '../../shared/TodoDueChip'

const SORT_FIELDS = {
  name: (todo) => todo.text || '',
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
}) => {
  const [sortField, setSortField] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showCompleted, setShowCompleted] = useState(false)

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
        border: '1.5px solid',
        borderColor: 'divider',
        borderRadius: '18px',
      }}
    >
      <Table
        sx={{ minWidth: 720 }}
        aria-label={completed ? 'Completed todos' : 'All open todos'}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 52 }} />
            <TableCell>{sortableHeader('name', 'Todo')}</TableCell>
            <TableCell>
              {sortableHeader('context', 'Project / activity')}
            </TableCell>
            <TableCell>{sortableHeader('dueDate', 'Due date')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
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
                      fontWeight: completed ? 500 : 650,
                      color: completed ? 'text.secondary' : 'text.primary',
                      textDecoration: completed ? 'line-through' : 'none',
                    }}
                  >
                    {todo.text}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box
                  onClick={() => onOpenItem(todo.ownerType, todo.ownerId)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    width: 'fit-content',
                    '&:hover .todo-owner': { textDecoration: 'underline' },
                  }}
                >
                  {todo.stream && (
                    <StreamTag
                      stream={todo.stream}
                      label={todo.stream.abbrev || todo.stream.name}
                      muted
                    />
                  )}
                  <Box>
                    <Typography
                      className="todo-owner"
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      {todo.ownerTitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'capitalize',
                      }}
                    >
                      {todo.ownerType}
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
      {openTodos.length > 0 ? (
        renderTable(openTodos)
      ) : (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: '20px',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            No open todos. You’re all caught up.
          </Typography>
        </Box>
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
              color: 'text.secondary',
              fontFamily: 'inherit',
              cursor: 'pointer',
              textAlign: 'left',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {showCompleted ? (
              <ExpandMore sx={{ fontSize: '1.1rem' }} />
            ) : (
              <ChevronRight sx={{ fontSize: '1.1rem' }} />
            )}
            <CheckCircle sx={{ fontSize: '1rem', color: 'primary.main' }} />
            <Typography
              component="span"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Completed
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.68rem',
                color: 'text.disabled',
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
