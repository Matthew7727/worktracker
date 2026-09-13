import React from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Fade,
} from '@mui/material'
import ReactMarkdown from 'react-markdown'
import { FONT, hardShadow, OFFSET, RULE } from '../../styles/tokens'
import {
  docsContainerStyles,
  docsSidebarStyles,
  docsContentStyles,
} from '../Layout/MainLayout.styles'
import { docsContent } from './docsContent'

const Documentation = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Fade in timeout={800}>
      <Box sx={docsContainerStyles}>
        {/* Side Navigation */}
        <Box sx={docsSidebarStyles}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `${RULE.base}px solid`,
              borderColor: 'text.primary',
              boxShadow: (theme) =>
                hardShadow(OFFSET.base, theme.palette.text.primary),
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.25rem',
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              CONTENTS
            </Typography>
            <Divider
              sx={{
                borderBottomWidth: `${RULE.hair}px`,
                borderColor: 'text.primary',
                mb: 2,
              }}
            />
            <List component="nav" sx={{ p: 0 }}>
              {docsContent.map((section) => (
                <ListItem key={section.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => scrollToSection(section.id)}
                    sx={{
                      border: `${RULE.hair}px solid`,
                      borderColor: 'transparent',
                      '&:hover': {
                        bgcolor: 'text.primary',
                        borderColor: 'text.primary',
                        color: 'background.paper',
                      },
                    }}
                  >
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: 'inherit',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box
          sx={[
            docsContentStyles,
            {
              maxWidth: '68ch',
              '& h1, & h2, & h3, & h4': {
                fontWeight: 800,
                letterSpacing: '-0.02em',
              },
              '& p, & li': {
                fontWeight: 400,
                lineHeight: 1.6,
              },
              '& code': {
                fontFamily: FONT.data,
                borderRadius: 0,
                border: `${RULE.hair}px solid`,
                borderColor: 'divider',
              },
              '& pre': {
                borderRadius: 0,
                border: `${RULE.base}px solid`,
                borderColor: 'text.primary',
                boxShadow: 'none',
              },
              '& pre code': {
                border: 'none',
                bgcolor: 'transparent',
              },
            },
          ]}
        >
          {docsContent.map((section) => (
            <Box
              key={section.id}
              id={section.id}
              sx={{ mb: 10, scrollMarginTop: '120px' }}
            >
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </Box>
          ))}

          <Box
            sx={{
              mt: 10,
              p: 4,
              bgcolor: 'primary.main',
              color: 'background.paper',
              border: `${RULE.base}px solid`,
              borderColor: 'text.primary',
              boxShadow: (theme) =>
                hardShadow(OFFSET.base, theme.palette.text.primary),
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Need Help?
            </Typography>
            <Typography
              sx={{ fontWeight: 700, fontSize: '1.2rem', opacity: 0.9 }}
            >
              If you have specific technical questions, check the source code on
              GitHub or reach out to Matt.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Fade>
  )
}

export default Documentation
