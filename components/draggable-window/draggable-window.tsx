import * as React from 'react';
import {Rnd} from 'react-rnd';
import classNames from 'classnames';
import './draggable-window.css';

export interface DraggableWindowProps {
	/**
	 * Content to render inside the window
	 */
	children: React.ReactNode;
	/**
	 * Additional CSS class names
	 */
	className?: string;
	/**
	 * Default window position
	 */
	defaultPosition?: {
		x: number;
		y: number;
	};
	/**
	 * Default window size
	 */
	defaultSize?: {
		width: number;
		height: number;
	};
	/**
	 * Whether the window is visible
	 */
	isOpen: boolean;
	/**
	 * Called when the close button is clicked
	 */
	onClose: () => void;
	/**
	 * Window title
	 */
	title: string;
	/**
	 * Customize the close button icon (default is X)
	 */
	closeIcon?: React.ReactNode;
	/**
	 * Custom header content (replaces default title and close button)
	 */
	customHeader?: React.ReactNode;
	/**
	 * ID for the window (used for accessibility)
	 */
	id?: string;
	/**
	 * z-index for the window (default is 9999)
	 */
	zIndex?: number;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
	children,
	className,
	defaultPosition = {x: 50, y: 50},
	defaultSize = {width: 480, height: 320},
	isOpen,
	onClose,
	title,
	closeIcon,
	customHeader,
	id,
	zIndex = 9999
}) => {
	const [isDragging, setIsDragging] = React.useState(false);

	// Close on escape key
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	// Default close icon if none provided
	const defaultCloseIcon = (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);

	const renderHeader = () => {
		if (customHeader) {
			return customHeader;
		}

		return (
			<div className="draggable-window-header">
				<h3
					className="draggable-window-title"
					id={id ? `${id}-title` : undefined}
				>
					{title}
				</h3>
				<button
					type="button"
					onClick={onClose}
					className="draggable-window-close"
					aria-label="Close"
				>
					{closeIcon || defaultCloseIcon}
				</button>
			</div>
		);
	};

	return (
		<Rnd
			default={{
				x: defaultPosition.x,
				y: defaultPosition.y,
				width: defaultSize.width,
				height: defaultSize.height
			}}
			size={{
				width: defaultSize.width,
				height: defaultSize.height
			}}
			minWidth={defaultSize.width}
			minHeight={defaultSize.height}
			bounds="window"
			dragHandleClassName="draggable-window-header"
			className={classNames({
				dragging: isDragging
			})}
			style={{zIndex}}
			onDragStart={() => setIsDragging(true)}
			onDragStop={() => setIsDragging(false)}
			enableResizing={false}
			disableDragging={false}
			id={id}
			role="dialog"
			aria-labelledby={id ? `${id}-title` : undefined}
		>
			<div
				className={classNames('draggable-window', className)}
				aria-labelledby={id ? `${id}-title` : undefined}
			>
				{renderHeader()}
				<div className="draggable-window-body">{children}</div>
			</div>
		</Rnd>
	);
};
