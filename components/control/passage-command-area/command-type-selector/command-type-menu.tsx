import React from "react";
import {useTranslation} from "react-i18next";
import _ from "lodash";
import {CommandType} from "../../../../../shared/typedef/command-type";
import {IconHeart} from "@tabler/icons";
import './command-type-menu.css';

export type Item = {
	title: string,
	icon: React.JSX.Element,
	isFavorite: boolean
    targetType?: CommandType,
	group: string;
	key: string;
}

export type FavoriteCommandType = {
	group: string;
	key: string;
}
export const CommandTypeMenu = (props: {
	style?: React.CSSProperties,
	title?: string,
	listItem: Item[],
	useFavorite?: boolean,
	onMouseEnter?,
	clickItem?,
	addFavorite?, removeFavorite?
}) => {
	const {t} = useTranslation();

	function addFavorite(ev: React.PointerEvent<HTMLDivElement>, i) {
		_.isFunction(props.addFavorite) && props.addFavorite(ev, i);
	}

	function removeFavorite(ev: React.PointerEvent<HTMLDivElement>, i) {
		_.isFunction(props.removeFavorite) && props.removeFavorite(ev, i);
	}

	return <div style={props.style}>
		<div className={'header-group'}>
			<p>{props.title || ''}</p>
		</div>
		<hr/>
		<div className={'content-group'}>
			{
				props.listItem.length === 0 ? (
					<div className="empty-list-placeholder">
						<p>{t('common.favoriteListEmpty')}</p>
					</div>
				) : props.listItem.map((item, i) => {
					if (!item) return null;

					return <div key={i}
								className={'flex max-content each-section-content'}
								onPointerDown={props.clickItem ? (ev => {
									// Don't trigger parent's click if we're clicking the favorite button
									if (!(ev.target as HTMLElement).closest('.favorite-btn')) {
										props.clickItem(ev, i);
									}
								}) : undefined}
								onMouseEnter={props.onMouseEnter ? (ev => props.onMouseEnter(ev, i)) : undefined}
					>
						<p>
							{item.title}
						</p>
						{
							!item.icon ? null
								: <div className={'icon-group'}>
									{item.icon}
								</div>
						}

						{
							!props.useFavorite ? null
								: <button
									type="button"
									className={'favorite-btn ' + (item.isFavorite ? 'favorited' : '')}
									onPointerDown={ev => {
										ev.stopPropagation();
										ev.preventDefault();
										if (!item.isFavorite)
											addFavorite(ev as any, i)
										else
											removeFavorite(ev as any, i)
									}}
									onMouseEnter={ev => {
										ev.stopPropagation();
									}}
								>
									<IconHeart
										className="heart-icon"
										fill={item.isFavorite ? "currentColor" : "none"}
										stroke="currentColor"
										strokeWidth={1.5}
									/>
									<span className="favorite-text">
										{t(!item.isFavorite ? 'common.favorite' : 'common.unfavorite')}
									</span>
								</button>
						}
					</div>
				})
			}
		</div>
	</div>;
}
