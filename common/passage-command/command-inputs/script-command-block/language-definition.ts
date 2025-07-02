import { Monaco } from '@monaco-editor/react';
import { languages } from 'monaco-editor';

export const LANGUAGE_ID = 'twine-script';

export function registerLanguage(monaco: Monaco) {
    // Register a new language
    monaco.languages.register({ id: LANGUAGE_ID });

    // Define token types/styles for syntax highlighting
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
        // Set defaultToken to invalid to see what you do not tokenize yet
        defaultToken: 'invalid',

        keywords: [
            'set', 'SET', 'Set',
            'add', 'ADD', 'Add',
            'sub', 'SUB', 'Sub',
            'if', 'IF', 'If',
            'then', 'THEN', 'Then',
            'goto', 'GOTO', 'Goto',
            'begin', 'BEGIN', 'Begin',
            'end', 'END', 'End',
            'true', 'TRUE', 'True',
            'false', 'FALSE', 'False'
        ],

        operators: [
            '==', '!=', '>=', '<=', '>', '<', '='
        ],

        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        tokenizer: {
            root: [
                // Comments
                [/\/\/.*$/, 'comment'],

                // Keywords
                [/\b(set|SET|Set|add|ADD|Add|sub|SUB|Sub|if|IF|If|then|THEN|Then|goto|GOTO|Goto|begin|BEGIN|Begin|end|END|End)\b/, 'keyword'],

                // Boolean literals
                [/\b(true|TRUE|True|false|FALSE|False)\b/, 'boolean'],

                // Operators
                [/==|!=|>=|<=|>|<|=/, 'operator'],

                // Semicolon
                [/;/, 'delimiter'],

                // String literal
                [/'[^']*'/, 'string'],

                // Number
                [/\b\d+\b/, 'number'],

                // Identifier (updated to match @varName pattern)
                [/@[a-zA-Z_]\w*/, 'identifier'],

                // Whitespace
                [/\s+/, 'white']
            ]
        }
    });

    // Define the language configuration
    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
        brackets: [
            ['begin', 'end']
        ],
        autoClosingPairs: [
            { open: '\'', close: '\'' },
            { open: 'begin', close: 'end' },
            { open: "'", close: "'", notIn: ['string'] }
        ],
        surroundingPairs: [
            { open: "'", close: "'" }
        ],
        comments: {
            lineComment: '//'
        },
        indentationRules: {
            increaseIndentPattern: /begin/i,
            decreaseIndentPattern: /end/i
        },
        // Add @ as a trigger character for completions
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/
    });
}

export function registerHoverProvider(monaco: Monaco) {
    monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        provideHover: (model, position) => {
            const word = model.getWordAtPosition(position);
            if (!word) {
                return null;
            }
            const variable = word.word;

            const keywords = [
                'SET',
                'ADD',
                'SUB',
                'IF',
                'THEN',
                'GOTO',
                'BEGIN',
                'END',
                'TRUE',
                'FALSE'
            ];

            const upperVariable = variable.toUpperCase();
            if (keywords.includes(upperVariable)) {
                const descriptions: Record<string, string> = {
                    SET: 'Assigns a value to a variable',
                    ADD: 'Adds a value to a variable',
                    SUB: 'Subtracts a value from a variable',
                    IF: 'Conditional statement',
                    THEN: 'Used with IF to specify what happens when condition is true',
                    GOTO: 'Jumps to another passage',
                    BEGIN: 'Starts a block of statements',
                    END: 'Ends a block of statements',
                    TRUE: 'Boolean true value',
                    FALSE: 'Boolean false value'
                };
                return {
                    contents: [
                        { value: `**Keyword: ${upperVariable}**` },
                        { value: descriptions[upperVariable] || 'Script command keyword' }
                    ],
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn: word.endColumn
                    }
                };
            }

            return null;
        }
    });

}

/**
 * Register completion provider for custom script language
 */
export function registerCompletion(monaco: Monaco) {
    // Register a completion item provider for the language
    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        triggerCharacters: ['@'],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const lineContent = model.getLineContent(position.lineNumber);
            const linePrefix = lineContent.substring(0, position.column - 1);

            const suggestions: languages.CompletionItem[] = [];

            // Create default range for all completion items
            const wordRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            // If the user just typed '@', suggest variables
            if (linePrefix.endsWith('@')) {
                const scriptContent = model.getValue();
                const currentLocalVars = extractVariables(scriptContent);
                
                // If we have existing variables, suggest them without the @ prefix
                // since we're already typing @
                const variableItems = [...currentLocalVars].map(varName => {
                    const varNameWithoutAt = varName.substring(1); // Remove the @ prefix
                    return {
                        label: varName,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: varNameWithoutAt,
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        },
                        detail: 'Variable'
                    };
                });
                
                suggestions.push(...variableItems);
                return { suggestions };
            }

            // Keywords
            const keywords = [
                {
                    label: 'set',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Set a variable value',
                    insertText: 'set ${1:@varName} = ${2:value};',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Set a variable value',
                    range: wordRange
                },
                {
                    label: 'add',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Add value to a variable',
                    insertText: 'add ${1:@varName} = ${2:value};',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Add value to a variable',
                    range: wordRange
                },
                {
                    label: 'sub',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Subtract value from a variable',
                    insertText: 'sub ${1:@varName} = ${2:value};',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Subtract value from a variable',
                    range: wordRange
                },
                {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Conditional statement',
                    insertText: 'if ${1:@varName} ${2:==} ${3:value} then ${4:command};',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Conditional statement',
                    range: wordRange
                },
                {
                    label: 'then',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Then clause for if statement',
                    insertText: 'then',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Then clause for if statement',
                    range: wordRange
                },
                {
                    label: 'goto',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Jump to a label',
                    insertText: 'goto ${1:labelName};',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Jump to a label',
                    range: wordRange
                },
                {
                    label: 'begin',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: 'Begin a block',
                    insertText: 'begin\n\t${1}\nend;',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Begin a block',
                    range: wordRange
                }
            ];

            // Boolean literals
            const booleans = [
                {
                    label: 'true',
                    kind: monaco.languages.CompletionItemKind.Value,
                    detail: 'Boolean true value',
                    insertText: 'true',
                    documentation: 'Boolean true value',
                    range: wordRange
                },
                {
                    label: 'false',
                    kind: monaco.languages.CompletionItemKind.Value,
                    detail: 'Boolean false value',
                    insertText: 'false',
                    documentation: 'Boolean false value',
                    range: wordRange
                }
            ];

            // Operators
            const operators = [
                {
                    label: '==',
                    kind: monaco.languages.CompletionItemKind.Operator,
                    detail: 'Equal to',
                    insertText: '==',
                    documentation: 'Bằng',
                    range: wordRange
                },
                {
                    label: '!=',
                    kind: monaco.languages.CompletionItemKind.Operator,
                    detail: 'Not equal to',
                    insertText: '!=',
                    documentation: 'Not equal to',
                    range: wordRange
                },
                {
                    label: '>=',
                    kind: monaco.languages.CompletionItemKind.Operator,
                    detail: 'Greater than or equal to',
                    insertText: '>=',
                    documentation: 'Greater than or equal to',
                    range: wordRange
                },
                {
                    label: '>',
                    kind: monaco.languages.CompletionItemKind.Operator,
                    detail: 'Greater than',
                    insertText: '>',
                    documentation: 'Greater than',
                    range: wordRange
                },
                {
                    label: '<',
                    kind: monaco.languages.CompletionItemKind.Operator,
                    detail: 'Less than',
                    insertText: '<',
                    documentation: 'Less than',
                    range: wordRange
                }
            ];

            // Add all suggestions
            suggestions.push(...keywords, ...booleans, ...operators);

            // Add snippets
            suggestions.push(
                {
                    label: 'if-then',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'If-Then statement',
                    insertText: 'if ${1:@variable} ${2:==} ${3:value} then\n\t${0}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: wordRange
                },
                {
                    label: 'begin-end',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Begin-End block',
                    insertText: 'begin\n\t${0}\nend;',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: wordRange
                }
            );

            // Add variables
            const scriptContent = model.getValue();
            const currentLocalVars = extractVariables(scriptContent);
            const variableItems = [...currentLocalVars].map(varName => ({
                label: varName,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: varName,
                range: wordRange,
                detail: 'Variable'
            }));

            suggestions.push(...variableItems);

            return { suggestions };
        }
    });
}

const variableSetRegex = /\b(?:set|SET|Set|add|ADD|Add|sub|SUB|Sub)\s+(@[a-zA-Z_]\w*)\s*=/g;

function extractVariables(scriptCode: string): string[] {
    const matches = [...scriptCode.matchAll(variableSetRegex)];
    const varNames = matches.map(match => match[1]);
    return [...new Set(varNames)];
}