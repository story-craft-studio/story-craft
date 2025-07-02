import * as React from 'react';
import {useTranslation} from 'react-i18next';
import * as GeoPattern from 'geopattern';
import TagBlock from '../../common/passage-command/command-blocks/tag-block';
import {Story} from '../../store/stories';
import {Color} from '../../util/color';
import {CardContent, CardProps} from '../container/card';
import {SelectableCard} from '../container/card/selectable-card';
import {TagButton} from '../tag';
import './story-card.css';
import {StoryPreview} from './story-preview';

const dateFormatter = new Intl.DateTimeFormat([]);

// Available pattern generators for variety
const PATTERN_GENERATORS = [
	'octogons',
	'overlappingCircles',
	'plusSigns',
	'xes',
	'sineWaves',
	'hexagons',
	'overlappingRings',
	'plaid',
	'triangles',
	'squares',
	'concentricCircles',
	'diamonds',
	'tessellation',
	'nestedSquares',
	'mosaicSquares',
	'chevrons'
] as const;

export interface StoryCardProps extends CardProps {
	onChangeTagColor: (name: string, color: Color) => void;
	onRemoveTag: (name: string) => void;
	onEdit: () => void;
	onSelect: () => void;
	onArchive?: () => void;
	onDelete?: () => void;
	story: Story;
	storyTagColors: Record<string, Color>;
	isLoading?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = props => {
	const {
		onChangeTagColor,
		onEdit,
		onRemoveTag,
		onSelect,
		onArchive,
		onDelete,
		story,
		storyTagColors,
		isLoading = false,
		...otherProps
	} = props;
	const {t} = useTranslation();

	// Generate unique pattern based on story name
	const generateStoryPattern = React.useCallback((storyName: string) => {
		// Use story name to deterministically select a pattern generator
		const nameHash = storyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const patternType = PATTERN_GENERATORS[nameHash % PATTERN_GENERATORS.length];
		
		try {
			const pattern = GeoPattern.generate(storyName, {
				generator: patternType as any
			});
			return pattern.toDataUri();
		} catch (error) {
			// Fallback to default pattern if specific generator fails
			const pattern = GeoPattern.generate(storyName);
			return pattern.toDataUri();
		}
	}, []);

	const patternBackground = React.useMemo(() => {
		return generateStoryPattern(story.name);
	}, [story.name, generateStoryPattern]);

	const truncateTitle = (title: string, maxLength: number = 25): string => {
		if (title.length <= maxLength) {
			return title;
		}
		return title.substring(0, maxLength) + '...';
	};

	const handleOpenClick = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (!isLoading) {
			onEdit();
		}
	};

	const handleCardClick = (event: React.MouseEvent) => {
		if (!isLoading) {
			onSelect();
		}
	};

	const handleCardDoubleClick = (event: React.MouseEvent) => {
		if (!isLoading) {
			onEdit();
		}
	};

	const handleArchiveClick = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (!isLoading && onArchive) {
			onArchive();
		}
	};

	const handleDeleteClick = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (!isLoading && onDelete) {
			// Ask for confirmation before deleting
			if (window.confirm(t('common.deleteConfirm', 'Are you sure you want to delete this story? This action cannot be undone.'))) {
				onDelete();
			}
		}
	};

	return (
		<div className="story-card-new">
			<div 
				className={`story-card-container ${isLoading ? 'loading' : ''}`}
				onClick={handleCardClick}
				onDoubleClick={handleCardDoubleClick}
			>
				<div 
					className="story-card-thumbnail"
					style={{
						backgroundImage: `url("${patternBackground}")`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
					title={`Pattern for ${story.name}`}
				>
					{/* Geopattern background replaces gray placeholder */}
					
					{/* Hover open button */}
					<button 
						className="story-card-open-button"
						onClick={handleOpenClick}
						title="Open project"
						disabled={isLoading}
					>
						<svg 
							width="24" 
							height="24" 
							viewBox="0 0 24 24" 
							fill="none" 
							xmlns="http://www.w3.org/2000/svg"
						>
							<path 
								d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" 
								fill="currentColor"
							/>
							<path 
								d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z" 
								fill="currentColor"
							/>
						</svg>
						{t('common.edit')}
					</button>

					{/* Archive button */}
					{onArchive && (
						<button 
							className="story-card-archive-button"
							onClick={handleArchiveClick}
							title={t('common.archive', 'Archive')}
							disabled={isLoading}
						>
							<svg 
								width="20" 
								height="20" 
								viewBox="0 0 24 24" 
								fill="none" 
								xmlns="http://www.w3.org/2000/svg"
							>
								<path 
									d="M20.54 5.23L19.15 3.55C18.88 3.21 18.47 3 18 3H6C5.53 3 5.12 3.21 4.85 3.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V6.5C21 6.02 20.83 5.57 20.54 5.23ZM12 17.5L6.5 12H10V10H14V12H17.5L12 17.5ZM5.12 5L6 4H18L18.88 5H5.12Z" 
									fill="currentColor"
								/>
							</svg>
						</button>
					)}

					{/* Delete button */}
					{onDelete && (
						<button 
							className="story-card-delete-button"
							onClick={handleDeleteClick}
							title={t('common.delete', 'Delete')}
							disabled={isLoading}
						>
							<svg 
								width="20" 
								height="20" 
								viewBox="0 0 24 24" 
								fill="none" 
								xmlns="http://www.w3.org/2000/svg"
							>
								<path 
									d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" 
									fill="currentColor"
								/>
							</svg>
						</button>
					)}
				</div>
				<div className="story-card-content">
					<h2 className="story-card-title">{truncateTitle(story.name)}</h2>
					<p className="story-card-meta">
						{t('components.storyCard.lastUpdated', {
							date: dateFormatter.format(story.lastUpdate)
						})}
						<br />
						{t('components.storyCard.passageCount', {
							count: story.passages.length
						})}
					</p>
				</div>
				
				{/* Loading overlay */}
				{isLoading && (
					<div className="story-card-loading-overlay">
						<div className="story-card-loading-spinner">
							<div className="loading-spinner"></div>
							<span className="loading-text">{t('common.loading')}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
