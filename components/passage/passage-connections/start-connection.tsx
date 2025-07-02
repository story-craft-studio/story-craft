import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import './start-connection.css';

export interface StartConnectionProps {
	offset: Point;
	passage: Passage;
}

export const StartConnection: React.FC<StartConnectionProps> = React.memo(
	() => {
		// No longer rendering a line connection since the star is now on the passage card itself
		return null;
	}
);

StartConnection.displayName = 'StartConnection';