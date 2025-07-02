import React, {useState, useEffect} from 'react';
import {CommandType} from '../../PassageCommandTypeDef';
import {CommandListItemContext} from '../../../../components/control/passage-command-area/CommandListItemContext';
import {
	CommandBlockBody,
	CommandBlockHolder,
	CommandBlockTitle
} from '../../command-blocks/base-ui';
import {getCommandTypeIcon} from '../../command-blocks/command-type-icons';
import CommandNavigators from '../../../../components/control/passage-command-area/CommandNavigators';
import {useComponentTranslation} from '../../../../util/translation-wrapper';
import {IconButton} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ScriptEditor from './script-editor';
import ScriptVariablesProvider from '../ScriptVariablesContext';
import ScriptHelpGuide from './ScriptHelpGuide';

export default function ScriptCommandBlock() {
	const context = React.useContext(CommandListItemContext);
	if (!context) return null;

	const {t} = useComponentTranslation('scriptCommandBlock');
	const [scriptText, setScriptText] = useState(context.commandText || '');
	const [isHelpOpen, setIsHelpOpen] = useState(false);
	const [helpTabIndex, setHelpTabIndex] = useState(0);
	const [globalVariables, setGlobalVariables] = useState<Record<string, any>>({
		score: 0,
		health: 100,
		level: 1,
		playerName: 'Hero',
		inventory: ['potion', 'sword'],
		hasKey: false,
		lastVisited: 'Main Hall'
	});

	useEffect(() => {
		// If there's no command text and this is a new command, set default example
		setScriptText(context.commandText || '');

		// In the future, this is where you will get global variables from GameState
		// Example:
		// if (window.GameState && typeof window.GameState.getInstance === 'function') {
		//     const gameState = window.GameState.getInstance();
		//     if (gameState && typeof gameState.getVariables === 'function') {
		//         setGlobalVariables(gameState.getVariables());
		//     }
		// }
	}, [context.commandText]);

	const handleScriptChange = (value: string) => {
		setScriptText(value);
		context._onChangeText?.(value);
	};

	const openHelp = (tabIndex: number = 0) => {
		setHelpTabIndex(tabIndex);
		setIsHelpOpen(true);
	};

	return (
		<CommandBlockHolder commandType={CommandType.script}>
			<CommandBlockTitle commandType={CommandType.script}>
				{getCommandTypeIcon(CommandType.script)}
			</CommandBlockTitle>
			<CommandNavigators />
			<CommandBlockBody>
				<div style={{ padding: '2px', paddingRight: '4px'}}>
					<div style={{
							display: 'flex',
							alignItems: 'center',
							borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
						}}>
						<p style={{
								margin: 0,
								flexGrow: 1,
								fontSize: '14px',
								fontWeight: '500'
							}}>
							{t('scriptDesc', 'Write your script commands here:')}
						</p>

						<IconButton
							size="small"
							color="primary"
							onClick={() => openHelp(0)}
							style={{
								backgroundColor: 'rgba(63, 81, 181, 0.08)'
							}}
							aria-label="help"
						>
							<HelpOutlineIcon fontSize="small" />
						</IconButton>
					</div>
					<div
						style={{
							borderRadius: '4px',
							overflow: 'hidden',
							boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
						}}
					>
						<ScriptVariablesProvider initialGlobalVariables={globalVariables}>
							<ScriptEditor value={scriptText} onChange={handleScriptChange} />
						</ScriptVariablesProvider>
					</div>
				</div>

				<ScriptHelpGuide
					open={isHelpOpen}
					onClose={() => setIsHelpOpen(false)}
					initialTab={helpTabIndex}
					globalVariables={globalVariables}
				/>
			</CommandBlockBody>
		</CommandBlockHolder>
	);
}
