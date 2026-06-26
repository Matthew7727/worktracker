import React, { useState, useEffect } from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createActivity,
  createClientProject,
  createTask,
} from '../../utils/projectsManager'
import ActivityCard from './components/ActivityCard'
import ClientProjectsList from './components/ClientProjectsList'
import AddActivityDialog from './components/AddActivityDialog'
import AddClientProjectDialog from './components/AddClientProjectDialog'
import { sectionHeaderStyles, filterTabStyles } from './ActivitiesBoard.styles'

const ACTIVITY_FILTERS = ['ALL', 'PD', 'BD']

// ── Local shared components ───────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle, children }) => (
  <Box sx={{ ...sectionHeaderStyles, mb: 3 }}>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {children}
  </Box>
)

const AddButton = ({ label, onClick }) => (
  <Box
    component="button"
    onClick={onClick}
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
      border: '3px solid',
      borderColor: 'text.primary',
      color: 'text.primary',
      bgcolor: 'background.paper',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '6px 6px 0px',
        boxShadowColor: 'text.primary',
        '& .shine-layer': {
          opacity: 1,
          transform: 'translateX(100%) skewX(-15deg)',
        },
      },
    }}
  >
    <Add sx={{ fontSize: '1rem' }} />
    {label}
    <Box
      className="shine-layer"
      sx={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '200%',
        height: '100%',
        opacity: 0,
        transition: 'all 0.8s ease',
        background:
          'linear-gradient(90deg, transparent, #80b621, #00d2ff, #eb8449, transparent)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  </Box>
)

const ActivityGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 2.5,
    }}
  >
    {children}
  </Box>
)

// ── Board ─────────────────────────────────────────────────────────────────────

const ActivitiesBoard = () => {
  const { selectedDirectory } = useAppContext()
  const [data, setData] = useState({ activities: [], clientProjects: [] })
  const [activityFilter, setActivityFilter] = useState('ALL')
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [addProjectOpen, setAddProjectOpen] = useState(false)

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then(setData)
  }, [selectedDirectory])

  const save = (newData) => {
    setData(newData)
    saveProjects(selectedDirectory, newData)
  }

  // ── Activity handlers ──────────────────────────────────────────────────

  const handleAddActivity = (title, type) => {
    save({
      ...data,
      activities: [...data.activities, createActivity(title, type)],
    })
  }

  const handleAddTask = (activityId, text) => {
    save({
      ...data,
      activities: data.activities.map((a) =>
        a.id === activityId
          ? { ...a, tasks: [...a.tasks, createTask(text)] }
          : a
      ),
    })
  }

  const handleToggleTask = (activityId, taskId) => {
    save({
      ...data,
      activities: data.activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              tasks: a.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : a
      ),
    })
  }

  const handleDeleteTask = (activityId, taskId) => {
    save({
      ...data,
      activities: data.activities.map((a) =>
        a.id === activityId
          ? { ...a, tasks: a.tasks.filter((t) => t.id !== taskId) }
          : a
      ),
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

  const handleAddClientProject = (title) => {
    save({
      ...data,
      clientProjects: [...data.clientProjects, createClientProject(title)],
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

  const typeMatch = (a) => activityFilter === 'ALL' || a.type === activityFilter
  const activeActivities = data.activities.filter(
    (a) => a.status === 'active' && typeMatch(a)
  )
  const archivedActivities = data.activities.filter(
    (a) => a.status === 'archived' && typeMatch(a)
  )

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Box sx={{ pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
        Projects & Activities
      </Typography>

      {/* ── Client Projects ── */}
      <Box sx={{ mb: 5 }}>
        <SectionHeader
          title="Client Projects"
          subtitle="Track what client work you're doing and have done."
        >
          <AddButton
            label="Add Project"
            onClick={() => setAddProjectOpen(true)}
          />
        </SectionHeader>

        <ClientProjectsList
          projects={data.clientProjects}
          onToggleStatus={handleToggleClientProjectStatus}
          onDelete={handleDeleteClientProject}
          onRename={handleRenameClientProject}
        />
      </Box>

      <Divider sx={{ mb: 5 }} />

      {/* ── Activities ── */}
      <Box sx={{ mb: 5 }}>
        <SectionHeader title="Activities">
          <AddButton
            label="Add Activity"
            onClick={() => setAddActivityOpen(true)}
          />
        </SectionHeader>

        {/* Filter tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {ACTIVITY_FILTERS.map((f) => {
            const config = {
              ALL: { bg: 'text.primary', fg: 'background.default' },
              PD: { bg: '#ffd166', fg: '#000000' },
              BD: { bg: '#eb8449', fg: '#000000' },
            }[f]

            return (
              <Box
                key={f}
                component="button"
                onClick={() => setActivityFilter(f)}
                sx={filterTabStyles(activityFilter === f, config.bg, config.fg)}
              >
                {f === 'ALL'
                  ? 'All'
                  : f === 'PD'
                    ? 'Practice Dev'
                    : 'Business Dev'}
              </Box>
            )
          })}
        </Box>

        {activeActivities.length === 0 && archivedActivities.length === 0 ? (
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
            {activeActivities.length > 0 && (
              <ActivityGrid>
                {activeActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onAddTask={(text) => handleAddTask(activity.id, text)}
                    onToggleTask={(taskId) =>
                      handleToggleTask(activity.id, taskId)
                    }
                    onDeleteTask={(taskId) =>
                      handleDeleteTask(activity.id, taskId)
                    }
                    onFinish={() => handleFinishActivity(activity.id)}
                    onRename={(title) =>
                      handleRenameActivity(activity.id, title)
                    }
                    onDelete={() => handleDeleteActivity(activity.id)}
                  />
                ))}
              </ActivityGrid>
            )}

            {archivedActivities.length > 0 && (
              <Box sx={{ mt: activeActivities.length > 0 ? 4 : 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2.5,
                  }}
                >
                  <Divider sx={{ flex: 1 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 900,
                      color: 'text.disabled',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    Completed
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>
                <ActivityGrid>
                  {archivedActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onDelete={() => handleDeleteActivity(activity.id)}
                    />
                  ))}
                </ActivityGrid>
              </Box>
            )}
          </>
        )}
      </Box>

      <AddActivityDialog
        open={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        onAdd={handleAddActivity}
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
