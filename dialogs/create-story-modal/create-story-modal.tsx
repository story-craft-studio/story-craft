import * as React from 'react';
import {
	Box,
	Modal,
	Typography,
	Paper,
	Grid,
	Button,
	SxProps,
	IconButton,
	Backdrop
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { useStoryTemplate } from '../../store/use-story-template';
import { useTranslation } from 'react-i18next';
import { createStory } from '../../store/stories/action-creators/create-story';
import { useStoriesContext } from '../../store/stories';
import { usePrefsContext } from '../../store/prefs';
import { DialogComponentProps } from '../dialogs.types';
import { unusedName } from '../../util/unused-name';
import { createStoryFromTemplate, STORY_TEMPLATES } from '../../util/create-template';
import { TemplateCardDetail } from '../template-card-detail';
import './create-story-modal.css';
import { images } from '../../components/image';
import { PlayModal } from '../../components/play-modal/play-modal';
import { ASSET_URLS, DEFAULT_ASSET_URLS } from '../../common/constants';

// Messages for NPC dialog rotation
const NPC_MESSAGES = [
	"welcome",
	"selectTemplate"
];

interface TemplateCardData {
	image: string;
	title: string;
	subtitle: string;
	isTopStory: boolean;
	storyTemplate: string;
	gradientColors: [string, string];
	characterImages: string[];
	isComingSoon?: boolean;
}

interface TemplateCardProps {
	image: string;
	title: string;
	subtitle: string;
	isTopStory?: boolean;
	storyTemplate: string;
	onClick?: (event: React.MouseEvent<HTMLElement>) => void;
	onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
	onMouseLeave?: () => void;
	onRemixNow: () => void;
	onPlayDemo: () => void;
	index?: number;
	gradientColors: [string, string];
	characterImages?: string[];
	isComingSoon?: boolean;
}

const TEMPLATE_CARDS: TemplateCardData[] = [
	{
		image: images.templateCardBg,
		title: "Mina's World Story",
		subtitle: "A Mina's world story template",
		isTopStory: true,
		storyTemplate: STORY_TEMPLATES.umi,
		gradientColors: ["#E13434", "#FFB6B6"] as [string, string],
		characterImages: [
			ASSET_URLS.TEMPLATE_BACKGROUNDS.MINA_WORLD_1 || DEFAULT_ASSET_URLS.TEMPLATE_BACKGROUNDS.MINA_WORLD_1,
			ASSET_URLS.TEMPLATE_BACKGROUNDS.MINA_WORLD_2 || DEFAULT_ASSET_URLS.TEMPLATE_BACKGROUNDS.MINA_WORLD_2,
		]
	},
	{
		image: images.templateCardBg2,
		title: "Slice of Life Story",
		subtitle: "Create slice of life story",
		isTopStory: false,
		storyTemplate: STORY_TEMPLATES.office,
		gradientColors: ["#33B1F0", "#D7F8FF"] as [string, string],
		characterImages: [
			ASSET_URLS.CHARACTER_IMAGES.SLICE_OF_LIFE_1 || DEFAULT_ASSET_URLS.CHARACTER_IMAGES.SLICE_OF_LIFE_1, // Character 1
			ASSET_URLS.CHARACTER_IMAGES.SLICE_OF_LIFE_2 || DEFAULT_ASSET_URLS.CHARACTER_IMAGES.SLICE_OF_LIFE_2, // Character 2
			ASSET_URLS.CHARACTER_IMAGES.SLICE_OF_LIFE_3 || DEFAULT_ASSET_URLS.CHARACTER_IMAGES.SLICE_OF_LIFE_3  // Character 3
		]
	},
	{
		image: images.templateCardBg3,
		title: "Meme Cat",
		subtitle: "Create meme cat story",
		isTopStory: false,
		storyTemplate: STORY_TEMPLATES.default,
		gradientColors: ["#848484", "#EAEAEA"] as [string, string],
		characterImages: [
			ASSET_URLS.CHARACTER_IMAGES.MEME_CAT_1 || DEFAULT_ASSET_URLS.CHARACTER_IMAGES.MEME_CAT_1, // Cat character 1
			ASSET_URLS.CHARACTER_IMAGES.MEME_CAT_2 || DEFAULT_ASSET_URLS.CHARACTER_IMAGES.MEME_CAT_2, // Cat character 2
		],
		isComingSoon: true
	},
];

const TemplateCard: React.FC<TemplateCardProps> = ({
	image,
	title,
	subtitle,
	isTopStory,
	onClick,
	onMouseEnter,
	onMouseLeave,
	onRemixNow,
	onPlayDemo,
	index = 0,
	gradientColors,
	characterImages,
	isComingSoon
}) => {
	const { t } = useTranslation();

	const handleRemixClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onRemixNow();
	};

	const handlePlayClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onPlayDemo();
	};

	return (
		<Box
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			sx={{
				position: 'relative',
				cursor: 'pointer',
				borderRadius: '20px',
				overflow: 'hidden',
				width: '100%',
				height: '100px',
				background: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
				boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
				'&:hover': {
					transform: 'translateY(-2px) scale(1.05)',
					boxShadow: '0 6px 6px rgba(0, 0, 0, 0.3)',
					'&::before': {
						opacity: 1,
					},
					'& .template-image': {
						height: 'calc(95% + 20px)',
					},
					'& .template-image img': {
						transform: 'scale(1.1)',
					},
					'& .template-buttons': {
						opacity: 1,
					},
					'& .top-story-tag': {
						opacity: 0,
					}
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
					opacity: 0,
					transition: 'opacity 0.3s ease',
					borderRadius: '20px',
					pointerEvents: 'none',
					zIndex: 1
				},
				transition: 'transform 0.2s, box-shadow 0.2s',
				opacity: 0,
				animation: `templateFadeIn 0.5s ease-out ${0.3 + index * 0.1}s forwards`,
				'@keyframes templateFadeIn': {
					'0%': {
						opacity: 0,
						transform: 'translateX(-20px)',
					},
					'100%': {
						opacity: 1,
						transform: 'translateX(0)',
					}
				},
				display: 'flex',
				alignItems: 'center',
				padding: '8px',
				gap: '12px'
			}}
		>
			{isTopStory && (
				<Box
					className="top-story-tag"
					sx={{
						position: 'absolute',
						right: '-10px',
						top: '-10px',
						display: 'flex',
						alignItems: 'center',
						background: 'linear-gradient(to right, white, #FCFFAE)',
						border: '2px solid #FCFFAE',
						borderRadius: '10px 0 10px 10px',
						padding: '2px 6px',
						zIndex: 10,
						margin: '8px 8px 0 0',
						boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
						transition: 'opacity 0.3s ease'
					}}
				>
					<FavoriteIcon sx={{ color: 'red', fontSize: '20px', mr: 0.5 }} />
					<Typography sx={{ color: 'red', fontSize: '14px', fontWeight: 'bold' }}>
						Top Story
					</Typography>
				</Box>
			)}

			{/* Image on the left */}
			<Box
				className="template-image"
				sx={{
					width: '150px',
					height: '95%',
					borderRadius: '20px',
					overflow: 'hidden',
					flexShrink: 0,
					boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
					position: 'relative',
					zIndex: 2
				}}
			>
				<img
					src={image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}
					alt={title}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						backgroundColor: '#f5f5f5',
						transition: 'transform 0.3s ease'
					}}
				/>
			</Box>

			{/* Text content in the middle */}
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', zIndex: 2 }}>
				<Typography
					sx={{
						color: '#3D3D3D',
						fontSize: '18px',
						fontWeight: 'bold',
						lineHeight: '22px'
					}}
				>
					{title}
				</Typography>
				<Typography
					sx={{
						color: 'white',
						fontSize: '16px',
						lineHeight: '20px'
					}}
				>
					{subtitle}
				</Typography>
			</Box>

			{/* Buttons on the right */}
			<Box
				className="template-buttons"
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: '8px',
					position: 'relative',
					zIndex: 2,
					alignItems: 'flex-end',
					opacity: 0,
					transition: 'opacity 0.3s ease'
				}}
			>
				{isComingSoon ? (
					<Box
						sx={{
							backgroundColor: 'rgba(255, 193, 7, 0.9)',
							color: '#333',
							borderRadius: '10px',
							width: '140px',
							height: '50px',
							fontSize: '16px',
							fontWeight: 'bold',
							boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							textAlign: 'center'
						}}
					>
						Coming Soon
					</Box>
				) : (
					<>
						<Button
							onClick={handleRemixClick}
							sx={{
								backgroundColor: 'rgba(114, 154, 255, 0.78)',
								color: 'white',
								borderRadius: '10px',
								width: '140px',
								height: '40px',
								fontSize: '14px',
								fontWeight: 'bold',
								boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
								textTransform: 'none',
								'&:hover': {
									backgroundColor: 'rgba(114, 154, 255, 0.9)',
									transform: 'scale(1.05)',
								},
								transition: 'all 0.2s ease'
							}}
						>
							{t('dialogs.templateDetail.remixNow', 'Remix Now')}
						</Button>

						<Button
							onClick={handlePlayClick}
							sx={{
								backgroundColor: 'rgba(155, 255, 109, 1)',
								color: '#404040',
								borderRadius: '10px',
								width: '140px',
								height: '40px',
								fontSize: '14px',
								fontWeight: 'bold',
								boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
								textTransform: 'none',
								'&:hover': {
									backgroundColor: 'rgba(155, 255, 109, 0.9)',
									transform: 'scale(1.05)',
								},
								transition: 'all 0.2s ease'
							}}
						>
							{t('dialogs.templateDetail.playDemo', 'Play Demo')}
						</Button>
					</>
				)}
			</Box>
		</Box>
	);
};

const modalStyle: SxProps = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 800,
	minHeight: 420,
	maxWidth: '90vw',
	background: 'linear-gradient(135deg, #E1FFBB 0%, #009990 50%, #074799 75%, #001A6E 100%)',
	borderRadius: '20px',
	p: '12px',
	outline: 'none',
	animation: 'modalFadeIn 0.6s ease-out forwards',
	'@keyframes modalFadeIn': {
		'0%': {
			opacity: 0,
			transform: 'translate(-50%, -45%)',
		},
		'100%': {
			opacity: 1,
			transform: 'translate(-50%, -50%)',
		}
	}
};

const modalInnerStyle: SxProps = {
	width: '100%',
	height: '100%',
	bgcolor: 'white',
	borderRadius: '12px',
	p: 3,
	display: 'flex',
	alignItems: 'center',
	gap: '20px',
	boxShadow: '2px 5px 5px rgba(0, 0, 0, 0.25)',
};

const npcContainerStyle: SxProps = {
	position: 'absolute',
	left: '-220px',
	top: '50%',
	transform: 'translateY(-50%)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '15px',
	width: '200px',
	animation: 'npcSlideIn 0.8s ease-out forwards',
	'@keyframes npcSlideIn': {
		'0%': {
			opacity: 0,
			transform: 'translateY(-50%) translateX(30px)',
		},
		'100%': {
			opacity: 1,
			transform: 'translateY(-50%) translateX(0)',
		}
	}
};

const npcTextStyle: SxProps = {
	backgroundColor: '#ffffff',
	padding: '14px 18px',
	borderRadius: '12px',
	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
	position: 'relative',
	fontSize: '1.1rem',
	animation: 'textFadeIn 0.5s ease-out 0.6s both',
	'@keyframes textFadeIn': {
		'0%': {
			opacity: 0,
			transform: 'translateY(-10px)',
		},
		'100%': {
			opacity: 1,
			transform: 'translateY(0)',
		}
	},
	'&::after': {
		content: '""',
		position: 'absolute',
		left: '50%',
		bottom: '-8px',
		transform: 'translateX(-50%)',
		borderTop: '8px solid #ffffff',
		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent'
	}
};

const CreateNewBlankButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
	return (
		<Box
			sx={{
				width: '145px',
				height: '47px',
				border: '2px solid #959595',
				borderRadius: '20px',
				margin: '0 auto',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
				backgroundColor: '#ffffff',
				position: 'relative',
				'&:hover': {
					backgroundColor: '#c4f2ff',
					border: '2px solid #ffffff',
				}
			}}
			onClick={onClick}
		>
			<AddIcon sx={{ opacity: 0.4, mr: 1 }} />
		</Box>
	);
};

export const CreateStoryModal: React.FC<DialogComponentProps> = (props) => {
	const { onClose } = props;
	const { t } = useTranslation();
	const { createFromTemplate, isCreating } = useStoryTemplate();
	const { dispatch: storiesDispatch, stories } = useStoriesContext();
	const { prefs } = usePrefsContext();

	// State for rotating NPC messages
	const [messageIndex, setMessageIndex] = React.useState(0);

	// State for template detail modal
	const [showTemplateDetail, setShowTemplateDetail] = React.useState(false);
	const [selectedTemplate, setSelectedTemplate] = React.useState<{
		title: string;
		image: string;
		storyTemplate: string;
		characterImages?: string[];
	} | null>(null);

	// State to track the position of the hovered template card
	const [templateCardPosition, setTemplateCardPosition] = React.useState<{
		left: number;
		top: number;
		width: number;
		height: number;
	} | null>(null);

	// State for play modal
	const [playModalOpen, setPlayModalOpen] = React.useState(false);
	const [templateToPlay, setTemplateToPlay] = React.useState<string>("");

	// Hover timeout ref for debouncing
	const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	// Effect to rotate messages every 5 seconds
	React.useEffect(() => {
		const interval = setInterval(() => {
			setMessageIndex(prevIndex => (prevIndex + 1) % NPC_MESSAGES.length);
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const handleTemplateHover = (template: { title: string; image: string; storyTemplate: string }, event: React.MouseEvent) => {
		// Clear any existing timeout
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		// Get the position of the hovered template card relative to its container
		const rect = event.currentTarget.getBoundingClientRect();
		const modalRect = event.currentTarget.closest('.MuiPaper-root')?.getBoundingClientRect();

		if (modalRect) {
			// Calculate position to place detail closer to the right of template card
			setTemplateCardPosition({
				left: rect.width + 50,
				top: rect.top - 150,
				width: rect.width,
				height: rect.height
			});
		}

		setSelectedTemplate(template);

		// Show detail with slight delay for better UX
		hoverTimeoutRef.current = setTimeout(() => {
			setShowTemplateDetail(true);
		}, 300);
	};

	const handleTemplateLeave = () => {
		// Clear timeout if user leaves before delay
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		// Hide detail with slight delay to allow moving to detail card
		hoverTimeoutRef.current = setTimeout(() => {
			setShowTemplateDetail(false);
		}, 200);
	};

	const handleDetailHover = () => {
		// Clear timeout when hovering over detail card to keep it visible
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
	};

	const handleDetailLeave = () => {
		// Hide detail when leaving detail card
		setShowTemplateDetail(false);
	};

	const handleRemixNow = async (storyTemplate: string) => {
		try {
			await createFromTemplate({
				templatePath: storyTemplate,
				navigateToStory: true
			});
			onClose();
		} catch (error) {
			console.error('Error creating template:', error);
		}
	};

	const handlePlayDemoTemplate = (storyTemplate: string) => {
		setTemplateToPlay(storyTemplate);
		setPlayModalOpen(true);
	};

	const handlePlayModalClose = () => {
		setPlayModalOpen(false);
	};

	const handleCreateBlank = async () => {
		try {
			await createFromTemplate(
				{
					templatePath: STORY_TEMPLATES.default, //todo: custom template
					navigateToStory: true
				}
			);
			onClose();
		} catch (error) {
			console.error('Error creating template:', error);
		}
	};

	// Function to render the current message
	const renderCurrentMessage = () => {
		const key = NPC_MESSAGES[messageIndex];

		if (key === "welcome") {
			return (
				<Box sx={{ display: 'block', alignItems: 'center', gap: '8px' }}>
					<Typography component="span">
						{t('dialogs.createStory.npcMessages.welcomePrefix')}
					</Typography>
					<Box
						component="img"
						src={images.pwa}
						alt="Story Craft"
						sx={{
							height: '28px',
							verticalAlign: 'middle',
							display: 'block'
						}}
					/>
				</Box>
			);
		}

		return t(`dialogs.createStory.npcMessages.${key}`);
	};

	return (
		<Box className="create-story-modal">
			<Paper sx={modalStyle}>
				<Box sx={modalInnerStyle}>
					<Box sx={{ flex: 1 }}>
						<Box sx={{ position: 'relative' }}>
							<IconButton
								aria-label="close"
								onClick={onClose}
								sx={{
									position: 'absolute',
									right: '-10px',
									top: '-30px',
									color: 'grey.500',
									bgcolor: 'white',
									boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
									'&:hover': {
										bgcolor: 'grey.100',
										color: 'grey.800',
									},
									zIndex: 1,
								}}
							>
								<CloseIcon />
							</IconButton>

							<Typography variant="h5" component="h2" align="center" gutterBottom>
								{t('dialogs.createStory.title')}
							</Typography>

							<Typography variant="body1" align="center" sx={{ mb: 2 }}>
								{t('dialogs.createStory.subtitle')}
							</Typography>
						</Box>

						<Typography variant="body2" sx={{ color: '#555', mt: 1, mb: 1 }}>
							{t('dialogs.createStory.templateSection')}
						</Typography>

						<Box
							sx={{
								backgroundColor: 'white',
								borderRadius: '20px',
								border: '3px solid #eeeeee',
								boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
								padding: '12px 12px 50px 12px',
								display: 'flex',
								flexDirection: 'column',
								gap: '4px',
								minHeight: '290px',
								position: 'relative'
							}}
						>
							{TEMPLATE_CARDS.map((card, idx) => (
								<TemplateCard
									key={idx}
									image={card.image}
									title={card.title}
									subtitle={card.subtitle}
									isTopStory={card.isTopStory}
									storyTemplate={card.storyTemplate}
									gradientColors={card.gradientColors}
									characterImages={card.characterImages}
									onClick={(e) => {
										// Keep click functionality for direct actions
										e.stopPropagation();
									}}
									onMouseEnter={(e) => handleTemplateHover(card, e)}
									onMouseLeave={handleTemplateLeave}
									onRemixNow={() => handleRemixNow(card.storyTemplate)}
									onPlayDemo={() => handlePlayDemoTemplate(card.storyTemplate)}
									index={idx}
									isComingSoon={card.isComingSoon}
								/>
							))}

							{/* More template button */}
							<Button
								sx={{
									position: 'absolute',
									bottom: '5px',
									right: '12px',
									backgroundColor: 'rgba(0, 0, 0, 0.1)',
									color: '#666',
									borderRadius: '8px',
									width: 'auto',
									height: '28px',
									fontSize: '12px',
									textTransform: 'none',
									minWidth: 'auto',
									boxShadow: 'none',
									'&:hover': {
										backgroundColor: 'rgba(0, 0, 0, 0.15)',
										color: '#333',
									},
									transition: 'all 0.2s ease'
								}}
							>
								{"More template >>"}
							</Button>
						</Box>

						<Typography
							variant="body2"
							align="center"
							sx={{
								color: '#454545',
								my: 2,
								fontSize: '14px'
							}}
						>
							{t('dialogs.createStory.orElse')}
						</Typography>

						<Box sx={{ textAlign: 'center', mb: 1 }}>
							<CreateNewBlankButton onClick={handleCreateBlank} />
							<Typography
								variant="body2"
								sx={{
									color: '#505050',
									mt: 1,
									fontSize: '14px'
								}}
							>
								{t('dialogs.createStory.blankStory')}
							</Typography>
						</Box>

						{/* Template Card Detail with Backdrop */}

						{showTemplateDetail && selectedTemplate && templateCardPosition && (
							<Box
								sx={{
									position: 'absolute',
									top: `${templateCardPosition.top}px`,
									left: `${templateCardPosition.left}px`,
									zIndex: theme => theme.zIndex.drawer + 2,
									pointerEvents: 'auto',
								}}
								onMouseEnter={handleDetailHover}
								onMouseLeave={handleDetailLeave}
							>
								<TemplateCardDetail
									onClose={() => setShowTemplateDetail(false)}
									onPlayDemo={() => handlePlayDemoTemplate(selectedTemplate.storyTemplate)}
									templateTitle={selectedTemplate.title}
									templateImage={selectedTemplate.image}
									storyTemplate={selectedTemplate.storyTemplate}
									characterImages={selectedTemplate.characterImages}
								/>
							</Box>
						)}
					</Box>

					<Box sx={npcContainerStyle}>
						<Typography sx={npcTextStyle}>
							{renderCurrentMessage()}
						</Typography>
						<img
							src={images.npc01}
							alt="NPC Guide"
							style={{
								width: '200px',
								height: 'auto',
							}}
						/>
					</Box>
				</Box>
			</Paper>

			{/* Play Game Modal */}
			<PlayModal
				open={playModalOpen}
				onClose={handlePlayModalClose}
				templatePath={templateToPlay}
			/>
		</Box>
	);
}; 