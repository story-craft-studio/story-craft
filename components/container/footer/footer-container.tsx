import React from 'react';
import { Box } from '@mui/material';
import { useDialogsContext } from '../../../dialogs';

interface FooterContainerProps {
    children: React.ReactNode;
}

export const FooterContainer: React.FC<FooterContainerProps> = ({ children }) => {
    const { dialogs } = useDialogsContext();
    // Kiểm tra có dialog đang mở không
    const anyDialogOpening = dialogs.activeDialogs.length > 0;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: '20px',
                left: anyDialogOpening
                    ? "calc(50% - 307px)"   // Offset khi có dialog đang mở
                    : "50%",                // Không có dialog thì căn giữa
                transform: 'translateX(-50%)',
                zIndex: 20000,             // Very high z-index to be on top
                backgroundColor: 'white',
                padding: '0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                isolation: 'isolate',      // Create a new stacking context
            }}
        >
            {children}
        </Box>
    );
}; 