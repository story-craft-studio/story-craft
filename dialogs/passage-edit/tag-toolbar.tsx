import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../../components/container/button-bar';
import {TagButton} from '../../components/tag';
import {
	Passage,
	removePassageTag,
	Story, updatePassage,
	updateStory
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';
import TagBlock from "../../common/passage-command/command-blocks/tag-block";
import DelayTaskUtil from "../../util/DelayTaskUtil";
import {useState} from "react";
import StringUtil from "../../util/StringUtil";
import {PassageEditMgr} from "../context/passage-edit-mgr";

export interface TagToolbarProps {
	disabled?: boolean;
	passage: Passage;
	story: Story;
}

export const TagToolbar: React.FC<TagToolbarProps> = props => {
	const [uid] = useState(
		'TagToolbar-' + StringUtil.randomString()
	)

	const {disabled, passage, story} = props;
	const {dispatch, stories} = useUndoableStoriesContext();
	const {t} = useTranslation();

	function handleChangeTags(newTag: string, index: number) {
		DelayTaskUtil.reInvokeDelayTask(uid + '-handleChangeTags', () => {
			PassageEditMgr.withDispatcher(dispatch).changeTags(passage, newTag, index);
		}, 0.8);
	}

	function handleRemoveTags(index: number) {
		PassageEditMgr.withDispatcher(dispatch).removeTags(passage, index);
	}

	return (
		<div className="tags">
			{/* <ButtonBar className={'TagBlockContainer'}>
				<TagBlock passage={passage} onChange={handleChangeTags} story={story} onRemove={handleRemoveTags}/>
			</ButtonBar> */}
		</div>
	);
};
