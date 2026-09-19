import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Typography, InputBase } from '@mui/material'
import { Search } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { loadProjects, getActivityStreamId } from '../../utils/projectsManager'
import { getInitials } from '../../utils/dashboardInsights'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { PageHead, StreamMark, BlankLine, Stamp } from '../paper'
import { LINE, SERIF } from '../paperStyles'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * An address book built from the team members named on projects and
 * activities, filed A to Z, each with the work you share.
 */
const ContactsPage = () => {
  const ff = useFilofaxTokens()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedDirectory, refreshTrigger, streamConfig, mainFocusStream } =
    useAppContext()
  const [data, setData] = useState(null)
  const [query, setQuery] = useState('')
  const refs = useRef({})
  const focusName = location.state?.name

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then(setData)
  }, [selectedDirectory, refreshTrigger])

  const people = useMemo(() => {
    if (!data) return []
    const streamById = Object.fromEntries(
      (streamConfig?.streams || []).map((s) => [s.id, s])
    )
    const map = new Map()
    const add = (item, type, stream) =>
      (item.teamMembers || []).forEach((raw) => {
        const name = String(raw).trim()
        if (!name) return
        const key = name.toLowerCase()
        if (!map.has(key)) map.set(key, { name, work: [] })
        map.get(key).work.push({ item, type, stream })
      })
    ;(data.clientProjects || []).forEach((p) =>
      add(p, 'project', mainFocusStream)
    )
    ;(data.activities || []).forEach((a) =>
      add(a, 'activity', streamById[getActivityStreamId(a)])
    )
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [data, streamConfig, mainFocusStream])

  const visible = people.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const byLetter = LETTERS.map((l) => ({
    letter: l,
    people: visible.filter((p) => p.name[0]?.toUpperCase() === l),
  }))
  const other = visible.filter(
    (p) => !LETTERS.includes(p.name[0]?.toUpperCase())
  )

  useEffect(() => {
    if (!focusName || !people.length) return
    refs.current[focusName.toLowerCase()]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [focusName, people.length])

  const jumpTo = (letter) =>
    document
      .getElementById(`contacts-${letter}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const card = (person) => {
    const active = person.work.filter(
      ({ item }) => item.status === 'active'
    ).length
    const highlighted =
      focusName && focusName.toLowerCase() === person.name.toLowerCase()
    return (
      <Box
        key={person.name}
        ref={(el) => {
          refs.current[person.name.toLowerCase()] = el
        }}
        sx={{
          display: 'grid',
          gridTemplateColumns: '44px minmax(0, 1fr)',
          gap: 2,
          py: 1.5,
          borderBottom: `1px solid ${ff.rule}`,
          bgcolor: highlighted ? 'action.hover' : 'transparent',
          borderRadius: highlighted ? '4px' : 0,
          px: highlighted ? 1 : 0,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `1.25px solid ${ff.print}`,
            color: ff.print,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
          }}
        >
          {getInitials(person.name)}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography sx={{ fontSize: '1.05rem', color: ff.ink }}>
              {person.name}
            </Typography>
            <Typography
              sx={{
                fontStyle: 'italic',
                fontSize: '0.8rem',
                color: 'text.secondary',
              }}
            >
              {person.work.length}{' '}
              {person.work.length === 1 ? 'piece of work' : 'pieces of work'}
              {active ? `, ${active} active` : ''}
            </Typography>
          </Box>
          {person.work.map(({ item, type, stream }) => (
            <Box
              key={`${type}-${item.id}`}
              component="button"
              type="button"
              onClick={() => navigate(`/todos/${type}/${item.id}`)}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minHeight: LINE - 4,
                p: 0,
                border: 'none',
                background: 'none',
                fontFamily: SERIF,
                fontSize: '0.86rem',
                color: item.status === 'active' ? ff.ink : 'text.secondary',
                textAlign: 'left',
                cursor: 'pointer',
                '&:hover': { color: ff.print },
              }}
            >
              <StreamMark stream={stream} label="" />
              {item.title}
              {item.status !== 'active' && (
                <Stamp color={ff.inkSoft}>Finished</Stamp>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <PageHead
        title="Contacts"
        aside={`${people.length} ${people.length === 1 ? 'person' : 'people'} named on your work`}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            borderBottom: `1px solid ${ff.ruleStrong}`,
            minWidth: 220,
          }}
        >
          <Search sx={{ fontSize: '1rem', color: ff.inkSoft }} />
          <InputBase
            value={query}
            placeholder="Find a name"
            onChange={(e) => setQuery(e.target.value)}
            inputProps={{ 'aria-label': 'Find a contact' }}
            sx={{
              fontSize: '0.9rem',
              '& input::placeholder': { fontStyle: 'italic' },
            }}
          />
        </Box>
      </PageHead>

      {data && people.length === 0 ? (
        <BlankLine>
          No contacts yet. Add team members to a project or activity under To do
          and they&apos;re filed here.
        </BlankLine>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 30px',
            gap: 3,
          }}
        >
          <Box>
            {byLetter
              .filter((g) => g.people.length)
              .map((g) => (
                <Box
                  key={g.letter}
                  id={`contacts-${g.letter}`}
                  sx={{ mb: 3, scrollMarginTop: 16 }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.6rem',
                      color: ff.print,
                      lineHeight: 1.2,
                      borderBottom: `1px solid ${ff.ruleStrong}`,
                    }}
                  >
                    {g.letter}
                  </Typography>
                  <Box
                    sx={{
                      columnWidth: 360,
                      columnGap: '40px',
                      '& > *': { breakInside: 'avoid' },
                    }}
                  >
                    {g.people.map(card)}
                  </Box>
                </Box>
              ))}
            {other.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    color: ff.print,
                    borderBottom: `1px solid ${ff.ruleStrong}`,
                  }}
                >
                  Other
                </Typography>
                {other.map(card)}
              </Box>
            )}
            {data && visible.length === 0 && people.length > 0 && (
              <BlankLine>Nobody by that name.</BlankLine>
            )}
          </Box>
          {/* Thumb-index letters down the page edge */}
          <Box
            component="nav"
            aria-label="Jump to letter"
            sx={{
              position: 'sticky',
              top: 0,
              alignSelf: 'start',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {LETTERS.map((l) => {
              const has = byLetter.find((g) => g.letter === l).people.length > 0
              return (
                <Box
                  key={l}
                  component="button"
                  type="button"
                  disabled={!has}
                  onClick={() => jumpTo(l)}
                  aria-label={`Jump to ${l}`}
                  sx={{
                    p: 0,
                    height: 20,
                    border: 'none',
                    background: 'none',
                    fontFamily: SERIF,
                    fontSize: '0.72rem',
                    color: has ? ff.print : ff.ruleStrong,
                    cursor: has ? 'pointer' : 'default',
                    '&:hover': has ? { fontWeight: 700 } : {},
                  }}
                >
                  {l}
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ContactsPage
