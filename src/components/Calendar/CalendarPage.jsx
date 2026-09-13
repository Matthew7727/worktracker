import React, { useEffect, useMemo, useState } from 'react'
import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { FileUpload, Groups, Place } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { selectCalendarFile, readFile } from '../../services/fileSystem'
import {
  getMeetingsForDate,
  importMeetings,
  loadMeetings,
  updateMeeting,
} from '../../utils/calendarManager'
import { loadProjects } from '../../utils/projectsManager'
import { createNote, loadNotes, saveNote } from '../../utils/notesManager'
import { InkButton, PageHeader, Segmented, EmptyState } from '../shared/ui'
import NoteEditorInline from '../Notes/components/NoteEditorInline'

const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const startOfWeek = (date) => {
  const start = new Date(date)
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  start.setHours(0, 0, 0, 0)
  return start
}

const CalendarPage = () => {
  const { selectedDirectory, showNotification } = useAppContext()
  const [meetings, setMeetings] = useState([])
  const [activities, setActivities] = useState([])
  const [activityOptions, setActivityOptions] = useState([])
  const [projectOptions, setProjectOptions] = useState([])
  const [notes, setNotes] = useState([])
  const [noteMeeting, setNoteMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)

  const refresh = async () => {
    if (!selectedDirectory) return
    setLoading(true)
    const [meetingData, projects, noteData] = await Promise.all([
      loadMeetings(selectedDirectory),
      loadProjects(selectedDirectory),
      loadNotes(selectedDirectory),
    ])
    setMeetings(meetingData)
    setActivities([
      ...(projects.activities || []),
      ...(projects.clientProjects || []),
    ])
    setActivityOptions(projects.activities || [])
    setProjectOptions(projects.clientProjects || [])
    setNotes(noteData)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory])

  const importCalendar = async () => {
    const filePath = await selectCalendarFile()
    if (!filePath) return
    const file = await readFile(filePath)
    if (!file.success) {
      showNotification(`Could not read calendar: ${file.error}`, 'error')
      return
    }
    const imported = await importMeetings(selectedDirectory, file.data)
    showNotification(`${imported.length} meetings imported`, 'success')
    refresh()
  }

  const weekStart = useMemo(() => {
    const date = startOfWeek(new Date())
    date.setDate(date.getDate() + weekOffset * 7)
    return date
  }, [weekOffset])
  const days = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })
  const handleSaveMeetingNote = async (fields) => {
    if (!noteMeeting) return
    await saveNote(selectedDirectory, {
      ...createNote({
        meetingId: noteMeeting.id,
        meetingTitle: noteMeeting.title,
      }),
      ...fields,
      updatedAt: new Date().toISOString(),
    })
    setNoteMeeting(null)
    setNotes(await loadNotes(selectedDirectory))
  }

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%', pb: 8 }}>
      <PageHeader title="Calendar" meta={`${meetings.length} meetings stored`}>
        <InkButton startIcon={<FileUpload />} onClick={importCalendar}>
          Import .ics
        </InkButton>
      </PageHeader>

      <Typography sx={{ mb: 3, maxWidth: 720, color: 'text.secondary' }}>
        Your calendar stays local to this workspace. Import an Outlook calendar
        export to connect meetings with the work you log here.
      </Typography>

      {meetings.length === 0 ? (
        <EmptyState
          title="No meetings imported yet."
          action={
            <InkButton startIcon={<FileUpload />} onClick={importCalendar}>
              Import .ics calendar
            </InkButton>
          }
        >
          This is a local, read-only import. Outlook remains your source of
          truth.
        </EmptyState>
      ) : (
        <>
          <Segmented
            size="sm"
            ariaLabel="Calendar week"
            value={String(weekOffset)}
            onChange={(value) => setWeekOffset(Number(value))}
            sx={{ mb: 3 }}
            options={[
              { value: '-1', label: 'Last week' },
              { value: '0', label: 'This week' },
              { value: '1', label: 'Next week' },
            ]}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {days.map((day) => {
              const dayMeetings = getMeetingsForDate(meetings, day)
              return (
                <Box key={day.toISOString()}>
                  <Typography sx={{ fontWeight: 900, mb: 1.25 }}>
                    {day.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Typography>
                  <Stack spacing={1.25}>
                    {dayMeetings.length ? (
                      dayMeetings.map((meeting) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          activities={activities}
                          noteCount={
                            notes.filter(
                              (note) => note.meetingId === meeting.id
                            ).length
                          }
                          onNewNote={() => setNoteMeeting(meeting)}
                          onUpdate={async (changes) => {
                            const updated = await updateMeeting(
                              selectedDirectory,
                              meeting.id,
                              changes
                            )
                            setMeetings(updated)
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        No meetings
                      </Typography>
                    )}
                  </Stack>
                  {noteMeeting &&
                    dayMeetings.some(
                      (meeting) => meeting.id === noteMeeting.id
                    ) && (
                      <Box sx={{ mt: 1.25 }}>
                        <NoteEditorInline
                          note={null}
                          activities={activityOptions}
                          projects={projectOptions}
                          lockMeetingId={noteMeeting.id}
                          lockMeetingTitle={noteMeeting.title}
                          onSave={handleSaveMeetingNote}
                          onClose={() => setNoteMeeting(null)}
                        />
                      </Box>
                    )}
                </Box>
              )
            })}
          </Box>
        </>
      )}
    </Box>
  )
}

const MeetingCard = ({
  meeting,
  activities,
  noteCount,
  onNewNote,
  onUpdate,
}) => {
  const linkedActivities = activities.filter((activity) =>
    meeting.activityIds?.includes(activity.id)
  )
  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'text.primary',
        boxShadow: (theme) => `3px 3px 0 ${theme.palette.text.primary}`,
      }}
    >
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontWeight: 800,
          fontSize: '0.78rem',
          mb: 0.75,
        }}
      >
        {formatTime(meeting.startAt)}–{formatTime(meeting.endAt)}
      </Typography>
      <Typography sx={{ fontWeight: 900, lineHeight: 1.15, mb: 1 }}>
        {meeting.title}
      </Typography>
      {meeting.location && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mb: 0.75, color: 'text.secondary' }}
        >
          <Place sx={{ fontSize: '1rem' }} />
          <Typography variant="body2">{meeting.location}</Typography>
        </Stack>
      )}
      {meeting.attendees?.length > 0 && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mb: 1, color: 'text.secondary' }}
        >
          <Groups sx={{ fontSize: '1rem' }} />
          <Typography variant="body2">
            {meeting.attendees.length} attendees
          </Typography>
        </Stack>
      )}
      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
        {linkedActivities.map((activity) => (
          <Chip key={activity.id} label={activity.title} size="small" />
        ))}
        {activities
          .filter((activity) => !meeting.activityIds?.includes(activity.id))
          .slice(0, 1)
          .map((activity) => (
            <Chip
              key={activity.id}
              label={`+ ${activity.title}`}
              size="small"
              variant="outlined"
              onClick={() =>
                onUpdate({
                  activityIds: [...(meeting.activityIds || []), activity.id],
                })
              }
            />
          ))}
      </Stack>
      <InkButton
        tone="ghost"
        size="sm"
        onClick={onNewNote}
        sx={{ mt: 1, ml: -1 }}
      >
        {noteCount ? `Add note (${noteCount})` : 'Add note'}
      </InkButton>
    </Box>
  )
}

export default CalendarPage
