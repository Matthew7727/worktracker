import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import WelcomeScreen from './components/Onboarding/WelcomeScreen';
import MainLayout from './components/Layout/MainLayout';
import DailyEditor from './components/DailyEditor/DailyEditor';
import Dashboard from './components/Dashboard/Dashboard';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import './App.css';

function App() {
  const { selectedDirectory } = useAppContext();

  if (!selectedDirectory) {
    return <WelcomeScreen />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DailyEditor />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
