import React from 'react'
import { Box, Typography, Switch, LinearProgress } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import useSettingsState from '../../components/Settings/hooks/useSettingsState'
import StreamSettings from '../../components/Settings/StreamSettings'
import AppearanceSection from '../../components/Settings/AppearanceSection'
import {
  SettingsSection,
  SettingRow,
  NumberField,
} from '../../components/Settings/SettingsSection'
import { docsContent } from '../../components/Documentation/docsContent'
import { InkButton } from '../../components/shared/ui'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { PageHead, PenLink } from '../paper'
import { SERIF } from '../paperStyles'

/**
 * The organiser's front section: personal details, settings and the
 * instructions leaflet, each on its own leaf.
 */
const InfoPage = () => {
  const ff = useFilofaxTokens()
  const [params, setParams] = useSearchParams()
  const s = useSettingsState()

  const leaves = [
    { id: 'details', label: 'Personal details' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'streams', label: 'Streams and features' },
    { id: 'reminders', label: 'Reminders' },
    s.utilisationEnabled && { id: 'utilisation', label: 'Utilisation' },
    { id: 'updates', label: 'Updates' },
    { id: 'instructions', label: 'Instructions' },
    s.isMock && { id: 'developer', label: 'Developer' },
  ].filter(Boolean)
  const current =
    leaves.find((l) => l.id === params.get('page'))?.id || 'details'
  const open = (id) => setParams({ page: id }, { replace: true })

  return (
    <Box>
      <PageHead title="Info" aside={`Work Tracker ${s.versionLabel}`} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '200px minmax(0, 1fr)' },
          gap: { xs: 3, md: 6 },
          alignItems: 'start',
        }}
      >
        <Box
          component="nav"
          aria-label="Info pages"
          sx={{ position: { md: 'sticky' }, top: 0 }}
        >
          {leaves.map((leaf) => {
            const active = leaf.id === current
            return (
              <Box
                key={leaf.id}
                component="button"
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => open(leaf.id)}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'baseline',
                  py: 0.9,
                  px: 0,
                  border: 'none',
                  borderBottom: `1px solid ${ff.rule}`,
                  background: 'none',
                  fontFamily: SERIF,
                  fontSize: '0.92rem',
                  fontStyle: active ? 'normal' : 'italic',
                  color: active ? ff.print : ff.inkSoft,
                  textAlign: 'left',
                  cursor: 'pointer',
                  '&:hover': { color: ff.print },
                  '&::before': {
                    content: '""',
                    width: 6,
                    height: 6,
                    mr: 1.25,
                    borderRadius: '50%',
                    alignSelf: 'center',
                    bgcolor: active ? ff.print : 'transparent',
                  },
                }}
              >
                {leaf.label}
              </Box>
            )
          })}
        </Box>

        <Box
          sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {current === 'details' && (
            <SettingsSection
              id="details"
              title="This organiser belongs to"
              description="The workspace folder holds every entry, activity and note as a Markdown file."
            >
              <Box sx={{ py: 2, borderBottom: `1px solid ${ff.rule}` }}>
                <Typography
                  sx={{
                    fontStyle: 'italic',
                    fontSize: '0.8rem',
                    color: ff.print,
                  }}
                >
                  Workspace
                </Typography>
                <Typography sx={{ color: ff.ink, wordBreak: 'break-all' }}>
                  {s.selectedDirectory}
                </Typography>
              </Box>
              <SettingRow
                label="Stream setup"
                hint="Walk through choosing and naming your streams again."
              >
                <InkButton
                  tone="outline"
                  size="sm"
                  onClick={s.rerunStreamSetup}
                >
                  Re-run setup
                </InkButton>
              </SettingRow>
              <SettingRow
                label="Exports"
                hint="Take a copy of your history from the Index."
              >
                <InkButton
                  tone="outline"
                  size="sm"
                  onClick={() => s.navigate('/index')}
                >
                  Open the Index
                </InkButton>
              </SettingRow>
              <SettingRow
                label="Switch workspace"
                hint="Open a different folder. Nothing in this one is deleted."
              >
                <InkButton
                  size="sm"
                  onClick={() => s.setProjectDirectory(null)}
                >
                  Switch workspace
                </InkButton>
              </SettingRow>
            </SettingsSection>
          )}

          {current === 'appearance' && <AppearanceSection />}

          {current === 'streams' && <StreamSettings />}

          {current === 'reminders' && (
            <SettingsSection
              id="reminders"
              title="Reminders"
              description="A daily desktop nudge to log your day before you forget what happened."
            >
              <SettingRow
                label="Daily reminder"
                hint="Show a notification every weekday."
              >
                <Switch
                  checked={s.notifEnabled}
                  onChange={s.handleToggleNotifs}
                  inputProps={{ 'aria-label': 'Daily reminder' }}
                />
              </SettingRow>
              <SettingRow
                label="Reminder time"
                hint="When the notification appears."
              >
                <NumberField
                  type="time"
                  label="Reminder time"
                  width={120}
                  value={s.notifTime}
                  onChange={s.handleTimeChange}
                  disabled={!s.notifEnabled}
                />
                <InkButton
                  size="sm"
                  onClick={() =>
                    s.handleSaveSettings(s.notifEnabled, s.notifTime)
                  }
                  disabled={!s.notifEnabled || s.isSaving}
                >
                  {s.isSaving ? 'Saving…' : 'Save time'}
                </InkButton>
              </SettingRow>
            </SettingsSection>
          )}

          {current === 'utilisation' && (
            <SettingsSection
              id="utilisation"
              title="Utilisation"
              description="Predicted from the client hours you declare in STAFFIT each week, measured against your standard week across the 1 June to 31 May cycle."
            >
              <SettingRow
                label="Target"
                hint="Share of a standard week that should be chargeable."
              >
                <NumberField
                  label="Utilisation target"
                  unit="%"
                  value={s.utilisationTarget}
                  onChange={(e) => s.setUtilisationTarget(e.target.value)}
                  inputProps={{ min: 0, max: 100, step: 5 }}
                />
              </SettingRow>
              <SettingRow
                label="Standard week"
                hint="Hours in a full working week."
              >
                <NumberField
                  label="Standard week hours"
                  unit="hrs"
                  value={s.standardWeeklyHours}
                  onChange={(e) => s.setStandardWeeklyHours(e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </SettingRow>
              <SettingRow label="" sx={{ justifyContent: 'flex-end' }}>
                <InkButton
                  size="sm"
                  onClick={() =>
                    s.handleSaveUtilisation(
                      s.utilisationTarget,
                      s.standardWeeklyHours
                    )
                  }
                  disabled={s.isUtilSaving}
                >
                  {s.isUtilSaving ? 'Saving…' : 'Save utilisation'}
                </InkButton>
              </SettingRow>
            </SettingsSection>
          )}

          {current === 'updates' && (
            <SettingsSection
              id="updates"
              title="Updates"
              description={`You're running Work Tracker ${s.versionLabel}.`}
            >
              <SettingRow
                label={s.updateStateText}
                hint={
                  s.updateStatus === 'downloaded'
                    ? 'Your data is saved; restarting is safe.'
                    : null
                }
              >
                {(s.updateStatus === 'idle' ||
                  s.updateStatus === 'up-to-date') && (
                  <InkButton
                    tone="outline"
                    size="sm"
                    onClick={() =>
                      s.checkForUpdates().then((res) => {
                        if (res && res.status === 'dev') {
                          s.showNotification(
                            'Update checks are unavailable in development mode.',
                            'info'
                          )
                        }
                      })
                    }
                  >
                    Check for updates
                  </InkButton>
                )}
                {s.updateStatus === 'checking' && (
                  <InkButton size="sm" disabled>
                    Checking…
                  </InkButton>
                )}
                {s.updateStatus === 'available' && (
                  <InkButton size="sm" onClick={s.downloadUpdate}>
                    Download update
                  </InkButton>
                )}
                {s.updateStatus === 'downloaded' && (
                  <InkButton size="sm" onClick={s.installUpdate}>
                    Restart and install
                  </InkButton>
                )}
                {s.updateStatus === 'error' && (
                  <InkButton tone="outline" size="sm" onClick={s.resetUpdate}>
                    Try again
                  </InkButton>
                )}
              </SettingRow>
              {s.updateStatus === 'downloading' && (
                <LinearProgress
                  variant="determinate"
                  value={s.updateProgress?.percent || 0}
                  sx={{ my: 1.5 }}
                />
              )}
            </SettingsSection>
          )}

          {current === 'instructions' && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {docsContent.map((section) => (
                  <PenLink
                    key={section.id}
                    onClick={() =>
                      document
                        .getElementById(`doc-${section.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  >
                    {section.title}
                  </PenLink>
                ))}
              </Box>
              <Box
                sx={{
                  maxWidth: '72ch',
                  color: ff.ink,
                  '& h1': {
                    fontSize: '1.6rem',
                    fontWeight: 400,
                    color: ff.print,
                    borderBottom: `1px solid ${ff.ruleStrong}`,
                    pb: 0.5,
                    mt: 0,
                    mb: 2,
                  },
                  '& h2, & h3': {
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    mt: 3,
                    mb: 1,
                  },
                  '& p, & li': { lineHeight: 1.75, fontSize: '0.95rem' },
                  '& code': {
                    fontSize: '0.88em',
                    bgcolor: ff.pageShade,
                    px: 0.5,
                    borderRadius: '2px',
                  },
                  '& blockquote': {
                    m: 0,
                    pl: 2,
                    borderLeft: `2px solid ${ff.ruleStrong}`,
                    fontStyle: 'italic',
                    color: ff.inkSoft,
                  },
                  '& table': { borderCollapse: 'collapse' },
                  '& td, & th': {
                    borderBottom: `1px solid ${ff.rule}`,
                    p: 0.75,
                    textAlign: 'left',
                  },
                }}
              >
                {docsContent.map((section) => (
                  <Box
                    key={section.id}
                    id={`doc-${section.id}`}
                    sx={{ mb: 6, scrollMarginTop: 16 }}
                  >
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {current === 'developer' && (
            <SettingsSection
              id="developer"
              title="Developer"
              description="Only shown when the app runs in a browser against mock data."
            >
              <SettingRow
                label="Test notification"
                hint="Fire the reminder notification now."
              >
                <InkButton
                  tone="outline"
                  size="sm"
                  onClick={() => window.electronAPI?.testNotification?.()}
                >
                  Send test
                </InkButton>
              </SettingRow>
            </SettingsSection>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default InfoPage
