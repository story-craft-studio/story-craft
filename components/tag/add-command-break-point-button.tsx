import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {IconButton} from '../control/icon-button';
import './add-tag-button.css';
import {Passage, Story} from "../../store/stories";
import {StoriesActionOrThunk} from "../../store/undoable-stories";
import { addCommandBreakPoint } from '../../utils/command-break-point-utils';

export interface AddTagButtonProps {
	dispatch: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void;
	passage: Passage,
	story: Story,
}

export const AddCommandBreakPointButton: React.FC<AddTagButtonProps> = props => {
	const {t} = useTranslation();
	const {dispatch, passage, story} = props;

	const clickAddTag = () => {
		addCommandBreakPoint(passage, dispatch, story);
	}

	return (
		<span className="add-tag-button">
			<div className="card-button"
			     onPointerDown={clickAddTag}
			>
				<IconButton icon={<IconPlus />} label={t('common.tag')}/>
			</div>
		</span>
	);
};
