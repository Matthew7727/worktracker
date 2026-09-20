import React, { useEffect, useRef, useState } from 'react'
import { Box, Tooltip } from '@mui/material'
import {
  Search as SearchIcon,
  LightMode,
  DarkMode,
  KeyboardArrowUp,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useThemeContext } from '../context/ThemeContext'
import { useFilofaxTokens } from '../styles/useUiStyle'
import GlobalSearch from '../components/Layout/components/GlobalSearch'
import FeedbackSystem from '../components/Layout/components/FeedbackSystem'
import { SERIF } from './paperStyles'
import { SECTIONS, sectionFor } from './sections'

// Two clusters of three rings, as on a personal-size organiser.
const RING_POSITIONS = ['9%', '17%', '25%', '75%', '83%', '91%']
const HOLE_X = 26 // centre of the punched holes from the page's left edge

const leatherGrain = (ff) => ({
  backgroundColor: ff.leather,
  backgroundImage: [
    `radial-gradient(120% 90% at 30% 0%, ${ff.leatherHi} 0%, transparent 55%)`,
    `radial-gradient(90% 80% at 100% 100%, ${ff.leatherLo} 0%, transparent 60%)`,
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
  ].join(', '),
})

const Ring = ({ top, ff }) => (
  <Box
    aria-hidden
    sx={{
      position: 'absolute',
      top,
      left: -30,
      width: HOLE_X + 30 + 5,
      height: 10,
      mt: '-5px',
      zIndex: 4,
      borderRadius: '6px',
      background: `linear-gradient(180deg, ${ff.goldHi} 0%, ${ff.gold} 45%, ${ff.goldLo} 100%)`,
      boxShadow: '0 3px 3px rgba(0,0,0,0.28)',
    }}
  />
)

const Hole = ({ top, ff }) => (
  <Box
    aria-hidden
    sx={{
      position: 'absolute',
      top,
      left: HOLE_X - 7,
      width: 14,
      height: 14,
      mt: '-7px',
      borderRadius: '50%',
      bgcolor: ff.hole,
      boxShadow: `inset 0 1px 2px rgba(0,0,0,0.6), 0 0 0 1px ${ff.ruleStrong}`,
      zIndex: 3,
    }}
  />
)

// A card-stock divider sticking out of the page's right edge.
const DividerTab = ({ section, active, color, onClick, ff }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    sx={{
      position: 'relative',
      flex: '1 1 0',
      minHeight: 58,
      maxHeight: 112,
      width: active ? 48 : 40,
      ml: active ? 0 : '-1px',
      p: 0,
      border: 'none',
      borderRadius: '0 9px 9px 0',
      bgcolor: color,
      color: ff.tabInk,
      cursor: 'pointer',
      fontFamily: SERIF,
      fontSize: '0.86rem',
      boxShadow: active
        ? `inset 6px 0 0 ${ff.page}, 2px 2px 4px rgba(0,0,0,0.3)`
        : 'inset 3px 0 4px rgba(0,0,0,0.18), 2px 2px 4px rgba(0,0,0,0.3)',
      transition: 'width 0.18s ease',
      '&:hover': active ? {} : { width: 44 },
      '&:focus-visible': {
        outline: `2px solid ${ff.goldHi}`,
        outlineOffset: 2,
      },
    }}
  >
    <Box
      component="span"
      sx={{
        writingMode: 'vertical-rl',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        fontStyle: active ? 'normal' : 'italic',
        fontWeight: active ? 700 : 400,
        letterSpacing: '0.01em',
      }}
    >
      {section.label}
    </Box>
  </Box>
)

// A gilt press-stud control set into the leather.
const Stud = ({ label, onClick, children, ff }) => (
  <Tooltip title={label} placement="left">
    <Box
      component="button"
      type="button"
      aria-label={label}
      onClick={onClick}
      sx={{
        width: 34,
        height: 34,
        p: 0,
        border: `1px solid ${ff.goldLo}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: ff.goldHi,
        background: `radial-gradient(circle at 35% 30%, ${ff.leatherHi}, ${ff.leatherLo})`,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
        '& svg': { fontSize: '1.05rem' },
        '&:hover': { color: '#fff3d6' },
        '&:focus-visible': {
          outline: `2px solid ${ff.goldHi}`,
          outlineOffset: 2,
        },
      }}
    >
      {children}
    </Box>
  </Tooltip>
)

const FilofaxLayout = ({ children }) => {
  const ff = useFilofaxTokens()
  const { selectedDirectory, notification, hideNotification } = useAppContext()
  const { mode, toggleTheme } = useThemeContext()
  const navigate = useNavigate()
  const location = useLocation()
  const pageRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const current = sectionFor(location.pathname)

  // Each section opens at the top of its page.
  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0 })
  }, [current.id])

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        p: { xs: '14px', md: '22px' },
        pr: 0,
        overflow: 'hidden',
        ...leatherGrain(ff),
        // Saddle stitching around the cover
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 7,
          border: `1.5px dashed ${ff.stitch}`,
          borderRadius: '14px',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Ring mechanism on the spine */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: { xs: 10, md: 17 },
          top: '7%',
          bottom: '7%',
          width: 12,
          borderRadius: '6px',
          background: `linear-gradient(90deg, ${ff.goldLo}, ${ff.goldHi} 45%, ${ff.gold} 60%, ${ff.goldLo})`,
          boxShadow: '1px 0 3px rgba(0,0,0,0.4)',
          display: { xs: 'none', sm: 'block' },
        }}
      />

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          ml: { xs: 0, sm: '22px' },
          display: 'flex',
        }}
      >
        {/* The page, with sheets stacked beneath it */}
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            bgcolor: ff.page,
            borderRadius: '10px',
            boxShadow: [
              `2px 2px 0 ${ff.pageShade}`,
              `4px 4px 0 ${ff.rule}`,
              `6px 6px 0 ${ff.pageShade}`,
              '0 20px 40px rgba(0,0,0,0.45)',
            ].join(', '),
            zIndex: 2,
          }}
        >
          {RING_POSITIONS.map((top) => (
            <React.Fragment key={top}>
              <Hole top={top} ff={ff} />
              <Ring top={top} ff={ff} />
            </React.Fragment>
          ))}
          {/* Margin rule */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 54,
              width: '1px',
              bgcolor: ff.margin,
              opacity: 0.7,
              zIndex: 1,
            }}
          />

          <Box
            component="main"
            ref={pageRef}
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 480)}
            sx={{
              position: 'absolute',
              inset: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              borderRadius: '10px',
              scrollbarWidth: 'thin',
              scrollbarColor: `${ff.ruleStrong} transparent`,
            }}
          >
            <Box
              key={current.id}
              sx={{
                pl: { xs: '72px', md: '92px' },
                pr: { xs: 3, md: 6 },
                pt: { xs: 3, md: 4.5 },
                pb: 8,
                maxWidth: 1240,
                animation: 'fxTurn 260ms ease-out',
                '@keyframes fxTurn': {
                  from: { opacity: 0, transform: 'translateX(12px)' },
                  to: { opacity: 1, transform: 'none' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              {children}
            </Box>
          </Box>

          {scrolled && (
            <Box
              component="button"
              type="button"
              onClick={() =>
                pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
              }
              sx={{
                position: 'absolute',
                right: 20,
                bottom: 16,
                zIndex: 5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1.25,
                py: 0.4,
                border: `1px solid ${ff.ruleStrong}`,
                borderRadius: '3px',
                bgcolor: ff.slip,
                color: ff.print,
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <KeyboardArrowUp sx={{ fontSize: '1rem' }} />
              Top of page
            </Box>
          )}
        </Box>

        {/* Divider tabs + studs */}
        <Box
          sx={{
            width: { xs: 52, md: 62 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            py: 2.5,
            zIndex: 1,
          }}
        >
          <Box
            component="nav"
            aria-label="Sections"
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              ml: '-2px',
            }}
          >
            {SECTIONS.map((section) => (
              <DividerTab
                key={section.id}
                section={section}
                ff={ff}
                color={ff.tabs[section.id]}
                active={current.id === section.id}
                onClick={() => navigate(section.path)}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              pt: 2.5,
              pl: '7px',
            }}
          >
            <GlobalSearch
              rootDir={selectedDirectory}
              onResultClick={(result) =>
                navigate(result.kind === 'note' ? '/notes' : '/', {
                  state: result.date
                    ? { initialDate: `${result.date}T12:00:00` }
                    : result.kind === 'note'
                      ? { focusNoteId: result.fileName }
                      : undefined,
                })
              }
              renderTrigger={(open) => (
                <Stud label="Search entries (Ctrl+F)" onClick={open} ff={ff}>
                  <SearchIcon />
                </Stud>
              )}
            />
            <Stud
              label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
              onClick={toggleTheme}
              ff={ff}
            >
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </Stud>
          </Box>
        </Box>
      </Box>

      <FeedbackSystem notification={notification} onHide={hideNotification} />
    </Box>
  )
}

export default FilofaxLayout
