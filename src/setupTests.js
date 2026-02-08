import '@testing-library/jest-dom';

// Mock Electron API
global.window.electronAPI = {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    deleteFile: vi.fn(),
    listDir: vi.fn(),
    listAllFiles: vi.fn(),
    openDirectory: vi.fn(),
    searchEntries: vi.fn(),
    watchWorkspace: vi.fn(),
    onWorkspaceChanged: vi.fn(),
};

// Mock LocalStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});
