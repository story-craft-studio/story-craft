import {CommandType} from "../../../../common/passage-command/PassageCommandTypeDef";
import React, {useEffect, useState} from "react";
import _ from "lodash";
import EvtMgr, {EventName} from "../../../../common/evt-mgr";
import {LocalStorageKeys} from "../../../../common/LocalStorageKeys";
import {useComponentTranslation} from "../../../../util/translation-wrapper";
import {IconBounceRight, IconClock, IconEraser, IconHeart, IconMusic, IconWand} from "@tabler/icons";
import {CommandTypeMenu, FavoriteCommandType, Item} from "./command-type-menu";
import ChatIcon from '@mui/icons-material/Chat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ListIcon from '@mui/icons-material/List';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import clearAllMocks = jest.clearAllMocks;

const CommandTypeGroups = {
	dialog: {
		icon: <ChatIcon />,
		inner: {
			showDialog: {
				icon: <ChatIcon />,
				targetType: CommandType.characterDialog
			},
			showCharacter: {
				icon: <DirectionsRunIcon />,
				targetType: CommandType.characterShow
			},
			// hideCharacter: {
			// 	icon: <PersonRemoveIcon />,
			// 	targetType: CommandType.characterHide
			// },
			dialogMenu: {
				icon: <ListIcon />,
				targetType: CommandType.chooseNextPassage
			},
		}
	},
	visualEffect: {
		icon: <AutoAwesomeIcon />,
		inner: {
			setBackground: {
				icon: <ImageIcon />,
				targetType: CommandType.changeBackground
			},
			clearScreen: {
				icon: <IconEraser />,
				targetType: CommandType.clearScreen
			},
			backgroundEffect: {
				icon: <IconWand />,
				targetType: CommandType.backgroundEffect
			}
		}
	},
	musicSound: {
		icon: <IconMusic/>,
		inner: {
			playMusic: {
				icon: <IconMusic/>,
				targetType: undefined
			},
			playSong: {
				icon: <IconMusic/>,
				targetType: undefined
			},
			stopMusic: {
				icon: <IconMusic/>,
				targetType: undefined
			},
		}
	},
	utilityFeatures: {
		icon: <IconWand/>,
		inner: {
			jumpPassage: {
				icon: <MoveDownIcon/>,
				targetType: CommandType.jumpToPassageWithTag
			},
			pause: {
				icon: <IconClock/>,
				targetType: CommandType.delay
			},
			script: {
				icon: <CodeIcon />,
				targetType: CommandType.script
			}
		}
	},
}

let favoriteJson = localStorage.getItem(LocalStorageKeys.FAVORITES_PASSAGE_COMMAND_TYPE);
let allFavorites: FavoriteCommandType[] = [];
try {
	allFavorites = favoriteJson ? JSON.parse(favoriteJson) : null;
} catch (ex) {}

if (!allFavorites?.length)
	allFavorites = [
		{group: 'dialog', key: 'showDialog'} //default favorite item
	]

function isFavorite (group, key) {
	return allFavorites.some(someFav =>
		someFav && someFav.key === key && someFav.group === group
	)
}

const tryRemoveFavoritesCmdType = (content: { group, key }) => {
	let lengthB4 = allFavorites.length;
	allFavorites = allFavorites.filter(anyF => anyF.group !== content.group || anyF.key !== content.key);
	let lengthAfter = allFavorites.length;
	if (lengthAfter >= lengthB4) return false;

	EvtMgr.emit(EventName.passageCommandTypesChange);
	localStorage.setItem(LocalStorageKeys.FAVORITES_PASSAGE_COMMAND_TYPE, JSON.stringify(allFavorites));
	return true;
}
const trySaveFavoritesCmdType = (content: { group, key }) => {
	if (isFavorite(content.group, content.key)) return false;
	allFavorites.push(content);
	allFavorites = [...allFavorites];
	EvtMgr.emit(EventName.passageCommandTypesChange);

	localStorage.setItem(LocalStorageKeys.FAVORITES_PASSAGE_COMMAND_TYPE, JSON.stringify(allFavorites));
	return true;
}


const listGroupItem: Item[] = [];
export function CommandTypeGroupsDiv(props: {
	groupWidth: number,
	groupSideMargin: number,
	chooseCommandType: (ev, cmdType: CommandType) => void,
	style?: React.CSSProperties
}) {

	const {t} = useComponentTranslation('commandTypeSelector');

	useEffect(() => {
		_resetFavListItem(NaN);

		//yep, it's safe to use the global value 'listGroupItem' instead of putting it in 'useState' as usual
		if (listGroupItem?.length) return;
		Object.keys(CommandTypeGroups).forEach(key => {
			let val = CommandTypeGroups[key];
			listGroupItem.push({
				group: key,
				key: '',
				targetType: undefined,
				icon: val.icon,
				title: t(key),
				isFavorite: false,
			});
		})
	}, []);

	const removeFavorite = (ev, listItemIndex: number) => {
		ev.stopPropagation();
		if (!listItem) return;

		if (!listItem) return;

		let item = listItem[listItemIndex];
		if (!item) return;
		let success = tryRemoveFavoritesCmdType({
			group: item.group,
			key: item.key,
		})
		if (!success) return;
		_resetFavListItem(listItemIndex, false);
		console.log('removed Favorite!', listItemIndex, false);
	}
	const addFavorite = (ev, listItemIndex: number) => {
		ev.stopPropagation();

		if (!listItem) return;

		let item = listItem[listItemIndex];
		if (!item) return;
		let success = trySaveFavoritesCmdType({
			group: item.group,
			key: item.key,
		})
		if (!success) return;
		_resetFavListItem(listItemIndex, true);
		console.log('added Favorite', listItemIndex, true);
	}

	const [favListItem, setFavListItem] = useState<Item[]>([]);
	const _resetFavListItem = (indexOfListItemNeedUpdate?: number, setFavoriteStatusTo?: boolean) => {
		setFavListItem(
			allFavorites.flatMap(eachFav => {
				if (!eachFav.group) return [];
				if (!eachFav.key) return [];

				let contents = CommandTypeGroups[eachFav.group];
				if (!contents?.inner) {
					console.warn('unknown group ', eachFav.group);
					return [];
				}

				let content = contents.inner[eachFav.key];
				if (!content) {
					console.error('unknown group content key ', eachFav.key);
					return [];
				}

				return [{
					group: eachFav.group,
					key: eachFav.key,
					title: t(mapDisplayNameByCommandType.get(content.targetType) || eachFav.key),
					icon: content.icon,
					targetType: content.targetType,
					isFavorite: true,
				}]
			})
		)


		if (_.isNil(indexOfListItemNeedUpdate) || _.isNil(setFavoriteStatusTo)) return;
		//#region update favorite status of item inside oldListItem
		//==========================
		let oldListItem = listItem;
		if (oldListItem && oldListItem[indexOfListItemNeedUpdate]) {
			oldListItem[indexOfListItemNeedUpdate].isFavorite = setFavoriteStatusTo;
			setListItem([...oldListItem]);
		}
		//#endregion
	}

	const clickFavItem = (ev, i) => {
		ev.stopPropagation();
		let favItem = favListItem[i];
		if (!favItem || !favItem.targetType) return;
		props.chooseCommandType(ev, favItem.targetType);
	}

	const clickGroupItem = (ev, i) => {
		ev.stopPropagation();
		ev.preventDefault();
		setListItem(undefined);
		let groupItem = listGroupItem[i];
		if (!groupItem || !groupItem.group) return;

		let groupContent = CommandTypeGroups[groupItem.group];
		if (!groupContent || !groupContent.inner) return;
		setListItem(
			Object.keys(groupContent.inner).flatMap(key => {
				let eachContent = groupContent.inner[key];
				if (!eachContent) return [];
				return [{
					group: groupItem.group,
					key,
					targetType: eachContent.targetType,
					title: t(mapDisplayNameByCommandType.get(eachContent.targetType) || key),
					icon: eachContent.icon,
					isFavorite: isFavorite(groupItem.group, key),
				}]
			})
		);
		setCurGroupTitle(groupItem.group);
	};
	const [curGroupTitle, setCurGroupTitle] = useState('');

	const [listItem, setListItem] = useState<Item[] | undefined>(undefined);
	const clickItem = (ev, i) => {
		ev.stopPropagation();
		if (!listItem) return;
		let item = listItem[i];
		if (!item || !item.targetType) return;
		props.chooseCommandType(ev, item.targetType);
		setListItem(undefined);
	};

	const [sectionStyle, setSectionStyle] = useState<React.CSSProperties>({});
	useEffect(() => {
		setSectionStyle({
			width: props.groupWidth + 'px',
			marginLeft: (props.groupSideMargin/2).toFixed(1) + 'px',
			marginRight: (props.groupSideMargin/2).toFixed(1) + 'px',
		})
	}, [props.groupWidth, props.groupSideMargin]);

	return <>
		<div className={'each-menu'} style={{...sectionStyle, background: '#ffcdd4'}}>
			<CommandTypeMenu
				listItem={favListItem}
				title={t('favorite')}
				clickItem={clickFavItem}
			/>
		</div>
		<div className={'each-menu'} style={sectionStyle}>
			<CommandTypeMenu
				listItem={listGroupItem}
				useFavorite={false}
				title={t('commands')}
				onMouseEnter={clickGroupItem}
			/>
		</div>
		{
			listItem?.length
				? <div className={'each-menu'} style={sectionStyle}>
					<CommandTypeMenu
						listItem={listItem}
						useFavorite={true}
						title={t(curGroupTitle)}
						clickItem={clickItem}
						addFavorite={addFavorite}
						removeFavorite={removeFavorite}
					/>
				</div>
				: null
		}
	</>
}



const mapDisplayNameByCommandType: Map<CommandType | string, string> = new Map();
mapDisplayNameByCommandType.set(CommandType.customCommand, 'script');
mapDisplayNameByCommandType.set(CommandType.newCommand, 'newCommand');

mapDisplayNameByCommandType.set(CommandType.characterDialog, 'characterDialog');
// mapDisplayNameByCommandType.set(CommandType.characterHide, 'characterHide');
mapDisplayNameByCommandType.set(CommandType.characterShow, 'characterShow');

mapDisplayNameByCommandType.set(CommandType.delay, 'pause');
mapDisplayNameByCommandType.set(CommandType.chooseNextPassage, 'menu');
mapDisplayNameByCommandType.set(CommandType.changeBackground, 'changeBackground');
mapDisplayNameByCommandType.set(CommandType.jumpToPassageWithTag, 'jumpToPassageWithTag');

export {mapDisplayNameByCommandType};
