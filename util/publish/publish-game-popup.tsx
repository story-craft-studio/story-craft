import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useForm, Controller} from 'react-hook-form';
import {
	Box,
	Button,
	TextField,
	Typography,
	Avatar,
	CircularProgress,
	Grid,
	Paper,
	Link,
	IconButton,
	Chip
} from '@mui/material';
import {IconExternalLink} from '@tabler/icons';
import {DialogCard} from '../../components/container/dialog-card';
import {CardContent} from '../../components/container/card';
import {DefaultService} from '../../_genApi/static-asset/services/DefaultService';
import {GameVersionDTO} from '../../_genApi/static-asset/models/GameVersionDTO';
import {VersionStatus} from '../../_genApi/static-asset/models/VersionStatus';
import {PublishNotification} from '../../_genApi/static-asset/models/PublishNotification';
import {Story} from '../../store/stories';
import {usePublishing} from '../../store/use-publishing';
import {saveFileBlob} from '../save-file';
import {storyFileName} from '../../electron/shared';
import {syncAndGetGameId} from '../publish';
import Network from '../../common/network-handler/network';
import {DialogComponentProps} from '../../dialogs';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VersionIcon from '@mui/icons-material/NewReleases';
import PendingIcon from '@mui/icons-material/Pending';
import {saveAs} from 'file-saver';

// Props interface
interface PublishGameDialogProps extends DialogComponentProps {
	story: Story;
}

// Form data interface
interface PublishFormData {
	title: string;
	description: string;
	thumbnail: File;
}

// Validation rules
const VALIDATION_RULES = {
	title: {
		required: 'publishGame.titleRequired',
		minLength: {value: 1, message: 'publishGame.titleMinLength'},
		maxLength: {value: 80, message: 'publishGame.titleMaxLength'}
	},
	description: {
		required: 'publishGame.descriptionRequired',
		minLength: {value: 10, message: 'publishGame.descriptionMinLength'},
		maxLength: {value: 200, message: 'publishGame.descriptionMaxLength'}
	},
	thumbnail: {
		required: 'publishGame.thumbnailRequired'
	}
};

const getThumbnailUrl = (gameVersion: GameVersionDTO | null) => {
	if (!gameVersion) return '';

    const gameId = gameVersion?.gameId;
    const versionId = gameVersion?.id;
    
    if (gameVersion?.status === VersionStatus.APPROVED) {
        return `${Network.withServerStaticAsset().getServerUrl()}/game/${gameId}/thumb.png`;
    }
    return `${Network.withServerStaticAsset().getServerUrl()}/tmp-version/${gameId}/${versionId}/thumb.png`;
}

const getGameVersionInfo = async (gameId: number) => {
	const versions = await DefaultService.postApiMyGameVersions({
		gameId,
		maxVersionId: undefined,
		numTake: 1
	});
	return versions.length > 0 ? versions[0] : null;
}

// Get all versions for a game
const getAllGameVersions = async (gameId: number): Promise<GameVersionDTO[]> => {
    try {
        const versions = await DefaultService.postApiMyGameVersions({
            gameId,
            maxVersionId: undefined,
            numTake: 10 // Get up to 10 versions
        });
        return versions || [];
    } catch (error) {
        console.error('Error fetching game versions:', error);
        return [];
    }
};

// Helper function to load game info
const loadGameInfo = async (
	storyId: number | string,
	setGameVersion: React.Dispatch<React.SetStateAction<GameVersionDTO | null>>,
	setAllVersions: React.Dispatch<React.SetStateAction<GameVersionDTO[]>>,
	setGameDetails: React.Dispatch<React.SetStateAction<any>>,
	setValue: (name: keyof PublishFormData, value: any) => void,
	setThumbnailUrl: React.Dispatch<React.SetStateAction<string | null>>,
	gameId: number
) => {
	try {
		if (!gameId) {
			setValue('title', '');
			setValue('description', '');
			setValue('thumbnail', undefined);
			return;
		}

		const gameVersion = await getGameVersionInfo(gameId);
		setGameVersion(gameVersion);
		
		// Load all versions
		const allVersions = await getAllGameVersions(gameId);
		setAllVersions(allVersions);

		if (!gameVersion) {
			setValue('title', '');
			setValue('description', '');
			setValue('thumbnail', undefined);
			return;
		}

		const thumbUrl = getThumbnailUrl(gameVersion);
		setThumbnailUrl(thumbUrl);

		if (thumbUrl) {
			try {
				const response = await fetch(thumbUrl);
				const blob = await response.blob();
				const file = new File([blob], 'thumbnail.png', {type: 'image/png'});
				setValue('thumbnail', file);
			} catch (error) {
				console.log('Error loading thumbnail:', error);
			}
		} else {
			setValue('thumbnail', undefined);
		}	

		if (gameVersion?.status === VersionStatus.APPROVED) {
			const {gameInfo} = await DefaultService.getApiGameInfo(gameId);
			setGameDetails(gameInfo);
			setValue('title', gameInfo.name);
			setValue('description', gameInfo.description);
		} else{
			const details = {
				name: gameVersion.newGameTitle,
				description: gameVersion.changeLog || ''
			};
			setGameDetails(details);
			setValue('title', details.name);
			setValue('description', details.description);
		}
	} catch (error) {
		console.error('Error loading game info:', error);
	}
};

// Helper function to handle game publishing
const handlePublishGame = async (
	formData: PublishFormData,
	gameFile: Blob,
	gameId: number
) => {
	try {
		const response = await DefaultService.postApiUploadGame({
			gameTitle: formData.title,
			description: formData.description,
			thumbFile: formData.thumbnail as Blob,
			file: gameFile,
			gameId,
			changeLog: 'Upload new game version'
		});
		return response;
	} catch (error) {
		console.error('Publish failed:', error);
		throw error;
	}
};

// Helper function to handle itch.io export
const handleExportItch = async (gameId: number) => {
    try {
        const url = (window.location.origin.includes("localhost") ? window.location.origin : window.location.origin + "/create");
        const response = await fetch(`${url}/template/itch-export.html`);
        let htmlContent = await response.text();
        htmlContent = htmlContent.replace(/@game-id/g, gameId.toString());
        
        const blob = new Blob([htmlContent], {type: 'text/html;charset=utf-8'});
        saveAs(blob, 'itch-export.html');
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};

// Helper function to get game notifications
const loadLatestPublishInfo = async (gameId: number) => {
    try {
        const notifications = await DefaultService.postApiGetNotifications({
            maxId: 999999, // A large number to get all notifications
            numTake: 10
        });
        
        // Filter for this game and sort by time (newest first)
        const gameNotifications = notifications
            .filter(notification => notification.gameId === gameId)
            .sort((a, b) => b.createTime - a.createTime);
            
        return gameNotifications.length > 0 ? gameNotifications[0] : null;
    } catch (error) {
        console.error('Error loading publish notifications:', error);
        return null;
    }
};

// Format timestamp to readable date
const formatPublishDate = (seconds: number) => {
	const timestamp = seconds * 1000;
    const date = new Date(timestamp);
    return date.toLocaleString();
};

// Main component
export const PublishGamePopup: React.FC<PublishGameDialogProps> = props => {
	const {story, onClose} = props;
	const {t} = useTranslation();
	const {publishStory} = usePublishing();
	const {control, watch, setValue, trigger} =
		useForm<PublishFormData>({
			defaultValues: {title: '', description: '', thumbnail: undefined},
			mode: 'onChange'
		});
	const inputTitle = watch('title');
	const inputDescription = watch('description');
	const thumbnailFile = watch('thumbnail');

	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [submissionError, setSubmissionError] = React.useState<string | null>(
		null
	);
	const [isLoadingGameInfo, setIsLoadingGameInfo] = React.useState(false);
	const [gameVersion, setGameVersion] = React.useState<GameVersionDTO | null>(
		null
	);
	const [allVersions, setAllVersions] = React.useState<GameVersionDTO[]>([]);
	const [gameId, setGameId] = React.useState(-1);
	const [gameDetails, setGameDetails] = React.useState<any>(null);
	const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
	const [showPublishForm, setShowPublishForm] = React.useState(true);
	const [thumbnailError, setThumbnailError] = React.useState<string | null>(null);
	const [lastPublishInfo, setLastPublishInfo] = React.useState<PublishNotification | null>(null);
	const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);

	// Load game info on mount
	React.useEffect(() => {
		const initialize = async () => {
			if (!story?.id) return;
			setIsLoadingGameInfo(true);
			const gameInfo = await syncAndGetGameId(story.id);
			setGameId(gameInfo?.gameId || -1);
			await loadGameInfo(
				story.id,
				setGameVersion,
				setAllVersions,
				setGameDetails,
				setValue,
				setThumbnailUrl,
				gameInfo?.gameId || -1
			);
			if (
				gameVersion?.status === VersionStatus.APPROVED ||
				gameVersion?.status === VersionStatus.REVIEWING
			) {
				setShowPublishForm(false);
			}
			setIsLoadingGameInfo(false);
		};
		initialize();
	}, [story?.id, setValue, gameVersion?.status]);

	// Load publish notifications
	React.useEffect(() => {
		const loadPublishInfo = async () => {
			if (gameId > 0) {
				setIsLoadingNotifications(true);
				const latestInfo = await loadLatestPublishInfo(gameId);
				setLastPublishInfo(latestInfo);
				setIsLoadingNotifications(false);
			}
		};
		
		loadPublishInfo();
	}, [gameId]);

	React.useEffect(() => {
		if (thumbnailFile) {
			setThumbnailError(null);
		}
	}, [thumbnailFile]);

	const gameUrl = `${Network.withServerStaticAsset().getServerUrl()}/dashboards/games/${gameId}`;

	// Find current approved version
	const approvedVersion = React.useMemo(() => {
		return allVersions.find(v => v.status === VersionStatus.APPROVED);
	}, [allVersions]);

	// Find reviewing version if any
	const reviewingVersion = React.useMemo(() => {
		return allVersions.find(v => v.status === VersionStatus.REVIEWING);
	}, [allVersions]);

	// Handle image upload
	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) setValue('thumbnail', file);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!thumbnailFile) {
			setThumbnailError(t('publishGame.thumbnailRequired'));
			setIsSubmitting(false);
		}

		const isValidForm = await trigger();
		if (!isValidForm || !thumbnailFile) {
			setIsSubmitting(false);
			return;
		}

		onSubmit({title: inputTitle, description: inputDescription, thumbnail: thumbnailFile});
	}

	// Handle form submission
	const onSubmit = async (data: PublishFormData) => {
		setSubmissionError(null);
		setIsSubmitting(true);

		try {
			const gameFile = saveFileBlob(
				await publishStory(story.id),
				storyFileName(story)
			);
			await handlePublishGame(data, gameFile, gameId);
			
			// Reload game info
			setIsLoadingGameInfo(true);
			await loadGameInfo(
				story.id,
				setGameVersion,
				setAllVersions,
				setGameDetails,
				setValue,
				setThumbnailUrl,
				gameId
			);
			
			// Reload publish notifications
			const latestInfo = await loadLatestPublishInfo(gameId);
			setLastPublishInfo(latestInfo);
			
			setShowPublishForm(false);
			setIsLoadingGameInfo(false);
		} catch (error) {
			setSubmissionError(t('publishGame.error'));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render game info view
	const renderGameInfoView = () => {
		if (!gameDetails || !gameVersion) return null;

		return (
			<Box
				sx={{
					p: 4,
					bgcolor: 'white',
					width: '100%',
					height: '100%',
					overflow: 'auto'
				}}
			>
				<Typography
					variant="h5"
					sx={{
						mb: 3,
						fontWeight: 600,
						color: '#1A1A1A',
						textAlign: 'left',
						letterSpacing: -0.2
					}}
				>
					{t('publishGame.publishInfo')}
				</Typography>

				<Paper
					elevation={0}
					sx={{
						p: 3,
						mb: 3,
						borderRadius: 2,
						bgcolor: '#F9FAFB',
						border: '1px solid #E5E7EB',
						transition: 'transform 0.2s ease-in-out',
						'&:hover': {
							transform: 'translateY(-2px)',
							boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
						}
					}}
				>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} sm={4}>
							<Box
								sx={{
									width: '100%',
									paddingTop: '100%',
									position: 'relative',
									borderRadius: 2,
									overflow: 'hidden',
									bgcolor: '#F3F4F6',
									border: '1px solid #E5E7EB'
								}}
							>
								<Box 
									component="img"
									src={thumbnailUrl || ''}
									alt={gameDetails.name}
									sx={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										transition: 'opacity 0.3s ease',
										'&:hover': {opacity: 0.95}
									}}
									onError={(e) => {
										setSubmissionError(t('publishGame.thumbnailError'));
									}}
								/>
							</Box>
						</Grid>
						<Grid item xs={12} sm={8}>
							<Typography
								variant="h6"
								sx={{fontWeight: 600, mb: 1, color: '#1A1A1A'}}
							>
								{gameDetails.name}
							</Typography>
							<Typography
								variant="body1"
								sx={{color: '#4B5563', lineHeight: 1.7}}
							>
								{gameDetails.description}
							</Typography>
						</Grid>
					</Grid>
				</Paper>

				<Box
					sx={{
						p: 2.5,
						borderRadius: 2,
						border: '1px solid',
						borderColor:
							gameVersion.status === VersionStatus.APPROVED
								? '#10B981'
								: gameVersion.status === VersionStatus.REJECTED
								? '#EF4444'
								: '#F59E0B',
						bgcolor: '#FFF',
						boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{
							display: 'flex',
							alignItems: 'center',
							color: '#1A1A1A'
						}}
					>
						<Box component="span" sx={{fontWeight: 600, mr: 1}}>
							{t('publishGame.status')}:
						</Box>
						{gameVersion.status === VersionStatus.REVIEWING && (
							<Box
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									color: '#F59E0B'
								}}
							>
								{t('publishGame.reviewing')}
								<ScheduleIcon  sx={{ ml: 1, fontSize: 18 }} />
							</Box>
						)}
						{gameVersion.status === VersionStatus.APPROVED && (
							<Box sx={{color: '#10B981', fontWeight: 500}}>
								{t('publishGame.published')}
							</Box>
						)}
						{gameVersion.status === VersionStatus.REJECTED && (
							<Box sx={{color: '#EF4444', fontWeight: 500}}>
								{t('publishGame.rejected')}
							</Box>
						)}
					</Typography>
					
					{/* Version information */}
					{approvedVersion && (
						<Typography
							variant="subtitle1"
							sx={{
								display: 'flex',
								alignItems: 'center',
								color: '#1A1A1A'
							}}
						>
							<Box component="span" sx={{fontWeight: 600, mr: 1}}>
								{t('publishGame.currentVersion')}:
							</Box>
							<Box sx={{color: '#10B981', display: 'flex', alignItems: 'center'}}>
								{approvedVersion.id}
								<VersionIcon sx={{ ml: 1, fontSize: 18, color: '#10B981' }} />
								<Chip 
									size="small" 
									label={t('publishGame.live')} 
									sx={{ 
										ml: 1, 
										bgcolor: '#D1FAE5', 
										color: '#047857',
										height: 20,
										fontSize: '0.7rem'
									}} 
								/>
							</Box>
						</Typography>
					)}
					
					{reviewingVersion && (
						<Typography
							variant="subtitle1"
							sx={{
								display: 'flex',
								alignItems: 'center',
								color: '#1A1A1A'
							}}
						>
							<Box component="span" sx={{fontWeight: 600, mr: 1}}>
								{t('publishGame.pendingVersion')}:
							</Box>
							<Box sx={{color: '#F59E0B', display: 'flex', alignItems: 'center'}}>
								{reviewingVersion.id}
								<PendingIcon sx={{ ml: 1, fontSize: 18, color: '#F59E0B' }} />
								<Chip 
									size="small" 
									label={t('publishGame.pending')} 
									sx={{ 
										ml: 1, 
										bgcolor: '#FEF3C7', 
										color: '#B45309',
										height: 20,
										fontSize: '0.7rem'
									}} 
								/>
							</Box>
						</Typography>
					)}
					
					{/* Last Published Time Information */}
					{lastPublishInfo && (
						<>
							<Typography
								variant="subtitle1"
								sx={{
									display: 'flex',
									alignItems: 'center',
									color: '#1A1A1A'
								}}
							>
								<Box component="span" sx={{fontWeight: 600, mr: 1}}>
									{t('publishGame.lastPublished')}:
								</Box>
								<Box sx={{color: '#4B5563'}}>
									{formatPublishDate(lastPublishInfo.createTime)}
								</Box>
							</Typography>

							<Typography
								variant="body2"
								sx={{
									display: 'flex',
									alignItems: 'center',
									color: '#4B5563',
									borderTop: '1px dashed #E5E7EB',
									paddingTop: 1,
									mt: 1
								}}
								>
								{t('publishGame.publishedMessage')}
								<Link
									href={gameUrl}
									target="_blank"
									sx={{
										ml: 1,
										display: 'inline-flex',
										alignItems: 'center',
										color: '#3B82F6',
										textDecoration: 'none',
										'&:hover': {textDecoration: 'underline'}
									}}
								>
									{t('publishGame.viewGame')}
									<IconExternalLink size={16} style={{marginLeft: 6}} />
								</Link>
							</Typography>
						</>
					)}
					{isLoadingNotifications && (
						<Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
							<CircularProgress size={16} sx={{ mr: 1, color: '#6B7280' }} />
							<Typography variant="body2" sx={{ color: '#6B7280' }}>
								{t('publishGame.loadingPublishInfo')}
							</Typography>
						</Box>
					)}

	
					{gameVersion.status === VersionStatus.REJECTED &&
						gameVersion.rejectReason && (
							<Typography
								variant="body2"
								sx={{mt: 1, color: '#EF4444', fontStyle: 'italic'}}
							>
								{t('publishGame.rejectedMessage')}: {gameVersion.rejectReason}
							</Typography>
						)}
				</Box>

				{gameVersion.status === VersionStatus.APPROVED && (
					<Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
						<Button
							variant="outlined"
							onClick={() => handleExportItch(gameId)}
							startIcon={
								<svg 
									width="16" 
									height="16" 
									viewBox="0 0 24 24" 
									fill="none" 
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M2.5 2.5H21.5V21.5H2.5V2.5Z" fill="#FA5C5C" />
									<path d="M6.5 6.5H17.5V17.5H6.5V6.5Z" fill="white" />
									<path d="M9.5 9.5H14.5V14.5H9.5V9.5Z" fill="#FA5C5C" />
								</svg>
							}
							sx={{
								px: 3,
								py: 1,
								borderRadius: 2,
								borderColor: '#FA5C5C',
								color: '#FA5C5C',
								fontWeight: 500,
								textTransform: 'none',
								'&:hover': {
									borderColor: '#E54545',
									bgcolor: '#FFF5F5'
								}
							}}
						>
							{t('publishGame.exportItch')}
						</Button>
						<Link
							href="https://itch.io/docs/creators/html5"
							target="_blank"
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								color: '#6B7280',
								textDecoration: 'none',
								fontSize: '0.875rem',
								'&:hover': {
									color: '#4B5563',
									textDecoration: 'underline'
								}
							}}
						>
							{t('publishGame.itchGuide')}
							<IconExternalLink size={14} style={{marginLeft: 4}} />
						</Link>
					</Box>
				)}

				<Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
					<Button
						variant="contained"
						onClick={() => setShowPublishForm(true)}
						sx={{
							px: 4,
							py: 1.5,
							borderRadius: 2,
							bgcolor: '#3B82F6',
							color: 'white',
							fontWeight: 500,
							textTransform: 'none',
							boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
							'&:hover': {
								bgcolor: '#2563EB',
								boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
							},
							'&:disabled': {bgcolor: '#D1D5DB', color: '#6B7280'}
						}}
					>
						{gameVersion.status === VersionStatus.REJECTED
							? t('publishGame.publishAgain')
							: t('publishGame.publishNewVersion')}
					</Button>
				</Box>
			</Box>
		);
	};

	// Render publish form
	const renderPublishForm = () => (
		<Box
			component="form"
			onSubmit={handleSubmit}
			sx={{
				p: 4,
				bgcolor: 'white',
				width: '100%',
				height: '100%',
				overflow: 'auto'
			}}
		>
			<Typography
				variant="h4"
				sx={{
					mb: 2,
					fontWeight: 600,
					color: '#1A1A1A',
					textAlign: 'center',
					letterSpacing: -0.3
				}}
			>
				{t('publishGame.headlineBig')}
			</Typography>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					mb: 3
				}}
			>
				<Typography variant="subtitle1" sx={{color: '#4B5563'}}>
					{t('publishGame.headlineSmall')}
				</Typography>
				{gameVersion?.status === VersionStatus.APPROVED && (
					<Link
					href={gameUrl}
					target="_blank"
					sx={{
						ml: 1,
						display: 'inline-flex',
						alignItems: 'center',
						color: '#3B82F6',
						textDecoration: 'none',
						'&:hover': {textDecoration: 'underline'}
					}}
				>
					{t('publishGame.viewGame')}
					<IconExternalLink size={16} style={{marginLeft: 6}} />
				</Link>
				)}
			</Box>

			<Controller
				name="title"
				control={control}
				rules={VALIDATION_RULES.title}
				render={({field, fieldState}) => (
					<TextField
						{...field}
						label={t('publishGame.title')}
						fullWidth
						margin="normal"
						error={!!fieldState.error}
						helperText={
							fieldState.error?.message ? t(fieldState.error.message) : ''
						}
						sx={{
							mb: 3,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								bgcolor: 'white',
								borderColor: '#E5E7EB',
								'&:hover fieldset': {borderColor: '#3B82F6'},
								'&.Mui-focused fieldset': {borderColor: '#3B82F6'}
							},
							'& .MuiInputLabel-root': {
								color: '#6B7280',
								'&.Mui-focused': {color: '#3B82F6'}
							}
						}}
					/>
				)}
			/>

			<Controller
				name="description"
				control={control}
				rules={VALIDATION_RULES.description}
				render={({field, fieldState}) => (
					<TextField
						{...field}
						label={t('publishGame.description')}
						multiline
						rows={4}
						fullWidth
						margin="normal"
						error={!!fieldState.error}
						helperText={
							fieldState.error?.message ? t(fieldState.error.message) : ''
						}
						sx={{
							mb: 3,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								bgcolor: 'white',
								borderColor: '#E5E7EB',
								'&:hover fieldset': {borderColor: '#3B82F6'},
								'&.Mui-focused fieldset': {borderColor: '#3B82F6'}
							},
							'& .MuiInputLabel-root': {
								color: '#6B7280',
								'&.Mui-focused': {color: '#3B82F6'}
							}
						}}
					/>
				)}
			/>

			<Box sx={{mb: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
				<Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
					<input
						accept="image/*"
						id="thumbnail-upload"
						type="file"
						hidden
						onChange={handleImageUpload}
					/>
					<label htmlFor="thumbnail-upload">
						<Button
							variant="outlined"
							component="span"
							sx={{
								borderRadius: 2,
								borderColor: '#3B82F6',
								color: '#3B82F6',
								textTransform: 'none',
								px: 3,
								py: 1,
								'&:hover': {bgcolor: '#EFF6FF', borderColor: '#2563EB'}
							}}
						>
							{t('publishGame.uploadThumbnail')}
						</Button>
					</label>
					{thumbnailFile && (
						<Avatar
							src={URL.createObjectURL(thumbnailFile)}
							sx={{
								width: 80,
								height: 80,
								borderRadius: 2,
								border: '1px solid #E5E7EB'
							}}
							variant="rounded"
						/>
					)}
				</Box>
				{thumbnailError && (
					<Typography sx={{color: '#EF4444', fontSize: '0.875rem'}}>
						{t('publishGame.thumbnailRequired')}
					</Typography>
				)}
			</Box>

			{gameId > -1 && (
				<Typography variant="body2" sx={{mb: 2, color: '#4B5563'}}>
					Status: Game({gameId}) Story({story.id})
				</Typography>
			)}

			{gameVersion?.status === VersionStatus.REJECTED && (
				<Box
					sx={{
						p: 2,
						borderRadius: 2,
						border: '1px solid #EF4444',
						bgcolor: '#FEF2F2',
						mb: 3
					}}
				>
					<Typography variant="body2" sx={{color: '#4B5563'}}>
						{t('publishGame.status')}: {gameVersion.status}
					</Typography>
					{gameVersion.rejectReason && (
						<Typography
							variant="body2"
							sx={{mt: 1, color: '#EF4444', fontStyle: 'italic'}}
						>
							{t('publishGame.rejectionReason')}: {gameVersion.rejectReason}
						</Typography>
					)}
				</Box>
			)}

			{submissionError && (
				<Typography sx={{mb: 2, color: '#EF4444', textAlign: 'center'}}>
					{submissionError}
				</Typography>
			)}

			<Button
				type="submit"
				fullWidth
				variant="contained"
				disabled={isSubmitting}
				sx={{
					py: 1.5,
					borderRadius: 2,
					bgcolor: '#3B82F6',
					color: 'white',
					fontWeight: 500,
					textTransform: 'none',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					'&:hover': {
						bgcolor: '#2563EB',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
					},
					'&:disabled': {bgcolor: '#D1D5DB', color: '#6B7280'}
				}}
			>
				{isSubmitting ? t('publishGame.submitting') : t('publishGame.submit')}
			</Button>
		</Box>
	);

	return (
		<DialogCard
			headerLabel={t('publishGame.modalTitle')}
			className="publish-game-modal"
			{...props}
		>
			<CardContent 
				style={{
					backgroundColor: 'white', 
					padding: 0,
					overflow: 'auto'
				}}
			>
                <div style={{minHeight: '500px', width: '600px', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {isLoadingGameInfo ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <CircularProgress sx={{color: '#3B82F6'}} />
                        </Box>
                    ) : showPublishForm ? (
                        renderPublishForm()
                    ) : (
                        renderGameInfoView()
                    )}
                </div>
			</CardContent>
		</DialogCard>
	);
};
