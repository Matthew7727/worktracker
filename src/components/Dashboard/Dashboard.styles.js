
export const cardHoverEffect = {
    transition: 'all 0.2s',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 0 black'
    }
};

export const boldBorder = {
    border: '3px solid black',
    borderRadius: '24px'
};

export const summaryCardStyles = {
    ...boldBorder,
    ...cardHoverEffect,
    p: 4,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
};

export const ghostPaper = {
    p: 4,
    borderRadius: '24px',
    border: '3px dashed black',
    bgcolor: 'rgba(0,0,0,0.02)'
};
