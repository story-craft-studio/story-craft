import * as React from 'react';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import './PassageCommandArea.css';
import './codemirror-theme.css';
import classnames from 'classnames';
import {initPrefixTriggerGlobally} from '../../../codemirror/prefix-trigger';
import StringUtil from "../../../util/StringUtil";
import {PassageCommand} from "../../../common/passage-command/PassageCommandTypeDef";
import {Passage} from "../../../store/stories";
import {CSSProperties, useState} from "react";
import {AddNewBlock} from "../../../common/passage-command/command-blocks/add-new-block";
import {BreakPoint} from "../../../../shared/typedef/command-break-points";
import {Box, Typography} from '@mui/material';
import {useHotkeys} from "react-hotkeys-hook";
// Import DnD Kit components
import {
	DndContext, 
	closestCenter,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Import new components and hooks
import { useCommandManager } from './hooks/useCommandManager';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { SortableCommandItem, SortableBreakPointItem } from './components/SortableItems';

initPrefixTriggerGlobally();

export interface CodeAreaProps {
	passage: Passage;
	editorDidMount: Function;
	options: any;

	fontScale?: number;
	// ID is required because nesting the input inside the label causes screen
	// readers to announce the label on every input, which is very annoying.
	id: string;
	label: string;
	labelHidden?: boolean;
	onChangeEditor?: (value: CodeMirror.Editor) => void;
	useCodeMirror?: boolean;
	value: PassageCommand[];
	style?: CSSProperties;
}



export const PassageCommandArea: React.FC<CodeAreaProps> = props => {
	const [uid] = useState(StringUtil.randomString());
	const {
		passage,
		fontScale,
		id,
		label,
		onChangeEditor,
		useCodeMirror,
		value,
		...otherProps
	} = props;

	const style: CSSProperties = props.style || {};

	// Use custom hooks
	const commandManager = useCommandManager(passage, value);
	const {
		commands,
		commandBreakPoint,
		positionTracker,
		commandBreakPointErr,
		updateCommandText,
		addCommand,
		addCommandAt,
		cloneCommand,
		deleteCommand,
		updateCommandType,
		updateWholeCommand,
		moveElementUp,
		moveElementDown,
		swapElements,
		updateBreakPointText,
		removeBreakPoint,
		tError
	} = commandManager;

	const dragAndDropHook = useDragAndDrop({
		positionTracker,
		updateState: commandManager.updateState
	});
	const {
		sensors,
		handleDragEnd,
		handleDragStart,
		handleDragCancel,
		itemIds
	} = dragAndDropHook;

	// Direct callback handlers
	const handleChangeCommandText = (positionIndex: number) => (text: string) => {
		updateCommandText(text, positionIndex);
	};
	
	const handleChangeBreakPointText = (positionIndex: number) => (ev: any) => {
		updateBreakPointText(ev, positionIndex);
	};
	
	const handleRemoveBreakPoint = (positionIndex: number) => (ev: any) => {
		removeBreakPoint(positionIndex);
	};
	
	const handleMoveUpOneSlot = (positionIndex: number) => (ev: any) => {
		moveElementUp(positionIndex);
	};
	
	const handleMoveDownOneSlot = (positionIndex: number) => (ev: any) => {
		moveElementDown(positionIndex);
	};

	useHotkeys('shift+g,', () => {
		console.log('selected passage', passage);
	}, [passage]);

	let commandIndex = -1;

	return (
		<>
			<div className="passage-command-area" style={style}>
				<label
					htmlFor={id}
					className={classnames('label', {
						'screen-reader-only': props.labelHidden
					})}
				>
					{label}
				</label>
				<DndContext 
					sensors={sensors} 
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					onDragStart={handleDragStart}
					onDragCancel={handleDragCancel}
				>
					<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
						{positionTracker.map((each, i) => {
							let isCmd = positionTracker.isCmd(each);
							const itemId = `item-${i}`;
							
							if (isCmd) {
								commandIndex++;
								const command = each.content as PassageCommand;
								if (!command) {
									console.error('We got a null command', each.content, 'at index', commandIndex, ' in ', commands);
									return <Box key={'empty-cmd-item-' + i}>Unknown command at index {commandIndex}</Box>;
								}
								
								// Use stable key based on command ID
								const stableKey = `CMD-${command.type}-${command.id}-${i}`;
								
								return (
									<Box key={stableKey}>
										<SortableCommandItem
											id={itemId}
											passage={passage}
											command={command}
											positionIndex={i}
											commandIndex={commandIndex}
											addCmd={addCommandAt}
											cloneCmd={cloneCommand}
											moveUp={moveElementUp}
											moveDown={moveElementDown}
											moveCommandListItemToIdx={swapElements}
											textareaId={id}
											textareaStyle={style}
											onChangeText={handleChangeCommandText(i)}
											deleteCmd={deleteCommand}
											changeCommandType={updateCommandType}
											editWholeCommandAtIndex={updateWholeCommand}
											useCodeMirror={useCodeMirror || false}
											otherProps={otherProps}
											handleCodeMirrorBeforeChange={
												(
													editor: CodeMirror.Editor,
													data: CodeMirror.EditorChange,
													text
												) => console.log('Code mirror is disabled but still receiving change request', editor, data, text, i)
											}
										/>
									</Box>
								);
							}

							const pBP = each.content as BreakPoint;
							const errObj = commandBreakPointErr.get(pBP);
							
							// Use stable key based on breakpoint name and position
							const stableKey = `BP-${pBP.name}-${i}`;
							// console.log('RENDERING BREAKPOINT', stableKey);
							
							return (
								<Box key={stableKey}>
									<SortableBreakPointItem
										id={itemId}
										breakPoint={pBP}
										positionIndex={i}
										bgColor={errObj?.message ? 'red' : undefined}
										onChange={handleChangeBreakPointText(i)}
										onRemove={handleRemoveBreakPoint(i)}
										onMoveUp={handleMoveUpOneSlot(i)}
										onMoveDown={handleMoveDownOneSlot(i)}
									/>
									{errObj?.message &&
										<Typography component={'div'} fontStyle={'italic'}
													sx={{mt: '5px', mb: '15px', color: 'red', pl: '30px'}}>
											{tError(
												errObj.message,
												errObj.messageReplaceArgs
											)}
										</Typography>
									}
								</Box>
							);
						})}
					</SortableContext>
				</DndContext>
				<AddNewBlock onAddBlock={addCommand} passage={passage}/>
			</div>
		</>
	);
};
