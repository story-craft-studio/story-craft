import * as React from 'react';
import {line} from '../../../util/svg';
import {
	rectCenter,
	rectIntersectionWithLine,
	Point
} from '../../../util/geometry';
import {Passage} from '../../../store/stories';
import {darkenColor} from '../../../util/pastel-colors';
import './passage-connection.css';

export interface PassageConnectionProps {
	end: Passage;
	offset: Point;
	start: Passage;
	variant: 'link' | 'reference';
}

export const PassageConnection: React.FC<PassageConnectionProps> = props => {
	const {end, offset, start, variant} = props;
	const path = React.useMemo(() => {
		// If either passage is selected, offset it. We need to take care not to
		// overwrite the passage information.

		let offsetStart = start;
		let offsetEnd = end;

		if (start.selected) {
			offsetStart = {
				...start,
				left: start.left + offset.left,
				top: start.top + offset.top
			};
		}

		if (end.selected) {
			offsetEnd = {
				...end,
				left: end.left + offset.left,
				top: end.top + offset.top
			};
		}

		// Start at the center of both passages.

		let startPoint: Point | null = rectCenter(offsetStart);
		let endPoint: Point | null = rectCenter(offsetEnd);

		// Move both points to where they intersect with the edges of their passages.

		startPoint = rectIntersectionWithLine(offsetStart, startPoint, endPoint);

		if (!startPoint) {
			return '';
		}

		endPoint = rectIntersectionWithLine(offsetEnd, startPoint, endPoint);

		if (!endPoint) {
			return '';
		}

		// Draw a straight line between the start and end points
		return line(startPoint, endPoint);
	}, [end, offset.left, offset.top, start]);

	const connectionColor = React.useMemo(() => {
		// Use the start passage's color, darkened for better visibility
		if (start.color) {
			return darkenColor(start.color, 40);
		}
		return 'var(--gray)'; // Default color
	}, [start.color]);

	return (
		<path
			d={path}
			className={`passage-connection variant-${variant}`}
			style={{
				markerEnd: 'url(#link-arrowhead)',
				stroke: connectionColor
			}}
		/>
	);
};
