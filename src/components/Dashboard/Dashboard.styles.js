export const cardHoverEffect = {
    transition: 'all 0.2s',
    '&:hover': {
        transform: 'translate(-4px, -4px)',
        boxShadow: '10px 10px 0px #000000',
    }
};

export const boldBorder = {
    border: '3px solid',
    borderColor: 'divider',
    borderRadius: '24px',
    boxShadow: '6px 6px 0px #000000',
    bgcolor: 'background.paper',
    overflow: 'hidden'
};

export const summaryCardStyles = {
    ...boldBorder,
    ...cardHoverEffect,
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    bgcolor: 'background.paper'
};

export const ghostPaper = {
    p: 3,
    borderRadius: '24px',
    border: '3px dashed',
    borderColor: 'divider',
    bgcolor: 'action.hover'
};
