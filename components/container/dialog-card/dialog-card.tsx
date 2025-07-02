import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {
	IconX
} from '@tabler/icons';
import {Card} from '../card';
import {IconButton} from '../../control/icon-button';
import './dialog-card.css';
import useErrorBoundary from 'use-error-boundary';
import {ErrorMessage} from '../../error';
import {CSSProperties} from "react";

export interface DialogCardProps {
	cardOverflow?: string;
	id?: string,
	className?: string;
	fixedSize?: boolean;
	headerLabel: string;
	headerDisplayLabel?: React.ReactNode;
	highlighted?: boolean;
	onChangeHighlighted: (value: boolean) => void;
	onClose: (event?: React.KeyboardEvent | React.MouseEvent) => void;
}

export const DialogCard: React.FC<DialogCardProps> = props => {
	const {
		children,
		className,
		fixedSize,
		headerDisplayLabel,
		headerLabel,
		highlighted,
		onChangeHighlighted,
		onClose
	} = props;
	const {didCatch, ErrorBoundary, error} = useErrorBoundary();
	const {t} = useTranslation();

	React.useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	React.useEffect(() => {
		if (highlighted) {
			const timeout = window.setTimeout(() => onChangeHighlighted(false), 400);

			return () => window.clearTimeout(timeout);
		}
	}, [highlighted, onChangeHighlighted]);

	const calcdClassName = classNames('dialog-card', className, {
		highlighted,
		'fixed-size': fixedSize
	});

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose(event);
		}
	}

	let cardStyle: CSSProperties = {};
	if (props.cardOverflow) cardStyle.overflow = props.cardOverflow;

	return (
		<div
			aria-label={headerLabel}
			role="dialog"
			className={calcdClassName}
			onKeyDown={handleKeyDown}
		>
			<Card floating style={cardStyle}>
				<h2>
					<div className="dialog-card-header">
						<IconButton
							icon={null}
							displayLabel={headerDisplayLabel}
							label={headerLabel}
							onClick={() => {}}
						/>
					</div>
					<div className="dialog-card-header-controls">
						<IconButton
							icon={<IconX />}
							iconOnly
							label={t('common.close')}
							onClick={onClose}
							tooltipPosition="bottom"
						/>
					</div>
				</h2>
				{didCatch ? (
					<ErrorMessage>
						{t('components.dialogCard.contentsCrashed')}
					</ErrorMessage>
				) : (
					<ErrorBoundary>{children}</ErrorBoundary>
				)}
			</Card>
		</div>
	);
};
