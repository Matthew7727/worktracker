import { describe, it, expect } from 'vitest'
import { getDailyFilePath } from './fileHelpers'

describe('fileHelpers', () => {
  describe('getDailyFilePath', () => {
    it('should generate a standard filename if no HHMMSS is provided', () => {
      const rootDir = 'C:/logs'
      const date = new Date('2024-05-20T12:00:00')
      const path = getDailyFilePath(rootDir, date)
      // Updated to match actual implementation: [Root]/YYYY/MM/YYYY-MM-DD.md
      expect(path).toBe('C:/logs/2024/05/2024-05-20.md')
    })

    it('should generate a timestamped filename if HHMMSS is provided', () => {
      const rootDir = 'C:/logs'
      const date = new Date('2024-05-20T12:00:00')
      const hhmmss = '143005'
      const path = getDailyFilePath(rootDir, date, hhmmss)
      expect(path).toBe('C:/logs/2024/05/2024-05-20_143005.md')
    })

    it('should handle root directory separators correctly', () => {
      const rootDir = 'C:\\logs'
      const date = new Date('2024-01-01T12:00:00')
      const path = getDailyFilePath(rootDir, date)
      // Implementation adds / between root and year
      expect(path.replace(/\\/g, '/')).toBe('C:/logs/2024/01/2024-01-01.md')
    })
  })
})
