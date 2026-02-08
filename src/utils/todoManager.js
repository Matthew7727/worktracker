
import { getDailyFilePath } from './fileHelpers';

/**
 * Parsed Todo Item structure
 * @typedef {Object} TodoItem
 * @property {string} id - Unique ID (timestamp + random)
 * @property {string} text - Task content
 * @property {boolean} completed - Is checked
 * @property {string} originalLine - Original markdown line for preservation (optional)
 */

/**
 * Parsed Lane structure
 * @typedef {Object} TodoLane
 * @property {string} title - Lane header (e.g. "To Do")
 * @property {TodoItem[]} items - List of tasks
 */

/**
 * Generates the specific path for todo files: YYYY-MM-DD-todos.md
 */
export const getTodoFilePath = (rootDir, date) => {
    const dailyPath = getDailyFilePath(rootDir, date);
    if (!dailyPath) return '';
    return dailyPath.replace('.md', '-todos.md');
};

/**
 * Loads todos for a specific date
 * @returns {Promise<TodoLane[]>}
 */
export const loadDailyTodos = async (rootDir, date) => {
    if (!window.electronAPI) return getDefaultLanes();

    const filePath = getTodoFilePath(rootDir, date);
    const result = await window.electronAPI.readFile(filePath);

    if (result.success) {
        return parseTodoMarkdown(result.data);
    }

    // If file doesn't exist, check for rollover from previous days
    return await checkForRollover(rootDir, date);
};

const checkForRollover = async (rootDir, date) => {
    // 1. List all todo files
    const result = await window.electronAPI.listAllFiles(rootDir);
    if (!result.success) return getDefaultLanes();

    // 2. Filter for *-todos.md files
    const todoFiles = result.files.filter(f => f.endsWith('-todos.md'));

    if (todoFiles.length === 0) return getDefaultLanes();

    // 3. Find the most recent file before today
    const todayPath = getTodoFilePath(rootDir, date);
    // Sort descending
    todoFiles.sort().reverse();

    // Find the first file that is "less than" today's path (lexicographical sort works for YYYY-MM-DD)
    // Note: We need to be careful with paths. Let's simplify and just look for the first file that isn't today.
    // Since we filtered for *-todos.md and sorted desc, the first one that isn't today is likely the most recent previous.
    // Ideally we parse dates, but string comparison is robust for ISO dates.

    const previousFile = todoFiles.find(f => f < todayPath);

    if (!previousFile) return getDefaultLanes();

    // 4. Load that file
    const prevResult = await window.electronAPI.readFile(previousFile);
    if (!prevResult.success) return getDefaultLanes();

    const prevLanes = parseTodoMarkdown(prevResult.data);
    const newLanes = getDefaultLanes();

    // 5. Migrate incomplete tasks
    // We want to preserve the lane titles.
    // If a lane exists in the previous file and has incomplete tasks, we create it in the new file.

    // Start with default "General" or empty?
    // Let's start empty to only carry over relevant lanes, but if nothing carries over we want at least "General".
    let newLanesMap = new Map(); // title -> items array

    // Initialize with default lanes if we want to ensure "General" always exists?
    // Let's just use the default lanes as a base, then merge.
    const defaults = getDefaultLanes();
    defaults.forEach(l => newLanesMap.set(l.title, [...l.items]));

    let rolloverCount = 0;
    prevLanes.forEach(lane => {
        const incompleteItems = lane.items.filter(i => !i.completed);
        if (incompleteItems.length > 0) {
            // Get or create lane in new map
            if (!newLanesMap.has(lane.title)) {
                newLanesMap.set(lane.title, []);
            }
            const existingItems = newLanesMap.get(lane.title);

            incompleteItems.forEach(item => {
                existingItems.push({
                    ...item,
                    text: `(Rollover) ${item.text}`
                });
                rolloverCount++;
            });
        }
    });

    // Convert map back to array
    const finalListLanes = Array.from(newLanesMap.entries()).map(([title, items]) => ({ title, items }));

    if (rolloverCount > 0) {
        saveDailyTodos(rootDir, date, finalListLanes);
    }

    return finalListLanes;
};

/**
 * Saves todos to markdown
 * @param {TodoLane[]} lanes
 */
export const saveDailyTodos = async (rootDir, date, lanes) => {
    if (!window.electronAPI) return;

    const filePath = getTodoFilePath(rootDir, date);
    const content = serializeTodoMarkdown(lanes);

    await window.electronAPI.writeFile(filePath, content);
};

const getDefaultLanes = () => [
    { title: 'General', items: [] }
];

/**
 * Parses markdown into lanes.
 * Format:
 * # Lane Title
 * - [ ] Task
 * - [x] Completed Task
 */
const parseTodoMarkdown = (content) => {
    const lines = content.split('\n');
    const lanes = [];
    let currentLane = null;

    lines.forEach(line => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
            // New Lane
            if (currentLane) lanes.push(currentLane);
            currentLane = {
                title: trimmed.substring(2).trim(),
                items: []
            };
        } else if (trimmed.startsWith('- [') && currentLane) {
            // Task Item
            const isCompleted = trimmed.startsWith('- [x]');
            const text = trimmed.substring(5).trim();
            currentLane.items.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                text,
                completed: isCompleted
            });
        }
    });

    if (currentLane) lanes.push(currentLane);

    // If empty or malformed, return defaults
    return lanes.length > 0 ? lanes : getDefaultLanes();
};

const serializeTodoMarkdown = (lanes) => {
    return lanes.map(lane => {
        const header = `# ${lane.title}`;
        const items = lane.items.map(item => {
            return `- [${item.completed ? 'x' : ' '}] ${item.text}`;
        }).join('\n');
        return `${header}\n${items}`;
    }).join('\n\n');
};
