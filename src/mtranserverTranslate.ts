import { ITranslate, ITranslateOptions } from 'comment-translate-manager';
import { workspace } from 'vscode';
import { translateText } from './client';
import { readWorkspaceSettings } from './config';
import { mapLanguageCode } from './language';
import { CONFIG_SECTION, MTranServerSettings } from './settings';
import { buildUiUrl } from './url';

export interface TranslateHost {
    getSettings(): MTranServerSettings;
    onDidChangeConfiguration?(listener: () => void): { dispose(): void };
    fetchImpl?: typeof fetch;
}

function createDefaultHost(): TranslateHost {
    return {
        getSettings: readWorkspaceSettings,
        onDidChangeConfiguration: (listener) => {
            return workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration(CONFIG_SECTION)) {
                    listener();
                }
            });
        },
    };
}

export class MTranServerTranslate implements ITranslate {
    private settings: MTranServerSettings;
    private readonly host: TranslateHost;

    constructor(host?: Partial<TranslateHost>) {
        this.host = host?.getSettings
            ? {
                getSettings: host.getSettings,
                onDidChangeConfiguration: host.onDidChangeConfiguration,
                fetchImpl: host.fetchImpl,
            }
            : {
                ...createDefaultHost(),
                ...host,
            };
        this.settings = this.host.getSettings();
        this.host.onDidChangeConfiguration?.(() => {
            this.settings = this.host.getSettings();
        });
    }

    get maxLen(): number {
        return this.settings.maxLen;
    }

    async translate(content: string, options: ITranslateOptions = {}): Promise<string> {
        const from = mapLanguageCode(options.from, this.settings.defaultFrom);
        const to = mapLanguageCode(options.to, 'en');

        return translateText({
            settings: this.settings,
            text: content,
            from,
            to,
            fetchImpl: this.host.fetchImpl,
        });
    }

    link(_content: string, _options: ITranslateOptions = {}): string {
        try {
            return `[MTranServer](${buildUiUrl(this.settings.baseUrl)})`;
        } catch {
            return '[MTranServer](http://127.0.0.1:8989/ui)';
        }
    }

    isSupported(_src: string): boolean {
        return true;
    }
}
