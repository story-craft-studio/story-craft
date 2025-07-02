import React, {useState, useEffect, useRef} from 'react';
import Editor, {Monaco} from '@monaco-editor/react';
import {editor } from 'monaco-editor';

import { defineTheme, setupEditor } from './editor-setup';
import { validateScript } from './validation';
import { LANGUAGE_ID } from './language-definition';

// Custom styles for Monaco editor container
const editorContainerStyle = {
	position: 'relative' as const,
	zIndex: 0
};

// Flag to ensure global styles are added only once
let globalStylesAdded = false;

// Add global CSS for Monaco editor tooltip
const addGlobalStyles = () => {
	if (globalStylesAdded) return;
	const styleElement = document.createElement('style');
	styleElement.setAttribute('id', 'monaco-editor-tooltip-fix');
	styleElement.textContent = `
	  .monaco-editor .monaco-hover {
		z-index: 100 !important;
		max-width: 500px !important;
	  }
	  .monaco-editor .monaco-hover-content {
		max-height: none !important;
		overflow: visible !important;
	  }
	`;
	document.head.appendChild(styleElement);
	globalStylesAdded = true;
};

interface ScriptEditorProps {
	value: string;
	onChange: (value: string) => void;
	height?: string;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
	value,
	onChange,
	height = '200px'
}) => {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);


	const handleEditorDidMount = (
		editor: editor.IStandaloneCodeEditor,
		monaco: Monaco
	) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
		const model = editor.getModel();
		if (!model) {
			console.error('Editor model is null');
			return;
		}

		addGlobalStyles();

		defineTheme(monaco);
		setupEditor(monaco);
		validateScript(monaco, model);
	};

	const handleEditorChange = (newValue: string | undefined) => {
		const script = newValue || '';
		onChange(script);
		if (monacoRef.current && editorRef.current) {
			const model = editorRef.current.getModel();
			if (model) validateScript(monacoRef.current, model);
		}
	};

	return (
		<div style={{display: 'flex', flexDirection: 'column'}}>
			<div
				style={{
					...editorContainerStyle,
					border: '1px solid #ccc',
					borderRadius: '4px',
					overflow: 'visible',
					position: 'relative'
				}}
			>
				<Editor
					height={height}
					language={LANGUAGE_ID}
					value={value}
					onChange={handleEditorChange}
					onMount={handleEditorDidMount}
					options={{
						minimap: {enabled: false},
						scrollBeyondLastLine: false,
						fontSize: 14,
						lineNumbers: 'on',
						folding: true,
						automaticLayout: true,
						suggest: {showKeywords: true},
						hover: {enabled: true, delay: 300, sticky: true},
						fixedOverflowWidgets: true
					}}
				/>
			</div>

		</div>
	);
};

export default ScriptEditor;
