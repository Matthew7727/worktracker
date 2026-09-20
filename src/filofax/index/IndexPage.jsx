import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Collapse, CircularProgress } from '@mui/material'
import { ChevronRight, ExpandMore, Search } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { loadAllEntries } from '../../utils/DataManager'
import { filterEntriesByRange, buildExport } from '../../utils/exportEntries'
import GlobalSearch from '../../components/Layout/components/GlobalSearch'
import { InkButton, Segmented } from '../../components/shared/ui'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import {
  PageHead,
  PrintHeading,
  PrintLabel,
  BlankLine,
  PenLink,
} from '../paper'
import { LINE, SERIF, statusInk } from '../paperStyles'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const STATUS_LABEL = { pto: 'PTO', sick: 'Sick', volunteering: 'Volunteering' }

// First readable line of an entry, for the contents listing.
const firstLine = (content) =>
  (content || '')
    .split('\n')
    .filter((l) => !/^\s*#/.test(l))
    .map((l) =>
      l
        .replace(/[*_`>]/g, '')
        .replace(/^\s*(-|\d+\.)\s+/, '')
        .trim()
    )
    .find((l) => l.length > 0) || ''

const IndexPage = () => {
  const ff = useFilofaxTokens()
  const navigate = useNavigate()
  const {
    selectedDirectory,
    setProjectDirectory,
    showNotification,
    streamConfig,
    refreshTrigger,
  } = useAppContext()
  const [entries, setEntries] = useState(null)
  const [openYears, setOpenYears] = useState(
    () => new Set([String(new Date().getFullYear())])
  )
  const [openMonths, setOpenMonths] = useState(() => {
    const now = new Date()
    return new Set([`${now.getFullYear()}-${now.getMonth()}`])
  })
  const [range, setRange] = useState('all')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!selectedDirectory || !streamConfig) return
    loadAllEntries(selectedDirectory, streamConfig.streams).then(setEntries)
  }, [selectedDirectory, streamConfig, refreshTrigger])

  const tree = useMemo(() => {
    const t = {}
    ;(entries || []).forEach((e) => {
      const d = new Date(`${e.date}T12:00:00`)
      const y = String(d.getFullYear())
      t[y] = t[y] || {}
      t[y][d.getMonth()] = t[y][d.getMonth()] || []
      t[y][d.getMonth()].push(e)
    })
    return t
  }, [entries])

  const toggle = (setter, key) =>
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const handleExport = async (format) => {
    if (!selectedDirectory) return
    setExporting(true)
    try {
      const all = await loadAllEntries(selectedDirectory)
      const now = new Date()
      const { content, extension } = buildExport(
        filterEntriesByRange(all, range, now),
        format,
        range,
        now
      )
      const { canceled, filePath } = await window.electronAPI.saveFile({
        title: `Export ${format.toUpperCase()}`,
        defaultPath: `work-tracker-export-${now.toISOString().split('T')[0]}.${extension}`,
        buttonLabel: 'Export',
        filters: [{ name: format.toUpperCase(), extensions: [extension] }],
      })
      if (canceled || !filePath) {
        showNotification('Export cancelled', 'info')
      } else {
        const result = await window.electronAPI.writeFile(filePath, content)
        if (result.success) showNotification('Exported', 'success')
        else showNotification(`Export failed: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  const groupButton = (label, count, open, onClick, level) => (
    <Box
      component="button"
      type="button"
      aria-expanded={open}
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'baseline',
        gap: 1,
        py: level === 0 ? 0.75 : 0.5,
        pl: level === 0 ? 0 : 3,
        border: 'none',
        borderBottom: `1px solid ${level === 0 ? ff.ruleStrong : ff.rule}`,
        background: 'none',
        fontFamily: SERIF,
        fontSize: level === 0 ? '1.5rem' : '1rem',
        color: ff.print,
        textAlign: 'left',
        cursor: 'pointer',
        '& svg': { alignSelf: 'center', fontSize: '1.1rem' },
      }}
    >
      {open ? <ExpandMore /> : <ChevronRight />}
      {label}
      {/* Dot leaders to the page count, as on a printed contents page */}
      <Box
        component="span"
        aria-hidden
        sx={{ flex: 1, borderBottom: `1px dotted ${ff.ruleStrong}`, mx: 1 }}
      />
      <Box
        component="span"
        sx={{
          fontStyle: 'italic',
          fontSize: '0.82rem',
          color: 'text.secondary',
        }}
      >
        {count} {count === 1 ? 'day' : 'days'}
      </Box>
    </Box>
  )

  const years = Object.keys(tree).sort((a, b) => b - a)

  return (
    <Box>
      <PageHead
        title="Index"
        aside="Every day on file, how to find it, and how to take it with you"
      >
        <GlobalSearch
          rootDir={selectedDirectory}
          onResultClick={(result) =>
            navigate(result.kind === 'note' ? '/notes' : '/', {
              state: result.date
                ? { initialDate: `${result.date}T12:00:00` }
                : undefined,
            })
          }
          renderTrigger={(open) => (
            <InkButton tone="outline" startIcon={<Search />} onClick={open}>
              Search entries
            </InkButton>
          )}
        />
      </PageHead>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
          gap: { xs: 5, lg: 6 },
          alignItems: 'start',
        }}
      >
        <Box component="section" aria-label="Contents">
          {entries === null ? (
            <CircularProgress size={24} />
          ) : entries.length === 0 ? (
            <BlankLine>
              No days on file yet. Pages you write in the Diary are listed here.
            </BlankLine>
          ) : (
            years.map((year) => {
              const months = Object.keys(tree[year])
                .map(Number)
                .sort((a, b) => b - a)
              const total = months.reduce((n, m) => n + tree[year][m].length, 0)
              return (
                <Box key={year} sx={{ mb: 1.5 }}>
                  {groupButton(
                    year,
                    total,
                    openYears.has(year),
                    () => toggle(setOpenYears, year),
                    0
                  )}
                  <Collapse in={openYears.has(year)}>
                    {months.map((m) => {
                      const key = `${year}-${m}`
                      const list = tree[year][m]
                      return (
                        <Box key={key}>
                          {groupButton(
                            MONTHS[m],
                            list.length,
                            openMonths.has(key),
                            () => toggle(setOpenMonths, key),
                            1
                          )}
                          <Collapse in={openMonths.has(key)}>
                            {list.map((entry) => {
                              const d = new Date(`${entry.date}T12:00:00`)
                              const status = entry.metadata?.dayStatus
                              const off = status && status !== 'working'
                              return (
                                <Box
                                  key={entry.id}
                                  component="button"
                                  type="button"
                                  onClick={() =>
                                    navigate('/', {
                                      state: {
                                        initialDate: `${entry.date}T12:00:00`,
                                      },
                                    })
                                  }
                                  sx={{
                                    width: '100%',
                                    display: 'grid',
                                    gridTemplateColumns:
                                      '2.25rem 5.5rem minmax(0, 1fr) auto',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    minHeight: LINE,
                                    pl: 6,
                                    pr: 0,
                                    border: 'none',
                                    borderBottom: `1px solid ${ff.rule}`,
                                    background: 'none',
                                    fontFamily: SERIF,
                                    color: ff.ink,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover' },
                                  }}
                                >
                                  <Typography
                                    sx={{ fontSize: '1rem', color: ff.print }}
                                  >
                                    {d.getDate()}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontStyle: 'italic',
                                      fontSize: '0.82rem',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {d.toLocaleDateString('en-GB', {
                                      weekday: 'long',
                                    })}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '0.86rem',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      color: off
                                        ? statusInk(ff, status)
                                        : ff.ink,
                                      fontStyle: off ? 'italic' : 'normal',
                                    }}
                                  >
                                    {off
                                      ? `${STATUS_LABEL[status] || status}${entry.metadata?.dayNote ? `: ${entry.metadata.dayNote}` : ''}`
                                      : firstLine(entry.content) ||
                                        'Nothing written'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: '3px' }}>
                                    {(streamConfig?.streams || [])
                                      .filter((s) => entry.streamCounts?.[s.id])
                                      .map((s) => (
                                        <Box
                                          key={s.id}
                                          title={s.name}
                                          sx={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: '50%',
                                            bgcolor: s.color,
                                          }}
                                        />
                                      ))}
                                  </Box>
                                </Box>
                              )
                            })}
                          </Collapse>
                        </Box>
                      )
                    })}
                  </Collapse>
                </Box>
              )
            })
          )}
        </Box>

        <Box
          component="aside"
          sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}
        >
          <Box>
            <PrintHeading>Take a copy</PrintHeading>
            <PrintLabel sx={{ mb: 1 }}>Which days</PrintLabel>
            <Segmented
              ariaLabel="Export range"
              value={range}
              onChange={setRange}
              options={[
                { value: 'all', label: 'All time' },
                { value: 'thisYear', label: 'This year' },
                { value: 'last30', label: 'Last 30 days' },
              ]}
            />
            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mt: 2 }}>
              <InkButton
                size="sm"
                disabled={exporting}
                onClick={() => handleExport('md')}
              >
                Export Markdown
              </InkButton>
              <InkButton
                size="sm"
                tone="outline"
                disabled={exporting}
                onClick={() => handleExport('json')}
              >
                Export JSON
              </InkButton>
            </Box>
            <Typography
              sx={{
                fontStyle: 'italic',
                fontSize: '0.8rem',
                color: 'text.secondary',
                mt: 1.25,
              }}
            >
              {exporting
                ? 'Exporting…'
                : 'One file. Markdown opens neatly in Notion or Obsidian.'}
            </Typography>
          </Box>

          <Box>
            <PrintHeading>Where it&apos;s kept</PrintHeading>
            <Typography
              sx={{
                fontSize: '0.84rem',
                color: ff.ink,
                wordBreak: 'break-all',
                mb: 1,
              }}
            >
              {selectedDirectory}
            </Typography>
            <Typography
              sx={{
                fontStyle: 'italic',
                fontSize: '0.8rem',
                color: 'text.secondary',
                mb: 1.5,
              }}
            >
              Every entry, activity and note is a plain Markdown file you can
              open in any editor.
            </Typography>
            <PenLink onClick={() => setProjectDirectory(null)}>
              Switch workspace
            </PenLink>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default IndexPage
