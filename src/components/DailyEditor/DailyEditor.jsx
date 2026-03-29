import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useDailyEditor } from './hooks/useDailyEditor'
import WeekDayPicker from './components/WeekDayPicker'
import StartView from './components/StartView'
import FlowView from './components/FlowView'
import SummaryView from './components/SummaryView'

const DailyEditor = () => {
  const {
    currentDate,
    setCurrentDate,
    weekStatus,
    streams,
    updateStream,
    taggedItems,
    updateTaggedItems,
    availableProjects,
    viewMode,
    setViewMode,
    currentStep,
    setCurrentStep,
    isLoading,
    handleSaveDay,
  } = useDailyEditor()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} thickness={5} />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <WeekDayPicker
        currentDate={currentDate}
        onSelectDay={setCurrentDate}
        weekStatus={weekStatus}
      />

      {viewMode === 'start' && (
        <StartView
          onStart={() => {
            setCurrentStep(0)
            setViewMode('flow')
          }}
        />
      )}

      {viewMode === 'flow' && (
        <FlowView
          streams={streams}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onCancel={() => setViewMode('start')}
          onSave={handleSaveDay}
          updateStream={updateStream}
          taggedItems={taggedItems}
          updateTaggedItems={updateTaggedItems}
          availableProjects={availableProjects}
        />
      )}

      {viewMode === 'summary' && (
        <SummaryView
          streams={streams}
          onEdit={() => {
            setCurrentStep(0)
            setViewMode('flow')
          }}
        />
      )}
    </Box>
  )
}

export default DailyEditor
