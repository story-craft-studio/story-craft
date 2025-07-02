import * as React from "react";
import {useEffect, useState} from "react";
import {TwineSettingFormGroup, TwineSettingGroupCardContent} from "../TwineSettingsMuiTemplate";
import {Box, Divider, Tooltip, tooltipClasses, TooltipProps, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {styled} from "@mui/material/styles";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }}/>
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: '#f5f5f9',
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(12),
		border: '1px solid #dadde9',
	},
}));

// Group card styling
const groupContentStyles = {
	padding: '16px 20px',
};

const formGroupStyles = {
	width: '100%',
	marginTop: '16px',
};

export interface CommonSettingGroupProps {
  groupName: string;
  context: {
    twineGameSetting: any;
  };
  FieldComponent: React.ComponentType<{
    groupName: string; 
    propName: string;
    context?: any;
    disabledCheck?: any;
    getDisabledMessage?: any;
  }>;
  disabledCheck?: (groupName: string, propName: string, twineGameSetting: any) => boolean;
  getDisabledMessage?: (propName: string) => string;
}

export const CommonSettingGroup: React.FC<CommonSettingGroupProps> = ({
  groupName,
  context,
  FieldComponent,
  disabledCheck,
  getDisabledMessage
}) => {
	const { t } = useTranslation();

	const {twineGameSetting} = context;

	const [propertyNames, setPropertyNames] = useState<string[]>([]);
	const [gTitle, setGTitle] = useState('');
	const [gDesc, setGDesc] = useState('');

	useEffect(() => {
		setPropertyNames(twineGameSetting.getPropertyNames(groupName));

		setGTitle(twineGameSetting.getGroupDisplayTitle(groupName));
		setGDesc(twineGameSetting.getGroupDisplayDescription(groupName));
	}, [twineGameSetting, groupName]);

	return <>
		<TwineSettingGroupCardContent sx={groupContentStyles}>
			<Typography gutterBottom sx={{fontSize: 22, fontWeight: 500, mb: 2}}>
				{t(gTitle)}
			</Typography>
			<Divider sx={{mb: 3}}/>
			<TwineSettingFormGroup className={'CDialogSettingFormGroup'} sx={formGroupStyles}>
				{
					propertyNames?.length ? null
						: <Typography sx={{fontStyle: 'italic', color: 'text.secondary'}}>No settings available</Typography>
				}
				{
					propertyNames?.map(eachPropName => {
						let tooltip = twineGameSetting.getPropertyTooltip(groupName, eachPropName);
						if (!tooltip) {
							return <Box key={'--key--no-tooltip--' + eachPropName} className={'html-tooltip-content'}>
								<FieldComponent
									groupName={groupName}
									propName={eachPropName}
									context={context}
									disabledCheck={disabledCheck}
									getDisabledMessage={getDisabledMessage}
								/>
							</Box>
						}

						return (
							<HtmlTooltip
								key={eachPropName}
								title={
									<React.Fragment>
										<Typography color="inherit">{t(
											twineGameSetting.getPropertyTooltip(groupName, eachPropName)
										)}</Typography>
									</React.Fragment>
								}
							>
								<Box className={'html-tooltip-content'}>
									<FieldComponent
										groupName={groupName}
										propName={eachPropName}
										context={context}
										disabledCheck={disabledCheck}
										getDisabledMessage={getDisabledMessage}
									/>
								</Box>
							</HtmlTooltip>
						)
					})
				}
			</TwineSettingFormGroup>

			{
				!twineGameSetting.getGroupDisplayDescription(groupName) ? null
					: <>
						<Divider sx={{width: '150px', mt: '24px'}}/>
						<Typography sx={{color: "text.secondary", mb: 1.5, mt: '16px', fontStyle: 'italic'}}>
							{t(gDesc)}
						</Typography>
					</>
			}

		</TwineSettingGroupCardContent>
	</>;
}; 