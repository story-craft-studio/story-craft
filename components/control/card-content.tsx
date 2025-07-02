import * as React from 'react';

export const CardContent: React.FC = ({ children }) => {
    return (
        <div className="card-content">
            {children}
        </div>
    );
}; 