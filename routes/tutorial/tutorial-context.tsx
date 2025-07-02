import * as React from 'react';
import { TutorialModal } from '../../components/tutorial-modal';
import { tutorialSteps } from './tutorial-data';
import { useTranslation } from 'react-i18next';

interface Position {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

interface TutorialContextProps {
	isOpen: boolean;
	openTutorial: () => void;
	closeTutorial: () => void;
	toggleTutorial: () => void;
	setOnCloseCallback: (callback: (() => void) | null) => void;
}

const TutorialContext = React.createContext<TutorialContextProps>({
	isOpen: false,
	openTutorial: () => {},
	closeTutorial: () => {},
	toggleTutorial: () => {},
	setOnCloseCallback: () => {}
});

export const useTutorial = () => React.useContext(TutorialContext);

interface TutorialProviderProps {
	children: React.ReactNode;
	showOnStart?: boolean;
	defaultPosition?: Position;
	defaultSize?: Size;
	rightOffset?: number; // Offset từ bên phải màn hình
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ 
	children, 
	showOnStart = true,
	defaultPosition = { x: 300, y: 100 },
	defaultSize = { width: 500, height: 450 },
	rightOffset
}) => {
	const { t } = useTranslation();
	
	const [isOpen, setIsOpen] = React.useState(showOnStart);
	const [windowWidth, setWindowWidth] = React.useState(
		typeof window !== 'undefined' ? window.innerWidth : 1200
	);
	const onCloseCallbackRef = React.useRef<(() => void) | null>(null);
	
	// Calculate final position based on rightOffset if provided
	const finalPosition = React.useMemo(() => {
		if (rightOffset && typeof window !== 'undefined') {
			return {
				x: windowWidth - rightOffset - defaultSize.width,
				y: defaultPosition.y
			};
		}
		return defaultPosition;
	}, [rightOffset, defaultPosition, defaultSize.width, windowWidth]);
	
	// Update position when window resizes
	React.useEffect(() => {
		if (!rightOffset || typeof window === 'undefined') return;
		
		const handleResize = () => {
			console.log('Window resized:', window.innerWidth);
			setWindowWidth(window.innerWidth);
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [rightOffset]);

	const openTutorial = React.useCallback(() => {
		console.log('Opening tutorial');
		setIsOpen(true);
	}, []);
	
	const closeTutorial = React.useCallback(() => {
		console.log('Closing tutorial, callback exists:', !!onCloseCallbackRef.current);
		setIsOpen(false);
		// Trigger the callback after closing
		if (onCloseCallbackRef.current) {
			// Delay the callback slightly to ensure modal is closed first
			setTimeout(() => {
				console.log('Executing tutorial close callback');
				onCloseCallbackRef.current?.();
			}, 100);
		}
	}, []);
	
	const toggleTutorial = React.useCallback(() => setIsOpen(prev => !prev), []);

	const setOnCloseCallback = React.useCallback((callback: (() => void) | null) => {
		console.log('Setting tutorial close callback:', !!callback);
		onCloseCallbackRef.current = callback;
	}, []);

	const contextValue = React.useMemo(
		() => ({ 
			isOpen, 
			openTutorial, 
			closeTutorial, 
			toggleTutorial, 
			setOnCloseCallback 
		}),
		[isOpen, openTutorial, closeTutorial, toggleTutorial, setOnCloseCallback]
	);

	return (
		<TutorialContext.Provider value={contextValue}>
			<TutorialModal
				key={`tutorial-modal-${windowWidth}`}
				isOpen={isOpen}
				onClose={closeTutorial}
				title={t('tutorial.title')}
				steps={tutorialSteps}
				defaultPosition={finalPosition}
				defaultSize={defaultSize}
			/>
			{children}
		</TutorialContext.Provider>
	);
};
