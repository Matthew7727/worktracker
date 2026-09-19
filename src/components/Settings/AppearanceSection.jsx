import React from 'react'
import { useThemeContext } from '../../context/ThemeContext'
import { SettingsSection, SettingRow } from './SettingsSection'
import { Segmented } from '../shared/ui'

/** Visual style (ledger or Filofax) and light/dark mode. */
const AppearanceSection = () => {
  const { uiStyle, setUiStyle, mode, toggleTheme } = useThemeContext()
  return (
    <SettingsSection
      id="appearance"
      title="Appearance"
      description="How Work Tracker looks. Your data is the same in every style."
    >
      <SettingRow
        label="Style"
        hint="Ledger is bold and sharp-edged. Filofax files everything into an oxblood leather organiser."
      >
        <Segmented
          size="sm"
          ariaLabel="Style"
          value={uiStyle}
          onChange={setUiStyle}
          options={[
            { value: 'ledger', label: 'Ledger' },
            { value: 'filofax', label: 'Filofax' },
          ]}
        />
      </SettingRow>
      <SettingRow
        label="Light or dark"
        hint="Each style has its own dark version."
      >
        <Segmented
          size="sm"
          ariaLabel="Colour mode"
          value={mode}
          onChange={(value) => value !== mode && toggleTheme()}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </SettingRow>
    </SettingsSection>
  )
}

export default AppearanceSection
