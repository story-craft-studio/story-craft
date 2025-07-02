import * as React from 'react';
import { ToggleIconButton } from './toggle-icon-button';

export const ToggleButtonExample: React.FC = () => {
  // State is maintained in the parent component
  const [isJoined, setIsJoined] = React.useState(false);
  
  // Handler function properly updates the state
  const handleToggle = (newValue: boolean) => {
    console.log(`Setting state to: ${newValue}`);
    setIsJoined(newValue);
  };

  console.log(`Rendering parent with isJoined=${isJoined}`);

  return (
    <div className="toggle-button-container">
      <div>Current state: {isJoined ? 'Joined' : 'Not Joined'}</div>
      
      <ToggleIconButton
        value={isJoined}
        onChange={handleToggle}
        joinLabel="Join"
        leaveLabel="Leave"
      />
      
      <div className="debug-controls">
        <button onClick={() => setIsJoined(true)}>
          Force Join
        </button>
        <button onClick={() => setIsJoined(false)}>
          Force Leave
        </button>
        <button onClick={() => setIsJoined(!isJoined)}>
          Toggle Manually
        </button>
      </div>
    </div>
  );
}; 