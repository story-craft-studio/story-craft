import {Point} from './geometry';

export interface ArcProps {
	end: Point;
	largeArc?: boolean;
	radius: Point;
	rotation?: number;
	start: Point;
	sweep?: boolean;
}

/**
 * Returns an SVG path string between two points.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#arcs
 */
export function arc({start, end, radius, largeArc, sweep, rotation}: ArcProps) {
	return (
		'M' +
		start.left +
		',' +
		start.top +
		' A' +
		radius.left +
		',' +
		radius.top +
		' ' +
		(rotation ?? '0') +
		(largeArc ? ' 1' : ' 0') +
		(sweep ? ' 1 ' : ' 0 ') +
		end.left +
		',' +
		end.top
	);
}

/**
 * Returns a straight SVG path string between two points.
 */
export function line(start: Point, end: Point): string {
	return `M${start.left},${start.top} L${end.left},${end.top}`;
}
