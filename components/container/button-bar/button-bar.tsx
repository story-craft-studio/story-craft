import * as React from 'react';
import classNames from 'classnames';
import './button-bar.css';
import {HTMLAttributes} from "react";

export interface ButtonBarProps {
	orientation?: 'horizontal' | 'vertical';
}

export const ButtonBar: React.FC<ButtonBarProps & HTMLAttributes<HTMLDivElement>> = props => (
	<div
		{...props}
		className={classNames(
			'button-bar',
			`orientation-${props.orientation ?? 'horizontal'}`,
			props.className,
		)}
	>
		{props.children}
	</div>
);
