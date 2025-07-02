import * as React from 'react';
import { useTranslation } from 'react-i18next';
import './archive-box.css';

export interface ArchiveBoxProps {
    archivedCount: number;
    onClick: () => void;
}

export const ArchiveBox: React.FC<ArchiveBoxProps> = ({ archivedCount, onClick }) => {
    const { t } = useTranslation();

    if (archivedCount === 0) {
        return null;
    }

    return (
        <div className="archive-box" onClick={onClick}>
            <div className="archive-box-icon">
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
                {archivedCount > 0 && (
                    <span className="archive-box-count">{archivedCount}</span>
                )}
            </div>
            <span className="archive-box-label">
                {t('archive.archived', 'Archived')}
            </span>
        </div>
    );
}; 