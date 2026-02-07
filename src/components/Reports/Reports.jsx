import React, { useState } from 'react';
import { Grid, Column, Button, Select, SelectItem, InlineLoading, Tile } from '@carbon/react';
import { Download } from '@carbon/icons-react';
import { useAppContext } from '../../context/AppContext';
import { loadAllEntries } from '../../utils/DataManager';

const Reports = () => {
    const { selectedDirectory } = useAppContext();
    const [range, setRange] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [status, setStatus] = useState('');

    const handleExport = async (format) => {
        if (!selectedDirectory) return;
        setIsExporting(true);
        setStatus('Loading entries...');

        try {
            // 1. Load Data
            const entries = await loadAllEntries(selectedDirectory);
            let filteredEntries = await entries;

            // 2. Filter logic (simple date math)
            const now = new Date();
            if (range === 'last30') {
                const cutoff = new Date();
                cutoff.setDate(now.getDate() - 30);
                filteredEntries = filteredEntries.filter(e => e.dateObj >= cutoff);
            } else if (range === 'thisYear') {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                filteredEntries = filteredEntries.filter(e => e.dateObj >= startOfYear);
            }

            setStatus(`Processing ${filteredEntries.length} entries...`);

            // 3. Serializing
            let content = '';
            let extension = '';

            if (format === 'json') {
                content = JSON.stringify(filteredEntries, null, 2);
                extension = 'json';
            } else {
                // Markdown Export
                content = `# Work Tracker Export\n\nGenerated: ${now.toLocaleDateString()}\nRange: ${range}\n\n`;
                filteredEntries.forEach(e => {
                    const timeHeader = e.time ? ` [${e.time}]` : '';
                    content += `### ${e.date}${timeHeader}\n\n`;
                    if (e.tags && e.tags.length > 0) {
                        content += `**Tags:** ${e.tags.join(', ')}\n\n`;
                    }
                    content += `${e.content}\n\n`;
                });
                content += `---\n\n`;
                extension = 'md';
            }

            // 4. Save Dialog
            if (window.electronAPI) {
                const { canceled, filePath } = await window.electronAPI.saveFile({
                    title: `Export ${format.toUpperCase()}`,
                    defaultPath: `work-tracker-export-${now.toISOString().split('T')[0]}.${extension}`,
                    buttonLabel: 'Export',
                    filters: [{ name: format.toUpperCase(), extensions: [extension] }]
                });

                if (canceled || !filePath) {
                    setStatus('Export canceled.');
                } else {
                    setStatus('Saving file...');
                    const result = await window.electronAPI.writeFile(filePath, content);
                    if (result.success) {
                        setStatus('Export successful!');
                    } else {
                        setStatus(`Error saving: ${result.error}`);
                    }
                }
            } else {
                console.warn("Electron API not found");
            }

        } catch (error) {
            console.error("Export failed:", error);
            setStatus('Export failed.');
        } finally {
            setIsExporting(false);
            setTimeout(() => setStatus(''), 3000); // Clear status after 3s
        }
    };

    return (
        <Grid className="reports-page animate-slide-up" fullWidth style={{ padding: '3rem' }}>
            <Column lg={16} md={8} sm={4}>
                <h1 style={{ marginBottom: '1rem', fontWeight: 900, fontSize: '4rem', color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>Reports & Export</h1>
                <p style={{ marginBottom: '4rem', color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 700 }}>Generate and distribute your work intelligence.</p>
            </Column>

            <Column lg={8} md={8} sm={4}>
                <Tile className="light-panel" style={{ padding: '3rem', border: '2px solid var(--text-primary)', background: 'white' }}>
                    <h4 style={{ marginBottom: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Configuration</h4>

                    <Select
                        id="export-range"
                        labelText="Date Range"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        style={{ marginBottom: '2rem' }}
                        size="lg"
                    >
                        <SelectItem value="all" text="All Time" />
                        <SelectItem value="thisYear" text="This Year" />
                        <SelectItem value="last30" text="Last 30 Days" />
                    </Select>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                        <Button
                            renderIcon={Download}
                            onClick={() => handleExport('md')}
                            disabled={isExporting}
                            size="lg"
                            style={{
                                borderRadius: '12px',
                                background: 'var(--accent-gradient)',
                                border: 'none',
                                padding: '0 2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontWeight: 900
                            }}
                        >
                            EXPORT MARKDOWN
                        </Button>
                        <Button
                            kind="ghost"
                            renderIcon={Download}
                            onClick={() => handleExport('json')}
                            disabled={isExporting}
                            size="lg"
                            style={{
                                borderRadius: '12px',
                                border: '3px solid var(--text-primary)',
                                padding: '0 2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontWeight: 900,
                                color: 'var(--text-primary)'
                            }}
                        >
                            EXPORT JSON
                        </Button>
                    </div>

                    {/* Status Indicator */}
                    <div style={{ marginTop: '2.5rem', height: '2rem' }}>
                        {isExporting ? (
                            <InlineLoading description={status} />
                        ) : (
                            status && <p style={{ color: 'var(--accent-secondary)', fontWeight: 800, fontSize: '1.1rem' }}>{status}</p>
                        )}
                    </div>
                </Tile>
            </Column>

            <Column lg={8} md={0} sm={0}>
                <div className="light-panel" style={{ padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.9, border: '2px dashed var(--text-primary)', background: 'var(--bg-sidebar)' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', lineHeight: '1.6' }}>
                        Data is exported as a single file.<br />
                        Markdown is optimized for <br />
                        <span style={{ color: 'var(--accent-primary)' }}>Notion & Obsidian.</span>
                    </p>
                </div>
            </Column>
        </Grid>
    );
};

export default Reports;
