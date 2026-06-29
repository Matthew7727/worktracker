export const DAY_STATUSES = [
  { id: 'working', label: 'Working', color: 'primary.main' },
  { id: 'pto', label: 'PTO', color: '#4dabf7' },
  { id: 'sick', label: 'Sick', color: '#ff6b6b' },
  { id: 'volunteering', label: 'Volunteering', color: '#9c6ade' },
]

export const PROJECT_TYPE_COLORS = {
  client: 'primary.main',
  pd: '#ffd166',
  bd: '#eb8449',
}

export const PROJECT_TYPE_LABELS = {
  client: 'CLIENT WORK',
  pd: 'PRACTICE DEVELOPMENT',
  bd: 'BUSINESS DEVELOPMENT',
}

// Kept for legacy SummaryView rendering of old-format files
export const STEPS = [
  {
    id: 'clientWork',
    label: 'CLIENT WORK',
    question: 'What Client Work have you done today?',
    description: 'Anything you did that goes towards your utilisation.',
    color: 'primary.main',
  },
  {
    id: 'practiceDevelopment',
    label: 'PRACTICE DEVELOPMENT',
    question: 'What PD have you done today?',
    description: '',
    color: '#ffd166',
  },
  {
    id: 'businessDevelopment',
    label: 'BUSINESS DEVELOPMENT',
    question: 'What BD have you done today?',
    description: '',
    color: '#eb8449',
  },
]
