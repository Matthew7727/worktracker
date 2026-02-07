import React from 'react';
import {
    Box, Typography, Paper, List, ListItem,
    ListItemText, ListItemButton, Divider, Fade
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { docsContainerStyles, docsSidebarStyles, docsContentStyles } from '../Layout/MainLayout.styles';
import { docsContent } from './docsContent';

const Documentation = () => {
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -120; // Account for fixed header
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={docsContainerStyles}>
                {/* Side Navigation */}
                <Box sx={docsSidebarStyles}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: '3px solid black',
                            borderRadius: '24px',
                            boxShadow: '0 8px 0 black',
                            bgcolor: 'white'
                        }}
                    >
                        <Typography sx={{ fontWeight: 950, fontSize: '1.25rem', mb: 2, letterSpacing: '-0.02em' }}>
                            CONTENTS
                        </Typography>
                        <Divider sx={{ borderBottomWidth: '2px', borderColor: 'black', mb: 2 }} />
                        <List component="nav" sx={{ p: 0 }}>
                            {docsContent.map((section) => (
                                <ListItem key={section.id} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => scrollToSection(section.id)}
                                        sx={{
                                            borderRadius: '12px',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                                        }}
                                    >
                                        <ListItemText
                                            primary={section.title}
                                            primaryTypographyProps={{
                                                fontWeight: 800,
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Box>

                {/* Main Content */}
                <Box sx={docsContentStyles}>
                    {docsContent.map((section) => (
                        <Box key={section.id} id={section.id} sx={{ mb: 10 }}>
                            <ReactMarkdown>{section.content}</ReactMarkdown>
                        </Box>
                    ))}

                    <Box sx={{ mt: 10, p: 4, bgcolor: 'primary.main', borderRadius: '24px', color: 'white', border: '3px solid black', boxShadow: '0 8px 0 black' }}>
                        <Typography variant="h4" sx={{ fontWeight: 950, mb: 1 }}>Need Help?</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', opacity: 0.9 }}>
                            If you have specific technical questions, check the source code on GitHub or reach out to the development team.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default Documentation;
