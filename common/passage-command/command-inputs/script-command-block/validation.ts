import { Monaco } from '@monaco-editor/react';
import { editor, MarkerSeverity } from 'monaco-editor';

import { ScriptLexer } from '../../../../../custom-story/src/passage/passage-command-runner/command-runner/run-by-command-type/script-command/chervotain/core/script-lexer';
import { scriptParser } from '../../../../../custom-story/src/passage/passage-command-runner/command-runner/run-by-command-type/script-command/chervotain/core/script-parser';

// Interface for parser errors
interface ScriptParserError {
    message: string;
    line?: number;
    column?: number;
    length?: number;
}

/**
 * Validate script content and show diagnostics
 */
export function validateScript(monaco: Monaco, model: editor.ITextModel) {
    const script = model.getValue();
    const lexResult = ScriptLexer.tokenize(script);
    const errors: ScriptParserError[] = [];

    // Check for lexer errors
    if (lexResult.errors.length > 0) {
        lexResult.errors.forEach(err => {
            errors.push({
                message: err.message,
                line: err.line,
                column: err.column,
                length: err.length
            });
        });
    } else {
        // Only try parsing if lexing was successful
        scriptParser.input = lexResult.tokens;

        try {
            scriptParser.script();

            // Check for parser errors
            if (scriptParser.errors.length > 0) {
                console.log('scriptParser.errors', scriptParser.errors);
                scriptParser.errors.forEach(err => {
                    errors.push({
                        message: err.message,
                        line: err.token.startLine,
                        column: err.token.startColumn,
                        length: err.token.image.length
                    });
                });
            }
        } catch (e) {
            errors.push({
                message: e instanceof Error ? e.message : String(e),
                line: 1,
                column: 1,
                length: 2
            });
        }
    }

    const markers = errors.map(error => ({
        startLineNumber: error.line || 1,
        startColumn: error.column || 1,
        endLineNumber: error.line || 1,
        endColumn: (error.column || 1) + (error.length || 1),
        message: error.message,
        severity: MarkerSeverity.Error
    }));

    // Set markers on the model
    monaco.editor.setModelMarkers(model, 'script-validation', markers);
}