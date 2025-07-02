import * as React from 'react';
import classNames from 'classnames';
import '../../../components/control/icon-button-link.css';
import './toggle-icon-button.css';
import { ICON_LEAVE, ICON_JOIN } from '../../../components/icons';

export interface ToggleIconButtonProps {
  disabled?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
  joinLabel?: string;
  leaveLabel?: string;
}

export const ToggleIconButton: React.FC<ToggleIconButtonProps> = ({
  disabled = false,
  value,
  onChange,
  joinLabel = 'Join',
  leaveLabel = 'Leave'
}) => {
  // Create internal state that initializes from the value prop
  const [internalValue, setInternalValue] = React.useState(value);
  
  // Sync internal state with prop when prop changes
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      // Update internal state first
      const newValue = !internalValue;
      setInternalValue(newValue);
      
      // Then notify parent
      onChange(newValue);
    }
  };

  // Use the internal state for rendering, not the prop
  const isJoined = !internalValue;
  const label = isJoined ? leaveLabel : joinLabel;
  const iconPath = isJoined ? ICON_LEAVE : ICON_JOIN;
  const variant = isJoined ? 'danger' : 'primary';

  return (
    <button
      className={classNames(
        'icon-button',
        'toggle-icon-button',
        `variant-${variant}`,
        'icon-position-start',
        { disabled }
      )}
      disabled={disabled}
      onClick={handleClick}
      aria-pressed={isJoined}
      type="button"
    >
      <span className="icon">
        <img src={iconPath} alt={label} />
      </span>
      <span className="button-label">{label}</span>
    </button>
  );
}; 