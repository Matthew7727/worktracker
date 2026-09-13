import { readFile, writeFile } from '../services/fileSystem'

const getCalendarPath = (rootDir) => `${rootDir}/calendar/meetings.json`

const unfoldLines = (content) =>
  content.replace(/\r?\n[ \t]/g, '').split(/\r?\n/)

const valueFor = (lines, name) => {
  const line = lines.find(
    (candidate) =>
      candidate.startsWith(`${name};`) || candidate.startsWith(`${name}:`)
  )
  return line ? line.slice(line.indexOf(':') + 1).trim() : ''
}

const unescapeIcs = (value) =>
  value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')

const parseIcsDate = (value) => {
  const matched = value.match(
    /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/
  )
  if (!matched) return null
  const [, year, month, day, hour = '00', minute = '00', second = '00', utc] =
    matched
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}${utc ? 'Z' : ''}`
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const parseAttendee = (value) => {
  const emailMatch = value.match(/mailto:([^;:]+)/i)
  const nameMatch = value.match(/CN=([^;:]+)/i)
  return {
    name: unescapeIcs(nameMatch?.[1] || emailMatch?.[1] || value),
    email: emailMatch?.[1] || '',
  }
}

/** A local, intentionally small iCalendar importer for exported Outlook files. */
export const parseIcsMeetings = (content) => {
  const lines = unfoldLines(content)
  const events = []
  let eventLines = null

  lines.forEach((line) => {
    if (line === 'BEGIN:VEVENT') eventLines = []
    else if (line === 'END:VEVENT' && eventLines) {
      const externalId = valueFor(eventLines, 'UID')
      const startAt = parseIcsDate(valueFor(eventLines, 'DTSTART'))
      if (externalId && startAt) {
        events.push({
          id: `ics-${externalId.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
          externalId,
          title:
            unescapeIcs(valueFor(eventLines, 'SUMMARY')) || 'Untitled meeting',
          description: unescapeIcs(valueFor(eventLines, 'DESCRIPTION')),
          location: unescapeIcs(valueFor(eventLines, 'LOCATION')),
          organiser: parseAttendee(
            eventLines.find((candidate) => candidate.startsWith('ORGANIZER')) ||
              ''
          ),
          attendees: eventLines
            .filter((candidate) => candidate.startsWith('ATTENDEE'))
            .map(parseAttendee),
          startAt,
          endAt: parseIcsDate(valueFor(eventLines, 'DTEND')),
        })
      }
      eventLines = null
    } else if (eventLines) eventLines.push(line)
  })
  return events
}

export const loadMeetings = async (rootDir) => {
  if (!rootDir) return []
  const result = await readFile(getCalendarPath(rootDir))
  if (!result.success) return []
  try {
    return JSON.parse(result.data).meetings || []
  } catch {
    return []
  }
}

export const saveMeetings = async (rootDir, meetings) =>
  writeFile(
    getCalendarPath(rootDir),
    JSON.stringify(
      { version: 1, meetings, updatedAt: new Date().toISOString() },
      null,
      2
    )
  )

export const importMeetings = async (rootDir, content) => {
  const existing = await loadMeetings(rootDir)
  const existingByExternalId = new Map(
    existing.map((meeting) => [meeting.externalId, meeting])
  )
  const imported = parseIcsMeetings(content).map((meeting) => ({
    ...meeting,
    activityIds:
      existingByExternalId.get(meeting.externalId)?.activityIds || [],
  }))
  const importedIds = new Set(imported.map((meeting) => meeting.externalId))
  const merged = [
    ...imported,
    ...existing.filter((meeting) => !importedIds.has(meeting.externalId)),
  ]
  await saveMeetings(rootDir, merged)
  return imported
}

export const updateMeeting = async (rootDir, meetingId, changes) => {
  const meetings = await loadMeetings(rootDir)
  const updated = meetings.map((meeting) =>
    meeting.id === meetingId ? { ...meeting, ...changes } : meeting
  )
  await saveMeetings(rootDir, updated)
  return updated
}

export const getMeetingsForDate = (meetings, date) => {
  const dateKey = new Date(date).toISOString().slice(0, 10)
  return (meetings || [])
    .filter((meeting) => meeting.startAt?.slice(0, 10) === dateKey)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
}
