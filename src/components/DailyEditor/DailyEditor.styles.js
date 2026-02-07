
export const cardStyles = {
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    border: '3px solid black',
    borderRadius: '24px',
    transition: 'all 0.2s',
    '&:hover': {
        borderColor: 'primary.main',
        bgcolor: 'rgba(0,0,0,0.01)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }
};

export const toolbarStyles = {
    p: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '24px',
    border: '3px solid black'
};

export const datePickerStyles = {
    width: '200px',
    '& fieldset': { border: 'none' },
    '& .MuiInputBase-root': {
        bgcolor: 'rgba(0,0,0,0.04)',
        borderRadius: '12px',
        fontWeight: 900
    }
};

export const entryBodyStyles = {
    disableUnderline: true,
    sx: {
        fontSize: '1.2rem',
        lineHeight: 1.8,
        borderRadius: '16px',
        bgcolor: 'rgba(0,0,0,0.02)',
        p: 3,
        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
    }
};
