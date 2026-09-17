import React from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { ChevronLeft, ChevronRight, Edit } from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { useDailyEditor } from '../../components/DailyEditor/hooks/useDailyEditor'
import { DAY_STATUSES } from '../../components/DailyEditor/constants'
import { getDateKey } from '../../components/DailyEditor/utils/weekDays'
import { resolveEntryStreamId } from '../../utils/markdownParser'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { InkButton, Segmented } from '../../components/shared/ui'
import {
  PrintHeading,
  PrintLabel,
  TickBox,
  StreamMark,
  PenLink,
  BlankLine,
} from '../paper'
import { LINE, ruled, inkMarkdown, statusInk, openLink } from '../paperStyles'
import WeekToView from './WeekToView'
import EntryField from './EntryField'
import ThingsToDo from './ThingsToDo'

const isoWeek = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

const shiftDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const markdownComponents = {
  a: (props) => <a {...props} onClick={(e) => openLink(e, props.href)} />,
}

const Written = ({ children }) => {
  const ff = useFilofaxTokens()
  return (
    <Box sx={{ ...ruled(ff), ...inkMarkdown(ff), pl: 0.5, minHeight: LINE }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </Box>
  )
}

// ── Reading a filled page ───────────────────────────────────────────────────

const DayRead = ({
  dayStatus,
  dayNote,
  streams,
  streamDefs,
  projectEntries,
  onEdit,
}) => {
  const ff = useFilofaxTokens()
  const status = DAY_STATUSES.find((s) => s.id === dayStatus) || DAY_STATUSES[0]
  const editLink = (
    <PenLink startIcon={<Edit />} onClick={onEdit}>
      Edit page
    </PenLink>
  )

  if (dayStatus !== 'working') {
    return (
      <Box>
        <PrintHeading action={editLink}>Day off</PrintHeading>
        <Typography
          sx={{
            display: 'inline-block',
            my: 2,
            px: 1.5,
            py: 0.25,
            fontSize: '1.6rem',
            fontStyle: 'italic',
            color: statusInk(ff, dayStatus),
            border: `2px solid ${statusInk(ff, dayStatus)}`,
            borderRadius: '4px',
            transform: 'rotate(-3deg)',
            opacity: 0.85,
          }}
        >
          {status.label}
        </Typography>
        {dayNote ? (
          <Written>{dayNote}</Written>
        ) : (
          <BlankLine>No note for this day.</BlankLine>
        )}
      </Box>
    )
  }

  const hasProjectEntries = projectEntries.some((p) => p.content?.trim())
  const groups = hasProjectEntries
    ? streamDefs
        .map((stream) => ({
          stream,
          entries: projectEntries.filter(
            (p) => resolveEntryStreamId(p) === stream.id && p.content?.trim()
          ),
        }))
        .filter((g) => g.entries.length)
    : streamDefs
        .filter((stream) => streams[stream.id]?.trim())
        .map((stream) => ({
          stream,
          entries: [{ title: null, content: streams[stream.id] }],
        }))

  return (
    <Box>
      <PrintHeading
        aside={hasProjectEntries ? null : 'Written in the older stream format'}
        action={editLink}
      >
        The day
      </PrintHeading>
      {groups.length === 0 && (
        <BlankLine>Nothing written for this day.</BlankLine>
      )}
      {groups.map(({ stream, entries }) => (
        <Box key={stream.id} sx={{ mb: 3.5 }}>
          <StreamMark stream={stream} sx={{ mb: 0.5 }} />
          {entries.map((entry, i) => (
            <Box key={entry.title || i} sx={{ mb: 2 }}>
              {entry.title && (
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: ff.ink,
                    lineHeight: `${LINE}px`,
                  }}
                >
                  {entry.title}
                </Typography>
              )}
              <Written>{entry.content}</Written>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

// ── Writing a page ──────────────────────────────────────────────────────────

const DayWrite = ({ editor, canCancel, onCancel }) => {
  const ff = useFilofaxTokens()
  const {
    dayStatus,
    setDayStatus,
    dayNote,
    setDayNote,
    allAvailableProjects,
    selectedFlowProjects,
    toggleFlowProject,
    completedTodosByTitle,
    projectDrafts,
    updateProjectDraft,
    handleSaveDay,
    handleSaveNonWorkingDay,
    isSaving,
  } = editor
  const working = dayStatus === 'working'
  const status = DAY_STATUSES.find((s) => s.id === dayStatus)

  const groups = []
  allAvailableProjects.forEach((p) => {
    let g = groups.find((x) => x.streamId === p.streamId)
    if (!g) {
      g = {
        streamId: p.streamId,
        name: p.streamName,
        color: p.color,
        projects: [],
      }
      groups.push(g)
    }
    g.projects.push(p)
  })
  const isPicked = (p) => selectedFlowProjects.some((s) => s.title === p.title)
  // Projects written about before but no longer active still keep their page.
  const orphaned = selectedFlowProjects.filter(
    (p) => !allAvailableProjects.some((a) => a.title === p.title)
  )

  return (
    <Box>
      <PrintHeading>The day</PrintHeading>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        <PrintLabel>Kind of day</PrintLabel>
        <Segmented
          ariaLabel="Day type"
          value={dayStatus}
          onChange={setDayStatus}
          options={DAY_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
        />
      </Box>

      {working ? (
        <>
          <PrintLabel sx={{ mb: 1 }}>
            Worked on
            {selectedFlowProjects.length
              ? `, ${selectedFlowProjects.length} ticked`
              : ''}
          </PrintLabel>
          {groups.length === 0 ? (
            <BlankLine>
              No active projects or activities. Add one under the To do tab,
              then come back to log it.
            </BlankLine>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'repeat(2, minmax(0, 1fr))',
                },
                columnGap: 4,
                mb: 4,
              }}
            >
              {groups.map((g) => (
                <Box key={g.streamId} sx={{ mb: 1.5 }}>
                  <StreamMark stream={{ name: g.name, color: g.color }} />
                  {g.projects.map((p) => {
                    const done = (completedTodosByTitle?.[p.title] || []).length
                    return (
                      <Box
                        key={p.title}
                        component="label"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          minHeight: LINE,
                          borderBottom: `1px solid ${ff.rule}`,
                          cursor: 'pointer',
                        }}
                      >
                        <TickBox
                          checked={isPicked(p)}
                          onChange={() => toggleFlowProject(p)}
                          label={p.title}
                          color={ff.print}
                        />
                        <Typography
                          onClick={() => toggleFlowProject(p)}
                          sx={{ flex: 1, fontSize: '0.92rem', color: ff.ink }}
                        >
                          {p.title}
                        </Typography>
                        {done > 0 && (
                          <Typography
                            title="Todos you ticked off on this day"
                            sx={{
                              fontStyle: 'italic',
                              fontSize: '0.76rem',
                              color: 'text.secondary',
                            }}
                          >
                            {done} done
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              ))}
            </Box>
          )}

          {[...selectedFlowProjects].map((project) => {
            const ticked = completedTodosByTitle?.[project.title] || []
            return (
              <Box key={project.title} component="section" sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap',
                    borderBottom: `1px solid ${ff.ruleStrong}`,
                    mb: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: ff.ink }}>
                    {project.title}
                  </Typography>
                  <StreamMark
                    stream={{ name: project.streamName, color: project.color }}
                  />
                </Box>
                {orphaned.includes(project) && (
                  <PrintLabel>
                    No longer active; untick above to drop it.
                  </PrintLabel>
                )}
                {ticked.length > 0 && (
                  <Typography
                    sx={{
                      fontStyle: 'italic',
                      fontSize: '0.8rem',
                      color: 'text.secondary',
                      my: 0.5,
                    }}
                  >
                    Ticked off: {ticked.map((t) => t.text).join('; ')}
                  </Typography>
                )}
                <EntryField
                  label={`What you did on ${project.title}`}
                  value={projectDrafts[project.title] || ''}
                  onChange={(text) => updateProjectDraft(project.title, text)}
                  placeholder="What moved forward? Decisions, blockers, who you worked with…"
                  minRows={4}
                />
              </Box>
            )
          })}
        </>
      ) : (
        <Box sx={{ mb: 3 }}>
          <PrintLabel sx={{ mb: 0.5 }}>
            Anything to remember about it?
          </PrintLabel>
          <EntryField
            label="Day note"
            value={dayNote}
            onChange={setDayNote}
            placeholder={`A note about this ${status.label.toLowerCase()} day (optional)`}
            minRows={3}
          />
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          pt: 2,
          borderTop: `3px double ${ff.print}`,
        }}
      >
        {working && selectedFlowProjects.length === 0 && (
          <Typography
            sx={{ fontStyle: 'italic', color: 'text.secondary', mr: 'auto' }}
          >
            Tick what you worked on to start writing.
          </Typography>
        )}
        {canCancel && (
          <InkButton tone="ghost" onClick={onCancel}>
            Cancel
          </InkButton>
        )}
        <InkButton
          disabled={isSaving}
          onClick={() =>
            working
              ? handleSaveDay()
              : handleSaveNonWorkingDay(dayStatus, dayNote.trim())
          }
        >
          {working ? 'Save page' : `Save ${status.label} day`}
        </InkButton>
      </Box>
    </Box>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

const Diary = () => {
  const ff = useFilofaxTokens()
  const editor = useDailyEditor({ weekRange: 'calendar' })
  const {
    currentDate,
    setCurrentDate,
    weekStatus,
    streamDefs,
    viewMode,
    setViewMode,
    isLoading,
    quickSetDayStatus,
  } = editor
  const todayKey = getDateKey(new Date())
  const onToday = getDateKey(currentDate) === todayKey

  const dateStatus = weekStatus[getDateKey(currentDate)]
  const hadData =
    dateStatus &&
    (dateStatus.dayStatus !== 'working' ||
      Object.values(dateStatus.filled || {}).some(Boolean))

  return (
    <Box>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
          <Typography
            component="span"
            sx={{
              fontSize: { xs: '3.6rem', md: '4.6rem' },
              lineHeight: 0.8,
              color: ff.print,
            }}
          >
            {currentDate.getDate()}
          </Typography>
          <Box sx={{ pb: 0.25 }}>
            <Typography
              component="h1"
              sx={{ fontSize: '1.7rem', lineHeight: 1.1, color: ff.ink }}
            >
              {currentDate.toLocaleDateString('en-GB', { weekday: 'long' })}
            </Typography>
            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {currentDate.toLocaleDateString('en-GB', {
                month: 'long',
                year: 'numeric',
              })}
              , week {isoWeek(currentDate)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PenLink
            startIcon={<ChevronLeft />}
            onClick={() => setCurrentDate(shiftDays(currentDate, -7))}
          >
            Previous week
          </PenLink>
          {!onToday && (
            <InkButton
              tone="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </InkButton>
          )}
          <PenLink onClick={() => setCurrentDate(shiftDays(currentDate, 7))}>
            Next week
            <ChevronRight />
          </PenLink>
        </Box>
      </Box>

      <WeekToView
        currentDate={currentDate}
        weekStatus={weekStatus}
        streams={streamDefs}
        onSelectDay={setCurrentDate}
        onQuickSetDayStatus={quickSetDayStatus}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
          gap: { xs: 5, lg: 6 },
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {isLoading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : viewMode === 'summary' ? (
            <DayRead {...editor} onEdit={() => setViewMode('start')} />
          ) : (
            <DayWrite
              editor={editor}
              canCancel={!!hadData}
              onCancel={() => setViewMode('summary')}
            />
          )}
        </Box>
        <ThingsToDo date={currentDate} />
      </Box>
    </Box>
  )
}

// Opening a different day from search or the planner starts a fresh page.
const DiaryPage = () => {
  const location = useLocation()
  return <Diary key={location.state?.initialDate || location.key} />
}

export default DiaryPage
