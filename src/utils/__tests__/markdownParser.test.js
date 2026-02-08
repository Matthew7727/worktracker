import { describe, it, expect, vi } from 'vitest';
import * as matter from 'gray-matter';
import { parseMarkdown, stringifyMarkdown } from '../markdownParser';

// Mock gray-matter to allow failure simulation
vi.mock('gray-matter', async (importOriginal) => {
    const actual = await importOriginal();
    const defaultFn = actual.default;

    // Create a wrapper function that behaves like the original
    const mockedMatter = function (...args) {
        return defaultFn(...args);
    };

    // Copy all properties
    Object.assign(mockedMatter, defaultFn);

    // Override stringify
    mockedMatter.stringify = vi.fn((content, data) => defaultFn.stringify(content, data));

    return {
        ...actual,
        default: mockedMatter,
    };
});

describe('markdownParser', () => {
    describe('parseMarkdown', () => {
        it('should correctly parse frontmatter and body', () => {
            const content = '---\ntags: [tag1, tag2]\ntime: "10:00"\n---\nThis is the body.';
            const { frontmatter, body } = parseMarkdown(content);
            expect(frontmatter.tags).toEqual(['tag1', 'tag2']);
            expect(frontmatter.time).toBe('10:00');
            expect(body.trim()).toBe('This is the body.');
        });

        it('should handle unquoted time as sexagesimal (YAML behavior)', () => {
            const content = '---\ntime: 10:00\n---\nBody.';
            const { frontmatter } = parseMarkdown(content);
            expect(frontmatter.time).toBe(600);
        });

        it('should handle missing frontmatter', () => {
            const content = 'Just plain text body.';
            const { frontmatter, body } = parseMarkdown(content);
            expect(frontmatter).toEqual({});
            expect(body.trim()).toBe('Just plain text body.');
        });

        it('should handle malformed frontmatter gracefully', () => {
            const content = '---\ntags: [unclosed\n---\nBody text.';
            const { frontmatter, body } = parseMarkdown(content);
            expect(typeof frontmatter).toBe('object');
        });
    });

    describe('stringifyMarkdown', () => {
        it('should correctly stringify frontmatter and body', () => {
            const body = 'My content';
            const metadata = { tags: ['test'], time: '12:00' };
            const result = stringifyMarkdown(body, metadata);
            expect(result).toContain('tags');
            expect(result).toContain('test');
            expect(result).toMatch(/time: ("|')?12:00("|')?/);
            expect(result.trim()).toContain('My content');
        });

        it('should handle body and metadata correctly', () => {
            const body = 'Plain body';
            const result = stringifyMarkdown(body, { key: 'val' });
            expect(result).toContain('---');
            expect(result).toContain('key: val');
            expect(result.trim()).toContain('Plain body');
        });

        it('should handle errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Force error
            matter.default.stringify.mockImplementationOnce(() => {
                throw new Error('Mock error');
            });

            const content = 'content';
            const data = { title: 'Test' };

            const result = stringifyMarkdown(content, data);

            expect(result).toBe(content);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});
