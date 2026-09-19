import React, { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import {
  AccountTree,
  ArrowOutward,
  Assignment,
  Flag,
  Notes,
  Today,
} from '@mui/icons-material'
import { loadAllEntries } from '../../../utils/DataManager'
import { loadProjects } from '../../../utils/projectsManager'
import { loadNotes } from '../../../utils/notesManager'
import { loadGoals } from '../../../utils/goalsManager'
import { InkButton, MONO } from '../../shared/ui'

const TYPE_META = {
  goal: { label: 'Goal', color: '#9b87f5', icon: Flag },
  activity: { label: 'Activity', color: '#80b621', icon: AccountTree },
  project: { label: 'Project', color: '#4794d9', icon: AccountTree },
  todo: { label: 'To-do', color: '#eb8449', icon: Assignment },
  note: { label: 'Note', color: '#f0c85a', icon: Notes },
  entry: { label: 'Entry', color: '#8494a7', icon: Today },
}

const nodeId = (type, id) => `${type}:${id}`
const truncate = (value, length = 56) =>
  value?.length > length
    ? `${value.slice(0, length - 1)}…`
    : value || 'Untitled'

const buildGraph = ({ entries, data, notes, goals }) => {
  const sources = [
    ...data.activities.map((item) => ({ ...item, type: 'activity' })),
    ...data.clientProjects.map((item) => ({ ...item, type: 'project' })),
  ]
  const nodes = []
  const edges = []
  const addNode = (type, item, title, detail = '') =>
    nodes.push({ id: nodeId(type, item.id), type, item, title, detail })
  const addEdge = (from, to, label) => {
    if (from !== to) edges.push({ id: `${from}-${to}`, from, to, label })
  }

  goals.forEach((goal) =>
    addNode('goal', goal, goal.title || 'Untitled goal', goal.targetDate || '')
  )
  sources.forEach((item) => {
    addNode(
      item.type,
      item,
      item.title,
      item.status === 'active' ? 'Active' : 'Completed'
    )
    ;(item.goalIds || []).forEach((goalId) =>
      addEdge(nodeId(item.type, item.id), nodeId('goal', goalId), 'supports')
    )
    ;(item.tasks || []).forEach((task) => {
      addNode('todo', task, task.text, task.completed ? 'Completed' : 'Open')
      addEdge(nodeId('todo', task.id), nodeId(item.type, item.id), 'belongs to')
      ;(task.goalIds || []).forEach((goalId) =>
        addEdge(nodeId('todo', task.id), nodeId('goal', goalId), 'supports')
      )
    })
  })
  notes.forEach((note) => {
    addNode(
      'note',
      note,
      note.title || truncate(note.content, 42),
      note.updatedAt?.slice(0, 10) || ''
    )
    if (note.taskId)
      addEdge(nodeId('note', note.id), nodeId('todo', note.taskId), 'notes')
    else if (note.activityId)
      addEdge(
        nodeId('note', note.id),
        nodeId('activity', note.activityId),
        'notes'
      )
    else if (note.projectId)
      addEdge(
        nodeId('note', note.id),
        nodeId('project', note.projectId),
        'notes'
      )
  })
  const sourceByTitle = new Map(
    sources.map((item) => [item.title?.trim().toLowerCase(), item])
  )
  entries.forEach((entry) => {
    let hasLinks = false
    const addEntryNode = () => {
      if (hasLinks) return
      addNode('entry', entry, entry.date, truncate(entry.content, 60))
      hasLinks = true
    }
    const historicTitles = [
      ...Object.values(entry.metadata?.projects || {}).flat(),
      ...(entry.metadata?.clientProjects || []),
      ...(entry.metadata?.pdActivities || []),
      ...(entry.metadata?.bdActivities || []),
    ]
    historicTitles.forEach((title) => {
      const source = sourceByTitle.get(title?.trim().toLowerCase())
      if (!source) return
      addEntryNode()
      addEdge(
        nodeId('entry', entry.id),
        nodeId(source.type, source.id),
        'recorded work'
      )
    })
    Object.entries(entry.metadata?.streamGoalIds || {}).forEach(
      ([stream, goalIds]) => {
        if (!goalIds?.length) return
        addEntryNode()
        goalIds.forEach((goalId) =>
          addEdge(nodeId('entry', entry.id), nodeId('goal', goalId), stream)
        )
      }
    )
  })

  const validIds = new Set(nodes.map((node) => node.id))
  const uniqueNodes = [
    ...new Map(nodes.map((node) => [node.id, node])).values(),
  ]
  const uniqueEdges = [
    ...new Map(
      edges
        .filter((edge) => validIds.has(edge.from) && validIds.has(edge.to))
        .map((edge) => [edge.id, edge])
    ).values(),
  ]
  const columns = {
    goal: 70,
    activity: 365,
    project: 365,
    todo: 660,
    note: 955,
    entry: 1250,
  }
  const offsets = {}
  const positioned = uniqueNodes.map((node) => {
    const key = node.type === 'project' ? 'activity' : node.type
    const index = offsets[key] || 0
    offsets[key] = index + 1
    return { ...node, x: columns[node.type], y: 80 + index * 108 }
  })
  return { nodes: positioned, edges: uniqueEdges }
}

const WorkspaceMap = ({ rootDir, streams, onOpen }) => {
  const [loading, setLoading] = useState(true)
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const [entries, data, notes, goals] = await Promise.all([
        loadAllEntries(rootDir, streams),
        loadProjects(rootDir),
        loadNotes(rootDir),
        loadGoals(rootDir),
      ])
      if (active) {
        const next = buildGraph({ entries, data, notes, goals })
        setGraph(next)
        setSelectedId(next.nodes[0]?.id || null)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [rootDir, streams])

  const selected = graph.nodes.find((node) => node.id === selectedId) || null
  const connected = useMemo(() => {
    if (!selected) return []
    const ids = graph.edges
      .filter((edge) => edge.from === selected.id || edge.to === selected.id)
      .map((edge) => (edge.from === selected.id ? edge.to : edge.from))
    return graph.nodes.filter((node) => ids.includes(node.id))
  }, [graph, selected])
  const byId = useMemo(
    () => Object.fromEntries(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes]
  )
  const maxY = Math.max(640, ...graph.nodes.map((node) => node.y + 120))

  if (loading)
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
        minHeight: 620,
        border: '3px solid',
        borderColor: 'text.primary',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ minWidth: 0, overflow: 'auto', bgcolor: 'background.subtle' }}>
        <Box
          sx={{
            position: 'relative',
            minWidth: 1540,
            height: maxY,
            backgroundImage: 'radial-gradient(#b7b2a8 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        >
          <svg
            width="1540"
            height={maxY}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {graph.edges.map((edge) => {
              const from = byId[edge.from]
              const to = byId[edge.to]
              if (!from || !to) return null
              const highlighted =
                selected &&
                (edge.from === selected.id || edge.to === selected.id)
              return (
                <line
                  key={edge.id}
                  x1={from.x + 190}
                  y1={from.y + 34}
                  x2={to.x + 190}
                  y2={to.y + 34}
                  stroke={highlighted ? '#1b1b1b' : '#a39e93'}
                  strokeWidth={highlighted ? 3 : 1.5}
                />
              )
            })}
          </svg>
          {graph.nodes.map((node) => {
            const meta = TYPE_META[node.type]
            const Icon = meta.icon
            const isSelected = node.id === selectedId
            return (
              <Box
                key={node.id}
                component="button"
                type="button"
                onClick={() => setSelectedId(node.id)}
                sx={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: 190,
                  textAlign: 'left',
                  border: isSelected ? '3px solid' : '1.5px solid',
                  borderColor: 'text.primary',
                  borderLeft: `8px solid ${meta.color}`,
                  bgcolor: isSelected ? 'background.paper' : '#fffdf7',
                  p: 1,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '4px 4px 0 #1b1b1b' : 'none',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.35,
                  }}
                >
                  <Icon sx={{ fontSize: '0.9rem', color: meta.color }} />
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}
                  >
                    {meta.label}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    lineHeight: 1.15,
                  }}
                >
                  {truncate(node.title, 32)}
                </Typography>
                {node.detail && (
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: '0.66rem',
                      color: 'text.secondary',
                      lineHeight: 1.2,
                    }}
                  >
                    {truncate(node.detail, 38)}
                  </Typography>
                )}
              </Box>
            )
          })}
          {graph.nodes.length === 0 && (
            <Typography sx={{ p: 5, fontWeight: 800 }}>
              No connected work yet. Link a goal to an activity, to-do, note, or
              entry and it will appear here.
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        component="aside"
        sx={{
          borderLeft: { lg: '3px solid' },
          borderColor: 'text.primary',
          p: 2.25,
          overflowY: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        {selected ? (
          <>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 800,
                color: TYPE_META[selected.type].color,
              }}
            >
              {TYPE_META[selected.type].label.toUpperCase()}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontWeight: 900,
                fontSize: '1.45rem',
                lineHeight: 1.05,
              }}
            >
              {selected.title}
            </Typography>
            {selected.detail && (
              <Typography
                sx={{ mt: 1, color: 'text.secondary', fontSize: '0.88rem' }}
              >
                {selected.detail}
              </Typography>
            )}
            <InkButton
              size="sm"
              tone="outline"
              endIcon={<ArrowOutward />}
              onClick={() => onOpen(selected)}
              sx={{ mt: 2 }}
            >
              Open item
            </InkButton>
            <Typography sx={{ mt: 3, mb: 1, fontWeight: 900 }}>
              Directly linked
            </Typography>
            {connected.length ? (
              connected.map((node) => (
                <Box
                  key={node.id}
                  component="button"
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  sx={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    p: 1,
                    mb: 0.75,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'text.primary',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: TYPE_META[node.type].color,
                      fontFamily: MONO,
                      fontWeight: 800,
                    }}
                  >
                    {TYPE_META[node.type].label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    {truncate(node.title, 42)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No direct links.
              </Typography>
            )}
          </>
        ) : (
          <Typography sx={{ fontWeight: 800 }}>
            Select a node to inspect it.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default WorkspaceMap
