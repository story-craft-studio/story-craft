import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Story } from '../../store/stories';
import './archive-popup.css';

export interface ArchivedStoryItemProps {
    story: Story;
    onUnarchive: (story: Story) => void;
}

const ArchivedStoryItem: React.FC<ArchivedStoryItemProps> = ({ story, onUnarchive }) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = React.useState(false);

    const handleUnarchive = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onUnarchive(story);
    };

    return (
        <div 
            className="archived-story-item"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="archived-story-info">
                <h3 className="archived-story-title">{story.name}</h3>
                <p className="archived-story-meta">
                    {t('components.storyCard.passageCount', {
                        count: story.passages.length
                    })}
                </p>
            </div>
            
            {isHovered && (
                <button 
                    className="archived-story-unarchive-button"
                    onClick={handleUnarchive}
                    title={t('archive.removeFromArchive', 'Remove from archive')}
                >
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M9 11H7V9H9V11ZM13 9V11H11V9H13ZM15 9V11H17V9H15ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" 
                            fill="currentColor"
                        />
                    </svg>
                    {t('archive.removeFromArchive', 'Remove from archive')}
                </button>
            )}
        </div>
    );
};

export interface ArchivePopupProps {
    open: boolean;
    onClose: () => void;
    archivedStories: Story[];
    onUnarchive: (story: Story) => void;
}

export const ArchivePopup: React.FC<ArchivePopupProps> = ({ 
    open, 
    onClose, 
    archivedStories, 
    onUnarchive 
}) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    maxHeight: '80vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                pb: 2
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M20.54 5.23L19.15 3.55C18.88 3.21 18.47 3 18 3H6C5.53 3 5.12 3.21 4.85 3.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V6.5C21 6.02 20.83 5.57 20.54 5.23ZM12 17.5L6.5 12H10V10H14V12H17.5L12 17.5ZM5.12 5L6 4H18L18.88 5H5.12Z" 
                            fill="currentColor"
                        />
                    </svg>
                    <span>
                        {t('archive.title', 'Archived Stories')} ({archivedStories.length})
                    </span>
                </div>
                <IconButton onClick={onClose} size="small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3 }}>
                {archivedStories.length === 0 ? (
                    <div className="archive-empty-state">
                        <p>{t('archive.empty', 'No archived stories yet.')}</p>
                    </div>
                ) : (
                    <div className="archived-stories-list">
                        {archivedStories.map(story => (
                            <ArchivedStoryItem
                                key={story.id}
                                story={story}
                                onUnarchive={onUnarchive}
                            />
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}; 