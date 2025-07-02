import * as React from 'react';
import './tutorial-modal.css';
import { DraggableWindow } from '../draggable-window';
import { 
	TutorialModalContent, 
	TutorialStep 
} from './tutorial-modal-content';
import { useTranslation } from 'react-i18next';

export interface TutorialModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	steps: TutorialStep[];
	defaultPosition?: {
		x: number;
		y: number;
	};
	defaultSize?: {
		width: number;
		height: number;
	};
	initialStep?: number;
	theme?: 'light' | 'dark';
	fixedSize?: boolean;
	onComplete?: () => void;
	completeButtonText?: string;
	showProgressBar?: boolean;
	allowSkip?: boolean;
	skipButtonText?: string;
	onStepChange?: (stepIndex: number) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
	isOpen,
	onClose,
	title,
	steps,
	defaultPosition,
	defaultSize = { width: 560, height: 540 },
	initialStep = 0,
	theme = 'light',
	fixedSize = true,
	onComplete,
	completeButtonText,
	showProgressBar = true,
	allowSkip = false,
	skipButtonText,
	onStepChange
}) => {
	const { t } = useTranslation();
	const [currentStep, setCurrentStep] = React.useState(initialStep);
	const [showCompletionAnimation, setShowCompletionAnimation] = React.useState(false);
	
	// Reset to initial step when opening
	React.useEffect(() => {
		if (isOpen) {
			setCurrentStep(initialStep);
			setShowCompletionAnimation(false);
		}
	}, [isOpen, initialStep]);

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(prevStep => {
				const newStep = prevStep + 1;
				if (onStepChange) {
					onStepChange(newStep);
				}
				return newStep;
			});
		} else {
			// On last step
			if (onComplete) {
				// Show completion animation first
				setShowCompletionAnimation(true);
				
				// Then call onComplete after animation
				setTimeout(() => {
					onComplete();
					onClose();
				}, 800);
			} else {
				// Auto close when reaching last step with "Next" button
				onClose();
			}
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(prevStep => {
				const newStep = prevStep - 1;
				if (onStepChange) {
					onStepChange(newStep);
				}
				return newStep;
			});
		}
	};

	const handleGoToStep = (stepIndex: number) => {
		if (stepIndex >= 0 && stepIndex < steps.length) {
			setCurrentStep(stepIndex);
			if (onStepChange) {
				onStepChange(stepIndex);
			}
		}
	};
	
	const handleSkip = () => {
		// Go directly to completion or close
		if (onComplete) {
			onComplete();
		}
		onClose();
	};

	return (
		<DraggableWindow
			isOpen={isOpen}
			onClose={onClose}
			title={title || t('tutorial.title', 'Tutorial')}
			defaultPosition={defaultPosition}
			defaultSize={defaultSize}
			className={`tutorial-modal tutorial-theme-${theme} ${fixedSize ? 'fixed-size' : ''} ${showCompletionAnimation ? 'completion-animation' : ''}`}
			id="tutorial-modal"
		>
			<TutorialModalContent
				steps={steps}
				currentStep={currentStep}
				onNext={handleNext}
				onPrev={handlePrev}
				onGoToStep={handleGoToStep}
			/>
			
			{allowSkip && (
				<button 
					className="tutorial-skip-button"
					onClick={handleSkip}
					title={t('tutorial.skip', 'Skip tutorial')}
				>
					{skipButtonText || t('tutorial.skip', 'Skip')}
				</button>
			)}
		</DraggableWindow>
	);
}; 