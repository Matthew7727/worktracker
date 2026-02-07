import React, { useState, useEffect } from 'react';
import { Grid, Column, Tile, SkeletonText, UnorderedList, ListItem, Tag, Button, Modal } from '@carbon/react';
import { useAppContext } from '../../context/AppContext';
import { loadAllEntries } from '../../utils/DataManager';
import { useNavigate } from 'react-router-dom';
import ContributionGraph from './ContributionGraph';
import { TrashCan } from '@carbon/icons-react';
import { getDailyFilePath } from '../../utils/fileHelpers';

const Dashboard = () => {
    const { selectedDirectory, refreshTrigger } = useAppContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalDays: 0, topTags: [], recentEntries: [] });
    const [loading, setLoading] = useState(true);
    const [allEntries, setAllEntries] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const handleDeleteClick = (e, entry) => {
        e.stopPropagation();
        setEntryToDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!entryToDelete || !selectedDirectory) return;

        try {
            // Use path directly from entry object
            const result = await window.electronAPI.deleteFile(entryToDelete.path);
            if (result.success) {
                // refreshTrigger will handle the data update 
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedDirectory) return;
            setLoading(true);
            try {
                const resolvedEntries = await loadAllEntries(selectedDirectory);
                setAllEntries(resolvedEntries);

                // stats should represent unique days and aggregated tags
                const uniqueDates = new Set(resolvedEntries.map(e => e.date));
                const totalDays = uniqueDates.size;

                // Count tags
                const tagCounts = {};
                resolvedEntries.forEach(entry => {
                    if (entry.tags && Array.isArray(entry.tags)) {
                        entry.tags.forEach(tag => {
                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                        });
                    }
                });

                // Sort tags
                const sortedTags = Object.entries(tagCounts)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 5) // Top 5
                    .map(([tag, count]) => ({ tag, count }));

                setStats({
                    totalDays,
                    topTags: sortedTags,
                    recentEntries: resolvedEntries.slice(0, 5)
                });
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDirectory, refreshTrigger]);

    const SummaryTile = ({ title, count, accentColor }) => (
        <Tile className="light-panel" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderWidth: '2px', // Bolder border
            borderColor: 'var(--text-primary)',
            padding: '2rem',
            background: 'white'
        }}>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>{title}</h4>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                {loading ? <SkeletonText width="80px" /> : count}
            </span>
        </Tile>
    );

    const handleEntryClick = (dateStr) => {
        navigate('/', { state: { initialDate: dateStr } });
    };

    return (
        <Grid className="dashboard-page animate-slide-up" fullWidth style={{ padding: '2rem' }}>
            <Column lg={16} md={8} sm={4}>
                <h1 style={{ marginBottom: '3rem', fontWeight: 900, fontSize: '4rem', color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>Dashboard</h1>
            </Column>

            {/* Summary Tiles */}
            <Column lg={4} md={4} sm={4} style={{ marginBottom: '2rem' }}>
                <SummaryTile title="Total Days Logged" count={stats.totalDays} accentColor="var(--accent-primary)" />
            </Column>
            <Column lg={4} md={4} sm={4} style={{ marginBottom: '2rem' }}>
                <SummaryTile title="Top Tag" count={stats.topTags.length > 0 ? stats.topTags[0].tag : '—'} accentColor="var(--accent-secondary)" />
            </Column>
            <Column lg={8} md={0} sm={0} /> {/* Spacer */}

            {/* Contribution Graph */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: '3rem' }}>
                <Tile className="light-panel" style={{ padding: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Yearly Activity</h4>
                    {loading ? (
                        <SkeletonText paragraph lineCount={3} />
                    ) : (
                        <ContributionGraph entries={allEntries} />
                    )}
                </Tile>
            </Column>

            {/* Recent Activity */}
            <Column lg={8} md={8} sm={4} style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Recent Activity</h3>
                {loading ? (
                    <SkeletonText paragraph lineCount={5} />
                ) : (
                    <Tile className="light-panel" style={{ padding: '2rem' }}>
                        <UnorderedList isExpressive>
                            {stats.recentEntries.length > 0 ? (
                                stats.recentEntries.map((entry, index) => (
                                    <ListItem key={entry.id} style={{ marginBottom: '1.5rem' }}>
                                        <div
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer', padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-sidebar)', border: '2px solid transparent', transition: 'var(--transition-smooth)' }}
                                            onClick={() => handleEntryClick(entry.date)}
                                            className="recent-entry-item-container"
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                    <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{entry.date}</span>
                                                    {entry.time && <span style={{ fontSize: '1.1rem', background: 'var(--accent-gradient-subtle)', padding: '4px 12px', borderRadius: '8px', fontWeight: 900, border: '1px solid var(--accent-secondary)' }}>{entry.time}</span>}
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        {entry.tags && entry.tags.map(tag => (
                                                            <Tag key={tag} type="cool-gray" size="lg" style={{ borderRadius: '8px', fontWeight: 900, border: '2px solid currentColor', padding: '0 1rem' }}>{tag}</Tag>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p style={{
                                                    fontSize: '1.1rem',
                                                    color: 'var(--text-secondary)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: '600px',
                                                    fontWeight: 600,
                                                    opacity: 0.8
                                                }}>
                                                    {entry.content || <em style={{ opacity: 0.5 }}>No content</em>}
                                                </p>
                                            </div>
                                            <Button
                                                kind="danger--ghost"
                                                size="lg"
                                                hasIconOnly
                                                renderIcon={TrashCan}
                                                iconDescription="Delete Entry"
                                                onClick={(e) => handleDeleteClick(e, entry)}
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid var(--text-primary)',
                                                    width: '3.5rem',
                                                    height: '3.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            />
                                        </div>
                                    </ListItem>
                                ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                                    <p style={{ marginBottom: '1rem', fontWeight: 700 }}>No entries found yet.</p>
                                    <Button kind="ghost" size="lg" onClick={() => navigate('/')}>Create your first entry</Button>
                                </div>
                            )}
                        </UnorderedList>
                    </Tile>
                )}
            </Column>

            {/* Top Tags */}
            <Column lg={8} md={8} sm={4} style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Trending Tags</h3>
                {loading ? (
                    <SkeletonText paragraph lineCount={5} />
                ) : (
                    <Tile className="light-panel" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {stats.topTags.length > 0 ? (
                                stats.topTags.map(({ tag, count }) => (
                                    <Tag
                                        key={tag}
                                        type="cyan"
                                        size="lg"
                                        title={`${count} entries`}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '0.5rem 1.5rem',
                                            background: 'white',
                                            border: '2px solid var(--accent-secondary)',
                                            color: 'var(--accent-secondary)',
                                            fontWeight: 900,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {tag} <span style={{ opacity: 0.7, marginLeft: '8px', fontSize: '0.85rem' }}>×{count}</span>
                                    </Tag>
                                ))
                            ) : (
                                <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.6, width: '100%' }}>
                                    <p style={{ fontWeight: 700 }}>Tags will appear here once you start logging.</p>
                                </div>
                            )}
                        </div>
                    </Tile>
                )}
            </Column>
            <Modal
                open={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                onRequestSubmit={confirmDelete}
                modalHeading="CONFIRM ARCHIVE PURGE"
                primaryButtonText="PERMANENTLY DELETE"
                secondaryButtonText="KEEP CONTRIBUTION"
                danger
                className="premium-delete-modal"
            >
                <div style={{ padding: '2.5rem 0', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '1.75rem',
                        fontWeight: 950,
                        color: 'var(--text-primary)',
                        marginBottom: '1.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em'
                    }}>
                        Are you absolutely sure?
                    </div>
                    <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        The entry for <strong>{entryToDelete?.date}</strong> will be purged.<br />
                        This action is irreversible and final.
                    </p>
                </div>
            </Modal>
        </Grid>
    );
};

export default Dashboard;
