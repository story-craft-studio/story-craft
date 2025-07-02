import * as React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player/lazy';
import './tutorial-modal.css';

// Types for different content types
export interface TutorialTextContent {
	type: 'text';
	text: string;
}

export interface TutorialImageContent {
	type: 'image';
	imageUrl: string;
	altText?: string;
	caption?: string;
}

export interface TutorialVideoContent {
	type: 'video';
	videoUrl: string;
	caption?: string;
}

export interface TutorialLinkContent {
	type: 'link';
	url: string;
	text: string;
	description?: string;
}

export interface TutorialMixedContent {
	type: 'mixed';
	text: string;
	imageUrl?: string;
	altText?: string;
}

export type TutorialContentItem =
	| TutorialTextContent
	| TutorialImageContent
	| TutorialVideoContent
	| TutorialLinkContent
	| TutorialMixedContent;

export interface TutorialStep {
	id: string;
	title: string;
	content: TutorialContentItem[];
}

export interface TutorialModalContentProps {
	steps: TutorialStep[];
	currentStep: number;
	onNext: () => void;
	onPrev: () => void;
	onGoToStep: (stepIndex: number) => void;
}

export const TutorialModalContent: React.FC<TutorialModalContentProps> = ({
	steps,
	currentStep,
	onNext,
	onPrev,
	onGoToStep
}) => {
	const { t } = useTranslation();
	const contentRef = React.useRef<HTMLDivElement>(null);
	
	// State for tracking if content is visible - used for animations
	const [contentVisible, setContentVisible] = React.useState(true);
	
	// Track loading status of videos
	const [loadingVideos, setLoadingVideos] = React.useState<Record<string, boolean>>({});
	
	// Calculate progress percentage
	const progressPercentage = ((currentStep + 1) / steps.length) * 100;
	
	// Check if we're at first or last step
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === steps.length - 1;
	
	// Scroll to top and trigger fade animation when step changes
	React.useEffect(() => {
		if (contentRef.current) {
			contentRef.current.scrollTop = 0;
			
			// Add a small animation when changing steps
			setContentVisible(false);
			const timer = setTimeout(() => {
				setContentVisible(true);
			}, 50);
			
			return () => clearTimeout(timer);
		}
	}, [currentStep]);
	
	// Initialize loading state for videos when current step changes
	React.useEffect(() => {
		if (!steps[currentStep]) return;
		
		// Find all video items in current step
		const videoItems = steps[currentStep].content.filter(
			item => item.type === 'video'
		) as TutorialVideoContent[];
		
		// Initialize loading state for each video
		const newLoadingState: Record<string, boolean> = {};
		videoItems.forEach((item, index) => {
			const videoKey = `${currentStep}-${index}`;
			newLoadingState[videoKey] = true;
		});
		
		setLoadingVideos(newLoadingState);
	}, [currentStep, steps]);

	// Handle video load events
	const handleVideoReady = (stepIndex: number, itemIndex: number) => {
		const videoKey = `${stepIndex}-${itemIndex}`;
		setLoadingVideos(prev => ({
			...prev,
			[videoKey]: false
		}));
	};

	const renderContentItem = (item: TutorialContentItem, index: number) => {
		switch (item.type) {
			case 'text': {
				return (
					<div key={index} className="tutorial-content-text">
						{item.text}
					</div>
				);
			}

			case 'image': {
				return (
					<div key={index} className="tutorial-content-item">
						<img src={item.imageUrl} alt={item.altText || ''} loading="lazy" />
						{item.caption && <p className="tutorial-content-caption">{item.caption}</p>}
					</div>
				);
			}

			case 'video': {
				const videoKey = `${currentStep}-${index}`;
				const isLoading = loadingVideos[videoKey];
				
				return (
					<div key={index} className="tutorial-content-item">
						<div className="tutorial-content-video-wrapper">
							{isLoading && (
								<div className="tutorial-content-video-loading">
									<div className="spinner"></div>
									<p>{t('tutorial.loadingVideo', 'Loading video...')}</p>
								</div>
							)}
							<ReactPlayer
								url={item.videoUrl}
								style={{aspectRatio: '16/9'}}
								className={isLoading ? 'loading' : ''}
								onReady={() => handleVideoReady(currentStep, index)}
								controls
								config={{
									youtube: {
										playerVars: { 
											origin: window.location.origin,
											modestbranding: 1
										}
									}
								}}
								width="100%"
								height="100%"
							/>
						</div>
						{item.caption && <p className="tutorial-content-caption">{item.caption}</p>}
					</div>
				);
			}

			case 'link': {
				return (
					<div key={index} className="tutorial-content-item">
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							className="tutorial-content-link"
						>
							{item.text}
						</a>
						{item.description && <p className="tutorial-content-caption">{item.description}</p>}
					</div>
				);
			}

			case 'mixed': {
				return (
					<div key={index} className="tutorial-content-item">
						<div className="tutorial-content-text">
							{item.text}
						</div>
						{item.imageUrl && (
							<div className="tutorial-content-image-wrapper">
								<img src={item.imageUrl} alt={item.altText || ''} loading="lazy" />
							</div>
						)}
					</div>
				);
			}

			default:
				return null;
		}
	};

	const currentStepData = steps[currentStep];

	if (!currentStepData) {
		return <div>No content available</div>;
	}

	return (
		<div className="tutorial-modal-content">
			{/* Progress bar */}
			<div className="tutorial-progress-bar">
				<div 
					className="tutorial-progress-fill" 
					style={{ width: `${progressPercentage}%` }}
				/>
			</div>
			
			{/* Content area */}
			<div className="tutorial-content-area">
				<div 
					ref={contentRef} 
					className={`tutorial-content-wrapper ${contentVisible ? 'fadeIn' : ''}`}
					style={{ opacity: contentVisible ? 1 : 0 }}
				>
					<h4 className="tutorial-content-title">{currentStepData.title}</h4>
					<div className="tutorial-content-items-container">
						{currentStepData.content.map(renderContentItem)}
					</div>
				</div>
			</div>
			
			{/* Navigation controls area */}
			<div className="tutorial-controls-area">
				<div className="tutorial-navigation-container">
					{/* Left arrow button */}
					<div className="tutorial-nav-button-container left">
						{!isFirstStep ? (
							<button
								className="tutorial-nav-button prev-button"
								onClick={onPrev}
								aria-label={t('tutorial.previous', 'Previous')}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M15 18L9 12L15 6"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						) : (
							<div className="tutorial-nav-button-placeholder"></div>
						)}
					</div>
					
					{/* Pagination dots */}
					<div className="tutorial-pagination">
						{steps.map((step, index) => (
							<div
								key={index}
								className={classNames('tutorial-dot', {
									active: currentStep === index
								})}
								onClick={() => onGoToStep(index)}
								aria-label={t('tutorial.goToStep', 'Go to step {{step}}', {
									step: index + 1
								})}
								title={step.title}
							/>
						))}
					</div>
					
					{/* Right arrow button */}
					<div className="tutorial-nav-button-container right">
						{!isLastStep ? (
							<button
								className="tutorial-nav-button next-button"
								onClick={onNext}
								aria-label={t('tutorial.next', 'Next')}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9 6L15 12L9 18"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						) : (
							<div className="tutorial-nav-button-placeholder"></div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}; 