import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadDailyTodos, saveDailyTodos, getTodoStats, getTodoFilePath } from '../todoManager';
import * as fileHelpers from '../fileHelpers';

// Mock fileHelpers
vi.mock('../fileHelpers', () => ({
    getDailyFilePath: vi.fn(),
}));

describe('todoManager', () => {
    const mockRootDir = '/mock/root';
    const mockDate = new Date('2023-10-27T12:00:00Z');
    const mockDateStr = '2023-10-27';

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Setup default electronAPI mock
        global.window.electronAPI = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
            listAllFiles: vi.fn(),
        };

        // Default getDailyFilePath behavior
        fileHelpers.getDailyFilePath.mockImplementation((root, date) => {
            if (date instanceof Date) {
                return `${root}/${date.toISOString().split('T')[0]}.md`;
            }
            return `${root}/${date.split('T')[0]}.md`;
        });
    });

    afterEach(() => {
        delete global.window.electronAPI;
    });

    describe('getTodoFilePath', () => {
        it('should return correct path', () => {
            const path = getTodoFilePath(mockRootDir, mockDate);
            expect(path).toBe(`${mockRootDir}/2023-10-27-todos.md`);
        });
    });

    describe('loadDailyTodos', () => {
        it('should load and parse existing todos', async () => {
            const mockContent = '# Work\n- [ ] Task 1\n- [x] Task 2';
            global.window.electronAPI.readFile.mockResolvedValue({ success: true, data: mockContent });

            const lanes = await loadDailyTodos(mockRootDir, mockDate);

            expect(lanes).toHaveLength(1);
            expect(lanes[0].title).toBe('Work');
            expect(lanes[0].items).toHaveLength(2);
            expect(lanes[0].items[0].text).toBe('Task 1');
            expect(lanes[0].items[0].completed).toBe(false);
            expect(lanes[0].items[1].text).toBe('Task 2');
            expect(lanes[0].items[1].completed).toBe(true);
        });

        it('should return default lanes if file read fails and no rollover', async () => {
            global.window.electronAPI.readFile.mockResolvedValue({ success: false });
            global.window.electronAPI.listAllFiles.mockResolvedValue({ success: true, files: [] });

            const lanes = await loadDailyTodos(mockRootDir, mockDate);
            expect(lanes).toHaveLength(1);
            expect(lanes[0].title).toBe('General');
        });

        it('should perform rollover from previous day', async () => {
            // fail current day read
            global.window.electronAPI.readFile.mockResolvedValueOnce({ success: false });

            // list files
            global.window.electronAPI.listAllFiles.mockResolvedValue({
                success: true,
                files: [`${mockRootDir}/2023-10-26-todos.md`, `${mockRootDir}/2023-10-27-todos.md`]
            });

            // read previous file
            const prevContent = '# General\n- [ ] Old Task';
            global.window.electronAPI.readFile.mockResolvedValueOnce({ success: true, data: prevContent });

            const lanes = await loadDailyTodos(mockRootDir, mockDate);

            expect(lanes[0].items[0].text).toContain('(Rollover) Old Task');
            expect(window.electronAPI.writeFile).toHaveBeenCalled(); // Should save the new file
        });
    });

    describe('saveDailyTodos', () => {
        it('should format and save todos', async () => {
            const lanes = [{
                title: 'Test',
                items: [{ text: 'Task', completed: false }]
            }];

            await saveDailyTodos(mockRootDir, mockDate, lanes);

            expect(window.electronAPI.writeFile).toHaveBeenCalledWith(
                expect.stringContaining('2023-10-27-todos.md'),
                expect.stringContaining('# Test\n- [ ] Task')
            );
        });
    });

    describe('getTodoStats', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should calculate stats correctly', async () => {
            global.window.electronAPI.listAllFiles.mockResolvedValue({
                success: true,
                files: [`${mockRootDir}/2023-10-27-todos.md`]
            });

            const mockContent = '# General\n- [x] Done\n- [ ] Not Done';
            global.window.electronAPI.readFile.mockResolvedValue({ success: true, data: mockContent });

            // Mock system time to match 2023-10-27
            const date = new Date('2023-10-27T12:00:00Z');
            vi.setSystemTime(date);

            const stats = await getTodoStats(mockRootDir);

            expect(stats.today.total).toBe(2);
            expect(stats.today.completed).toBe(1);
        });
    });
});
