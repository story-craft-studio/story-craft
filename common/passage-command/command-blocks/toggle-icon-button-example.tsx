import * as React from 'react';
import { ToggleIconButton } from './toggle-icon-button';

export const ToggleIconButtonExample: React.FC = () => {
  const [isJoined, setIsJoined] = React.useState(false);
  
  const handleChange = (newValue: boolean) => {
    console.log(`Toggle state changed to: ${newValue ? 'joined' : 'not joined'}`);
    setIsJoined(newValue);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Toggle Icon Button Example</h3>
      <p>Current state: {isJoined ? 'Joined' : 'Not joined'}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <ToggleIconButton 
          value={isJoined} 
          onChange={handleChange} 
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <ToggleIconButton 
          value={isJoined} 
          onChange={handleChange}
          joinLabel="Connect" 
          leaveLabel="Disconnect" 
        />
      </div>
      
      <div>
        <ToggleIconButton 
          value={isJoined} 
          onChange={handleChange} 
          disabled={true}
        />
      </div>
    </div>
  );
}; 