import React, { useState, useEffect } from 'react'
import { Box, Typography, Collapse, CircularProgress } from '@mui/material'
import { ChevronRight, ExpandMore } from '@mui/icons-material'
import { loadAllEntries } from '../../../utils/DataManager'
import { MONO } from '../../shared/ui'

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

const buildDateTree = (entries) => {
  const tree = {}
  entries.forEach((entry) => {
    const d = new Date(entry.date + 'T12:00:00')
    const year = d.getFullYear().toString()
    const monthName = MONTHS[d.getMonth()]
    if (!tree[year]) tree[year] = {}
    if (!tree[year][monthName]) tree[year][monthName] = []
    tree[year][monthName].push(entry)
  })
  return tree
}

const GroupRow = ({ label, count, isExpanded, onClick, level }) => (
  <Box
    component="button"
    type="button"
    aria-expanded={isExpanded}
    onClick={onClick}
    sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1.5,
      py: level === 0 ? 1.25 : 0.9,
      fontFamily: 'inherit',
      textAlign: 'left',
      border: 'none',
      borderBottom: '2px solid',
      borderColor: level === 0 ? 'text.primary' : 'divider',
      bgcolor: 'transparent',
      color: 'text.primary',
      cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    {isExpanded ? (
      <ExpandMore sx={{ fontSize: '1.1rem' }} />
    ) : (
      <ChevronRight sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
    )}
    <Typography
      sx={{
        flex: 1,
        fontWeight: 900,
        fontSize: level === 0 ? '1.35rem' : '0.95rem',
        letterSpacing: level === 0 ? '-0.03em' : '-0.01em',
        fontFamily: level === 0 ? MONO : 'inherit',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: MONO,
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'text.secondary',
      }}
    >
      {count}
    </Typography>
  </Box>
)

const DayRow = ({ entry, isSelected, onClick }) => {
  const d = new Date(entry.date + 'T12:00:00')
  return (
    <Box
      component="button"
      type="button"
      aria-current={isSelected ? 'true' : undefined}
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr',
        alignItems: 'baseline',
        pl: 4.5,
        pr: 1.5,
        py: 0.75,
        fontFamily: 'inherit',
        textAlign: 'left',
        border: 'none',
        bgcolor: isSelected ? 'text.primary' : 'transparent',
        color: isSelected ? 'background.paper' : 'text.primary',
        cursor: 'pointer',
        '&:hover': isSelected ? {} : { bgcolor: 'action.hover' },
      }}
    >
      <Typography
        sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.95rem' }}
      >
        {String(d.getDate()).padStart(2, '0')}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>
        {d.toLocaleDateString('en-GB', { weekday: 'long' })}
      </Typography>
    </Box>
  )
}

const DirectoryTree = ({ rootDir, selectedEntry, onSelectEntry }) => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const currentYear = new Date().getFullYear().toString()
  const [expandedYears, setExpandedYears] = useState(new Set([currentYear]))
  const [expandedMonths, setExpandedMonths] = useState(new Set())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await loadAllEntries(rootDir)
      setEntries(data)
      setLoading(false)
    }
    load()
  }, [rootDir])

  const toggle = (setter, key) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const tree = buildDateTree(entries)
  const years = Object.keys(tree).sort((a, b) => b - a)

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={22} sx={{ color: 'text.primary' }} />
        </Box>
      ) : entries.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>No entries yet.</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Days you log on Entries appear here.
          </Typography>
        </Box>
      ) : (
        years.map((year) => {
          const yearOpen = expandedYears.has(year)
          const months = Object.keys(tree[year]).sort(
            (a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a)
          )
          const total = months.reduce((n, m) => n + tree[year][m].length, 0)

          return (
            <Box key={year}>
              <GroupRow
                level={0}
                label={year}
                count={total}
                isExpanded={yearOpen}
                onClick={() => toggle(setExpandedYears, year)}
              />
              <Collapse in={yearOpen}>
                {months.map((month) => {
                  const monthKey = `${year}-${month}`
                  const monthOpen = expandedMonths.has(monthKey)
                  const monthEntries = tree[year][month]
                  return (
                    <Box key={month}>
                      <GroupRow
                        level={1}
                        label={month}
                        count={monthEntries.length}
                        isExpanded={monthOpen}
                        onClick={() => toggle(setExpandedMonths, monthKey)}
                      />
                      <Collapse in={monthOpen}>
                        <Box
                          sx={{
                            py: 0.5,
                            borderBottom: '2px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {monthEntries.map((entry) => (
                            <DayRow
                              key={entry.id}
                              entry={entry}
                              isSelected={selectedEntry?.id === entry.id}
                              onClick={() => onSelectEntry(entry)}
                            />
                          ))}
                        </Box>
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
  )
}

export default DirectoryTree
