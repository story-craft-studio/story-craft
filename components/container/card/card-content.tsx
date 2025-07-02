import * as React from 'react';
import './card-content.css';

export const CardContent = (props: {children: React.ReactNode, style?: React.CSSProperties}) => {
	let style = props.style || {};
	return (
		<div className="card-content" style={style}>{props.children}</div>
	)
}

