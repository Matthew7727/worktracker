
export const appBarStyles = {
    zIndex: 1100,
    borderBottom: '3px solid black',
    bgcolor: 'white',
    color: 'black'
};

export const toolbarStyles = {
    height: '5.5rem',
    px: '4rem !important',
    display: 'flex',
    gap: 4,
    bgcolor: 'white'
};

export const brandStyles = {
    cursor: 'pointer',
    fontWeight: 950,
    mr: 4,
    letterSpacing: '-0.05em',
    '& span': { color: 'primary.main' },
    whiteSpace: 'nowrap'
};

export const navItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 2,
    height: '100%',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: '1rem',
    color: isActive ? 'primary.main' : 'text.primary',
    borderBottom: '4px solid',
    borderColor: isActive ? 'primary.main' : 'transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    '&:hover': {
        bgcolor: 'rgba(0,0,0,0.04)'
    }
});

export const searchFieldStyles = {
    borderRadius: '12px',
    bgcolor: 'white',
    '& fieldset': { borderWidth: '2px', borderColor: 'black !important' },
    maxWidth: '400px',
    minWidth: '200px'
};

export const searchDialogStyles = {
    p: 2,
    borderRadius: '24px',
    border: '4px solid black'
};

export const alertStyles = {
    width: '100%',
    fontWeight: 900,
    border: '3px solid black',
    borderRadius: '16px',
    boxShadow: '0 8px 0 black',
    '& .MuiAlert-icon': { fontSize: '1.5rem' }
};

export const fabStyles = {
    border: '3px solid black',
    boxShadow: '0 6px 0 black',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 0 black' }
};

export const toolbarIconStyles = {
    border: '2px solid black',
    borderRadius: '12px',
    p: 1.5,
    transition: 'all 0.2s',
    '&:hover': {
        bgcolor: 'primary.main',
        color: 'white',
        transform: 'translateY(-2px)'
    }
};

// Documentation Page Styles
export const docsContainerStyles = {
    display: 'flex',
    gap: 6,
    py: 4
};

export const docsSidebarStyles = {
    width: '280px',
    flexShrink: 0,
    position: 'sticky',
    top: '7.5rem',
    height: 'fit-content',
    display: { xs: 'none', lg: 'block' }
};

export const docsContentStyles = {
    flexGrow: 1,
    minWidth: 0,
    '& h1': { fontWeight: 950, fontSize: '3rem', mb: 4, letterSpacing: '-0.02em' },
    '& h2': { fontWeight: 900, fontSize: '2rem', mt: 6, mb: 3, borderBottom: '3px solid black', pb: 1 },
    '& h3': { fontWeight: 900, fontSize: '1.5rem', mt: 4, mb: 2 },
    '& p': { fontSize: '1.1rem', lineHeight: 1.6, mb: 3, opacity: 0.8 },
    '& ul, & ol': { mb: 3, pl: 4 },
    '& li': { mb: 1.5, fontSize: '1.1rem', opacity: 0.8 },
    '& code': { bgcolor: 'rgba(0,0,0,0.05)', px: 1, borderRadius: '4px', fontWeight: 700 },
    '& blockquote': { borderLeft: '5px solid black', pl: 3, py: 1, my: 3, bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }
};
