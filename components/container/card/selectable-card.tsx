import classNames from 'classnames';
import * as React from 'react';
import {Card, CardProps} from './card';
import './selectable-card.css';

export interface SelectableCardProps extends CardProps {
	label: string;
	onDoubleClick?: React.MouseEventHandler;
	onClick?: React.MouseEventHandler;
	onSelect: (value: boolean, exclusive: boolean) => void;
	selected?: boolean;
	className?: string;
}

export const SelectableCard: React.FC<SelectableCardProps> = props => {
	const {label, onDoubleClick, onClick, onSelect, selected, ...other} = props;
	const handleClick = React.useCallback(
		(event: React.MouseEvent) => {
			// If click handler is provided, call it first
			if (onClick) {
				onClick(event);
				return;
			}
			
			// Otherwise handle selection
			if (event.ctrlKey || event.shiftKey) {
				onSelect(!selected, false);
			} else {
				onSelect(true, true);
			}
		},
		[onClick, onSelect, selected]
	);
	const onKeyDown = React.useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();

				if (event.ctrlKey || event.shiftKey) {
					onSelect(!selected, false);
				} else {
					onSelect(true, true);
				}
			}
		},
		[onSelect, selected]
	);

	return (
		<div
			className={classNames('selectable-card', {selected}, props.className || '')}
			role="button"
			aria-label={label}
			aria-pressed={selected}
			onClick={handleClick}
			onDoubleClick={onDoubleClick}
			onKeyDown={onKeyDown}
			tabIndex={0}
		>
			<Card {...other} />
		</div>
	);
};
