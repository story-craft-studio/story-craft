import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { storyWithId, useStoriesContext } from "../../../../../store/stories";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { DialogCard, DialogCardProps } from "../../../../../components/container/dialog-card";
import AddIcon from '@mui/icons-material/Add';
import { FlexBox, FlexCenterBox } from "../../../../../common/template/mui-template/flex-box";
import { CharacterMgr } from "./character-mgr";
import { useDialogsContext } from "../../../../../dialogs";
import CharacterSettingsSubDialog from "./character-settings-sub-dialog";
import { Character } from "./character-typedef";
import EvtMgr, { EventName } from "../../../../../common/evt-mgr";
import PreviewIcon from '@mui/icons-material/Preview';
import { CharacterItem } from "./character-item";

const errorImg = '/common/imgs/image-not-found.png';

export default function CharacterSettings(props: DialogCardProps & { storyId: string }) {
	const { t } = useTranslation();

	const { storyId, ...other } = props;
	const { dispatch, stories } = useStoriesContext();
	const story = storyWithId(stories, storyId);

	const [characters, setCharacters] = useState<Character[]>(
		CharacterMgr.getAlls()
	);
	const reloadCharacter = () => {
		let chars = [...CharacterMgr.getAlls()];
		// console.log('reloadCharacter', chars);
		setCharacters(chars);
	}
	useEffect(() => {
		EvtMgr.on(EventName.characterChange, reloadCharacter);
		return () => {
			EvtMgr.off(EventName.characterChange, reloadCharacter);
		}
	}, []);

	const [actualImgUrls, setActualImgUrls] = useState<string[]>([]);
	useEffect(() => {
		setActualImgUrls(
			characters.map(each => {
				return each.imgUrl;
			})
		);
	}, [characters]);

	const addEmptyChar = () => {
		let name = CharacterMgr.getNewCharName();
		CharacterMgr.addCharacter({
			stories,
			story,
			displayName: name,
			imgUrl: errorImg,
			skins: [{
				id: 'skin-01',
				imgUrl: errorImg,
				settings: {
					scale: 1,
				}
			}],
			dispatchStory: dispatch,
		});

		clickCharacterItem(CharacterMgr.charactersCount - 1);
	}

	const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number>(NaN);
	const dialogsContext = useDialogsContext();
	const clickCharacterItem = (i) => {
		dialogsContext.dispatch({
			type: 'removeDialogById',
			id: 'CharacterSettingsSubDialog',
		});

		dialogsContext.dispatch({
			type: 'addDialog',
			id: 'CharacterSettingsSubDialog',
			component: CharacterSettingsSubDialog,
			centerScreen: false,
			props: {
				storyId,
				characterIndex: i,
			},
			isSubDialogOfId: 'CharacterSettings',
		});
		// console.log('emit demoModalChangeCharacterIndex', {characterIndex: i});
		EvtMgr.emit(EventName.demoModalChangeCharacterIndex, { characterIndex: i });
		setSelectedCharacterIndex(i);
	}

	const [isShowingPreview, setIsShowingPreview] = useState<boolean>(false);
	const togglePreview = () => {
		let needShow = !isShowingPreview;
		EvtMgr.emit(EventName.enableDemoModal, { needEnable: needShow, characterIndex: selectedCharacterIndex });
		setIsShowingPreview(needShow);
	}

	useEffect(() => {
		return () => {
			EvtMgr.emit(EventName.enableDemoModal, { needEnable: false });
		}
	}, []);

	const onRemoveChar = (ev, i) => {
		// Close sub dialog when removing a character
		dialogsContext.dispatch({
			type: 'removeDialogById',
			id: 'CharacterSettingsSubDialog',
		});
		
		// Reset selected character index
		setSelectedCharacterIndex(NaN);
		
		CharacterMgr.removeCharacter({
			stories,
			story,
			characterIndex: i,
			dispatchStory: dispatch,
		})
	}
	return (
		<DialogCard
			{...other}
			className="character-settings"
			headerLabel={t('dialogs.characterSettings.title')}
		>

			<Box sx={{ overflowY: 'auto', height: '100%', m: '5px 10px' }}>
				{
					characters?.length
						? null
						: <Box sx={{ textAlign: 'center' }}>
							<Typography sx={{
								m: 'auto',
								fontStyle: 'italic',
								color: "var(--black)",
							}}>
								{t('common.soEmpty')}
							</Typography>
						</Box>
				}
				{
					characters.map((each, i) => {
						return <CharacterItem
							key={each.id + '-' + i}
							actualImgUrls={actualImgUrls}
							index={i}
							character={each}
							setActualImgUrls={setActualImgUrls}
							onPointerDown={ev => clickCharacterItem(i)}
							onRemove={ev => onRemoveChar(ev, i)}
							isSelected={selectedCharacterIndex === i}
						/>
					})
				}
				<FlexBox sx={{gap: 1}}>
					<Button variant="contained" size="large" onPointerDown={addEmptyChar} startIcon={<AddIcon />}>
						{t('dialogs.characterSettings.addCharacter')}
					</Button>
					<Box>
						<Button variant={'contained'} size="large" onPointerDown={togglePreview} color={isShowingPreview ? 'secondary' : 'primary'}>
							<PreviewIcon />&nbsp;Preview
						</Button>
					</Box>
				</FlexBox>

			</Box>
		</DialogCard>
	)
}

