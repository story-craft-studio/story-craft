import {Editor} from 'codemirror';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import {IconWriting, IconTool, IconTrash, IconCopy} from '@tabler/icons';
import {
	Passage,
	Story,
	updatePassage,
	deletePassage,
	createUntitledPassage
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {useStoryLaunch} from '../../store/use-story-launch';
import EvtMgr, {EventName} from "../../common/evt-mgr";
import {unusedName} from '../../util/unused-name';
import {v4 as uuid} from '@lukeed/uuid';

export interface PassageToolbarProps {
	disabled?: boolean;
	editor?: Editor;
	passage: Passage;
	story: Story;
	useCodeMirror: boolean;
}

export const PassageToolbar: React.FC<PassageToolbarProps> = props => {
	const {disabled, passage, story} = props;
	const {dispatch} = useUndoableStoriesContext();
	const {testStory} = useStoryLaunch();
	const {t} = useTranslation();

	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

	function handleRename(name: string) {
		// Don't create newly linked passages here because the update action will
		// try to recreate the passage as it's been renamed--it sees new links in
		// existing passages, updates them, but does not see that the passage name
		// has been updated since that hasn't happened yet.

		EvtMgr.emit(EventName.passageNameChange, {
			from: passage.name,
			to: name,
		})
		dispatch(updatePassage(story, passage, {name}, {dontUpdateOthers: true}));
	}

	const handleRenameClick = () => {
		const newPassageName = prompt(t('common.renamePrompt', {name: passage.name}), passage.name);
		if (newPassageName && newPassageName.trim() !== '' && newPassageName !== passage.name) {
			// Check if name already exists
			const nameExists = story.passages.some(p => p.id !== passage.id && p.name === newPassageName);
			if (nameExists) {
				alert(t('components.renamePassageButton.nameAlreadyUsed'));
				return;
			}
			handleRename(newPassageName);
		}
	};

	const handleCloneClick = () => {
		// Generate a unique name for the cloned passage
		const clonedName = unusedName(
			`${passage.name} (Copy)`,
			story.passages.map(p => p.name)
		);

		// Create a position offset for the cloned passage
		const offsetX = 120; // Offset to the right
		const offsetY = 0;   // Same vertical position

		// Deep clone all commands from the original passage
		const clonedCommands = passage.commands.map(command => {
			// Use JSON parse/stringify for deep copy, then assign new ID
			const deepClonedCommand = JSON.parse(JSON.stringify(command));
			deepClonedCommand.id = uuid(); // Generate new ID for each command
			return deepClonedCommand;
		});

		// Create the new passage with cloned content
		dispatch({
			type: 'createPassage',
			storyId: story.id,
			props: {
				name: clonedName,
				left: passage.left + offsetX,
				top: passage.top + offsetY,
				width: passage.width,
				height: passage.height,
				tags: [...passage.tags], // Clone tags array
				commands: clonedCommands,
				color: passage.color
			}
		});
	};

	const handleTestClick = () => {
		console.log('TestPassageButton clicked!');
		testStory(story.id, passage?.id);
	};

	const handleRemoveClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		dispatch(deletePassage(story, passage));
		setDeleteDialogOpen(false);
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
	};

	return (
		<>
			<Stack spacing={0.5} sx={{ padding: 0.5 }}>
				{/* First row: Rename and Clone */}
				<Stack direction="row" spacing={0.5} justifyContent="center">
					<Button
						variant="contained"
						color="primary"
						startIcon={<IconWriting />}
						disabled={disabled || !passage}
						onClick={handleRenameClick}
						sx={{
							textTransform: 'none',
							fontWeight: 500,
							borderRadius: 2,
							boxShadow: 2,
							flex: 1,
							'&:hover': {
								boxShadow: 4,
							}
						}}
					>
						{t('common.renameChapter')}
					</Button>
					<Button
						variant="contained"
						color="info"
						startIcon={<IconCopy />}
						disabled={disabled || !passage}
						onClick={handleCloneClick}
						sx={{
							textTransform: 'none',
							fontWeight: 500,
							borderRadius: 2,
							boxShadow: 2,
							flex: 1,
							'&:hover': {
								boxShadow: 4,
							}
						}}
					>
						{t('common.cloneChapter')}
					</Button>
				</Stack>
				
				{/* Second row: Test and Remove */}
				<Stack direction="row" spacing={0.5} justifyContent="center">
					<Button
						variant="contained"
						color="secondary"
						startIcon={<IconTool />}
						disabled={disabled || !passage}
						onClick={handleTestClick}
						sx={{
							textTransform: 'none',
							fontWeight: 500,
							borderRadius: 2,
							boxShadow: 2,
							flex: 1,
							'&:hover': {
								boxShadow: 4,
							}
						}}
					>
						{t('routes.storyEdit.toolbar.testFromHere')}
					</Button>
					<Button
						variant="contained"
						color="error"
						startIcon={<IconTrash />}
						disabled={disabled || !passage || story.startPassage === passage.id}
						onClick={handleRemoveClick}
						sx={{
							textTransform: 'none',
							fontWeight: 500,
							borderRadius: 2,
							boxShadow: 2,
							flex: 1,
							'&:hover': {
								boxShadow: 4,
							}
						}}
					>
						{t('common.removeChapter')}
					</Button>
				</Stack>
			</Stack>
			
			<Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
				<DialogTitle>
					{t('common.delete')} &quot;{passage?.name || ''}&quot;?
				</DialogTitle>
				<DialogContent>
					This chapter will be permanently deleted. This action cannot be undone.
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelDelete} color="primary">
						{t('common.cancel')}
					</Button>
					<Button onClick={handleConfirmDelete} color="error" autoFocus>
						{t('common.delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
