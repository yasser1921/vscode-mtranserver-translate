import { workspace } from 'vscode';
import { CONFIG_SECTION, MTranServerSettings, resolveSettings } from './settings';

export function readWorkspaceSettings(): MTranServerSettings {
    const configuration = workspace.getConfiguration(CONFIG_SECTION);
    return resolveSettings({
        baseUrl: configuration.get<string>('baseUrl'),
        apiToken: configuration.get<string>('apiToken'),
        timeout: configuration.get<number>('timeout'),
        html: configuration.get<boolean>('html'),
        maxLen: configuration.get<number>('maxLen'),
        defaultFrom: configuration.get<string>('defaultFrom'),
    });
}
