import * as React from "react";
import {
	CommandBlockBody,
	CommandBlockHolder,
} from "../command-blocks/base-ui";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import {useComponentTranslation} from "../../../util/translation-wrapper";
import {Typography} from "@mui/material";
import './custom-command-block.css';

import {UnControlled as CodeMirror} from 'react-codemirror2'
import * as codemirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/mode/css/css';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/display/autorefresh';

export default function CustomCommandBlock() {
	const context = React.useContext(CommandListItemContext);

	const {t} = useComponentTranslation('customCommandBlock');

	const onCodeMirrorEditorChange = (editor: codemirror.Editor, data, newValue) => {
		editor.showHint({ completeSingle: true });
		context?._onChangeText(newValue);
	}
	return (
		<CommandBlockHolder className={'CustomCommandBlock'} commandType={context?.command.type}>
			<CommandNavigators />

			<CommandBlockBody>
				<Typography component={'div'}>
					{t("javascript")}
				</Typography>

				<CodeMirror
					value={context?.commandText}
					onChange={onCodeMirrorEditorChange}
					className={'code-mirror'}
					options={{
						value: t('enterYourCodeHere'),
						mode: 'javascript',
						theme: 'material'
					}}
				/>
			</CommandBlockBody>
		</CommandBlockHolder>
	);
}

