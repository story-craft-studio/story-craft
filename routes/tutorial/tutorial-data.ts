import { TutorialStep } from '../../components/tutorial-modal';
import { images } from '../../components/image';

// Tutorial data dùng chung
export const tutorialSteps: TutorialStep[] = [
	{
		id: 'welcome',
		title: 'Introduction to Story Craft',
		content: [
			{
				type: 'text',
				text: 'Welcome to Story Craft! This tool helps you create interactive, non-linear narratives with rich character development and engaging dialogue.'
			},
			{
				type: 'image',
				imageUrl: images.tutorialLogo,
				altText: 'Story Craft Logo',
				caption: 'Create magnificent stories with Story Craft'
			},
		]
	},
	{
		id: 'stories',
		title: 'Character Introduction',
		content: [
			{
				type: 'text',
				text: 'Characters are the foundation of your story. Start by designing compelling characters.'
			},
			{
				type: 'image',
				imageUrl: images.tutorialCharacterSetting0,
				altText: 'Character Setting Interface',
				caption: 'Character Setting Button'
			},
			{
				type: 'image',
				imageUrl: images.tutorialCharacterSetting1,
				altText: 'Advanced Character Settings',
				caption: 'Create expressive for characters with animations.'
			}
		]
	},
	{
		id: 'character-creation',
		title: 'Character Development',
		content: [
			{
				type: 'text',
				text: 'Use the character command interface to create detailed character profiles and track their development throughout your story.'
			},
			{
				type: 'image',
				imageUrl: images.tutorialCmdCharacter,
				altText: 'Character Command Interface',
				caption: 'Using the Character Command Interface to develop your story characters'
			}
		]
	},
	{
		id: 'dialogue',
		title: 'Crafting Dialogue',
		content: [
			{
				type: 'text',
				text: 'Create meaningful conversations between characters using the dialogue command interface to advance your narrative and reveal personality traits.'
			},
			{
				type: 'image',
				imageUrl: images.tutorialCmdDialog,
				altText: 'Dialogue Command Interface',
				caption: 'Creating interactive dialogue using the Command Interface'
			}
		]
	},
	{
		id: 'menu-choice',
		title: 'Let players make choices',
		content: [
			{
				type: 'text',
				text: 'Let players make choices to advance the story. Use the menu command interface to create interactive choices that drive the narrative forward.'
			},
			{
				type: 'image',
				imageUrl: images.tutorialChoiceMenu,
				altText: 'Menu Choice Interface',
				caption: 'Using the Menu Choice Interface to create interactive choices'
			}
		]
	},
	{
		id: 'publishing',
		title: 'Publishing Your Story',
		content: [
			{
				type: 'text',
				text: 'When your story is ready, try to play then publish it to Story Craft main page right away'
			},
			{
				type: 'image',
				imageUrl: images.tutorialPublish,
				altText: 'Menu Choice Interface',
				caption: 'Using the Menu Choice Interface to create interactive choices'
			},
			{
				type: 'link',
				url: 'https://twinery.org/wiki/',
				text: 'Learn more at our Wiki',
				description: 'Find advanced story crafting techniques in our documentation.'
			}
		]
	}
];
