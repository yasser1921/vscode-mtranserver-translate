import { ITranslateRegistry } from 'comment-translate-manager';
import * as vscode from 'vscode';
import { TRANSLATE_KEY } from './settings';
import { MTranServerTranslate } from './mtranserverTranslate';

export function activate(_context: vscode.ExtensionContext) {
    return {
        extendTranslate(registry: ITranslateRegistry) {
            registry(TRANSLATE_KEY, MTranServerTranslate);
        },
    };
}

export function deactivate() {}
