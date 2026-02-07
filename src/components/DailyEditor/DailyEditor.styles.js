
export const cardStyles = {
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    border: '3px solid',
    borderColor: 'divider',
    borderRadius: '24px',
    transition: 'all 0.2s',
    bgcolor: 'background.paper',
    '&:hover': {
        borderColor: 'primary.main',
        bgcolor: 'action.hover',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }
};

export const toolbarStyles = {
    p: 1.5,
    px: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '24px',
    border: '3px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    mb: 3
};

export const datePickerStyles = {
    width: '180px',
    '& fieldset': { border: 'none' },
    '& .MuiInputBase-root': {
        bgcolor: 'action.hover',
        borderRadius: '12px',
        fontWeight: 900
    }
};

export const entryBodyStyles = {
    disableUnderline: true,
    sx: {
        fontSize: '1.2rem',
        lineHeight: 1.4,
        borderRadius: '16px',
        bgcolor: 'action.hover',
        p: 2.5,
        textAlign: 'left',
        color: 'text.primary',
        '&:hover': { bgcolor: 'action.selected' }
    }
};

export const markdownToolbarStyles = {
    display: 'flex',
    gap: 0.5,
    mb: 1,
    p: 0.5,
    bgcolor: 'action.hover',
    borderRadius: '12px',
    width: 'fit-content'
};

export const toolbarBtnStyles = {
    p: 1,
    borderRadius: '8px',
    color: 'text.secondary',
    '&:hover': {
        bgcolor: 'primary.main',
        color: 'white'
    }
};
