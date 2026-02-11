import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Electron API
global.window.electronAPI = {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    deleteFile: vi.fn(),
    listDir: vi.fn(),
    listAllFiles: vi.fn(),
    openDirectory: vi.fn(),
    searchEntries: vi.fn(),
};
