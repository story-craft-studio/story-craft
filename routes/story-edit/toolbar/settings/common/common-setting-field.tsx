import {useTranslation} from "react-i18next";
import * as React from "react";
import {useEffect, useState} from "react";
import {OneOfInputType} from "../../../../../common/character-dialog-setting-mgr";
import _ from "lodash";
import {FlexBox} from "../../../../../common/template/mui-template/flex-box";
import SearchIcon from '@mui/icons-material/Search';
import '../character-settings/character-settings-sub-dialog.css';
import {
	Box,
	Checkbox,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Slider,
	TextField,
	Tooltip,
	Typography,
	styled,
} from "@mui/material";
import {
	ArrowUpward as ArrowUpwardIcon,
	ArrowDownward as ArrowDownwardIcon,
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { SettingPropertyDesc } from "../../../../../common/twine-game-setting";
import {MuiColorInput} from "../../../../../components/input/mui-color-input";
import AssetStoreModal from "../../../../../common/asset/asset-store-modal/asset-store-modal";
import { AssetStoreModalPropsCloseArgs } from "../../../../../common/asset/asset-store-modal/asset-store-type-def";
import AssetMgr from "../../../../../common/asset/asset-mgr";
import ImageUrlInput from "../../../../../common/passage-command/command-blocks/image-url-input";

// Create styled components for floating label style
const InputContainer = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	position: 'relative',
	paddingTop: '7px',
}));

const FloatingLabel = styled(Typography)(({ theme }) => ({
	fontSize: '0.875rem',
	color: theme.palette.text.primary,
	position: 'absolute',
	top: 0,
	left: 10,
	zIndex: 1,
	backgroundColor: 'white',
	padding: '0 5px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	backgroundColor: "white",
	borderRadius: "8px",
	"& .MuiOutlinedInput-root": {
		borderRadius: "8px",
		minHeight: "40px",
		"& fieldset": {
			borderColor: "#e0e0e0",
		},
	},
}));

const StyledColorInput = styled(MuiColorInput)(({ theme }) => ({
	backgroundColor: "white",
	borderRadius: "8px",
	"& .MuiOutlinedInput-root": {
		borderRadius: "8px",
		minHeight: "40px",
		"& fieldset": {
			borderColor: "#e0e0e0",
		},
	},
}));

export interface CommonSettingFieldProps {
  groupName: string;
  propName: string;
  context: {
    twineGameSetting: any;
    changeSettingsByFieldPath: (ev: any, data: {
      propertyName: string;
      groupName: string;
      newValue: any;
      valueUnit: string;
    }) => void;
  };
  disabledCheck?: (groupName: string, propName: string, twineGameSetting: any) => boolean;
  getDisabledMessage?: (propName: string) => string;
  supportsPositionInput?: boolean;
}

export const CommonSettingField: React.FC<CommonSettingFieldProps> = ({
  groupName,
  propName,
  context,
  disabledCheck,
  getDisabledMessage,
  supportsPositionInput = false
}) => {
	const {t} = useTranslation();

	const {twineGameSetting} = context;

	const [propDesc, setPropDesc] = useState<SettingPropertyDesc>(twineGameSetting.getPropertyDesc(groupName, propName));
	const [propValUnit, setPropValUnit] = useState('');
	const [propVal, setPropVal] = useState<any>('');
	const [isDisabled, setIsDisabled] = useState(false);

	const [inputType, setInputType] = useState<OneOfInputType>('text');
	const [assetType, setAssetType] = useState<string>('');

	useEffect(() => {
		let newPropDesc = twineGameSetting.getPropertyDesc(groupName, propName);
		setPropDesc(newPropDesc);
		setPropValUnit(newPropDesc.unit);
		setAssetType(newPropDesc.assetType || '');

		let newPropVal = newPropDesc.value;
		if (inputType === "slider" && !_.isNumber(newPropVal)) {
			newPropVal = Number(newPropVal) || 0;
		}
		setPropVal(newPropVal);
		setInputType(newPropDesc.inputType);
	}, [twineGameSetting, groupName, propName]);

	// Check if this field should be disabled based on dependency rules
	useEffect(() => {
		if (disabledCheck) {
			setIsDisabled(disabledCheck(groupName, propName, twineGameSetting));
		}
	}, [twineGameSetting, groupName, propName, disabledCheck]);

	const [sliderStep, setSliderStep] = useState<number>(5);
	const [sliderMin, setSliderMin] = useState<number | undefined>(undefined);
	const [sliderMax, setSliderMax] = useState<number | undefined>(undefined);
	useEffect(() => {
		let sliderValue = Number(propDesc.value) || 0;
		if (inputType !== "slider") {
			setSliderMin(undefined);
			setSliderMax(undefined);
			setSliderStep(5);
			return;
		}

		let min = Number(propDesc.min);
		let max = Number(propDesc.max);
		let step = Number(propDesc.step);
		setSliderMin(min);
		setSliderMax(max);
		setSliderStep(step);

		//auto determine a 'step' value for slider
		if (Number.isNaN(min)) min = Math.min(sliderValue, 0);
		if (Number.isNaN(max)) max = Math.max(sliderValue, 100);
		let newStep = step || Math.floor((max - min) / 5);
		newStep = Math.max(newStep, 5);
		setSliderStep(newStep);
	}, [inputType, propDesc]);

	const onChangeCDialogSettingValue = (ev) => {
		if (isDisabled) return;
		
		let val = ev.target.value;
		if (inputType === "checkbox") val = ev.target.checked;

		setPropVal(val);
		context.changeSettingsByFieldPath(
			ev,
			{
				propertyName: propName,
				groupName: groupName,
				newValue: val,
				valueUnit: propValUnit,
			}
		)
	}
	
	const onChangeImageUrl = (value: string) => {
		if (isDisabled) return;
		
		setPropVal(value);
		context.changeSettingsByFieldPath(
			{ target: { value } }, // Create a synthetic event
			{
				propertyName: propName,
				groupName: groupName,
				newValue: value,
				valueUnit: propValUnit,
			}
		)
	}

	const onChangeCDialogSettingValueAsColor = (newColorValue) => {
		if (isDisabled) return;
		
		setPropVal(newColorValue);
		context.changeSettingsByFieldPath(
			undefined,
			{
				propertyName: propName,
				groupName: groupName,
				newValue: newColorValue,
				valueUnit: propValUnit,
			}
		)
	}

	const onChangeCDialogSettingUnit = (ev) => {
		if (isDisabled) return;
		
		let valueUnit = ev.target.value;
		setPropValUnit(valueUnit);
		context.changeSettingsByFieldPath(
			ev,
			{
				propertyName: propName,
				groupName: groupName,
				newValue: propVal,
				valueUnit,
			}
		)
	}

	const [openMyAssets, setOpenMyAssets] = useState(false);
	const onCloseAssetStoreModal = (args: AssetStoreModalPropsCloseArgs | undefined) => {
		setOpenMyAssets(false);
		let chooseMyAssetItem = args?.chooseMyAssetItem;
		if (!chooseMyAssetItem) {
			return;
		}
		// Create a synthetic event object with the target.value property
		const syntheticEvent = {
			target: {
				value: AssetMgr.toRealUrl(chooseMyAssetItem.relativeLink)
			}
		};
		onChangeCDialogSettingValue(syntheticEvent);
	}

	const updatePositionValue = (direction: 'up' | 'down' | 'left' | 'right', step: number = 10) => {
		if (isDisabled || !supportsPositionInput) return;
		
		if (!propVal || typeof propVal !== 'object') {
			// Initialize with default values if value is not an object
			setPropVal({ x: 0, y: 0 });
		}
		
		const currentPos = propVal || { x: 0, y: 0 };
		let newX = currentPos.x;
		let newY = currentPos.y;
		
		// Get constraints from propDesc
		const minValue = propDesc.min !== undefined ? Number(propDesc.min) : -200;
		const maxValue = propDesc.max !== undefined ? Number(propDesc.max) : 200;
		const stepValue = step || (propDesc.step !== undefined ? Number(propDesc.step) : 10);
		
		switch (direction) {
			case 'up':
				newY = Math.max(minValue, newY - stepValue);
				break;
			case 'down':
				newY = Math.min(maxValue, newY + stepValue);
				break;
			case 'left':
				newX = Math.max(minValue, newX - stepValue);
				break;
			case 'right':
				newX = Math.min(maxValue, newX + stepValue);
				break;
		}
		
		const newPosition = { x: newX, y: newY };
		setPropVal(newPosition);
		
		context.changeSettingsByFieldPath(
			undefined,
			{
				propertyName: propName,
				groupName: groupName,
				newValue: newPosition,
				valueUnit: propValUnit,
			}
		);
	}

	// Generate a message about why the field is disabled
	const getDisabledInfo = () => {
		if (getDisabledMessage) {
			return getDisabledMessage(propName);
		}
		return '';
	}

	return <>
		<FlexBox className={'CDialogSettingField'} sx={{
			mt: '16px',
			mb: '16px',
			alignItems: 'flex-start',
			justifyContent: 'space-between',
			opacity: isDisabled ? 0.6 : 1,
		}}>
			{
				inputType === 'checkbox'
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							<Box sx={{ 
								display: 'flex', 
								alignItems: 'center', 
								height: '47px', 
								backgroundColor: 'white', 
								borderRadius: '10px',
								padding: '5px', 
								marginTop: '7px',
								border: '1px solid #e0e0e0' 
							}}>
								<Checkbox 
									checked={Boolean(propVal)} 
									onChange={onChangeCDialogSettingValue}
									disabled={isDisabled}
								/>
								{isDisabled && (
									<Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
										{getDisabledInfo()}
									</Typography>
								)}
							</Box>
						</InputContainer>
					</>
					: null
			}
			{
				inputType === 'color'
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							<Tooltip title={isDisabled ? getDisabledInfo() : ''} arrow placement="top">
								<Box sx={{ width: '100%' }}>
									<StyledColorInput
										format="hex8" 
										value={propVal} 
										onChange={onChangeCDialogSettingValueAsColor}
										sx={{ 
											width: '100%',
											marginTop: '7px'
										}}
										disabled={isDisabled}
									/>
								</Box>
							</Tooltip>
						</InputContainer>
					</>
					: null
			}
			{
				inputType === 'link' && assetType === 'image'
					? <>
						<Box sx={{ width: '100%' }}>
							<Box sx={{ 
								opacity: isDisabled ? 0.6 : 1, 
								pointerEvents: isDisabled ? 'none' : 'auto' 
							}}>
								<ImageUrlInput
									title={t(propDesc._title)}
									value={propVal}
									onChange={onChangeImageUrl}
									placeholder="Enter image URL or select from asset store"
								/>
							</Box>
						</Box>
					</>
					: null
			}
			{
				inputType === 'link' && assetType !== 'image'
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							<Box sx={{ 
								display: 'flex', 
								alignItems: 'center', 
								height: '47px', 
								backgroundColor: 'white', 
								borderRadius: '10px',
								padding: '5px', 
								marginTop: '7px',
								border: '1px solid #e0e0e0' 
							}}>
								<IconButton
									className='search-icon-container'
									sx={{
										'&.search-icon-container': {
											backgroundColor: 'rgb(48, 50, 173)',
											borderRadius: '4px',
											padding: '8px',
											mr: 1
										}
									}}
									onPointerDown={ev => setOpenMyAssets(true)}
									disabled={isDisabled}
								>
									<SearchIcon sx={{color: 'white'}}/>
								</IconButton>
								<AssetStoreModal
									open={openMyAssets}
									onClose={onCloseAssetStoreModal}
								/>
								<StyledTextField
									variant="outlined"
									type={'text'}
									value={propVal}
									onChange={onChangeCDialogSettingValue}
									sx={{ width: 'calc(100% - 40px)' }}
									InputProps={{ 
										style: { border: 'none' },
										disableUnderline: true
									}}
									disabled={isDisabled}
								/>
							</Box>
						</InputContainer>
					</>
					: null
			}
			{
				inputType === 'position' && supportsPositionInput
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							<Box sx={{ 
								marginTop: '7px',
								border: '1px solid #e0e0e0',
								borderRadius: '10px',
								padding: '16px',
								backgroundColor: 'white'
							}}>
								<Box
									sx={{
										position: 'relative',
										width: 120,
										height: 120,
										backgroundColor: '#ffffff',
										borderRadius: '20%',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										mb: 2,
										border: '1px solid #e0e0e0',
										margin: '0 auto'
									}}
								>
									<IconButton
										onClick={() => updatePositionValue('up')}
										sx={{
											position: 'absolute',
											top: 0,
											left: '50%',
											transform: 'translateX(-50%)',
											color: '#555',
										}}
										disabled={isDisabled}
									>
										<ArrowUpwardIcon />
									</IconButton>
									<IconButton
										onClick={() => updatePositionValue('down')}
										sx={{
											position: 'absolute',
											bottom: 0,
											left: '50%',
											transform: 'translateX(-50%)',
											color: '#555',
										}}
										disabled={isDisabled}
									>
										<ArrowDownwardIcon />
									</IconButton>
									<IconButton
										onClick={() => updatePositionValue('left')}
										sx={{
											position: 'absolute',
											left: 0,
											top: '50%',
											transform: 'translateY(-50%)',
											color: '#555',
										}}
										disabled={isDisabled}
									>
										<ArrowBackIcon />
									</IconButton>
									<IconButton
										onClick={() => updatePositionValue('right')}
										sx={{
											position: 'absolute',
											right: 0,
											top: '50%',
											transform: 'translateY(-50%)',
											color: '#555',
										}}
										disabled={isDisabled}
									>
										<ArrowForwardIcon />
									</IconButton>
									
									<Box 
										sx={{ 
											backgroundColor: 'white', 
											borderRadius: '50%', 
											width: 50, 
											height: 50,
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'center',
											alignItems: 'center',
											boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
										}}
									>
										<Typography variant="caption" component="div" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
											X: {propVal?.x || 0}
										</Typography>
										<Typography variant="caption" component="div" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
											Y: {propVal?.y || 0}
										</Typography>
									</Box>
								</Box>
								
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
										<Typography variant="caption" sx={{ mr: 1, color: '#616161' }}>
											X:
										</Typography>
										<IconButton 
											size="small"
											onClick={() => updatePositionValue('left', 1)}
											sx={{ color: '#555', p: 0.5 }}
											disabled={isDisabled}
										>
											<ArrowBackIcon fontSize="small" />
										</IconButton>
										<IconButton 
											size="small"
											onClick={() => updatePositionValue('right', 1)}
											sx={{ color: '#555', p: 0.5 }}
											disabled={isDisabled}
										>
											<ArrowForwardIcon fontSize="small" />
										</IconButton>
									</Box>
									
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<Typography variant="caption" sx={{ mr: 1, color: '#616161' }}>
											Y:
										</Typography>
										<IconButton 
											size="small"
											onClick={() => updatePositionValue('up', 1)}
											sx={{ color: '#555', p: 0.5 }}
											disabled={isDisabled}
										>
											<ArrowUpwardIcon fontSize="small" />
										</IconButton>
										<IconButton 
											size="small"
											onClick={() => updatePositionValue('down', 1)}
											sx={{ color: '#555', p: 0.5 }}
											disabled={isDisabled}
										>
											<ArrowDownwardIcon fontSize="small" />
										</IconButton>
									</Box>
								</Box>
								
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
									<Typography variant="caption" sx={{ color: '#757575', fontSize: '0.65rem' }}>
										Range: {propDesc.min || -200} to {propDesc.max || 200}, Step: {propDesc.step || 10}
									</Typography>
								</Box>
							</Box>
						</InputContainer>
					</>
					: null
			}
			{
				inputType === 'slider'
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							<Box sx={{ 
								height: '47px', 
								backgroundColor: 'white', 
								borderRadius: '10px',
								padding: '5px 15px', 
								marginTop: '7px',
								border: '1px solid #e0e0e0',
								display: 'flex',
								alignItems: 'center'
							}}>
								<Slider
									aria-label="Custom marks"
									value={Number(propVal) || 0}
									onChange={onChangeCDialogSettingValue}
									shiftStep={sliderStep}
									step={sliderStep}
									marks={true}
									valueLabelDisplay={'auto'}
									min={sliderMin}
									max={sliderMax}
									sx={{ width: '100%' }}
									disabled={isDisabled}
								/>
							</Box>
						</InputContainer>
					</>
					: null
			}
			{
				inputType === 'text'
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							<StyledTextField
								variant="outlined"
								type={'text'}
								value={propVal}
								onChange={onChangeCDialogSettingValue}
								sx={{ width: '100%', marginTop: '7px' }}
								disabled={isDisabled}
							/>
						</InputContainer>
					</>
					: null
			}
			{
				inputType === 'number'
					? <>
						<InputContainer>
							<FloatingLabel>{t(propDesc._title)}</FloatingLabel>
							{
								!propDesc?.unitsToChooseFrom?.length 
								?
								<StyledTextField
									variant="outlined"
									type={'number'}
									value={propVal}
									onChange={onChangeCDialogSettingValue}
									sx={{ width: '100%', marginTop: '7px' }}
									disabled={isDisabled}
								/>
								:
								<Box sx={{ 
									display: 'flex', 
									alignItems: 'center', 
									width: '100%', 
									marginTop: '7px' 
								}}>
									<StyledTextField
										variant="outlined"
										type={'number'}
										value={propVal}
										onChange={onChangeCDialogSettingValue}
										sx={{ width: '65%', mr: '5%' }}
										disabled={isDisabled}
									/>
									<FormControl sx={{ width: '30%' }}>
										<InputLabel id="unit-label" shrink>Unit</InputLabel>
										<Select
											labelId="unit-label"
											value={propValUnit}
											label="Unit"
											onChange={onChangeCDialogSettingUnit}
											sx={{ 
												width: '100%',
												backgroundColor: "white",
												borderRadius: "8px",
												"& .MuiOutlinedInput-root": {
													borderRadius: "8px",
													minHeight: "40px",
												}
											}}
											disabled={isDisabled}
										>
											{
												propDesc?.unitsToChooseFrom?.map(eachUnit =>
													<MenuItem key={eachUnit} value={eachUnit}>{eachUnit}</MenuItem>
												)
											}
										</Select>
									</FormControl>
								</Box>
							}
						</InputContainer>
					</>
					: null
			}
		</FlexBox>
	</>;
}; 