import React from 'react'
import { Box, Switch } from '@mui/material'
import StreamSettings from './StreamSettings'
import { SettingsSection, SettingRow, NumberField } from './SettingsSection'
import { InkButton, PageHeader } from '../shared/ui'
import useSettingsState from './hooks/useSettingsState'
import AppearanceSection from './AppearanceSection'

const Settings = () => {
  const {
    navigate,
    selectedDirectory,
    setProjectDirectory,
    showNotification,
    rerunStreamSetup,
    utilisationEnabled,
    notifEnabled,
    notifTime,
    isSaving,
    utilisationTarget,
    setUtilisationTarget,
    standardWeeklyHours,
    setStandardWeeklyHours,
    isUtilSaving,
    updateStatus,
    updateProgress,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    resetUpdate,
    handleSaveUtilisation,
    handleSaveSettings,
    handleToggleNotifs,
    handleTimeChange,
    isMock,
    sections,
    versionLabel,
    updateStateText,
  } = useSettingsState()

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%', pb: 10 }}>
      <PageHeader title="Settings" meta={`Work Tracker ${versionLabel}`} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '200px minmax(0, 1fr)' },
          gap: 5,
          alignItems: 'start',
        }}
      >
        <Box
          component="nav"
          aria-label="Settings sections"
          sx={{
            position: { md: 'sticky' },
            top: { md: 24 },
            display: { xs: 'none', md: 'block' },
            borderLeft: '3px solid',
            borderColor: 'text.primary',
          }}
        >
          {sections.map((s) => (
            <Box
              key={s.id}
              component="button"
              type="button"
              onClick={() =>
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                px: 2,
                py: 0.9,
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
              }}
            >
              {s.label}
            </Box>
          ))}
        </Box>

        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}
        >
          <AppearanceSection />

          <StreamSettings />

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
                checked={notifEnabled}
                onChange={handleToggleNotifs}
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
                value={notifTime}
                onChange={handleTimeChange}
                disabled={!notifEnabled}
              />
              <InkButton
                size="sm"
                onClick={() => handleSaveSettings(notifEnabled, notifTime)}
                disabled={!notifEnabled || isSaving}
              >
                {isSaving ? 'Saving…' : 'Save time'}
              </InkButton>
            </SettingRow>
          </SettingsSection>

          {utilisationEnabled && (
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
                  value={utilisationTarget}
                  onChange={(e) => setUtilisationTarget(e.target.value)}
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
                  value={standardWeeklyHours}
                  onChange={(e) => setStandardWeeklyHours(e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </SettingRow>
              <SettingRow
                label=""
                sx={{
                  justifyContent: 'flex-end',
                  py: 1.5,
                  bgcolor: 'background.subtle',
                }}
              >
                <InkButton
                  size="sm"
                  onClick={() =>
                    handleSaveUtilisation(
                      utilisationTarget,
                      standardWeeklyHours
                    )
                  }
                  disabled={isUtilSaving}
                >
                  {isUtilSaving ? 'Saving…' : 'Save utilisation'}
                </InkButton>
              </SettingRow>
            </SettingsSection>
          )}

          <SettingsSection
            id="workspace"
            title="Workspace"
            description="The folder where every entry, activity and note is stored as a Markdown file."
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                wordBreak: 'break-all',
                bgcolor: 'background.subtle',
                borderBottom: '2px solid',
                borderColor: 'divider',
              }}
            >
              {selectedDirectory}
            </Box>
            <SettingRow
              label="Stream setup"
              hint="Walk through choosing and naming your streams again."
            >
              <InkButton tone="outline" size="sm" onClick={rerunStreamSetup}>
                Re-run setup
              </InkButton>
            </SettingRow>
            <SettingRow
              label="Reports"
              hint="Export your history as Markdown or JSON."
            >
              <InkButton
                tone="outline"
                size="sm"
                onClick={() => navigate('/reports')}
              >
                Open reports
              </InkButton>
            </SettingRow>
            <SettingRow
              label="Switch workspace"
              hint="Open a different folder. Nothing in this one is deleted."
            >
              <InkButton
                color="#ff6b6b"
                size="sm"
                onClick={() => setProjectDirectory(null)}
              >
                Switch workspace
              </InkButton>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            id="updates"
            title="Updates"
            description={`You're running Work Tracker ${versionLabel}.`}
          >
            <SettingRow
              label={updateStateText}
              hint={
                updateStatus === 'downloaded'
                  ? 'Your data is saved; restarting is safe.'
                  : null
              }
            >
              {(updateStatus === 'idle' || updateStatus === 'up-to-date') && (
                <InkButton
                  tone="outline"
                  size="sm"
                  onClick={() => {
                    checkForUpdates().then((res) => {
                      if (res && res.status === 'dev') {
                        showNotification(
                          'Update checks are unavailable in development mode.',
                          'info'
                        )
                      }
                    })
                  }}
                >
                  Check for updates
                </InkButton>
              )}
              {updateStatus === 'checking' && (
                <InkButton size="sm" disabled>
                  Checking…
                </InkButton>
              )}
              {updateStatus === 'available' && (
                <InkButton
                  size="sm"
                  color="primary.main"
                  onClick={downloadUpdate}
                >
                  Download update
                </InkButton>
              )}
              {updateStatus === 'downloaded' && (
                <InkButton
                  size="sm"
                  color="primary.main"
                  onClick={installUpdate}
                >
                  Restart and install
                </InkButton>
              )}
              {updateStatus === 'error' && (
                <InkButton tone="outline" size="sm" onClick={resetUpdate}>
                  Try again
                </InkButton>
              )}
            </SettingRow>
            {updateStatus === 'downloading' && (
              <Box sx={{ px: 3, pb: 2.5 }}>
                <Box
                  sx={{
                    height: 16,
                    border: '3px solid',
                    borderColor: 'text.primary',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${updateProgress?.percent || 0}%`,
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            )}
          </SettingsSection>

          {isMock && (
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

export default Settings
