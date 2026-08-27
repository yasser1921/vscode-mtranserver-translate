import * as assert from 'assert';
import { readWorkspaceSettings } from '../config';
import { CONFIG_SECTION, DEFAULT_SETTINGS } from '../settings';
import { emitConfigurationChange, resetWorkspaceConfig, setWorkspaceConfig } from './setup';
import { MTranServerTranslate } from '../mtranserverTranslate';

describe('readWorkspaceSettings', () => {
    afterEach(() => {
        resetWorkspaceConfig();
    });

    it('reads values from the vscode configuration section', () => {
        setWorkspaceConfig({
            baseUrl: 'http://192.168.1.8:8989',
            apiToken: 'abc',
            timeout: 5000,
            html: true,
            maxLen: 2000,
            defaultFrom: 'en',
        });

        assert.deepStrictEqual(readWorkspaceSettings(), {
            baseUrl: 'http://192.168.1.8:8989',
            apiToken: 'abc',
            timeout: 5000,
            html: true,
            maxLen: 2000,
            defaultFrom: 'en',
        });
    });

    it('falls back to defaults when configuration is empty', () => {
        setWorkspaceConfig({
            baseUrl: undefined,
            apiToken: undefined,
            timeout: undefined,
            html: undefined,
            maxLen: undefined,
            defaultFrom: undefined,
        });
        assert.deepStrictEqual(readWorkspaceSettings(), DEFAULT_SETTINGS);
    });
});

describe('MTranServerTranslate default host', () => {
    afterEach(() => {
        resetWorkspaceConfig();
    });

    it('reads workspace settings and reacts to configuration changes', async () => {
        setWorkspaceConfig({ html: false, apiToken: 'one' });
        let body = '';
        const translator = new MTranServerTranslate({
            fetchImpl: async (_input, init) => {
                body = String(init?.body);
                return new Response(JSON.stringify({ result: 'ok' }), { status: 200 });
            },
        });

        setWorkspaceConfig({ html: true, apiToken: 'two' });
        emitConfigurationChange(CONFIG_SECTION);
        await translator.translate('Hello', { from: 'en', to: 'zh-CN' });
        assert.strictEqual(JSON.parse(body).html, true);
    });
});
