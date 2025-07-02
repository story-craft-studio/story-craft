import {Story, UpdateStoryAction} from "../../../../../store/stories";

export type CharacterSkinSettings = {
	scale?: number;
}

export type CharacterSkin = {
	id: string,
	imgUrl: string,
	settings?: CharacterSkinSettings,
}
export type Character = {
	id: number,
	displayName: string,
	imgUrl: string,
	skins: CharacterSkin[]
}
export type CharacterSetting = {
	updateVersion: number,
	characters: Character[],
}
export type EditCharOption = Partial<Omit<Character, 'id'>> & {
	stories: Story[];
	story: Story,
	delayS?: number,
	dispatchStory: (updateStoryAction: UpdateStoryAction) => void,
	characterIndex: number;
}
