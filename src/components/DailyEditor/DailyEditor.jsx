import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useDailyEditor } from './hooks/useDailyEditor'
import WeekDayPicker from './components/WeekDayPicker'
import ProjectSelectionView from './components/ProjectSelectionView'
import FlowView from './components/FlowView'
import SummaryView from './components/SummaryView'
import DayOffSummary from './components/DayOffSummary'

const DailyEditor = () => {
  const {
    currentDate,
    setCurrentDate,
    weekStatus,
    streams,
    streamDefs,
    dayStatus,
    setDayStatus,
    dayNote,
    setDayNote,
    projectDrafts,
    updateProjectDraft,
    selectedFlowProjects,
    toggleFlowProject,
    allAvailableProjects,
    projectEntries,
    viewMode,
    setViewMode,
    currentStep,
    setCurrentStep,
    isLoading,
    handleSaveDay,
    handleSaveNonWorkingDay,
    quickSetDayStatus,
    todayTodos,
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
        streams={streamDefs}
        onQuickSetDayStatus={quickSetDayStatus}
      />

      {viewMode === 'start' && (
        <ProjectSelectionView
          dayStatus={dayStatus}
          onStatusChange={setDayStatus}
          dayNote={dayNote}
          onNoteChange={setDayNote}
          allAvailableProjects={allAvailableProjects}
          selectedFlowProjects={selectedFlowProjects}
          onToggleProject={toggleFlowProject}
          onStart={() => {
            setCurrentStep(0)
            setViewMode('flow')
          }}
          onSaveNonWorking={handleSaveNonWorkingDay}
        />
      )}

      {viewMode === 'flow' && (
        <FlowView
          selectedFlowProjects={selectedFlowProjects}
          projectDrafts={projectDrafts}
          updateProjectDraft={updateProjectDraft}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onBackToSelect={() => setViewMode('start')}
          onSave={handleSaveDay}
          todayTodos={todayTodos}
        />
      )}

      {viewMode === 'summary' && dayStatus !== 'working' && (
        <DayOffSummary
          dayStatus={dayStatus}
          dayNote={dayNote}
          onEdit={() => setViewMode('start')}
        />
      )}

      {viewMode === 'summary' && dayStatus === 'working' && (
        <SummaryView
          streams={streams}
          streamDefs={streamDefs}
          projectEntries={projectEntries}
          onEdit={() => {
            setCurrentStep(0)
            setViewMode('start')
          }}
        />
      )}
    </Box>
  )
}

export default DailyEditor
