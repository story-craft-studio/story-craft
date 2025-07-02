import React from "react";
import {Passage, Story} from "../../store/stories";
import {StoriesActionOrThunk} from "../../store/undoable-stories";

export type PassageEditContextType = {
	passage: Passage;
	story: Story;
	stories: Story[];
	allPassages: Passage[];
	dispatch: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void,
}


const PassageEditContext = React.createContext<PassageEditContextType>({
	passage: {
		height: -1,
		highlighted: false,
		id: '',
		left: -1,
		name: '',
		selected: false,
		story: '',
		tags: [],
		commands: [],
		top: -1,
		width: -1,
	},
	stories: [],
	story: {
		storySetting: {
			characterSetting: null,
			characterDialogSetting: {}
		},
		id: '',
		lastUpdate: new Date(),
		ifid: '',
		name: '', // At least 1
		passages: [],
		selected: false,
		script: '', // Might be 0
		snapToGrid: false,
		startPassage: '-1',
		storyFormat: '', // At least 1
		storyFormatVersion: '',
		stylesheet: '', // Might be 0
		tags: [],
		tagColors: {},
		zoom: Math.random()
	},
	allPassages: [],
	dispatch: () => {},
});
export {PassageEditContext};


