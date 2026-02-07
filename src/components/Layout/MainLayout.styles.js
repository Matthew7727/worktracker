
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
    minWidth: '150px'
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
