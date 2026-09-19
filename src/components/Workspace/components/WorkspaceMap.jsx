import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { ForceGraph2D } from 'react-force-graph'

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
  return {
    nodes: uniqueNodes.map((node) => ({
      ...node,
      color: TYPE_META[node.type].color,
      val: node.type === 'goal' ? 7 : node.type === 'activity' ? 5 : 3.5,
    })),
    links: uniqueEdges.map((edge) => ({
      ...edge,
      source: edge.from,
      target: edge.to,
    })),
  }
}

const WorkspaceMap = ({ rootDir, streams, onOpen }) => {
  const [loading, setLoading] = useState(true)
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [selectedId, setSelectedId] = useState(null)
  const graphRef = useRef()

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
    const ids = graph.links
      .filter((edge) => edge.from === selected.id || edge.to === selected.id)
      .map((edge) => (edge.from === selected.id ? edge.to : edge.from))
    return graph.nodes.filter((node) => ids.includes(node.id))
  }, [graph, selected])

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
      <Box
        sx={{
          minWidth: 0,
          height: 620,
          position: 'relative',
          bgcolor: '#1c1c1c',
        }}
      >
        {graph.nodes.length ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graph}
            backgroundColor="#1c1c1c"
            nodeLabel={(node) => `${TYPE_META[node.type].label}: ${node.title}`}
            nodeColor={(node) => node.color}
            nodeVal={(node) => node.val}
            linkColor={(link) =>
              link.from === selectedId || link.to === selectedId
                ? '#f4f0e6'
                : 'rgba(255,255,255,0.18)'
            }
            linkWidth={(link) =>
              link.from === selectedId || link.to === selectedId ? 1.8 : 0.65
            }
            onNodeClick={(node) => setSelectedId(node.id)}
            onNodeHover={(node) => {
              document.body.style.cursor = node ? 'pointer' : 'default'
            }}
            nodeCanvasObject={(node, context, scale) => {
              const radius = node.val + (node.id === selectedId ? 3 : 0)
              context.beginPath()
              context.arc(node.x, node.y, radius, 0, 2 * Math.PI)
              context.fillStyle = node.color
              context.fill()
              if (node.id === selectedId) {
                context.lineWidth = 2 / scale
                context.strokeStyle = '#fff'
                context.stroke()
              }
              if (scale > 1.6 || node.id === selectedId) {
                context.font = `${12 / scale}px ${MONO}`
                context.fillStyle = '#f4f0e6'
                context.fillText(
                  truncate(node.title, 28),
                  node.x + radius + 4 / scale,
                  node.y + 3 / scale
                )
              }
            }}
            onEngineStop={() => graphRef.current?.zoomToFit(500, 65)}
          />
        ) : (
          <Typography sx={{ p: 5, color: '#f4f0e6', fontWeight: 800 }}>
            No connected work yet. Link a goal to an activity, to-do, note, or
            entry and it will appear here.
          </Typography>
        )}
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
