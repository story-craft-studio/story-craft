import * as React from 'react';
import {useTranslation} from 'react-i18next';
import useErrorBoundary from 'use-error-boundary';
import {ErrorMessage} from '../../components/error';
import {getAllPassages, passageWithId, storyWithId, updatePassage} from '../../store/stories';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {PassageText} from './passage-text';
import {PassageToolbar} from './passage-toolbar';
import {TagToolbar} from './tag-toolbar';
import './passage-edit-contents.css';
import {usePrefsContext} from '../../store/prefs';
import {PassageCommand} from "../../common/passage-command/PassageCommandTypeDef";
import {useEffect, useState} from "react";
import {PassageEditContext} from "../context/passage-edit-context";
import {PassageEditMgr} from "../context/passage-edit-mgr";

export interface PassageEditContentsProps {
	disabled?: boolean;
	passageId: string;
	storyId: string;
}

export const PassageEditContents: React.FC<
	PassageEditContentsProps
> = props => {
	const {disabled, passageId, storyId} = props;
	const [storyFormatExtensionsEnabled, setStoryFormatExtensionsEnabled] =
		React.useState(true);
	const [editorCrashed, setEditorCrashed] = React.useState(false);
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {ErrorBoundary, error, reset: resetError} = useErrorBoundary();
	const {prefs} = usePrefsContext();
	const {dispatch, stories} = useUndoableStoriesContext();
	const {formats} = useStoryFormatsContext();

	const [allPassages, setAllPassages] = useState(getAllPassages(stories, storyId));
	useEffect(() => {
		setAllPassages(
			getAllPassages(stories, storyId)
		);
	}, [stories, storyId]);

	const [passage, setPassage] = useState(passageWithId(stories, storyId, passageId));
	useEffect(() => {
		setPassage(
			passageWithId(stories, storyId, passageId)
		);
	}, [stories, storyId, passageId])

	const story = storyWithId(stories, storyId);
	useEffect(() => {
		PassageEditMgr.loadStory(story, stories);
	}, [story]);

	const storyFormat = formatWithNameAndVersion(
		formats,
		story.storyFormat,
		story.storyFormatVersion
	);
	const {t} = useTranslation();

	React.useEffect(() => {
		if (error) {
			if (storyFormatExtensionsEnabled) {
				console.error(
					'Passage editor crashed, trying without format extensions',
					error
				);
				setStoryFormatExtensionsEnabled(false);
			} else {
				setEditorCrashed(true);
			}

			resetError();
		}
	}, [error, resetError, storyFormatExtensionsEnabled]);

	const handlePassageCommandChange = React.useCallback(
		(commands: PassageCommand[]) => {
			dispatch(updatePassage(story, passage, {commands: [...commands]}));
		},
		[dispatch, passage, story]
	);

	if (editorCrashed) {
		return (
			<ErrorMessage>{t('dialogs.passageEdit.editorCrashed')}</ErrorMessage>
		);
	}

	return (
		<div className="passage-edit-contents" aria-hidden={disabled}>
			<PassageEditContext.Provider value={{
				passage, allPassages, story, stories, dispatch
			}}>
				<PassageToolbar
					disabled={disabled}
					editor={cmEditor}
					passage={passage}
					story={story}
					useCodeMirror={prefs.useCodeMirror}
				/>
				<TagToolbar disabled={disabled} passage={passage} story={story} />
				<ErrorBoundary>
					<PassageText
						disabled={disabled}
						onChange={handlePassageCommandChange}
						onEditorChange={setCmEditor}
						passage={passage}
						story={story}
						storyFormat={storyFormat}
						storyFormatExtensionsDisabled={!storyFormatExtensionsEnabled}
					/>
				</ErrorBoundary>
			</PassageEditContext.Provider>
		</div>
	);
};
