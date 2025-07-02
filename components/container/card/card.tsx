import * as React from 'react';
import classNames from 'classnames';
import './card.css';
import {CSSProperties} from "react";

export interface CardProps {
	floating?: boolean;
	highlighted?: boolean;
	style?: CSSProperties;
}

export const Card: React.FC<CardProps> = props => {
	const {children, floating, highlighted} = props;

	const className = classNames('card', {
		floating,
		highlighted
	});

	const style = props.style || {};
	return <div className={className} style={style}>{children}</div>;
};
