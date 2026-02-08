export const cardHoverEffect = (theme) => ({
    transition: 'all 0.2s',
    '&:hover': {
        transform: 'translate(-4px, -4px)',
        boxShadow: theme.palette.mode === 'light' ? '10px 10px 0px #000000' : '10px 10px 0px rgba(255,255,255,0.1)',
    }
});

export const boldBorder = (theme) => ({
    border: '3px solid',
    borderColor: 'divider',
    borderRadius: '24px',
    boxShadow: theme.palette.mode === 'light' ? '6px 6px 0px #000000' : '6px 6px 0px rgba(0,0,0,0.5)',
    bgcolor: 'background.paper',
    overflow: 'hidden'
});

export const summaryCardStyles = (theme) => ({
    ...boldBorder(theme),
    ...cardHoverEffect(theme),
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    bgcolor: 'background.paper'
});

export const ghostPaper = (theme) => ({
    p: 3,
    borderRadius: '24px',
    border: '3px dashed',
    borderColor: 'divider',
    bgcolor: 'action.hover'
});
