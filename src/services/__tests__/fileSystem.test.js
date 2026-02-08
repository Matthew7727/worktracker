import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, listFiles, selectProjectDirectory } from '../fileSystem';

describe('fileSystem Service', () => {
    beforeEach(() => {
        global.window.electronAPI = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
            listFiles: vi.fn(),
            selectDirectory: vi.fn(),
        };
    });

    afterEach(() => {
        delete global.window.electronAPI;
    });

    it('should call electronAPI.readFile', async () => {
        global.window.electronAPI.readFile.mockResolvedValue({ success: true, data: 'content' });
        const result = await readFile('/path/to/file');

        expect(global.window.electronAPI.readFile).toHaveBeenCalledWith('/path/to/file');
        expect(result).toEqual({ success: true, data: 'content' });
    });

    it('should return error if API is missing', async () => {
        delete global.window.electronAPI;
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await readFile('/path');
        expect(result.success).toBe(false);
        expect(result.error).toContain('API not available');

        consoleSpy.mockRestore();
    });

    it('should call electronAPI.writeFile', async () => {
        await writeFile('/path', 'content');
        expect(global.window.electronAPI.writeFile).toHaveBeenCalledWith('/path', 'content');
    });

    it('should call electronAPI.selectDirectory', async () => {
        await selectProjectDirectory();
        expect(global.window.electronAPI.selectDirectory).toHaveBeenCalled();
    });

    it('should call electronAPI.listFiles', async () => {
        await listFiles('/path');
        expect(global.window.electronAPI.listFiles).toHaveBeenCalledWith('/path');
    });
});
