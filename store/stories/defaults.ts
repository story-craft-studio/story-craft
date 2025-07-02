import {i18n} from '../../util/i18n';
import {Passage, Story} from './stories.types';
import {getRandomPastelColor} from '../../util/pastel-colors';

export const passageDefaults = (): Omit<Passage, 'id' | 'story'> => ({
	height: 100,
	highlighted: false,
	left: 0,
	name: 'Chapter',
	selected: false,
	tags: [],
	commands: [],
	top: 0,
	width: 100,
	color: getRandomPastelColor()
});

export const storyDefaults = (): Omit<Story, 'id'> => ({
	ifid: '',
	lastUpdate: new Date(),
	passages: [],
	name: 'Untitled Story',
	script: '',
	selected: false,
	snapToGrid: true,
	startPassage: '',
	storyFormat: '',
	storyFormatVersion: '',
	stylesheet: '',
	tags: [],
	tagColors: {},
	zoom: 1,
	storySetting: {
		characterSetting: null,
		characterDialogSetting: {},
		startMenuSetting: {},
		endMenuSetting: {},
		choiceMenuSetting: {}
	},
	remixEnabled: false,
	orientation: 'landscape'
});
