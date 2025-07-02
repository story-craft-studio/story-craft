import * as React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useStoryLaunch } from '../../store/use-story-launch';

export interface TestModalProps {
	storyId: string;
	startPassageId?: string;
	open: boolean;
	onClose: () => void;
}

export const TestModal: React.FC<TestModalProps> = props => {
	const {storyId, startPassageId, open, onClose} = props;
	const {t} = useTranslation();
	const [error, setError] = React.useState<Error | null>(null);

	// Get the full base URL including studio/index.html
	const baseUrl = window.location.href.split('#')[0];
	const iframeSrc = startPassageId
		? `${baseUrl}#/stories/${storyId}/test/${startPassageId}`
		: `${baseUrl}#/stories/${storyId}/test`;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={false}
			fullWidth
			PaperProps={{
				sx: {
					width: '80vw',
					height: '45vw', // 16:9 aspect ratio (80vw * 9/16 = 45vw)
					maxWidth: '1280px',
					maxHeight: '720px',
					margin: 'auto',
					borderRadius: '8px',
					overflow: 'hidden',
					position: 'fixed',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)'
				}
			}}
		>
			<DialogTitle sx={{ 
				p: 1, 
				position: 'absolute', 
				top: 0, 
				right: 0, 
				zIndex: 1,
				backgroundColor: 'transparent',
				marginRight: '16px'
			}}>
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						color: 'white',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						'&:hover': {
							backgroundColor: 'rgba(0, 0, 0, 0.7)',
						},
						width: '48px',
						height: '48px',
						'& .MuiSvgIcon-root': {
							fontSize: '32px'
						}
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ 
				p: 0, 
				height: '100%',
				overflow: 'hidden',
				'&::-webkit-scrollbar': {
					display: 'none'
				},
				msOverflowStyle: 'none',
				scrollbarWidth: 'none'
			}}>
				{error ? (
					<div style={{ padding: '1rem', color: 'red' }}>
						{error.message}
					</div>
				) : (
					<iframe
						src={iframeSrc}
						style={{
							width: '100%',
							height: '100%',
							border: 'none',
							display: 'block',
							overflow: 'hidden'
						}}
						sandbox="allow-scripts allow-same-origin allow-popups"
						title="story-test"
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}; 