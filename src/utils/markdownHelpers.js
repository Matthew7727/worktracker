
/**
 * Injects markdown syntax into a text based on selection or cursor position.
 * 
 * @param {string} text - The current text content
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} type - Action type
 * @returns {Object} { newText, newCursorPosition }
 */
export const injectMarkdown = (text, start, end, type) => {
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    let newText = text;
    let newCursor = end;

    // Helper to determine if we are at the start of a line
    const lastNewLine = before.lastIndexOf('\n');
    const isStartOfLine = lastNewLine === -1 || lastNewLine === before.length - 1;

    switch (type) {
        case 'bold':
            newText = `${before}**${selectedText || 'bold text'}**${after}`;
            newCursor = start + (selectedText ? selectedText.length + 4 : 11);
            break;
        case 'italic':
            newText = `${before}_${selectedText || 'italic text'}_${after}`;
            newCursor = start + (selectedText ? selectedText.length + 2 : 12);
            break;
        case 'strikethrough':
            newText = `${before}~~${selectedText || 'strikethrough text'}~~${after}`;
            newCursor = start + (selectedText ? selectedText.length + 4 : 20);
            break;
        case 'heading':
            const hPrefix = isStartOfLine ? '## ' : '\n## ';
            newText = `${before}${hPrefix}${selectedText || 'Heading'}${after}`;
            newCursor = start + hPrefix.length + (selectedText ? selectedText.length : 7);
            break;
        case 'list':
            const lPrefix = isStartOfLine ? '- ' : '\n- ';
            newText = `${before}${lPrefix}${selectedText || 'list item'}${after}`;
            newCursor = start + lPrefix.length + (selectedText ? selectedText.length : 9);
            break;
        case 'blockquote':
            const qPrefix = isStartOfLine ? '> ' : '\n> ';
            newText = `${before}${qPrefix}${selectedText || 'quote'}${after}`;
            newCursor = start + qPrefix.length + (selectedText ? selectedText.length : 5);
            break;
        case 'code':
            if (selectedText.includes('\n') || !selectedText) {
                // Block code
                const cPrefix = isStartOfLine ? '```\n' : '\n```\n';
                newText = `${before}${cPrefix}${selectedText || 'code block'}\n\`\`\`${after}`;
                newCursor = start + cPrefix.length + (selectedText ? selectedText.length : 10);
            } else {
                // Inline code
                newText = `${before}\`${selectedText}\`${after}`;
                newCursor = start + selectedText.length + 2;
            }
            break;
        case 'link':
            newText = `${before}[${selectedText || 'link text'}](https://example.com)${after}`;
            newCursor = start + (selectedText ? selectedText.length + 2 : 11);
            break;
        case 'align-left':
            newText = `${before}<div style="text-align: left">\n${selectedText || 'left aligned text'}\n</div>${after}`;
            newCursor = start + 30 + (selectedText ? selectedText.length : 17);
            break;
        case 'align-center':
            newText = `${before}<div style="text-align: center">\n${selectedText || 'centered text'}\n</div>${after}`;
            newCursor = start + 32 + (selectedText ? selectedText.length : 13);
            break;
        case 'align-right':
            newText = `${before}<div style="text-align: right">\n${selectedText || 'right aligned text'}\n</div>${after}`;
            newCursor = start + 31 + (selectedText ? selectedText.length : 18);
            break;
        default:
            break;
    }

    return { newText, newCursor };
};
