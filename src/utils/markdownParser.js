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
