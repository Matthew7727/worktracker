import React, { useEffect, useState } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { CalendarMonth, Groups, Place } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import {
  getMeetingsForDate,
  loadMeetings,
} from '../../../utils/calendarManager'

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

const MeetingContext = ({ date }) => {
  const { selectedDirectory } = useAppContext()
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState([])

  useEffect(() => {
    if (!selectedDirectory) return
    loadMeetings(selectedDirectory).then((allMeetings) => {
      setMeetings(getMeetingsForDate(allMeetings, date))
    })
  }, [selectedDirectory, date])

  if (!meetings.length) return null

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: '2px solid',
        borderColor: 'text.primary',
        bgcolor: 'background.subtle',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
        <CalendarMonth fontSize="small" />
        <Typography sx={{ fontWeight: 900 }}>Meetings today</Typography>
      </Stack>
      <Stack spacing={1}>
        {meetings.map((meeting) => (
          <Box
            key={meeting.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {formatTime(meeting.startAt)}
            </Typography>
            <Typography sx={{ fontWeight: 800 }}>{meeting.title}</Typography>
            {meeting.location && (
              <Chip icon={<Place />} label={meeting.location} size="small" />
            )}
            {meeting.attendees?.length > 0 && (
              <Chip
                icon={<Groups />}
                label={meeting.attendees.length}
                size="small"
              />
            )}
            <Typography
              component="button"
              type="button"
              onClick={() => navigate('/calendar')}
              sx={{
                border: 'none',
                p: 0,
                bgcolor: 'transparent',
                font: 'inherit',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Open
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default MeetingContext
