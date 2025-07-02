import * as React from "react";
import {HTMLAttributes} from "react";
import {BoxOwnProps} from "@mui/system/Box/Box";
import {Character} from "./character-typedef";
import {FlexBox} from "../../../../../common/template/mui-template/flex-box";
import {Box, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import {AbsoluteBox} from "../../../../../common/template/mui-template/position-box";
import { useTranslation } from "react-i18next";

const errorImg = '/common/imgs/image-not-found.png';
export function CharacterItem(props: HTMLAttributes<any> & BoxOwnProps & {
	actualImgUrls: string[],
	index: number,
	character: Character,
	setActualImgUrls: (urls: string[]) => void,
	onRemove: (ev) => void,
	isSelected?: boolean,
}) {
	const { t } = useTranslation();
	const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
	let actualImgUrls = props.actualImgUrls;

	const materialSystemProps: any = {...props};
	delete materialSystemProps.actualImgUrls;
	delete materialSystemProps.index;
	delete materialSystemProps.character;
	delete materialSystemProps.setActualImgUrls;
	delete materialSystemProps.onRemove;
	delete materialSystemProps.isSelected;

	const handleDeleteClick = (ev) => {
		ev.stopPropagation();
		setDeleteConfirmOpen(true);
	};

	const handleDeleteConfirm = (ev) => {
		ev.stopPropagation();
		setDeleteConfirmOpen(false);
		props.onRemove(ev);
	};

	const handleDeleteCancel = (ev) => {
		ev.stopPropagation();
		setDeleteConfirmOpen(false);
	};

	return <>
		<FlexBox
			className={'CharacterItem'}
			sx={{
				height: "120px", width: "100%",
				borderRadius: '8px',
				backgroundColor: '#f0f0f0',
				boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
				marginBottom: '10px',
				border: props.isSelected ? '3px solid #1976d2' : '3px solid transparent',
				transition: 'border-color 0.2s ease',
				position: 'relative'
			}}
			{...materialSystemProps}
		>
			<Box sx={{width: "20%"}}>
				<img
					src={actualImgUrls[props.index]}
					alt={props.character.displayName}
					onError={() => {
						if (actualImgUrls[props.index] === errorImg) return;
						console.error('cant get character img at url', actualImgUrls[props.index]);
						actualImgUrls[props.index] = errorImg;
						props.setActualImgUrls([...actualImgUrls]);
					}}

					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
				/>
			</Box>
			<Box sx={{width: '50%', ml: '10px', p: '15px 8px'}}>
				<Typography component={'div'} sx={{
					fontWeight: 700,
					fontSize: '2rem',
					mb: '5px'
				}}>
					{props.character.displayName}
				</Typography>
				<Typography component={'div'} sx={{
					fontSize: '1.2rem',
					color: '#666'
				}}>
					{props.character.skins.length} {props.character.skins.length === 1 ? t('dialogs.characterSettings.expression') : t('dialogs.characterSettings.expressions')}
				</Typography>
			</Box>
			<Box sx={{
				position: 'absolute',
				right: '10px',
				top: '50%',
				transform: 'translateY(-50%)'
			}}>
				<IconButton onPointerDown={handleDeleteClick}>
					<DeleteIcon sx={{width: '40px', height: '40px', color: 'red'}}/>
				</IconButton>
			</Box>
		</FlexBox>
		<Dialog
			open={deleteConfirmOpen}
			onClose={handleDeleteCancel}
		>
			<DialogTitle>{t('dialogs.characterSettings.confirmDeleteCharacterTitle')}</DialogTitle>
			<DialogContent>
				<Typography>{t('dialogs.characterSettings.confirmDeleteCharacterMessage')}</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
				<Button onClick={handleDeleteConfirm} color="error">{t('common.delete')}</Button>
			</DialogActions>
		</Dialog>
	</>;
}
