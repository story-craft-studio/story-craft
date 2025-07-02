import React, { useEffect } from 'react';
import { FooterContainer } from "../../../../../components/container/footer";
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../../../../components/control/icon-button';
import { ButtonBar } from '../../../../../components/container/button-bar';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons';
import { Box } from '@mui/material';
import { useSettings } from '../settings-context';

// Button color styles
const BUTTON_STYLES = {
    enabled: { color: '#2C7BE5' },    // Blue for active buttons
    disabled: { color: '#B0B8C4' },   // Gray for disabled buttons
} as const;

export const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();

    // Sử dụng settings context
    const {
        isGeneralSettingVisible,
        currentDialogIndex,
        openDialog,
        closeDialog,
        nextDialog,
        previousDialog,
        settingsConfig
    } = useSettings();

    // Tự động mở dialog đầu tiên khi component được mount
    useEffect(() => {
        if (isGeneralSettingVisible) {
            openDialog(currentDialogIndex || 0);
        }

        return () => {
            closeDialog(currentDialogIndex);
        };
    }, [isGeneralSettingVisible]);

    // Nếu GeneralSetting không hiển thị thì không render
    if (!isGeneralSettingVisible) return null;

    // Button states
    const isPrevDisabled = currentDialogIndex === 0;
    const isNextDisabled = currentDialogIndex === settingsConfig.length - 1;

    // Translated settings labels
    const translatedSettings = settingsConfig.map(config => ({
        ...config,
        label: t(config.label),
    }));

    return (
        <div style={{ pointerEvents: 'auto' }}>
            <FooterContainer>
                <Box
                    sx={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        position: 'relative',  // Added position relative
                        zIndex: 10001,        // Added higher z-index to ensure it appears above all elements
                        pointerEvents: 'auto',  // Explicitly enable pointer events
                    }}
                >
                    <ButtonBar>
                        <IconButton
                            icon={
                                <IconChevronLeft
                                    color={isPrevDisabled ? BUTTON_STYLES.disabled.color : BUTTON_STYLES.enabled.color}
                                />
                            }
                            label={t('common.back')}
                            onClick={previousDialog}
                            disabled={isPrevDisabled}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                margin: '0 16px',
                                minWidth: '150px',
                                textAlign: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: '#333',
                            }}
                        >
                            {currentDialogIndex + 1} / {settingsConfig.length}: {translatedSettings[currentDialogIndex]?.label || ''}
                        </Box>
                        <IconButton
                            icon={
                                <IconChevronRight
                                    color={isNextDisabled ? BUTTON_STYLES.disabled.color : BUTTON_STYLES.enabled.color}
                                />
                            }
                            label={t('common.next')}
                            onClick={nextDialog}
                            disabled={isNextDisabled}
                        />
                    </ButtonBar>
                </Box>
            </FooterContainer>
        </div>
    );
};
