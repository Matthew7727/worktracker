import { describe, it, expect } from 'vitest';
import { loadAllEntries } from './DataManager';

describe('DataManager Logic', () => {
    it('successfully parses multiple files into sorted entries', async () => {
        // Mock electron listAllFiles
        window.electronAPI.listAllFiles.mockResolvedValue({
            success: true,
            files: [
                'C:/mock/2024-01-01.md',
                'C:/mock/2024-01-02_113000.md',
                'C:/mock/not-a-log.txt'
            ]
        });

        // Mock electron readFile with markdown content + frontmatter
        window.electronAPI.readFile.mockImplementation((path) => {
            if (path.includes('2024-01-01')) {
                return Promise.resolve({
                    success: true,
                    data: '---\ntags: [work, tests]\ntime: 10:00:00\n---\nWorked on feature A.'
                });
            }
            if (path.includes('2024-01-02')) {
                return Promise.resolve({
                    success: true,
                    data: '---\ntags: [docs]\ntime: 11:30:00\n---\nUpdated documentation.'
                });
            }
            return Promise.resolve({ success: false });
        });

        const entries = await loadAllEntries('/mock/dir');

        expect(entries.length).toBe(2);
        expect(entries[0].date).toBe('2024-01-02'); // Most recent first
        expect(entries[0].time).toBe('11:30');
        expect(entries[0].tags).toContain('docs');
        expect(entries[1].date).toBe('2024-01-01');
        expect(entries[1].content.trim()).toBe('Worked on feature A.');
    });

    it('returns empty array if directory listing fails', async () => {
        window.electronAPI.listAllFiles.mockResolvedValue({ success: false });
        const entries = await loadAllEntries('/mock/dir');
        expect(entries).toEqual([]);
    });
});
