import classNames from 'classnames';
import {deviceType} from 'detect-it';
import * as React from 'react';
import {DraggableCore, DraggableCoreProps} from 'react-draggable';
import {useTranslation} from 'react-i18next';
import {CardContent} from '../container/card';
import {SelectableCard} from '../container/card/selectable-card';
import {Passage, TagColors} from '../../store/stories';
import {TagStripe} from '../tag/tag-stripe';
import {passageIsEmpty} from '../../util/passage-is-empty';
import {darkenColor} from '../../util/pastel-colors';
import './passage-card.css';

export interface PassageCardProps {
	onEdit: (passage: Passage) => void;
	onDeselect: (passage: Passage) => void;
	onDragStart?: DraggableCoreProps['onStart'];
	onDrag?: DraggableCoreProps['onDrag'];
	onDragStop?: DraggableCoreProps['onStop'];
	onSelect: (passage: Passage, exclusive: boolean) => void;
	passage: Passage;
	tagColors: TagColors;
	startPassageId?: string;
}

// Needs to fill a large-sized passage card.
const excerptLength = 400;

export const PassageCard: React.FC<PassageCardProps> = React.memo(props => {
	const {
		onDeselect,
		onDrag,
		onDragStart,
		onDragStop,
		onEdit,
		onSelect,
		passage,
		tagColors,
		startPassageId
	} = props;
	const {t} = useTranslation();
	
	const isStartPassage = passage.id === startPassageId;
	
	const className = React.useMemo(
		() =>
			classNames('passage-card', {
				empty: passageIsEmpty(passage),
				selected: passage.selected,
				'start-passage': isStartPassage
			}),
		[passage, isStartPassage]
	);
	const container = React.useRef<HTMLDivElement>(null);
	const excerpt = React.useMemo(() => {
		let firstText = passage.commands?.[0]?.content?.text || '';
		if (firstText.length > 0) {
			return firstText.substring(0, excerptLength);
		}

		return (
			<span className="placeholder">
				{t(
					deviceType === 'touchOnly'
						? 'components.passageCard.placeholderTouch'
						: 'components.passageCard.placeholderClick'
				)}
			</span>
		);
	}, [passage.commands, t]);
	const style = React.useMemo(
		() => ({
			height: passage.height,
			left: passage.left,
			top: passage.top,
			width: passage.width,
			'--passage-color': passage.color || 'hsl(0, 0%, 90%)',
			'--passage-border-color': passage.color ? darkenColor(passage.color, 30) : 'hsl(0, 0%, 70%)'
		} as React.CSSProperties),
		[passage.height, passage.left, passage.top, passage.width, passage.color]
	);
	
	// Track previous selection state
	const prevSelected = React.useRef(passage.selected);
	
	// Effect to open passage editor when selected
	React.useEffect(() => {
		// Only trigger when selection state changes from false to true
		if (passage.selected && !prevSelected.current) {
			onEdit(passage);
		}
		prevSelected.current = passage.selected;
	}, [passage.selected, onEdit, passage]);
	
	const handleMouseDown = React.useCallback(
		(event: MouseEvent) => {
			// Shift- or control-clicking toggles our selected status, but doesn't
			// affect any other passage's selected status. If the shift or control key
			// was not held down and we were not already selected, we know the user
			// wants to select only this passage.

			if (event.shiftKey || event.ctrlKey) {
				if (passage.selected) {
					onDeselect(passage);
				} else {
					onSelect(passage, false);
				}
			} else if (!passage.selected) {
				onSelect(passage, true);
			}
		},
		[onDeselect, onSelect, passage]
	);
	
	const handleEdit = React.useCallback(
		() => onEdit(passage),
		[onEdit, passage]
	);
	
	const handleSelect = React.useCallback(
		(value: boolean, exclusive: boolean) => {
			onSelect(passage, exclusive);
		},
		[onSelect, passage]
	);
	
	const handleClick = React.useCallback(
		() => {
			// If already selected, just open editor directly
			if (passage.selected) {
				onEdit(passage);
			}
		},
		[onEdit, passage]
	);

	return (
		<DraggableCore
			nodeRef={container}
			onMouseDown={handleMouseDown}
			onStart={onDragStart}
			onDrag={onDrag}
			onStop={onDragStop}
		>
			<div className={className} ref={container} style={style} data-passage-tags={passage.tags.join(' ')}>
				<SelectableCard
					highlighted={passage.highlighted}
					label={passage.name}
					onClick={handleClick}
					onSelect={handleSelect}
					selected={passage.selected}
					className={'each-passage-card'}
				>
					<TagStripe tagColors={tagColors} tags={passage.tags} />
					<h2>{passage.name}</h2>
					<CardContent>{excerpt}</CardContent>
					{isStartPassage && (
						<div className="start-passage-indicator">
							<svg 
								width="20" 
								height="20" 
								viewBox="0 0 32 32" 
								className="start-star"
							>
								<circle cx="16" cy="16" r="16" fill="var(--dark-green)" />
								<path 
									d="M16 4l3.5 7.5 8.5 1-6 6 1.5 8.5-7.5-4-7.5 4 1.5-8.5-6-6 8.5-1z" 
									fill="white"
								/>
							</svg>
						</div>
					)}
				</SelectableCard>
			</div>
		</DraggableCore>
	);
});

PassageCard.displayName = 'PassageCard';
