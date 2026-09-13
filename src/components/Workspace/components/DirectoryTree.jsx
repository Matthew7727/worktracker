import React, { useState, useEffect } from 'react'
import { Box, Typography, Collapse, CircularProgress } from '@mui/material'
import {
  ChevronRight,
  ExpandMore,
  InsertDriveFile,
  Folder,
  CalendarMonth,
} from '@mui/icons-material'
import { loadAllEntries } from '../../../utils/DataManager'
import { FONT, RULE } from '../../../styles/tokens'

const ACCENT = '#00d2ff'

const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
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

const formatEntryLabel = (entry) => {
  const d = new Date(entry.date + 'T12:00:00')
  const day = d.getDate().toString().padStart(2, '0')
  const weekday = d.toLocaleString('default', { weekday: 'long' })
  return `${day} — ${weekday}`
}

const TreeRow = ({
  label,
  depth,
  isLeaf,
  isSelected,
  isExpanded,
  icon,
  onClick,
  rightLabel,
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      py: 0.6,
      pr: 1,
      pl: `${depth * 16 + 8}px`,
      cursor: 'pointer',
      borderLeft: `${RULE.base}px solid`,
      borderLeftColor: isSelected ? ACCENT : 'transparent',
      borderBottom: (theme) => `${RULE.hair}px solid ${theme.palette.divider}`,
      bgcolor: 'transparent',
      backgroundImage: (theme) =>
        depth > 0
          ? Array.from({ length: depth }, (_, index) => {
              const x = index * 16 + 8
              return `linear-gradient(90deg, transparent ${x}px, ${theme.palette.divider} ${x}px, ${theme.palette.divider} ${x + RULE.hair}px, transparent ${x + RULE.hair}px)`
            }).join(',')
          : 'none',
      '&:hover': {
        borderLeftColor: ACCENT,
        borderBottomColor: ACCENT,
      },
      transition: 'border-color 0.12s ease',
      userSelect: 'none',
    }}
  >
    <Box
      sx={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}
    >
      {!isLeaf &&
        (isExpanded ? (
          <ExpandMore sx={{ fontSize: 14, color: ACCENT }} />
        ) : (
          <ChevronRight sx={{ fontSize: 14, color: 'text.secondary' }} />
        ))}
    </Box>
    {icon}
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        border: `${RULE.hair}px solid`,
        borderColor: isSelected || isExpanded ? ACCENT : 'text.secondary',
        bgcolor: isSelected || isExpanded ? ACCENT : 'transparent',
        flexShrink: 0,
      }}
    />
    <Typography
      sx={{
        fontSize: '0.78rem',
        fontWeight: isLeaf ? 500 : 700,
        color: 'text.primary',
        fontFamily: isLeaf ? FONT.data : undefined,
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
    {rightLabel && (
      <Typography
        sx={{
          fontSize: '0.65rem',
          color: 'text.secondary',
          fontWeight: 700,
          flexShrink: 0,
          fontFamily: FONT.data,
        }}
      >
        {rightLabel}
      </Typography>
    )}
  </Box>
)

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

  const toggleYear = (year) => {
    setExpandedYears((prev) => {
      const next = new Set(prev)
      next.has(year) ? next.delete(year) : next.add(year)
      return next
    })
  }

  const toggleMonth = (key) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const tree = buildDateTree(entries)
  const years = Object.keys(tree).sort((a, b) => b - a)

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: `${RULE.hair}px solid`,
          borderColor: 'text.primary',
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'text.secondary',
            fontFamily: FONT.data,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rootDir}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: ACCENT },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={20} sx={{ color: ACCENT }} />
          </Box>
        ) : entries.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              No entries found
            </Typography>
          </Box>
        ) : (
          <Box>
            {years.map((year) => {
              const yearOpen = expandedYears.has(year)
              const months = Object.keys(tree[year]).sort(
                (a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a)
              )
              const totalEntries = months.reduce(
                (acc, m) => acc + tree[year][m].length,
                0
              )

              return (
                <Box key={year}>
                  <TreeRow
                    label={year}
                    depth={0}
                    isLeaf={false}
                    isExpanded={yearOpen}
                    icon={
                      <CalendarMonth
                        sx={{
                          fontSize: 14,
                          color: yearOpen ? ACCENT : 'text.secondary',
                          flexShrink: 0,
                        }}
                      />
                    }
                    onClick={() => toggleYear(year)}
                    rightLabel={String(totalEntries)}
                  />
                  <Collapse in={yearOpen}>
                    {months.map((month) => {
                      const monthKey = `${year}-${month}`
                      const monthOpen = expandedMonths.has(monthKey)
                      const monthEntries = tree[year][month]

                      return (
                        <Box key={month}>
                          <TreeRow
                            label={month}
                            depth={1}
                            isLeaf={false}
                            isExpanded={monthOpen}
                            icon={
                              <Folder
                                sx={{
                                  fontSize: 13,
                                  color: monthOpen ? ACCENT : 'text.secondary',
                                  flexShrink: 0,
                                }}
                              />
                            }
                            onClick={() => toggleMonth(monthKey)}
                            rightLabel={String(monthEntries.length)}
                          />
                          <Collapse in={monthOpen}>
                            {monthEntries.map((entry) => (
                              <TreeRow
                                key={entry.id}
                                label={formatEntryLabel(entry)}
                                depth={2}
                                isLeaf
                                isSelected={selectedEntry?.id === entry.id}
                                icon={
                                  <InsertDriveFile
                                    sx={{
                                      fontSize: 12,
                                      color:
                                        selectedEntry?.id === entry.id
                                          ? ACCENT
                                          : 'text.secondary',
                                      flexShrink: 0,
                                    }}
                                  />
                                }
                                onClick={() => onSelectEntry(entry)}
                              />
                            ))}
                          </Collapse>
                        </Box>
                      )
                    })}
                  </Collapse>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default DirectoryTree
