import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const UpdateContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useUpdate = () => {
  return useContext(UpdateContext)
}

// Single owner of auto-update state. Registers the one 'update:event'
// listener for the window; everything else (Settings, snackbar) reads from
// here instead of attaching its own IPC listeners.
export const UpdateProvider = ({ children }) => {
  // idle | checking | available | downloading | downloaded | up-to-date | error
  const [status, setStatus] = useState('idle')
  const [info, setInfo] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  const statusRef = useRef('idle')
  // Background checks fail quietly (e.g. offline at launch); errors are only
  // surfaced when the user initiated the check/download themselves.
  const interactiveRef = useRef(false)
  const offeredVersionRef = useRef(null)
  const upToDateTimerRef = useRef(null)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    const api = window.electronAPI
    if (!api || !api.onUpdateEvent) return undefined

    api.onUpdateEvent((event) => {
      switch (event.status) {
        case 'checking':
          setError(null)
          setStatus('checking')
          break
        case 'available':
          setInfo({
            version: event.version,
            releaseDate: event.releaseDate,
            releaseNotes: event.releaseNotes,
          })
          if (offeredVersionRef.current !== event.version) {
            offeredVersionRef.current = event.version
            setDismissed(false)
          }
          setStatus('available')
          break
        case 'not-available':
          setStatus('up-to-date')
          clearTimeout(upToDateTimerRef.current)
          upToDateTimerRef.current = setTimeout(() => {
            setStatus((s) => (s === 'up-to-date' ? 'idle' : s))
          }, 4000)
          break
        case 'downloading':
          setStatus('downloading')
          setProgress({
            percent: event.percent,
            bytesPerSecond: event.bytesPerSecond,
            transferred: event.transferred,
            total: event.total,
          })
          break
        case 'downloaded':
          setStatus('downloaded')
          setDismissed(false)
          break
        case 'error':
          if (interactiveRef.current || statusRef.current === 'downloading') {
            setError(event.message)
            setStatus('error')
          } else {
            setStatus('idle')
          }
          break
        default:
          break
      }
    })

    return () => {
      clearTimeout(upToDateTimerRef.current)
      if (api.removeUpdateListeners) api.removeUpdateListeners()
    }
  }, [])

  const checkForUpdates = useCallback(async () => {
    if (!window.electronAPI || !window.electronAPI.checkForUpdates) return null
    interactiveRef.current = true
    setError(null)
    return window.electronAPI.checkForUpdates()
  }, [])

  const downloadUpdate = useCallback(async () => {
    if (!window.electronAPI || !window.electronAPI.downloadUpdate) return null
    interactiveRef.current = true
    return window.electronAPI.downloadUpdate()
  }, [])

  const installUpdate = useCallback(() => {
    if (window.electronAPI && window.electronAPI.installUpdate) {
      window.electronAPI.installUpdate()
    }
  }, [])

  const dismiss = useCallback(() => setDismissed(true), [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setProgress(null)
  }, [])

  return (
    <UpdateContext.Provider
      value={{
        status,
        info,
        progress,
        error,
        dismissed,
        checkForUpdates,
        downloadUpdate,
        installUpdate,
        dismiss,
        reset,
      }}
    >
      {children}
    </UpdateContext.Provider>
  )
}
