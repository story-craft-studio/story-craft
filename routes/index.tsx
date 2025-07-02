import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';
import {usePrefsContext} from '../store/prefs';
import {StoryEditRoute} from './story-edit';
import {StoryListRoute} from './story-list';
import {StoryPlayRoute} from './story-play';
import {StoryProofRoute} from './story-proof';
import {StoryTestRoute} from './story-test';
import {WelcomeRoute} from './welcome';

export const Routes: React.FC = () => {
	const {prefs} = usePrefsContext();

	// A <HashRouter> is used to make our lives easier--to load local story
	// formats, we need the document HREF to reflect where the HTML file is.
	// Otherwise we'd have to store the actual location somewhere, which will
	// differ between web and Electron contexts.

	return (
		<ReactRouterDom.HashRouter>
			{prefs.welcomeSeen ? (
				<ReactRouterDom.Routes>

					<ReactRouterDom.Route path="/" element={<StoryListRoute />}/>

					<ReactRouterDom.Route path="/welcome" element={<WelcomeRoute />}/>
					<ReactRouterDom.Route path="/stories/:storyId/play" element={<StoryPlayRoute />}/>
					<ReactRouterDom.Route path="/stories/:storyId/proof" element={<StoryProofRoute />}/>
					<ReactRouterDom.Route path="/stories/:storyId/test/:passageId" element={<StoryTestRoute />}/>
					<ReactRouterDom.Route path="/stories/:storyId/test" element={<StoryTestRoute />}/>
					<ReactRouterDom.Route path="/stories/:storyId" element={<StoryEditRoute />}/>
					<ReactRouterDom.Route
						path="*"
						element={<StoryListRoute />}
					/>
				</ReactRouterDom.Routes>
			) : (
				<WelcomeRoute />
			)}
		</ReactRouterDom.HashRouter>
	);
};
