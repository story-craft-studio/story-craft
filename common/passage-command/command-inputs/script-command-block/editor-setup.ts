import { Monaco } from '@monaco-editor/react';
import { registerLanguage, registerHoverProvider, registerCompletion } from './language-definition';

let isSetup = false;

export function setupEditor(monaco: Monaco) {
    if (isSetup) return;

    isSetup = true;
    
    registerLanguage(monaco);
    registerHoverProvider(monaco);
    registerCompletion(monaco);
}

/**
 * Define a custom theme for the editor
 */
export function defineTheme(monaco: Monaco) {
    // Define custom theme
    monaco.editor.defineTheme('script-dark-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
            { token: 'operator', foreground: 'D4D4D4' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'comment', foreground: '608B4E', fontStyle: 'italic' },
            { token: 'delimiter', foreground: 'D4D4D4' },
            { token: 'identifier', foreground: '9CDCFE' }
        ],
        colors: {
            'editor.background': '#1E1E1E',
            'editor.foreground': '#D4D4D4',
            'editorCursor.foreground': '#FFFFFF',
            'editor.lineHighlightBackground': '#2D2D2D',
            'editorLineNumber.foreground': '#858585',
            'editor.selectionBackground': '#264F78',
            'editor.inactiveSelectionBackground': '#3A3D41'
        }
    });

    // Set theme
    monaco.editor.setTheme('script-dark-theme');
}
