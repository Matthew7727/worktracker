
export const cardHoverEffect = {
    transition: 'all 0.2s',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 0', // Theme context usually handles color, or use currentColor if needed
        color: 'text.primary' // ensure text color is consistent
    }
};

export const boldBorder = {
    border: '3px solid',
    borderColor: 'divider',
    borderRadius: '24px'
};

export const summaryCardStyles = {
    ...boldBorder,
    ...cardHoverEffect,
    p: 4,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    bgcolor: 'background.paper'
};

export const ghostPaper = {
    p: 4,
    borderRadius: '24px',
    border: '3px dashed',
    borderColor: 'divider',
    bgcolor: 'action.hover'
};
