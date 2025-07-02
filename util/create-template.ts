import { importStories } from './import';
import { Story } from '../store/stories';
import { unusedName } from './unused-name';
import { StartMenuSettingMgr } from '../common/start-menu-setting-mgr';
import { EndMenuSettingMgr } from '../common/end-menu-setting-mgr';
import { ChoiceMenuSettingMgr } from '../common/choice-menu-setting-mgr';

/**
 * Creates a new story from the template file
 * @param existingStoryNames Array of existing story names to prevent duplicates
 * @param templatePath Path to the template file (default: '/story-template.html')
 * @returns Promise that resolves to the created story object
 */
export async function createStoryFromTemplate(
	existingStoryNames: string[],
	templatePath: string
): Promise<Story> {
	const response = await fetch(templatePath);

	if (!response.ok) {
		throw new Error(`Failed to fetch template: ${response.statusText}`);
	}

	const templateHtml = await response.text();
	console.log("Story imported: ", existingStoryNames, templatePath)
	const importedStories = importStories(templateHtml);

	if (!importedStories || importedStories.length === 0) {
		throw new Error('No story found in template');
	}

	// Generate a unique name for the template story
	const templateStory = importedStories[0];
	templateStory.name = unusedName(templateStory.name, existingStoryNames);
	templateStory.templatePath = templatePath;
	templateStory.remixEnabled = false;

	// ensureStorySetting(templateStory);

	return templateStory;
}

function ensureStorySetting(story: Story) {
	story.storySetting = story.storySetting || {};
	story.storySetting.startMenuSetting = StartMenuSettingMgr.fromRawObj(story.storySetting.startMenuSetting, story).toRaw();
	story.storySetting.endMenuSetting = EndMenuSettingMgr.fromRawObj(story.storySetting.endMenuSetting, story).toRaw();
	story.storySetting.choiceMenuSetting = ChoiceMenuSettingMgr.fromRawObj(story.storySetting.choiceMenuSetting, story).toRaw();
}

export const STORY_TEMPLATES = {
	default: 'template/story-template.html',
	empty: 'template/empty-story-template.html',
	umi: 'template/umi-template.html',
	office: 'template/office-template.html',
	cat: 'template/cat-template.html',
	// Add more templates here as needed
}; 
