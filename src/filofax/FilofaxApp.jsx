import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import FilofaxLayout from './FilofaxLayout'
import DiaryPage from './diary/DiaryPage'
import ToDoPage from './todo/ToDoPage'
import InsertPage from './todo/InsertPage'
import NotesPage from './notes/NotesPage'
import GoalsPage from '../components/Goals/GoalsPage'
import Reports from '../components/Reports/Reports'
import PlannerPage from './planner/PlannerPage'
import ContactsPage from './contacts/ContactsPage'
import IndexPage from './index/IndexPage'
import InfoPage from './info/InfoPage'

// The Filofax re-files the app into organiser sections. Ledger URLs still
// resolve (tray widget, search and old links) by redirecting to the section
// that now holds that content.
const FilofaxApp = () => (
  <FilofaxLayout>
    <Routes>
      <Route path="/" element={<DiaryPage />} />
      <Route path="/editor" element={<DiaryPage />} />
      <Route path="/todos" element={<ToDoPage />} />
      <Route path="/todos/:itemType/:itemId" element={<InsertPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/goals/:goalId" element={<GoalsPage />} />
      <Route path="/planner" element={<PlannerPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/index" element={<IndexPage />} />
      <Route path="/info" element={<InfoPage />} />
      <Route path="/dashboard" element={<Navigate to="/planner" replace />} />
      <Route path="/workspace" element={<Navigate to="/index" replace />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Navigate to="/info" replace />} />
      <Route
        path="/docs"
        element={<Navigate to="/info?page=instructions" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </FilofaxLayout>
)

export default FilofaxApp
