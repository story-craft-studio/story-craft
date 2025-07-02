import * as React from 'react';
import { TemplateCard } from './template-card';
import './left-panel.css';

interface LeftPanelProps {
  children?: React.ReactNode;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ children }) => {
  return (
    <div className="left-panel">
      {children || <TemplateCard />}
    </div>
  );
}; 