import matter from 'gray-matter';

// Note: gray-matter is isomorphic but might rely on node built-ins like Buffer. 
// Vite usually handles this, or we might need a polyfill configuration.

/**
 * Parses markdown content with frontmatter.
 * @param {string} fileContent - The raw file content
 * @returns {Object} { frontmatter, body }
 */
export const parseMarkdown = (fileContent) => {
    if (!fileContent) return { frontmatter: {}, body: '' };

    try {
        const { data, content } = matter(fileContent);
        return { frontmatter: data, body: content };
    } catch (e) {
        console.error("Failed to parse markdown", e);
        // Fallback: treat everything as body, empty frontmatter
        return { frontmatter: {}, body: fileContent };
    }
};

/**
 * Converts body and frontmatter back to a markdown string.
 * @param {string} body - The markdown content
 * @param {Object} frontmatter - The frontmatter object
 * @returns {string} The full file content with frontmatter
 */
export const stringifyMarkdown = (body, frontmatter) => {
    try {
        return matter.stringify(body, frontmatter);
    } catch (e) {
        console.error("Failed to stringify markdown", e);
        return body;
    }
};

/**
 * Parses the markdown body into three predefined streams.
 * @param {string} body - The markdown body content
 * @returns {Object} { clientWork, practiceDevelopment, businessDevelopment }
 */
export const parseStreams = (body) => {
    const streams = {
        clientWork: '',
        practiceDevelopment: '',
        businessDevelopment: ''
    };

    if (!body) return streams;

    const sections = body.split(/^# (Client Work|Practice Development|Business Development)/m);

    for (let i = 1; i < sections.length; i += 2) {
        const title = sections[i];
        const content = sections[i + 1] ? sections[i + 1].trim() : '';

        if (title === 'Client Work') streams.clientWork = content;
        else if (title === 'Practice Development') streams.practiceDevelopment = content;
        else if (title === 'Business Development') streams.businessDevelopment = content;
    }

    return streams;
};

/**
 * Converts stream contents into a single markdown body string.
 * @param {Object} streams - { clientWork, practiceDevelopment, businessDevelopment }
 * @returns {string} The formatted markdown body
 */
export const stringifyStreams = (streams) => {
    let body = '';
    if (streams.clientWork) {
        body += `# Client Work\n${streams.clientWork}\n\n`;
    }
    if (streams.practiceDevelopment) {
        body += `# Practice Development\n${streams.practiceDevelopment}\n\n`;
    }
    if (streams.businessDevelopment) {
        body += `# Business Development\n${streams.businessDevelopment}\n\n`;
    }
    return body.trim();
};
